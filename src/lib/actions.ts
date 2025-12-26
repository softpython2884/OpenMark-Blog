'use server';

import { z } from 'zod';
import db from './db';
import { createSession, getUser } from './auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Role, User } from './definitions';
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

  const { id, title, content, summary, imageUrl, tags } = validatedFields.data;
  let slug = createSlug(title);
  
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
                `UPDATE articles SET title = ?, slug = ?, content = ?, summary = ?, image_url = ?, updated_at = datetime('now'), published_at = datetime('now') WHERE id = ?`
            );
            stmt.run(title, slug, content, summary || null, imageUrl || null, articleId);
            db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);
        } else {
            const slugCheck = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
            if (slugCheck) {
                slug = `${slug}-${Date.now()}`;
            }
            const stmt = db.prepare(
                `INSERT INTO articles (title, slug, content, summary, image_url, author_id, published_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
            );
            const result = stmt.run(title, slug, content, summary || null, imageUrl || null, user.id);
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

export async function addComment(articleId: number, content: string) {
    const user = await getUser();
    if (!user) throw new Error('You must be logged in to comment.');
    if (!content.trim()) throw new Error('Comment cannot be empty.');

    try {
        const stmt = db.prepare('INSERT INTO comments (article_id, author_id, content) VALUES (?, ?, ?)');
        stmt.run(articleId, user.id, content);
        revalidatePath(`/article/[slug]`, 'page');
        return { success: true };
    } catch(e: any) {
        return { success: false, message: e.message };
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
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Permission denied: Only admins can change user roles.');
    }
    if (user.id === userId) {
        throw new Error('Admins cannot change their own role.');
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
