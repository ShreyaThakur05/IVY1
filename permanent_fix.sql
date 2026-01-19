-- PERMANENT FIX: Remove foreign key constraints and disable RLS

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Remove all foreign key constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_session_id_fkey;

-- Make user_id nullable in sessions table to allow any user_id
ALTER TABLE sessions ALTER COLUMN user_id DROP NOT NULL;