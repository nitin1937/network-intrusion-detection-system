@echo off
title NIDS - Real-Time Packet Sniffer
echo ========================================================
echo Starting Real-Time Network Packet Capture & AI Detection...
echo Note: Ensure Npcap / WinPcap is installed for packet sniffing.
echo ========================================================
cd /d "%~dp0"
call .venv\Scripts\activate.bat
python -m backend.realtime.packet_capture
pause
