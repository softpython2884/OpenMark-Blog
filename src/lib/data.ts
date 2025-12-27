
import db from './db';
import type { Article, User, Comment, Tag, Report } from './definitions';
import { calculateGamificationData } from './gamification';

export async function getPublishedArticles(userId?: number): Promise<Article[]> {
  try {
    const articlesStmt = db.prepare(`
      SELECT 
        a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId, 
        u.name as authorName, u.avatar_url as authorAvatarUrl, a.published_at as publishedAt,
        a.is_featured as isFeatured, a.visibility,
        (SELECT COUNT(*) FROM likes WHERE article_id = a.id) as likes
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.published_at IS NOT NULL AND a.visibility = 'public'
      ORDER BY DATE(a.published_at) DESC, likes DESC, a.published_at DESC
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
      isFeatured: article.isFeatured === 1,
    }));

  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch articles.');
  }
}

export async function getAllPublishedArticlesWithAuthor(): Promise<Partial<Article>[]> {
    try {
        const articlesStmt = db.prepare(`
            SELECT 
                a.id, a.title, a.slug, a.is_featured as isFeatured, a.visibility,
                u.name as authorName
            FROM articles a
            JOIN users u ON a.author_id = u.id
            WHERE a.published_at IS NOT NULL
            ORDER BY a.published_at DESC
        `);
        const articles = articlesStmt.all() as any[];
        return articles.map(article => ({ ...article, isFeatured: article.isFeatured === 1 }));

    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch all articles.');
    }
}


export async function getArticleBySlug(slug: string, userId?: number): Promise<Article | null> {
    try {
        const articleStmt = db.prepare(`
            SELECT 
                a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId,
                u.name as authorName, u.avatar_url as authorAvatarUrl, a.created_at as createdAt, a.updated_at as updatedAt,
                a.published_at as publishedAt, a.visibility
            FROM articles a
            JOIN users u ON a.author_id = u.id
            WHERE a.slug = ?
        `);
        const article = articleStmt.get(slug) as any;

        if (!article) return null;

        // If article is private, only the author can see it
        if (article.visibility === 'private' && article.authorId !== userId) {
            return null;
        }

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

            // Track tag views for recommendation engine
            try {
              const insertViewStmt = db.prepare(`
                INSERT INTO user_tag_views (user_id, tag_id, view_count) 
                VALUES (?, ?, 1)
                ON CONFLICT(user_id, tag_id) 
                DO UPDATE SET view_count = view_count + 1
              `);
              db.transaction(() => {
                for (const tag of article.tags) {
                  insertViewStmt.run(userId, tag.id);
                }
              })();
            } catch (e) {
                console.error("Failed to update tag views:", e);
            }
        }


        return article as Article;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch article.');
    }
}

export async function getArticleByShareToken(token: string): Promise<Article | null> {
    try {
        const articleStmt = db.prepare(`
            SELECT 
                a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId,
                u.name as authorName, u.avatar_url as authorAvatarUrl, a.created_at as createdAt, a.updated_at as updatedAt,
                a.published_at as publishedAt, a.visibility
            FROM articles a
            JOIN users u ON a.author_id = u.id
            WHERE a.share_token = ? AND a.visibility = 'private'
        `);
        const article = articleStmt.get(token) as any;

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
        
        // Note: We don't check for likes for shared articles, as the viewer might not be logged in.
        
        return article as Article;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch article by share token.');
    }
}

export async function getArticlesByAuthorId(authorId: number): Promise<Article[]> {
    try {
        const articlesStmt = db.prepare(`
            SELECT 
                a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId, 
                u.name as authorName, u.avatar_url as authorAvatarUrl, a.published_at as publishedAt,
                a.visibility, a.share_token as shareToken
            FROM articles a
            JOIN users u ON a.author_id = u.id
            WHERE a.author_id = ?
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
        const users = stmt.all() as any[];
        return users.map(user => ({...user, isEmailPublic: user.isEmailPublic === 1}));
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch users.');
    }
}

export async function getUserByName(name: string): Promise<User | null> {
    try {
        const stmt = db.prepare('SELECT id, name, email, role, avatar_url as avatarUrl, registration_date as registrationDate, bio, is_email_public as isEmailPublic FROM users WHERE name = ?');
        const user = stmt.get(name) as any | undefined;
        if (!user) return null;
        return { ...user, isEmailPublic: user.isEmailPublic === 1 };
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch user.');
    }
}

async function getFullArticleById(id: number, userId?: number): Promise<Article | null> {
    const articleStmt = db.prepare(`
        SELECT 
            a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId, 
            u.name as authorName, u.avatar_url as authorAvatarUrl, a.published_at as publishedAt, a.visibility
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.id = ?
    `);
    const article = articleStmt.get(id) as any;
    if (!article) return null;

    if (article.visibility === 'private' && article.authorId !== userId) {
        return null;
    }

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
            WHERE author_id = ? AND published_at IS NOT NULL AND visibility = 'public'
            ORDER BY published_at DESC LIMIT 1
        `);
        const latest = latestStmt.get(authorId) as { id: number } | undefined;
        if (latest) {
            const article = await getFullArticleById(latest.id, authorId);
            if (article) featuredArticles[article.id] = { ...article, reason: 'Latest' };
        }

        // 2. Get most liked article
        const mostLikedStmt = db.prepare(`
            SELECT a.id, COUNT(l.article_id) as like_count
            FROM articles a
            JOIN likes l ON a.id = l.article_id
            WHERE a.author_id = ? AND a.published_at IS NOT NULL AND a.visibility = 'public'
            GROUP BY a.id
            ORDER BY like_count DESC LIMIT 1
        `);
        const mostLiked = mostLikedStmt.get(authorId) as { id: number } | undefined;
        if (mostLiked) {
            const article = await getFullArticleById(mostLiked.id, authorId);
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
            WHERE a.author_id = ? AND a.published_at IS NOT NULL AND a.visibility = 'public'
            GROUP BY a.id
            ORDER BY comment_count DESC LIMIT 1
        `);
        const mostCommented = mostCommentedStmt.get(authorId) as { id: number } | undefined;
        if (mostCommented) {
             const article = await getFullArticleById(mostCommented.id, authorId);
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


export async function getUserProfileData(userName: string, loggedInUserId?: number) {
    try {
        const user = await getUserByName(userName);
        if (!user) {
            return null;
        }

        let articles = await getArticlesByAuthorId(user.id);
        
        // If not viewing own profile, filter out private articles
        if (loggedInUserId !== user.id) {
            articles = articles.filter(article => article.visibility === 'public' && article.publishedAt);
        }
        
        const topArticles = await getTopArticlesByAuthorId(user.id);
        const gamificationData = await calculateGamificationData(user.id);
        
        let isFollowing = false;
        if (loggedInUserId && loggedInUserId !== user.id) {
            const followStmt = db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND followed_id = ?');
            isFollowing = !!followStmt.get(loggedInUserId, user.id);
        }
        
        const userWithGamification: User & { isFollowing?: boolean } = {
            ...user,
            ...gamificationData,
            isFollowing,
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

export async function getFollowedArticles(userId: number): Promise<Article[]> {
    try {
        const articlesStmt = db.prepare(`
            SELECT 
                a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl, a.author_id as authorId, 
                u.name as authorName, u.avatar_url as authorAvatarUrl, a.published_at as publishedAt
            FROM articles a
            JOIN users u ON a.author_id = u.id
            JOIN followers f ON a.author_id = f.followed_id
            WHERE f.follower_id = ? AND a.published_at IS NOT NULL AND a.visibility = 'public'
            ORDER BY a.published_at DESC
            LIMIT 10
        `);
        const articles = articlesStmt.all(userId) as any[];

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
        throw new Error('Failed to fetch followed articles.');
    }
}

export async function getRecommendedArticles(userId: number): Promise<Article[]> {
    try {
        // Get user's top 5 viewed tags
        const topTagsStmt = db.prepare(`
            SELECT tag_id FROM user_tag_views
            WHERE user_id = ?
            ORDER BY view_count DESC
            LIMIT 5
        `);
        const topTags = topTagsStmt.all(userId) as { tag_id: number }[];
        if (topTags.length === 0) return [];
        const topTagIds = topTags.map(t => t.tag_id);

        // Get articles that have these tags, are published, and are not authored by the user
        const articlesStmt = db.prepare(`
            SELECT DISTINCT a.id, a.title, a.slug, a.content, a.summary, a.image_url as imageUrl,
                            a.author_id as authorId, u.name as authorName, u.avatar_url as authorAvatarUrl,
                            a.published_at as publishedAt
            FROM articles a
            JOIN article_tags at ON a.id = at.article_id
            JOIN users u ON a.author_id = u.id
            WHERE at.tag_id IN (${topTagIds.map(() => '?').join(',')})
              AND a.author_id != ?
              AND a.published_at IS NOT NULL
              AND a.visibility = 'public'
            ORDER BY a.published_at DESC
            LIMIT 20
        `);
        const articles = articlesStmt.all(...topTagIds, userId) as any[];

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
        throw new Error('Failed to fetch recommended articles.');
    }
}

export async function getPendingReports(): Promise<Report[]> {
  try {
    const reports = db.prepare(`
        SELECT
            r.id, r.type, r.item_id as itemId, r.reporter_id as reporterId,
            u.name as reporterName, r.reason, r.status, r.created_at as createdAt
        FROM reports r
        JOIN users u ON r.reporter_id = u.id
        WHERE r.status = 'pending'
        ORDER BY r.created_at DESC
    `).all() as Omit<Report, 'itemContent' | 'itemUrl'>[];

    const processedReports: Report[] = [];

    for (const report of reports) {
      let itemContent = 'Content not found';
      let itemUrl = '#';

      if (report.type === 'article') {
        const article = db.prepare('SELECT title, slug FROM articles WHERE id = ?').get(report.itemId) as { title: string; slug: string } | undefined;
        if (article) {
          itemContent = article.title;
          itemUrl = `/article/${article.slug}`;
        }
      } else if (report.type === 'comment') {
        const comment = db.prepare('SELECT content, article_id FROM comments WHERE id = ?').get(report.itemId) as { content: string; article_id: number } | undefined;
        if (comment) {
          const article = db.prepare('SELECT slug FROM articles WHERE id = ?').get(comment.article_id) as { slug: string } | undefined;
          itemContent = comment.content;
          if (article) {
            itemUrl = `/article/${article.slug}#comment-${report.itemId}`;
          }
        }
      }
      processedReports.push({ ...report, itemContent, itemUrl });
    }

    return processedReports;

  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch reports.');
  }
}
