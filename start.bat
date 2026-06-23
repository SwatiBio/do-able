@echo off
cd /d "%~dp0backend"
start "Doable Server" py -B -m uvicorn app.main:app --host 0.0.0.0 --port 8000
timeout /t 2 /nobreak >nul
start http://localhost:8000
