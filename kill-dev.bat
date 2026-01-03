@echo off
REM Kill all Node.js dev servers before starting a new one
taskkill /F /IM node.exe >nul 2>&1
echo Killed all Node.js processes
timeout /t 1 /nobreak >nul
npm run dev
