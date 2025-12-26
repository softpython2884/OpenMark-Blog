'use server';

import { z } from 'zod';
import db from './db';
import { getUser } from './auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Role } from './definitions';

const ArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  summary: z.string().optional(),
  tags: z.string(), // Comma-separated
  status: z.enum(['draft', 'published']),
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
  const user = await getUser();
  if (!user || !['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role)) {
    return { message: 'Permission denied.' };
  }

  const validatedFields = ArticleSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to save article.',
    };
  }

  const { id, title, content, summary, tags, status } = validatedFields.data;
  const slug = createSlug(title);
  
  try {
    db.transaction(() => {
        let articleId: number;
        if (id) {
            // Update existing article
            articleId = Number(id);
            const stmt = db.prepare(
                `UPDATE articles SET title = ?, slug = ?, content = ?, summary = ?, status = ?, published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now') ELSE published_at END, updated_at = datetime('now') WHERE id = ?`
            );
            stmt.run(title, slug, content, summary || null, status, status, articleId);

            // TODO: permission check if user can edit this article
            
            // Clear old tags
            db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);
        } else {
            // Create new article
            const stmt = db.prepare(
                `INSERT INTO articles (title, slug, content, summary, author_id, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
            );
            const result = stmt.run(title, slug, content, summary || null, user.id, status, status === 'published' ? new Date().toISOString() : null);
            articleId = Number(result.lastInsertRowid);
        }

        // Handle tags
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
