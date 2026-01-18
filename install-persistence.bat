@echo off
echo Installing Supabase client dependency...
cd backend
npm install @supabase/supabase-js@^2.39.0
echo.
echo ✅ Supabase client installed successfully!
echo.
echo Next steps:
echo 1. Run the updated database schema in Supabase SQL Editor
echo 2. Start the backend: npm start
echo 3. Test session persistence
pause