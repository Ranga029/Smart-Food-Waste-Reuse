import os
import sqlite3
from datetime import datetime, timedelta, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "food_rescue.db")

def init_and_seed():
    # Remove older database instance if you want a clean reset
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Create Tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        phone TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS food_donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donor_id INTEGER NOT NULL,
        food_name TEXT NOT NULL,
        servings INTEGER NOT NULL,
        cooked_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiry_time TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'Available',
        photo_url TEXT,
        FOREIGN KEY (donor_id) REFERENCES users (id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donation_id INTEGER NOT NULL,
        shelter_id INTEGER NOT NULL,
        volunteer_id INTEGER,
        claimed_servings INTEGER NOT NULL,
        status TEXT DEFAULT 'Pending Dispatch',
        pickup_otp TEXT NOT NULL,
        drop_otp TEXT NOT NULL,
        assigned_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_time TIMESTAMP,
        FOREIGN KEY (donation_id) REFERENCES food_donations (id),
        FOREIGN KEY (shelter_id) REFERENCES users (id),
        FOREIGN KEY (volunteer_id) REFERENCES users (id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS volunteer_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        volunteer_id INTEGER NOT NULL,
        points INTEGER DEFAULT 0,
        distance_km REAL DEFAULT 0.0,
        carbon_saved_kg REAL DEFAULT 0.0,
        FOREIGN KEY (volunteer_id) REFERENCES users (id)
    );
    """)

    # 2. Insert Seed Users (Donor, Shelter, Volunteer)
    cursor.executemany("""
    INSERT INTO users (id, name, email, role, phone, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [
        (1, "Joy University Hostel Mess #2", "mess2@joyuniversity.edu.in", "donor", "+919876543210", 12.9716, 79.1585),
        (2, "Karuna Orphanage Home", "contact@karunahome.org", "shelter", "+919876543211", 12.9249, 79.1352),
        (3, "Campus Volunteer Rider", "volunteer1@joyuniversity.edu.in", "volunteer", "+919876543212", 12.9650, 79.1500)
    ])

    # 3. Insert Initial Active Food Donation
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(hours=4)

    cursor.execute("""
    INSERT INTO food_donations (id, donor_id, food_name, servings, cooked_time, expiry_time, status, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        1,
        1,
        "Vegetable Biryani & Dal Makhani",
        50,
        now.strftime("%Y-%m-%d %H:%M:%S"),
        expiry.strftime("%Y-%m-%d %H:%M:%S"),
        "Available",
        "uploads/sample_biryani.jpg"
    ))

    conn.commit()
    conn.close()
    print(f"Successfully generated: {DB_PATH}")

if __name__ == "__main__":
    init_and_seed()