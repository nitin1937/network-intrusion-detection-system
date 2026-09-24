@echo off
title Upload NIDS to GitHub
echo ========================================================
echo   Uploading NIDS Project to GitHub
echo   Target: https://github.com/nitin1937/network-intrusion-detection-system
echo ========================================================
echo.
cd /d "%~dp0"
echo Pushing code to GitHub...
echo If your browser opens, click "Sign in with browser" / "Authorize".
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   SUCCESS! Uploaded successfully to GitHub!
    echo   View here: https://github.com/nitin1937/network-intrusion-detection-system
    echo ========================================================
) else (
    echo ========================================================
    echo   Upload encountered an issue. Check the message above.
    echo ========================================================
)
echo.
pause
