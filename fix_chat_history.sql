-- Fix chat history persistence issues

-- 1. Add missing message_order column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_order INTEGER DEFAULT 0;

-- 2. Add message_count column to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;

-- 3. Add analysis column to sessions table for storing interview analysis
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS analysis JSONB;

-- 4. Create index for message ordering
CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(session_id, message_order);

-- 5. Update existing messages to have proper ordering
UPDATE messages 
SET message_order = row_number() OVER (PARTITION BY session_id ORDER BY created_at) - 1
WHERE message_order = 0;

-- 6. Update sessions with correct message counts
UPDATE sessions 
SET message_count = (
  SELECT COUNT(*) 
  FROM messages 
  WHERE messages.session_id = sessions.id
)
WHERE message_count = 0 OR message_count IS NULL;

-- 7. Create function to automatically update message_count when messages are added
CREATE OR REPLACE FUNCTION update_session_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sessions 
    SET message_count = message_count + 1,
        updated_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sessions 
    SET message_count = GREATEST(message_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.session_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically update message count
DROP TRIGGER IF EXISTS trigger_update_message_count ON messages;
CREATE TRIGGER trigger_update_message_count
  AFTER INSERT OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_session_message_count();

-- 9. Allow users to update their own sessions (for analysis results)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own sessions' AND tablename = 'sessions') THEN
    CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 10. Allow users to update messages in their own sessions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update messages in own sessions' AND tablename = 'messages') THEN
    CREATE POLICY "Users can update messages in own sessions" ON messages FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = messages.session_id
        AND sessions.user_id = auth.uid()
      )
    );
  END IF;
END $$;