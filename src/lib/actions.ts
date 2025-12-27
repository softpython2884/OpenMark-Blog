
'use server';

import { z } from 'zod';
import db from './db';
import { createSession, getUser } from './auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Role, User, Article } from './definitions';
import { getCommentsByArticleId } from './server-data';
import bcrypt from 'bcryptjs';
import { placeholderImages } from './placeholder-images';

const ArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  summary: z.string().optional(),
  imageUrl: z.string()
    .url('Please enter a valid URL.')
    .optional()
    .or(z.literal(''))
    .refine(url => !url || !url.includes('imgur.com') || url.includes('i.imgur.com'), {
        message: "Invalid Imgur link. Please use the direct image link (starting with i.imgur.com). Right-click the image on Imgur and select 'Copy Image Address'.",
    }),
  tags: z.string(), // Comma-separated
  isPrivate: z.preprocess((val) => val === 'on', z.boolean().default(false)),
});

function createSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function saveArticle(prevState: any, formData: FormData) {
  console.log("saveArticle action called");
  const user = await getUser();
  if (!user || !['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role)) {
    return { message: 'Permission denied.' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = ArticleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.log("Validation failed", validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to save article due to validation errors.',
    };
  }

  const { id, title, content, summary, imageUrl, tags, isPrivate } = validatedFields.data;
  let slug = createSlug(title);
  const visibility = isPrivate ? 'private' : 'public';
  
  try {
    db.transaction(() => {
        let articleId: number;
        if (id) {
            articleId = Number(id);
            const existingSlug = db.prepare('SELECT slug FROM articles WHERE id = ?').get(articleId) as {slug: string};
            if(existingSlug.slug !== slug){
                const slugCheck = db.prepare('SELECT id FROM articles WHERE slug = ? and id !=?').get(slug, articleId);
                 if (slugCheck) {
                    slug = `${slug}-${Date.now()}`;
                }
            }
            
            const stmt = db.prepare(
                `UPDATE articles SET title = ?, slug = ?, content = ?, summary = ?, image_url = ?, updated_at = datetime('now'), published_at = datetime('now'), visibility = ? WHERE id = ?`
            );
            stmt.run(title, slug, content, summary || null, imageUrl || null, visibility, articleId);
            db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);
        } else {
            const slugCheck = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
            if (slugCheck) {
                slug = `${slug}-${Date.now()}`;
            }
            const stmt = db.prepare(
                `INSERT INTO articles (title, slug, content, summary, image_url, author_id, published_at, visibility) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)`
            );
            const result = stmt.run(title, slug, content, summary || null, imageUrl || null, user.id, visibility);
            articleId = Number(result.lastInsertRowid);
        }

        const tagNames = tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagNames.length > 0) {
            const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
            const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
            const insertArticleTag = db.prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)');
            
            for (const tagName of tagNames) {
                insertTag.run(tagName);
                const tag = getTag.get(tagName) as {id: number};
                if (tag) {
                    insertArticleTag.run(articleId, tag.id);
                }
            }
        }
    })();
  } catch (e: any) {
    console.error("Database transaction failed:", e);
    return { message: `Database Error: ${e.message}` };
  }

  revalidatePath('/');
  revalidatePath(`/article/${slug}`);
  if (id) {
    revalidatePath(`/editor/${id}`);
  }
  redirect(`/article/${slug}`);
}

export async function deleteArticle(articleId: number) {
    const user = await getUser();
    if (!user) {
        throw new Error('You must be logged in to delete an article.');
    }

    const article = db.prepare('SELECT author_id FROM articles WHERE id = ?').get(articleId) as { author_id: number } | undefined;

    if (!article) {
        throw new Error("The article does not exist.");
    }

    if (article.author_id !== user.id && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
        throw new Error("You are not authorized to delete this article.");
    }

    try {
        db.prepare('DELETE FROM articles WHERE id = ?').run(articleId);
        revalidatePath('/my-articles');
        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error("Database error while deleting article:", e);
        throw new Error("Database error while deleting the article.");
    }
}


export async function addComment(articleId: number, content: string, parentId?: number) {
    const user = await getUser();
    if (!user) throw new Error('You must be logged in to comment.');
    if (user.role === 'SUSPENDED') throw new Error('Your account is suspended. You cannot post comments.');
    if (!content.trim()) throw new Error('Comment cannot be empty.');

    try {
        const stmt = db.prepare('INSERT INTO comments (article_id, author_id, content, parent_id) VALUES (?, ?, ?, ?)');
        stmt.run(articleId, user.id, content, parentId || null);
        revalidatePath(`/article/[slug]`, 'page');
        return { success: true };
    } catch(e: any) {
        return { success: false, message: e.message };
    }
}

export async function deleteComment(commentId: number) {
    const user = await getUser();
    if (!user) {
        throw new Error("You must be logged in to delete a comment.");
    }

    const comment = db.prepare('SELECT author_id FROM comments WHERE id = ?').get(commentId) as { author_id: number } | undefined;

    if (!comment) {
        throw new Error("Comment not found.");
    }

    if (comment.author_id !== user.id && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
        throw new Error("You are not authorized to delete this comment.");
    }

    try {
        // Using a transaction to ensure both deletes happen or neither do.
        db.transaction(() => {
            // Delete the comment itself and any replies to it.
            // The ON DELETE CASCADE foreign key constraint should handle this automatically.
            db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
        })();
        revalidatePath(`/article/[slug]`, 'page');
        return { success: true };
    } catch (e: any) {
        console.error("Database error while deleting comment:", e);
        throw new Error("Database error occurred while deleting the comment.");
    }
}

export async function getCommentsAction(articleId: number) {
  return await getCommentsByArticleId(articleId);
}

export async function toggleLike(articleId: number) {
    const user = await getUser();
    if (!user) throw new Error('You must be logged in to like an article.');

    try {
        const isLikedStmt = db.prepare('SELECT 1 FROM likes WHERE article_id = ? AND user_id = ?');
        const isLiked = !!isLikedStmt.get(articleId, user.id);

        if (isLiked) {
            db.prepare('DELETE FROM likes WHERE article_id = ? AND user_id = ?').run(articleId, user.id);
        } else {
            db.prepare('INSERT INTO likes (article_id, user_id) VALUES (?, ?)').run(articleId, user.id);
        }

        revalidatePath(`/article/[slug]`, 'page');
        return { success: true, liked: !isLiked };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}


export async function updateUserRole(userId: number, role: Role) {
    const user = await getUser();
    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
        throw new Error('Permission denied: Only admins or moderators can change user roles.');
    }
    if (user.id === userId) {
        throw new Error('You cannot change your own role.');
    }

    if (user.role === 'MODERATOR' && (role === 'ADMIN' || role === 'EDITOR')) {
        throw new Error('Moderators cannot assign Admin or Editor roles.');
    }

    try {
        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
        revalidatePath('/admin');
        return { success: true };
    } catch(e: any) {
        return { success: false, message: e.message };
    }
}

const SignUpSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export async function signup(prevState: any, formData: FormData) {
    const validatedFields = SignUpSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid data. Please check the fields.',
        };
    }
    
    const { name, email, password } = validatedFields.data;
    let userId: number | bigint;
    let userRole: Role;

    try {
        const existingName = db.prepare('SELECT id FROM users WHERE name = ?').get(name);
        if (existingName) {
            return {
                errors: { name: ['This name is already taken. Please choose another.'] },
                message: 'This name is already taken. Please choose another.' 
            };
        }
        
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return { message: 'A user with this email already exists.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        userRole = 'READER'; 
        const defaultAvatar = placeholderImages[Math.floor(Math.random() * placeholderImages.length)].imageUrl;
        
        const stmt = db.prepare('INSERT INTO users (name, email, password, role, avatar_url) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(name, email, hashedPassword, userRole, defaultAvatar);
        userId = result.lastInsertRowid;
    } catch (e: any) {
        return { message: `Database Error: ${e.message}` };
    }
    
    await createSession({ userId: Number(userId), role: userRole, name });
    redirect('/');
}

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as (User & { password?: string }) | undefined;

    if (!user || !user.password) {
      return { message: 'Invalid credentials.' };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return { message: 'Invalid credentials.' };
    }
    
    const { password: _, ...userSessionData } = user;

    await createSession({ userId: userSessionData.id, role: userSessionData.role, name: userSessionData.name });
    
  } catch (error) {
     return { message: 'Something went wrong.' };
  }

  redirect('/');
}

export async function searchArticles(query: string): Promise<Article[]> {
  if (!query) return [];

  const searchQuery = `%${query}%`;
  
  try {
    // We need to find all articles that match the query in title, content, author name, or tag name.
    // This is a bit complex with joins.
    const articlesStmt = db.prepare(`
      SELECT DISTINCT a.id
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE a.title LIKE ? 
         OR a.content LIKE ? 
         OR u.name LIKE ? 
         OR t.name LIKE ?
      AND a.visibility = 'public' AND a.published_at IS NOT NULL
      ORDER BY a.published_at DESC
      LIMIT 10
    `);
    
    const articleIds = articlesStmt.all(searchQuery, searchQuery, searchQuery, searchQuery) as { id: number }[];
    
    if (articleIds.length === 0) return [];
    
    const placeholders = articleIds.map(() => '?').join(',');
    
    const articlesDataStmt = db.prepare(`
      SELECT 
        a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId, 
        u.name as authorName, u.avatar_url as authorAvatarUrl, a.published_at as publishedAt, a.visibility
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.id IN (${placeholders})
    `);
    
    const articles = articlesDataStmt.all(...articleIds.map(row => row.id)) as any[];

    const tagsStmt = db.prepare(`
      SELECT t.id, t.name 
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `);

    return articles.map(article => ({
      ...article,
      tags: tagsStmt.all(article.id),
    }));

  } catch (err) {
    console.error('Search Database Error:', err);
    throw new Error('Failed to search articles.');
  }
}

const ProfileFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  avatarUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  bio: z.string().max(200, 'Bio cannot exceed 200 characters.').optional(),
  isEmailPublic: z.boolean().default(false),
});

export async function updateProfile(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { errors: null, message: 'You must be logged in to update your profile.' };
  }
  
  const rawData = Object.fromEntries(formData.entries());
  // Manually convert 'on'/'off' to boolean for zod parsing
  const data = {
    ...rawData,
    isEmailPublic: rawData.isEmailPublic === 'on',
  };

  const validatedFields = ProfileFormSchema.safeParse(data);
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data provided.',
    };
  }
  
  const { name, avatarUrl, bio, isEmailPublic } = validatedFields.data;

  try {
    if (name !== user.name) {
      const existingUser = db.prepare('SELECT id FROM users WHERE name = ? AND id != ?').get(name, user.id);
      if (existingUser) {
        return {
          errors: { name: ['This name is already taken.'] },
          message: 'This name is already taken. Please choose another.',
        };
      }
    }

    db.prepare(
      'UPDATE users SET name = ?, avatar_url = ?, bio = ?, is_email_public = ? WHERE id = ?'
    ).run(name, avatarUrl, bio, isEmailPublic ? 1 : 0, user.id);
  } catch (e: any) {
    return { errors: null, message: `Database error: ${e.message}` };
  }

  revalidatePath(`/profile/${encodeURIComponent(user.name)}`); // Revalidate old profile page
  revalidatePath(`/profile/${encodeURIComponent(name)}`); // Revalidate new profile page
  redirect(`/profile/${encodeURIComponent(name)}`);
}

export async function setFeaturedArticle(articleId: number, isFeatured: boolean) {
    const user = await getUser();
    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
        throw new Error('Permission denied.');
    }

    try {
        db.transaction(() => {
            if (isFeatured) {
                // Un-feature all others first
                db.prepare('UPDATE articles SET is_featured = 0').run();
            }
            db.prepare('UPDATE articles SET is_featured = ? WHERE id = ?').run(isFeatured ? 1 : 0, articleId);
        })();
        
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        console.error("Database error while featuring article:", e);
        throw new Error("Database error while featuring the article.");
    }
}

export async function toggleFollow(authorId: number) {
    const user = await getUser();
    if (!user) {
        throw new Error('You must be logged in to follow an author.');
    }
    if (user.id === authorId) {
        throw new Error("You cannot follow yourself.");
    }

    try {
        const isFollowingStmt = db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND followed_id = ?');
        const isFollowing = !!isFollowingStmt.get(user.id, authorId);

        if (isFollowing) {
            db.prepare('DELETE FROM followers WHERE follower_id = ? AND followed_id = ?').run(user.id, authorId);
        } else {
            db.prepare('INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)').run(user.id, authorId);
        }

        revalidatePath(`/profile/${user.name}`);
        revalidatePath('/');
        return { success: true, following: !isFollowing };
    } catch (e: any) {
        console.error("Database error while toggling follow:", e);
        return { success: false, message: "A database error occurred." };
    }
}

export async function reportItem(type: 'article' | 'comment', itemId: number, reason: string) {
    const user = await getUser();
    if (!user) {
        return { success: false, message: 'You must be logged in to report content.' };
    }
    if (!reason.trim()) {
        return { success: false, message: 'Please provide a reason for your report.' };
    }

    try {
        const existingReport = db.prepare(
            'SELECT id FROM reports WHERE type = ? AND item_id = ? AND reporter_id = ? AND status = \'pending\''
        ).get(type, itemId, user.id);

        if (existingReport) {
            return { success: false, message: 'You have already reported this content.' };
        }

        db.prepare(
            'INSERT INTO reports (type, item_id, reporter_id, reason) VALUES (?, ?, ?, ?)'
        ).run(type, itemId, user.id, reason);

        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: `Database Error: ${e.message}` };
    }
}

export async function updateReportStatus(reportId: number, status: 'resolved' | 'dismissed') {
    const user = await getUser();
    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
        return { success: false, message: 'Permission denied.' };
    }

    try {
        db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, reportId);
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: `Database Error: ${e.message}` };
    }
}

export async function updateArticleVisibility(articleId: number, visibility: 'public' | 'private') {
    const user = await getUser();
    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
        throw new Error('Permission denied.');
    }

    try {
        db.prepare('UPDATE articles SET visibility = ? WHERE id = ?').run(visibility, articleId);
        revalidatePath('/admin');
        revalidatePath(`/article/${db.prepare('SELECT slug FROM articles WHERE id = ?').get(articleId)}`);
        return { success: true };
    } catch (e: any) {
        console.error("Database error while updating visibility:", e);
        throw new Error("Database error while updating visibility.");
    }
}
