@echo off
REM Test the API without interfering with the server
echo Testing http://localhost:3000/api/health...
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -TimeoutSec 5 | Select-Object -ExpandProperty Content"
pause
