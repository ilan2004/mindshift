-- Add columns for MBTI type and user statistics to profiles table
-- Run this in your Supabase SQL editor

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mbti_type TEXT,
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_focus_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for efficient querying by MBTI type
CREATE INDEX IF NOT EXISTS idx_profiles_mbti_type ON profiles(mbti_type);

-- Add updated_at trigger to automatically update the timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_profiles_updated_at' 
        AND tgrelid = 'profiles'::regclass
    ) THEN
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON profiles 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add RLS policies if they don't exist
DO $$
BEGIN
    -- Enable RLS on profiles table
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to read their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    -- Policy for users to insert their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Policy for users to update their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Optional: Add some helpful views for analytics (if needed)
CREATE OR REPLACE VIEW user_stats AS 
SELECT 
    id,
    username,
    mbti_type,
    points,
    streak,
    total_focus_minutes,
    created_at,
    updated_at
FROM profiles 
WHERE mbti_type IS NOT NULL 
AND points > 0;

-- Grant access to authenticated users
GRANT SELECT ON user_stats TO authenticated;

COMMENT ON TABLE profiles IS 'User profiles with MBTI personality types and focus statistics';
COMMENT ON COLUMN profiles.mbti_type IS 'Myers-Briggs personality type (e.g., INTJ, ENFP)';
COMMENT ON COLUMN profiles.points IS 'Total points earned from focus sessions and achievements';
COMMENT ON COLUMN profiles.streak IS 'Current daily focus streak';
COMMENT ON COLUMN profiles.total_focus_minutes IS 'Total minutes of focused work completed';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN profiles.bio IS 'User biography/description';
