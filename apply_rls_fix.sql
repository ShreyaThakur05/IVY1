-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view messages from own sessions" ON messages;
DROP POLICY IF EXISTS "Users can create messages in own sessions" ON messages;

-- Create new policies that allow service role
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service can insert profiles" ON profiles FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Users can create own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Users can delete own sessions" ON sessions FOR DELETE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view messages from own sessions" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = messages.session_id
    AND (sessions.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
  )
);

CREATE POLICY "Users can create messages in own sessions" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = messages.session_id
    AND (sessions.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
  ) OR auth.jwt() ->> 'role' = 'service_role'
);