import db from './db';
import { User, BadgeInfo } from './definitions';
import { Leaf, Feather } from 'lucide-react';

const SCORE_CONFIG = {
  ARTICLE_PUBLISHED: 50,
  LIKE_RECEIVED: 5,
  COMMENT_RECEIVED: 10,
  COMMENT_MADE: 2,
};

function calculateLevel(score: number): { level: number, progress: number } {
    if (score < 0) score = 0;
    const level = Math.floor(Math.sqrt(score / 100)) + 1;
    
    // Calculate score needed for current and next level
    const scoreForCurrentLevel = 100 * Math.pow(level - 1, 2);
    const scoreForNextLevel = 100 * Math.pow(level, 2);

    const scoreInCurrentLevel = score - scoreForCurrentLevel;
    const scoreNeededForNextLevel = scoreForNextLevel - scoreForCurrentLevel;

    const progress = scoreNeededForNextLevel > 0 ? Math.floor((scoreInCurrentLevel / scoreNeededForNextLevel) * 100) : 0;

    return { level, progress };
}

function getBadges(user: User, articleCount: number): BadgeInfo[] {
    const badges: BadgeInfo[] = [];

    // Newbie Badge: "New Leaf"
    const registrationDate = new Date(user.registrationDate);
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    if (registrationDate > fiveDaysAgo) {
        badges.push({
            name: 'New Leaf',
            description: 'Joined in the last 5 days. Welcome!',
            icon: Leaf,
        });
    }

    // Author Badge: "Scribe"
    if (articleCount >= 5) {
         badges.push({
            name: 'Scribe',
            description: 'Published at least 5 articles.',
            icon: Feather,
        });
    }

    return badges;
}


export async function calculateGamificationData(userId: number) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
  if (!user) {
    throw new Error('User not found');
  }

  // Calculate score from articles published and likes/comments received
  const articles = db.prepare('SELECT id FROM articles WHERE author_id = ? AND published_at IS NOT NULL').all(userId) as { id: number }[];
  const articleCount = articles.length;

  let score = articleCount * SCORE_CONFIG.ARTICLE_PUBLISHED;

  for (const article of articles) {
    const likes = (db.prepare('SELECT COUNT(*) as count FROM likes WHERE article_id = ?').get(article.id) as { count: number }).count;
    const commentsReceived = (db.prepare('SELECT COUNT(*) as count FROM comments WHERE article_id = ?').get(article.id) as { count: number }).count;
    score += likes * SCORE_CONFIG.LIKE_RECEIVED;
    score += commentsReceived * SCORE_CONFIG.COMMENT_RECEIVED;
  }
  
  // Calculate score from comments made
  const commentsMade = (db.prepare('SELECT COUNT(*) as count FROM comments WHERE author_id = ?').get(userId) as { count: number }).count;
  score += commentsMade * SCORE_CONFIG.COMMENT_MADE;

  const { level, progress } = calculateLevel(score);
  const badges = getBadges(user, articleCount);

  return {
    score,
    level,
    levelProgress: progress,
    badges,
  };
}
