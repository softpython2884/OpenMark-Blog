
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
      name TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'READER', 'SUSPENDED')),
      avatar_url TEXT,
      registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      bio TEXT,
      is_email_public INTEGER DEFAULT 0
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
      is_featured INTEGER DEFAULT 0,
      visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'private')),
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
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
      parent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL,
      article_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, article_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS followers (
      follower_id INTEGER NOT NULL,
      followed_id INTEGER NOT NULL,
      PRIMARY KEY (follower_id, followed_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('article', 'comment')),
      item_id INTEGER NOT NULL,
      reporter_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'resolved', 'dismissed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_tag_views (
        user_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        view_count INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (user_id, tag_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);
  
  // Poor-man's migration: Add columns if they don't exist
  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  const userColumnNames = userColumns.map((col: any) => col.name);

  if (!userColumnNames.includes('registration_date')) {
    console.log("Applying migration: Adding 'registration_date' to users table.");
    db.exec('ALTER TABLE users ADD COLUMN registration_date DATETIME');
    db.exec('UPDATE users SET registration_date = CURRENT_TIMESTAMP WHERE registration_date IS NULL');
  }

  if (!userColumnNames.includes('bio')) {
    console.log("Applying migration: Adding 'bio' to users table.");
    db.exec('ALTER TABLE users ADD COLUMN bio TEXT');
  }

  if (!userColumnNames.includes('is_email_public')) {
    console.log("Applying migration: Adding 'is_email_public' to users table.");
    db.exec('ALTER TABLE users ADD COLUMN is_email_public INTEGER DEFAULT 0');
  }

  const articleColumns = db.prepare("PRAGMA table_info(articles)").all();
  const articleColumnNames = articleColumns.map((col: any) => col.name);

  if (!articleColumnNames.includes('is_featured')) {
      console.log("Applying migration: Adding 'is_featured' to articles table.");
      db.exec('ALTER TABLE articles ADD COLUMN is_featured INTEGER DEFAULT 0');
  }

  if (!articleColumnNames.includes('visibility')) {
      console.log("Applying migration: Adding 'visibility' to articles table.");
      db.exec("ALTER TABLE articles ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'private'))");
  }

  const commentColumns = db.prepare("PRAGMA table_info(comments)").all();
  const commentColumnNames = commentColumns.map((col: any) => col.name);

  if (!commentColumnNames.includes('parent_id')) {
    console.log("Applying migration: Adding 'parent_id' to comments table.");
    db.exec('ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE');
  }

  // Handle unique constraint on 'name' for existing data
  if (userColumnNames.includes('name')) {
      const duplicateNames = db.prepare(`
          SELECT name FROM users GROUP BY name HAVING COUNT(id) > 1
      `).all() as { name: string }[];

      if (duplicateNames.length > 0) {
          console.log("Applying migration: Fixing duplicate user names.");
          const updateUser = db.prepare('UPDATE users SET name = ? WHERE id = ?');
          for (const item of duplicateNames) {
              const users = db.prepare('SELECT id FROM users WHERE name = ? ORDER BY id').all(item.name) as { id: number }[];
              users.forEach((user, index) => {
                  if (index > 0) { // Keep the first user's name
                      const newName = `${item.name}${index + 1}`;
                      updateUser.run(newName, user.id);
                      console.log(`Updating user ID ${user.id}: name '${item.name}' -> '${newName}'`);
                  }
              });
          }
      }
      
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      if(userCount.count > 0) {
        try {
          db.pragma('foreign_keys = OFF');
          db.exec(`
            CREATE TABLE IF NOT EXISTS users_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              email TEXT NOT NULL UNIQUE,
              password TEXT,
              role TEXT NOT NULL CHECK(role IN ('ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'READER', 'SUSPENDED')),
              avatar_url TEXT,
              registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
              bio TEXT,
              is_email_public INTEGER DEFAULT 0
            );
          `);
          db.exec('INSERT INTO users_new SELECT id, name, email, password, role, avatar_url, registration_date, bio, is_email_public FROM users;');
          db.exec('DROP TABLE users;');
          db.exec('ALTER TABLE users_new RENAME TO users;');
          db.pragma('foreign_keys = ON');
          console.log("Successfully applied UNIQUE constraint to user names.");
        } catch(e: any) {
          db.pragma('foreign_keys = ON');
          if (!e.message.includes('already exists')) {
            console.error("Failed to apply UNIQUE constraint migration:", e);
          }
           db.exec('DROP TABLE IF EXISTS users_new;');
        }
      }
  }

  // Seed initial data if users table is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, role, avatar_url, password) VALUES (?, ?, ?, ?, ?)
    `);
    
    const adminPassword = bcrypt.hashSync('admin', 10);
    const authorPassword = bcrypt.hashSync('author', 10);
    const readerPassword = bcrypt.hashSync('reader', 10);

    insertUser.run('Admin', 'admin@example.com', 'ADMIN', placeholderImages[0].imageUrl, adminPassword);
    insertUser.run('Author', 'author@example.com', 'AUTHOR', placeholderImages[1].imageUrl, authorPassword);
    insertUser.run('Reader', 'reader@example.com', 'READER', placeholderImages[2].imageUrl, readerPassword);
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
