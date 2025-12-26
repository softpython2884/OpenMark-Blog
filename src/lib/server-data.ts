'use server';

import db from './db';
import type { Comment } from './definitions';

export async function getCommentsByArticleId(articleId: number): Promise<Comment[]> {
    try {
        const stmt = db.prepare(`
            SELECT
                c.id, c.content, c.article_id as articleId, c.author_id as authorId, c.parent_id as parentId,
                u.name as authorName, u.avatar_url as authorAvatarUrl, c.created_at as createdAt
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.article_id = ?
            ORDER BY c.created_at ASC
        `);
        const comments = stmt.all(articleId) as Comment[];

        // Build a tree structure from the flat list of comments
        const commentMap: { [key: number]: Comment } = {};
        const topLevelComments: Comment[] = [];

        for (const comment of comments) {
            comment.children = [];
            commentMap[comment.id] = comment;
        }

        for (const comment of comments) {
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].children?.push(comment);
            } else {
                topLevelComments.push(comment);
            }
        }
        
        // Reverse to show newest top-level comments first
        return topLevelComments.reverse();

    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch comments.');
    }
}
