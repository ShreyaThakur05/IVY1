@echo off
echo ========================================
echo          IVY - Interview Virtual You
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js 18+ first.
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo [2/4] Installing frontend dependencies...
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies installation failed!
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

echo.
echo [3/4] Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed!
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo.
echo [4/4] Checking environment variables...
if not exist ".env" (
    echo ❌ Backend .env file not found!
    echo Please create backend\.env with your API keys
    pause
    exit /b 1
)
echo ✅ Environment file found

echo.
echo [5/5] Starting IVY application...
echo.
echo 🚀 Starting Node.js backend server on port 3001...
start "IVY Backend" cmd /k "cd /d \"%~dp0backend\" && npm start"

timeout /t 3 /nobreak >nul

echo 🌐 Starting frontend server on port 3000...
cd /d "%~dp0"
start "IVY Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo ✅ IVY is starting up!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo 🏥 Health:   http://localhost:3001/health
echo.
echo ⚠️  IMPORTANT: Only use Node.js backend (server.js)
echo ❌ Python backend (main.py) is disabled
echo.
echo Wait a few seconds for both servers to start,
echo then open http://localhost:3000 in your browser.
echo ========================================
echo.
pause