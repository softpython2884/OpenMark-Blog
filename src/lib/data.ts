import db from './db';
import type { Article, User, Comment, Tag } from './definitions';
import { calculateGamificationData } from './gamification';

export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const articlesStmt = db.prepare(`
      SELECT 
        a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId, 
        u.name as authorName, u.avatar_url as authorAvatarUrl, a.published_at as publishedAt
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.published_at IS NOT NULL
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
                a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId, 
                u.name as authorName, u.avatar_url as authorAvatarUrl, a.published_at as publishedAt
            FROM articles a
            JOIN users u ON a.author_id = u.id
            WHERE a.author_id = ? AND a.published_at IS NOT NULL
            ORDER BY a.published_at DESC
        `);
        const articles = articlesStmt.all(authorId) as any[];

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
        const stmt = db.prepare('SELECT id, name, email, role, avatar_url as avatarUrl, registration_date as registrationDate, bio, is_email_public as isEmailPublic FROM users');
        return stmt.all() as User[];
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch users.');
    }
}

export async function getUserByName(name: string): Promise<User | null> {
    try {
        const stmt = db.prepare('SELECT id, name, email, role, avatar_url as avatarUrl, registration_date as registrationDate, bio, is_email_public as isEmailPublic FROM users WHERE name = ?');
        const user = stmt.get(name) as User | undefined;
        return user || null;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch user.');
    }
}

async function getFullArticleById(id: number): Promise<Article | null> {
    const articleStmt = db.prepare(`
        SELECT 
            a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId, 
            u.name as authorName, u.avatar_url as authorAvatarUrl, a.published_at as publishedAt
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.id = ?
    `);
    const article = articleStmt.get(id) as any;
    if (!article) return null;

    const tagsStmt = db.prepare(`
        SELECT t.id, t.name 
        FROM tags t
        JOIN article_tags at ON t.id = at.tag_id
        WHERE at.article_id = ?
    `);
    article.tags = tagsStmt.all(article.id);
    return article as Article;
}


export async function getTopArticlesByAuthorId(authorId: number): Promise<Array<Article & { reason: string }>> {
    try {
        const featuredArticles: { [key: number]: Article & { reason: string } } = {};

        // 1. Get latest article
        const latestStmt = db.prepare(`
            SELECT id FROM articles 
            WHERE author_id = ? AND published_at IS NOT NULL 
            ORDER BY published_at DESC LIMIT 1
        `);
        const latest = latestStmt.get(authorId) as { id: number } | undefined;
        if (latest) {
            const article = await getFullArticleById(latest.id);
            if (article) featuredArticles[article.id] = { ...article, reason: 'Latest' };
        }

        // 2. Get most liked article
        const mostLikedStmt = db.prepare(`
            SELECT a.id, COUNT(l.article_id) as like_count
            FROM articles a
            JOIN likes l ON a.id = l.article_id
            WHERE a.author_id = ? AND a.published_at IS NOT NULL
            GROUP BY a.id
            ORDER BY like_count DESC LIMIT 1
        `);
        const mostLiked = mostLikedStmt.get(authorId) as { id: number } | undefined;
        if (mostLiked) {
            const article = await getFullArticleById(mostLiked.id);
            if (article) {
                if (!featuredArticles[article.id]) {
                    featuredArticles[article.id] = { ...article, reason: 'Most Liked' };
                }
            }
        }

        // 3. Get most commented article
        const mostCommentedStmt = db.prepare(`
            SELECT a.id, COUNT(c.article_id) as comment_count
            FROM articles a
            JOIN comments c ON a.id = c.article_id
            WHERE a.author_id = ? AND a.published_at IS NOT NULL
            GROUP BY a.id
            ORDER BY comment_count DESC LIMIT 1
        `);
        const mostCommented = mostCommentedStmt.get(authorId) as { id: number } | undefined;
        if (mostCommented) {
             const article = await getFullArticleById(mostCommented.id);
            if (article) {
                if (!featuredArticles[article.id]) {
                    featuredArticles[article.id] = { ...article, reason: 'Most Commented' };
                }
            }
        }

        return Object.values(featuredArticles);

    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch top articles.');
    }
}


export async function getUserProfileData(userName: string) {
    try {
        const user = await getUserByName(userName);
        if (!user) {
            return null;
        }

        const articles = await getArticlesByAuthorId(user.id);
        const topArticles = await getTopArticlesByAuthorId(user.id);
        const gamificationData = await calculateGamificationData(user.id);
        
        const userWithGamification: User = {
            ...user,
            ...gamificationData,
        };

        return { user: userWithGamification, articles, topArticles };
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch user profile data.');
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
