@echo off
title NIDS - Restore Working Checkpoint
echo ====================================================================
echo        RESTORE NIDS PROJECT TO WORKING STABLE CHECKPOINT
echo ====================================================================
echo.
echo Choose a restore point:
echo  1. Checkpoint v2 (Recommended - Latest Deployed with 70/30 Split)
echo  2. Checkpoint v1 (Initial Working Version)
echo.
set /p CHOICE="Select checkpoint (1 or 2, default is 1): "
if "%CHOICE%"=="2" (
    set TARGET_TAG=working-stable-v1
    set TARGET_DB=_checkpoints\nidps_checkpoint_working.db
) else (
    set TARGET_TAG=working-stable-v2
    set TARGET_DB=_checkpoints\nidps_checkpoint_v2.db
)

echo.
echo This will restore the exact state of %TARGET_TAG%.
set /p CONFIRM="Are you sure you want to proceed? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Restore cancelled.
    pause
    exit /b
)

echo.
echo [1/3] Reverting all source code and files via Git...
cd /d "%~dp0"
git reset --hard %TARGET_TAG%
git clean -fd

echo.
echo [2/3] Restoring working database snapshot...
if exist "%TARGET_DB%" (
    copy /y "%TARGET_DB%" "nidps.db" >nul
    echo Database snapshot restored from %TARGET_DB%.
) else (
    echo Note: Database backup not found, keeping current database.
)

echo.
echo [3/3] Re-verifying frontend build...
if not exist "frontend\build\index.html" (
    echo Rebuilding frontend bundle...
    call npm --prefix frontend run build
)

echo.
echo ====================================================================
echo  SUCCESS: Project has been restored to %TARGET_TAG%!
echo  You can now run start_project.bat to launch the working system.
echo ====================================================================
echo.
pause
