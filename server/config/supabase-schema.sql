-- ============================================================================
-- GroqTales Supabase Schema
-- Run this SQL in the Supabase SQL Editor to create all required tables
-- ============================================================================

-- --------------------------------------------------------
-- 1. PROFILES TABLE
-- Linked to auth.users via id (UUID)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  first_name TEXT DEFAULT 'Anonymous',
  last_name TEXT DEFAULT 'Creator',
  display_name TEXT,
  bio TEXT DEFAULT '' CHECK (char_length(bio) <= 500),
  avatar_url TEXT,
  phone TEXT,
  wallet_address TEXT,
  wallet_network TEXT,
  wallet_provider TEXT,
  wallet_verified BOOLEAN DEFAULT false,
  wallet_last_connected_at TIMESTAMPTZ,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  badges TEXT[] DEFAULT '{}',
  social_twitter TEXT,
  social_website TEXT,
  website TEXT,
  location TEXT,
  primary_genre TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- --------------------------------------------------------
-- 2. STORIES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  content TEXT NOT NULL,
  genre TEXT NOT NULL CHECK (genre IN ('fantasy', 'sci-fi', 'mystery', 'adventure', 'horror', 'romance', 'other')),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_minted BOOLEAN DEFAULT false,
  nft_token_id TEXT,
  file_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  format_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Stories are viewable by everyone"
  ON stories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (auth.uid() = author_id);

-- --------------------------------------------------------
-- 3. USER_SETTINGS TABLE
-- Stores notification + privacy preferences
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- Notification settings
  notif_email_comments BOOLEAN DEFAULT true,
  notif_email_likes BOOLEAN DEFAULT true,
  notif_email_followers BOOLEAN DEFAULT true,
  notif_email_nft_sales BOOLEAN DEFAULT true,
  notif_email_platform BOOLEAN DEFAULT false,
  notif_inapp_comments BOOLEAN DEFAULT true,
  notif_inapp_likes BOOLEAN DEFAULT true,
  notif_inapp_followers BOOLEAN DEFAULT true,
  notif_inapp_messages BOOLEAN DEFAULT true,
  -- Privacy settings
  privacy_profile_public BOOLEAN DEFAULT true,
  privacy_allow_comments BOOLEAN DEFAULT true,
  privacy_show_activity BOOLEAN DEFAULT true,
  privacy_show_reading_history BOOLEAN DEFAULT false,
  privacy_data_collection BOOLEAN DEFAULT true,
  privacy_personalization BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 4. DRAFTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_key TEXT NOT NULL UNIQUE,
  story_type TEXT DEFAULT 'text',
  story_format TEXT DEFAULT 'free',
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  owner_wallet TEXT,
  owner_role TEXT DEFAULT 'wallet' CHECK (owner_role IN ('wallet', 'admin', 'guest')),
  -- Current version
  current_title TEXT DEFAULT '',
  current_description TEXT DEFAULT '',
  current_genre TEXT DEFAULT '',
  current_content TEXT DEFAULT '',
  current_cover_image TEXT DEFAULT '',
  current_version INTEGER DEFAULT 1,
  current_updated_at TIMESTAMPTZ DEFAULT now(),
  -- Version history stored as JSONB array
  versions JSONB DEFAULT '[]'::jsonb,
  -- AI metadata
  ai_pipeline_state TEXT DEFAULT 'idle',
  ai_suggested_edits JSONB DEFAULT '[]'::jsonb,
  ai_last_edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drafts"
  ON drafts FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own drafts"
  ON drafts FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own drafts"
  ON drafts FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own drafts"
  ON drafts FOR DELETE
  USING (auth.uid() = owner_id);

-- --------------------------------------------------------
-- 5. HELPER: Auto-create profile on new user signup
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, first_name, last_name, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'firstName', 'Anonymous'),
    COALESCE(NEW.raw_user_meta_data->>'lastName', 'Creator'),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'firstName', 'Anonymous'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- 6. Updated_at auto-trigger
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
