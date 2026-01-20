@echo off
echo Applying database fixes for chat history...

echo.
echo 1. Go to your Supabase Dashboard
echo 2. Navigate to SQL Editor
echo 3. Copy and paste the contents of fix_chat_history.sql
echo 4. Run the SQL script
echo.

echo The script will:
echo - Add missing message_order column
echo - Add message_count column to sessions
echo - Add analysis column for interview results
echo - Create proper indexes and triggers
echo - Fix RLS policies
echo.

echo After running the SQL script, restart your backend server.
echo.
pause