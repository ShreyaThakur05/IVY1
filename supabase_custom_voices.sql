-- Add custom voices table for persona-specific voice cloning
CREATE TABLE custom_voices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  persona_name TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_custom_voices_user_persona ON custom_voices(user_id, persona_name);

-- Enable Row Level Security
ALTER TABLE custom_voices ENABLE ROW LEVEL SECURITY;

-- Custom voices policies
CREATE POLICY "Users can view own custom voices" ON custom_voices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom voices" ON custom_voices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom voices" ON custom_voices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom voices" ON custom_voices
  FOR DELETE USING (auth.uid() = user_id);