-- Disable RLS temporarily to fix backend issues
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Remove foreign key constraint temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;

-- Insert the actual user profile
INSERT INTO profiles (id, full_name) 
VALUES ('5c2fbcaa-3333-45f4-915a-f7666921482b', 'User')
ON CONFLICT (id) DO NOTHING;