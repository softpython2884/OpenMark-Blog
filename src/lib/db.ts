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
      image_url TEXT,
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
}

// Ensure the DB is initialized on startup
try {
  initializeDb();
} catch (error) {
  console.error("Failed to initialize database:", error);
}

export default db;
