# Smart Hyperlocal Food Rescue & Volunteer-Driven Redistribution Platform

A three-sided hyperlocal logistics web platform that intercepts prepared food surplus from university hostels and banquet halls, validates safe degradation windows using Haversine formulas, and routes volunteer riders to redistribute meals to partner shelters.

## Architecture
- **Backend:** FastAPI (Python 3.11+), SQLAlchemy ORM, SQLite
- **Frontend:** Next.js (React 18), Tailwind CSS, Leaflet.js (OpenStreetMap)
- **Security:** 4-Digit Ephemeral Pickup/Drop OTP Handshakes

## Quick Start Guide

### First-Time Setup on Windows

Install the backend dependencies and frontend packages once:

```bash
py -3 -m pip install -r BACKEND\\requirements.txt
cd frontend
npm.cmd install
```

### Start the App

After restarting the laptop, double-click `start_app.bat` in the project root. It opens the backend and frontend in separate terminal windows. Keep both windows open while using the app.

- Frontend: http://localhost:3000
- Backend health check: http://127.0.0.1:8000
- Daily Food Flow: http://localhost:3000/dashboard

The food database is stored at `BACKEND/food_rescue.db`, independent of the folder used to launch the backend. Food records persist across app and laptop restarts; the backend must be running to use the app, so it cannot serve requests while the laptop is powered off.
