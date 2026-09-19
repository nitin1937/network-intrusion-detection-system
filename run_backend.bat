@echo off
title NIDS - Backend Server
echo ========================================================
echo Starting NIDS FastAPI Backend Server...
echo API Docs: http://127.0.0.1:8000/docs
echo ========================================================
cd /d "%~dp0"
"%~dp0.venv\Scripts\python.exe" app.py
pause
