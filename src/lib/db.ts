import Database from 'better-sqlite3';
import { placeholderImages } from './placeholder-images';
import bcrypt from 'bcryptjs';

const db = new Database('local.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'READER')),
      avatar_url TEXT
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      summary TEXT,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    
    CREATE TABLE IF NOT EXISTS article_tags (
      article_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (article_id, tag_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      article_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL,
      article_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, article_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );
  `);

  // Seed initial data if users table is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, role, avatar_url, password) VALUES (?, ?, ?, ?, ?)
    `);
    
    // Hash passwords
    const adminPassword = bcrypt.hashSync('admin', 10);
    const authorPassword = bcrypt.hashSync('author', 10);
    const readerPassword = bcrypt.hashSync('reader', 10);

    insertUser.run('Admin User', 'admin@example.com', 'ADMIN', placeholderImages[0].imageUrl, adminPassword);
    insertUser.run('Author User', 'author@example.com', 'AUTHOR', placeholderImages[1].imageUrl, authorPassword);
    insertUser.run('Reader User', 'reader@example.com', 'READER', placeholderImages[2].imageUrl, readerPassword);
    console.log('Database seeded with initial users.');
  }

  // Seed initial articles if articles table is empty
  const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
  if (articleCount.count === 0) {
    const admin = db.prepare("SELECT id FROM users WHERE role = 'ADMIN'").get() as { id: number };
    const author = db.prepare("SELECT id FROM users WHERE role = 'AUTHOR'").get() as { id: number };

    const insertArticle = db.prepare(`
      INSERT INTO articles (title, slug, content, summary, author_id, status, published_at) 
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    insertArticle.run(
      'Exploring the Mountains', 
      'exploring-the-mountains', 
      '<h1>Exploring the Mountains</h1><p>The mountains are calling, and I must go. This is a deep dive into the philosophy of mountaineering and the spiritual connection to the peaks. We will cover preparation, mindset, and the sheer joy of reaching a summit.</p>', 
      'A philosophical journey into the heart of mountaineering, exploring its spiritual and practical aspects.', 
      admin.id, 
      'published'
    );
    insertArticle.run(
      'The Bustling City Life', 
      'the-bustling-city-life', 
      '<h1>The Bustling City Life</h1><p>City life is a symphony of chaos and order. From neon lights to quiet park benches, we explore the duality of urban existence. This article presents a photo-essay combined with personal anecdotes from living in a metropolis for over a decade.</p>',
      'An exploration of urban existence through a photo-essay and personal stories, capturing the chaos and harmony of city life.',
      author.id, 
      'published'
    );
    
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
    const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
    const insertArticleTag = db.prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)');

    const tags1 = ['Travel', 'Nature', 'Philosophy'];
    tags1.forEach(tag => {
      insertTag.run(tag);
      const tagId = (getTag.get(tag) as { id: number }).id;
      insertArticleTag.run(1, tagId);
    });

    const tags2 = ['Urban', 'Photography', 'Lifestyle'];
    tags2.forEach(tag => {
      insertTag.run(tag);
      const tagId = (getTag.get(tag) as { id: number }).id;
      insertArticleTag.run(2, tagId);
    });

    console.log('Database seeded with initial articles and tags.');
  }
}

// Ensure the DB is initialized on startup
try {
  initializeDb();
} catch (error) {
  console.error("Failed to initialize database:", error);
}

export default db;
