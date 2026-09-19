@echo off
title NIDS - Restore Working Checkpoint
echo ====================================================================
echo        RESTORE NIDS PROJECT TO WORKING STABLE CHECKPOINT
echo ====================================================================
echo.
echo This will undo all changes and restore the exact working state
echo from checkpoint: working-stable-v1
echo.
set /p CONFIRM="Are you sure you want to restore to working checkpoint? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Restore cancelled.
    pause
    exit /b
)

echo.
echo [1/3] Reverting all source code and files via Git...
cd /d "%~dp0"
git reset --hard working-stable-v1
git clean -fd

echo.
echo [2/3] Restoring working database snapshot...
if exist "_checkpoints\nidps_checkpoint_working.db" (
    copy /y "_checkpoints\nidps_checkpoint_working.db" "nidps.db" >nul
    echo Database snapshot restored.
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
echo  SUCCESS: Project has been completely restored to working checkpoint!
echo  You can now run start_project.bat to launch the working system.
echo ====================================================================
echo.
pause
