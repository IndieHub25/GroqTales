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
