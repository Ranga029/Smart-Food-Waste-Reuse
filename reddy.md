# Project Analysis: Reddy

## Overview
The **Smart Hyperlocal Food Rescue & Volunteer-Driven Redistribution Platform** is a three-sided web application designed to prevent food waste by intercepting surplus food from sources like university hostels and banquet halls and redistributing it to partner shelters via volunteer riders.

## Technical Architecture
- **Backend**: Built with **FastAPI** (Python 3.11+). It uses **SQLAlchemy ORM** for database interaction, and **SQLite** as the database (`food_rescue.db`).
- **Frontend**: Developed using **Next.js** (React 18), **Tailwind CSS** for styling, and **Leaflet.js** for handling maps/OpenStreetMap integrations for routing the volunteer riders.
- **Security**: Utilizes a 4-Digit Ephemeral Pickup/Drop OTP Handshake to ensure secure and verified deliveries of food.

## Key Features & Functionality
1. **Three-Sided Logistics**: Serves Donors (e.g., Joy University Hostel Mess #2), Shelters (e.g., Karuna Orphanage Home), and Volunteers (e.g., Campus Volunteer Rider).
2. **Automated Expiry Management**: The backend runs an asynchronous background task (`cleanup_expired_donations`) every 60 seconds to automatically update the status of available food donations to "Expired" if their expiry time has passed.
3. **Food Flow Tracking**: Handled on the frontend via the `/dashboard` route. Health checks for the backend are available at the root route (`/`).

## Startup Process
The application provides a simplified `start_app.bat` script at the root directory which launches both the FastAPI backend server (running on `http://127.0.0.1:8000`) and the Next.js frontend server (running on `http://localhost:3000`).

## Database
An SQLite file named `food_rescue.db` located in the `BACKEND` directory ensures that food records and user profiles persist across application restarts. The database automatically seeds some initial demo users for testing.
