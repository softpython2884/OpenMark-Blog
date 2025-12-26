'use server';

import db from './db';
import type { Comment } from './definitions';

export async function getCommentsByArticleId(articleId: number): Promise<Comment[]> {
    try {
        const stmt = db.prepare(`
            SELECT
                c.id, c.content, c.article_id as articleId, c.author_id as authorId,
                u.name as authorName, u.avatar_url as authorAvatarUrl, c.created_at as createdAt
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.article_id = ?
            ORDER BY c.created_at DESC
        `);
        return stmt.all(articleId) as Comment[];
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch comments.');
    }
}
