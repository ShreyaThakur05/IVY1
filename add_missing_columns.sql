-- Add missing columns to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS interview_mode TEXT DEFAULT 'Interview' NOT NULL,
ADD COLUMN IF NOT EXISTS document_reference TEXT;

-- Update existing records to have the default interview_mode
UPDATE sessions SET interview_mode = 'Interview' WHERE interview_mode IS NULL;