import db from './db';
import type { Article, User, Comment, Tag } from './definitions';

export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const articlesStmt = db.prepare(`
      SELECT 
        a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId, 
        u.name as authorName, u.avatar_url as authorAvatarUrl, a.published_at as publishedAt
      FROM articles a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.published_at DESC
    `);
    const articles = articlesStmt.all() as any[];

    const tagsStmt = db.prepare(`
      SELECT t.id, t.name 
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `);

    return articles.map(article => ({
      ...article,
      tags: tagsStmt.all(article.id) as Tag[],
    }));

  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch articles.');
  }
}

export async function getArticleBySlug(slug: string, userId?: number): Promise<Article | null> {
    try {
        const articleStmt = db.prepare(`
            SELECT 
                a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId,
                u.name as authorName, u.avatar_url as authorAvatarUrl, a.created_at as createdAt, a.updated_at as updatedAt,
                a.published_at as publishedAt
            FROM articles a
            JOIN users u ON a.author_id = u.id
            WHERE a.slug = ?
        `);
        const article = articleStmt.get(slug) as any;

        if (!article) return null;

        const tagsStmt = db.prepare(`
            SELECT t.id, t.name 
            FROM tags t
            JOIN article_tags at ON t.id = at.tag_id
            WHERE at.article_id = ?
        `);
        article.tags = tagsStmt.all(article.id);

        const likesStmt = db.prepare('SELECT COUNT(*) as count FROM likes WHERE article_id = ?');
        article.likes = (likesStmt.get(article.id) as { count: number }).count;
        
        if (userId) {
            const isLikedStmt = db.prepare('SELECT 1 FROM likes WHERE article_id = ? AND user_id = ?');
            article.isLiked = !!isLikedStmt.get(article.id, userId);
        }

        return article as Article;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch article.');
    }
}

export async function getArticlesByAuthorId(authorId: number): Promise<Article[]> {
    try {
        const articlesStmt = db.prepare(`
            SELECT 
                id, title, slug, published_at as publishedAt
            FROM articles
            WHERE author_id = ?
            ORDER BY published_at DESC
        `);
        const articles = articlesStmt.all(authorId) as any[];
        return articles;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch articles for author.');
    }
}


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

export async function getAllUsers(): Promise<User[]> {
    try {
        const stmt = db.prepare('SELECT id, name, email, role, avatar_url as avatarUrl FROM users');
        return stmt.all() as User[];
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch users.');
    }
}

export async function getUsersForLogin(): Promise<Pick<User, 'id' | 'name' | 'role'>[]> {
    try {
        const stmt = db.prepare('SELECT id, name, role FROM users');
        return stmt.all() as Pick<User, 'id' | 'name' | 'role'>[];
    } catch (err) {
        console.error('Database Error:', err);
        return [];
    }
}
