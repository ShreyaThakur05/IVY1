@echo off
echo Starting IVY Backend...
cd /d "%~dp0backend"
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo Error: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo Installing dependencies...
npm install

echo Starting backend server...
npm start