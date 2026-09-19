@echo off
title NIDS - React Frontend
echo ========================================================
echo Starting NIDS React Frontend...
echo URL: http://localhost:3000
echo ========================================================
cd /d "%~dp0frontend"
if exist "build" (
    echo Serving optimized dashboard on http://localhost:3000 ...
    npx serve -s build -l 3000
) else (
    echo Starting React development server on http://localhost:3000 ...
    npm start
)
pause
