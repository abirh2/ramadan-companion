-- Deen Companion - Database Setup and RLS Policies
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_name TEXT,
  timezone TEXT,
  location_type TEXT CHECK (location_type IN ('coords', 'city')),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_city TEXT,
  calculation_method TEXT,
  madhab TEXT,
  hijri_offset_days INTEGER DEFAULT 0,
  language TEXT DEFAULT 'en',
  theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system'
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT NOT NULL CHECK (type IN ('zakat', 'sadaqah', 'other')),
  category TEXT,
  charity_name TEXT,
  charity_url TEXT,
  date DATE NOT NULL,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  item_type TEXT NOT NULL CHECK (item_type IN ('quran', 'hadith')),
  source_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  title TEXT,
  excerpt TEXT,
  metadata JSONB
);

-- Quran Bookmarks table (for reading position tracking)
CREATE TABLE IF NOT EXISTS quran_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, surah_number)
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_quran_bookmarks_user_id ON quran_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_bookmarks_user_surah ON quran_bookmarks(user_id, surah_number);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. DROP EXISTING POLICIES (if any)
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own donations" ON donations;
DROP POLICY IF EXISTS "Users can create own donations" ON donations;
DROP POLICY IF EXISTS "Users can update own donations" ON donations;
DROP POLICY IF EXISTS "Users can delete own donations" ON donations;

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON quran_bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON quran_bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks" ON quran_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON quran_bookmarks;

-- ============================================
-- 5. CREATE RLS POLICIES - PROFILES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 6. CREATE RLS POLICIES - DONATIONS
-- ============================================

-- Users can view their own donations
CREATE POLICY "Users can view own donations"
ON donations FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own donations
CREATE POLICY "Users can create own donations"
ON donations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own donations
CREATE POLICY "Users can update own donations"
ON donations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own donations
CREATE POLICY "Users can delete own donations"
ON donations FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 7. CREATE RLS POLICIES - FAVORITES
-- ============================================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own favorites
CREATE POLICY "Users can create own favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 8. CREATE RLS POLICIES - QURAN BOOKMARKS
-- ============================================

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
ON quran_bookmarks FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own bookmarks
CREATE POLICY "Users can create own bookmarks"
ON quran_bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookmarks
CREATE POLICY "Users can update own bookmarks"
ON quran_bookmarks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
ON quran_bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 9. CREATE TRIGGER FOR AUTO-CREATING PROFILES
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. CREATE FUNCTION FOR UPDATED_AT TIMESTAMP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for automatic updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS donations_updated_at ON donations;
CREATE TRIGGER donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- DONE!
-- ============================================

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'donations', 'favorites');

-- Verify policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'donations', 'favorites');

-- ============================================
-- 10. ADD QURAN TRANSLATION PREFERENCE FIELD
-- ============================================

-- Add quran_translation field to profiles table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'quran_translation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN quran_translation TEXT DEFAULT 'en.asad';
  END IF;
END $$;

-- ============================================
-- 11. ADD HADITH LANGUAGE PREFERENCE FIELD
-- ============================================

-- Add hadith_language field to profiles table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'hadith_language'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hadith_language TEXT DEFAULT 'english';
  END IF;
END $$;

-- ============================================
-- 12. CREATE FEEDBACK TABLE
-- ============================================

-- Feedback table for user reports and suggestions
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  page_path TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('problem', 'suggestion')),
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_agent TEXT,
  metadata JSONB
);

-- Create index for feedback queries
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_page_path ON feedback(page_path);

-- Enable RLS for feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 13. CREATE RLS POLICIES - FEEDBACK
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "allow_all_insert" ON feedback;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
DROP POLICY IF EXISTS "Only admins can view feedback" ON feedback;

-- Allow anonymous and authenticated users to insert feedback
CREATE POLICY "allow_all_insert"
ON feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No SELECT policy - admin-only access via service role
-- Users cannot read feedback (prevents spam/abuse)

-- ============================================
-- 14. ADD ADMIN SYSTEM TO PROFILES TABLE
-- ============================================

-- Add is_admin column to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Set initial admin user
-- After your first user signs up, run this query with your email:
-- UPDATE profiles SET is_admin = TRUE 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE');

-- ============================================
-- 15. EXTEND FEEDBACK TABLE FOR ADMIN WORKFLOW
-- ============================================

-- Add workflow fields to feedback table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'feedback' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE feedback ADD COLUMN status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'feedback' 
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE feedback ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'feedback' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE feedback ADD COLUMN category TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'feedback' 
    AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE feedback ADD COLUMN admin_notes TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'feedback' 
    AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE feedback ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'feedback' 
    AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE feedback ADD COLUMN reviewed_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- Create indexes for feedback filtering
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);

-- ============================================
-- 16. CREATE ADMIN RLS POLICIES FOR FEEDBACK
-- ============================================

-- Drop existing admin policies if any
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON feedback;

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = TRUE
  )
);

-- Admins can update feedback (status, priority, category, notes)
CREATE POLICY "Admins can update feedback"
ON feedback FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = TRUE
  )
);

-- ============================================
-- 17. CREATE PRAYER TRACKING TABLE
-- ============================================

-- Prayer tracking table for daily prayer completion
CREATE TABLE IF NOT EXISTS prayer_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  fajr_completed BOOLEAN DEFAULT FALSE,
  dhuhr_completed BOOLEAN DEFAULT FALSE,
  asr_completed BOOLEAN DEFAULT FALSE,
  maghrib_completed BOOLEAN DEFAULT FALSE,
  isha_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for prayer tracking queries
CREATE INDEX IF NOT EXISTS idx_prayer_tracking_user_date ON prayer_tracking(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_tracking_user_id ON prayer_tracking(user_id);

-- Enable RLS for prayer_tracking table
ALTER TABLE prayer_tracking ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 18. CREATE RLS POLICIES - PRAYER TRACKING
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own prayer tracking" ON prayer_tracking;
DROP POLICY IF EXISTS "Users can insert their own prayer tracking" ON prayer_tracking;
DROP POLICY IF EXISTS "Users can update their own prayer tracking" ON prayer_tracking;

-- Users can view their own prayer tracking
CREATE POLICY "Users can view their own prayer tracking"
ON prayer_tracking FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own prayer tracking
CREATE POLICY "Users can insert their own prayer tracking"
ON prayer_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own prayer tracking
CREATE POLICY "Users can update their own prayer tracking"
ON prayer_tracking FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger for automatic updated_at on prayer_tracking
DROP TRIGGER IF EXISTS prayer_tracking_updated_at ON prayer_tracking;
CREATE TRIGGER prayer_tracking_updated_at
  BEFORE UPDATE ON prayer_tracking
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 19. ADD NOTIFICATION PREFERENCES TO PROFILES
-- ============================================

-- Add notification_preferences JSONB field to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"enabled": false, "prayers": {"Fajr": true, "Dhuhr": true, "Asr": true, "Maghrib": true, "Isha": true}}'::jsonb;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN profiles.notification_preferences IS 'User preferences for prayer time notifications. Stores enabled state and per-prayer toggles.';

-- ============================================
-- 20. CREATE PUSH SUBSCRIPTIONS TABLE
-- ============================================

-- Push subscriptions table for Web Push API notifications
-- Stores browser push subscription endpoints and keys for each user
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Index for efficient user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- RLS policies for push subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE push_subscriptions IS 'Stores Web Push API subscription endpoints for prayer time notifications. Each user can have multiple subscriptions (different browsers/devices).';

