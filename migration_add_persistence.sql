-- Migration: Add persistence fields to existing sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS interview_mode TEXT DEFAULT 'Interview' NOT NULL,
ADD COLUMN IF NOT EXISTS primary_topic TEXT,
ADD COLUMN IF NOT EXISTS document_reference TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();