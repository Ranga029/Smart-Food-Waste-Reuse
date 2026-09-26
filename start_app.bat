@echo off
set "PROJECT_ROOT=%~dp0"
start "Food Rescue Backend" /D "%PROJECT_ROOT%BACKEND" py -3 -m uvicorn APP.main:app --reload --port 8000
start "Food Rescue Frontend" /D "%PROJECT_ROOT%frontend" npm.cmd run dev

echo Food Rescue is starting.
echo Frontend: http://localhost:3000
echo Backend health: http://127.0.0.1:8000
echo Daily Food Flow: http://localhost:3000/dashboard
