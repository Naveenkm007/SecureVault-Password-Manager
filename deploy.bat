@echo off
echo ========================================
echo    SecureVault Mobile Server v2.0
echo ========================================
echo.
echo Starting server for mobile testing...
echo.
echo Your app will be available at:
echo http://YOUR_IP:8080
echo.
echo To find your IP address, run: ipconfig
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8080 --bind 0.0.0.0

pause
