@echo off
taskkill /FI "WINDOWTITLE eq Doable Server" /F >nul 2>&1
echo Server stopped.
