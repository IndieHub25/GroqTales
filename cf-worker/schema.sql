-- Initial Schema for GroqTales D1 Database

-- Drop tables if they exist (useful for local dev resets)
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS stories;
DROP TABLE IF EXISTS marketplace_listings;

-- Profiles table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user', -- user, admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stories table
CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  genre TEXT,
  tags TEXT, -- Store as JSON array string
  seo_keywords TEXT,
  seo_description TEXT,
  ml_quality_score REAL,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  review_status TEXT DEFAULT 'under_review', -- under_review, verified, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES profiles(id)
);

-- Marketplace Listings table
CREATE TABLE marketplace_listings (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT DEFAULT 'MON',
  status TEXT DEFAULT 'active', -- active, sold, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id),
  FOREIGN KEY (seller_id) REFERENCES profiles(id)
);

-- Trending Stories table (updated by cron or on story events)
DROP TABLE IF EXISTS trending_stories;
CREATE TABLE trending_stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id TEXT NOT NULL,
  score REAL DEFAULT 0,
  period TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'alltime'
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id)
);
CREATE INDEX idx_trending_period_score ON trending_stories(period, score DESC);

-- Notifications table
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'story_approved', 'story_rejected', 'new_follower', 'new_like', 'system'
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  read INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}', -- JSON for extra data (storyId, fromUserId, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
