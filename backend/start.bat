@echo off
echo Starting Parkinson's Pal Backend Server...
echo.
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop
echo.
node server.js
pause
