@echo off
title NIDS - Network Intrusion Detection System
echo ====================================================================
echo        LAUNCHING NETWORK INTRUSION DETECTION SYSTEM (NIDS)
echo ====================================================================
echo.
cd /d "%~dp0"

echo [1/3] Starting Backend API Server (Port 8000)...
start "NIDS - Backend Server" cmd /k "call run_backend.bat"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Dashboard (Port 3000)...
start "NIDS - Frontend Dashboard" cmd /k "call run_frontend.bat"

echo [3/3] Opening browser...
timeout /t 4 /nobreak >nul
start http://localhost:3000

echo.
echo ====================================================================
echo  System launched successfully!
echo.
echo  * Frontend:       http://localhost:3000
echo  * Backend Docs:   http://127.0.0.1:8000/docs
echo.
echo  LOGIN CREDENTIALS:
echo    * Admin:   Username: admin    / Password: admin123
echo    * Analyst: Username: analyst  / Password: analyst123
echo ====================================================================
echo.
pause
