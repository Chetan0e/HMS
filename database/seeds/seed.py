import asyncio
import os
import sys
from datetime import datetime, timezone
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient

import certifi

# Ensure backend path is on sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from app.core.config import settings

MONGODB_URL = settings.MONGODB_URL
MONGODB_DATABASE = settings.MONGODB_DATABASE

def get_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

async def seed_database():
    print("🌱 Connecting to MongoDB...")
    kwargs = {}
    if "mongodb+srv" in MONGODB_URL or "tls=true" in MONGODB_URL.lower() or "ssl=true" in MONGODB_URL.lower():
        kwargs["tlsCAFile"] = certifi.where()
        kwargs["tlsAllowInvalidCertificates"] = True

    client = AsyncIOMotorClient(MONGODB_URL, **kwargs)
    db = client[MONGODB_DATABASE]

    try:
        # Test connection ping
        await client.admin.command('ping')
        print("🧹 Cleaning existing test collections...")
        await db.users.delete_many({})
        await db.properties.delete_many({})
        await db.rooms.delete_many({})
        await db.beds.delete_many({})
        await db.bookings.delete_many({})
        await db.reviews.delete_many({})
    except Exception as e:
        print("\n❌ MongoDB Connection/Authentication Failed!")
        print(f"Error details: {e}\n")
        print("💡 Troubleshooting checklist for MongoDB Atlas:")
        print("  1. Database User: Go to Atlas -> Security -> Database Access.")
        print("     Ensure user 'chetanrangari0e52_db_user' exists and its password matches your .env file.")
        print("  2. User Permissions: Ensure the user has 'Read and write to any database' role.")
        print("  3. Network Access: Go to Atlas -> Security -> Network Access.")
        print("     Click 'Add IP Address' -> Select 'Allow Access From Anywhere' (0.0.0.0/0).")
        sys.exit(1)

    # 1. Create Users
    print("👤 Creating demo accounts (Admin, Owners, Seekers)...")
    admin_id = (await db.users.insert_one({
        "name": "Platform Administrator",
        "email": "admin@hms.com",
        "phone": "+919876543210",
        "password_hash": get_hash("AdminPassword123!"),
        "role": "ADMIN",
        "account_status": "ACTIVE",
        "verification_status": "VERIFIED",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })).inserted_id

    owner1_id = (await db.users.insert_one({
        "name": "Rahul Sharma",
        "email": "owner@hms.com",
        "phone": "+919812345678",
        "password_hash": get_hash("OwnerPassword123!"),
        "role": "OWNER",
        "account_status": "ACTIVE",
        "verification_status": "VERIFIED",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })).inserted_id

    seeker1_id = (await db.users.insert_one({
        "name": "Anita Smith",
        "email": "seeker@hms.com",
        "phone": "+919899911122",
        "password_hash": get_hash("SeekerPassword123!"),
        "role": "SEEKER",
        "account_status": "ACTIVE",
        "verification_status": "VERIFIED",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })).inserted_id

    # 2. Create Properties
    print("🏠 Creating realistic properties matching design Stitch reference...")
    properties_data = [
        {
            "owner_id": str(owner1_id),
            "manager_ids": [],
            "name": "Shree Mahalaxmi Executive PG",
            "slug": "shree-mahalaxmi-executive-pg-kolhapur",
            "property_type": "PG",
            "gender_policy": "Boys",
            "description": "Premium PG for students and working professionals near Tarabai Park. Includes 3-time authentic Kolhapuri meal service, high-speed WiFi, daily cleaning, and biometric security.",
            "address": "Tarabai Park, Station Road",
            "city": "Kolhapur",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "416003",
            "latitude": 16.7050,
            "longitude": 74.2433,
            "location": {"type": "Point", "coordinates": [74.2433, 16.7050]},
            "nearby_places": ["Shivaji University (1.5km)", "Kolhapur Railway Station (800m)", "Tarabai Park Market (300m)"],
            "images": [
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["High-Speed WiFi", "Food Included", "Daily Cleaning", "Parking", "CCTV", "Power Backup", "Hot Water"],
            "rules": ["No Smoking", "Visitor entry allowed till 9 PM", "Gate closes at 10 PM"],
            "deposit": 8000.0,
            "minimum_stay": "1 Month",
            "verification_status": "Verified",
            "property_status": "Published",
            "rating": 4.8,
            "review_count": 64,
            "views": 940,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "owner_id": str(owner1_id),
            "manager_ids": [],
            "name": "Shivaji University Scholar Stay",
            "slug": "shivaji-university-scholar-stay-kolhapur",
            "property_type": "Hostel",
            "gender_policy": "Boys",
            "description": "Affordable student hostel situated right opposite Shivaji University gate. Silent study zones, laundry facilities, and nutritious daily dining.",
            "address": "Rajarampuri 9th Lane, Near University Main Gate",
            "city": "Kolhapur",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "416008",
            "latitude": 16.6800,
            "longitude": 74.2550,
            "location": {"type": "Point", "coordinates": [74.2550, 16.6800]},
            "nearby_places": ["Shivaji University Main Campus (200m)", "Cyber Chowk (600m)"],
            "images": [
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["WiFi", "Food Included", "Laundry", "Study Desk", "24/7 Water Supply"],
            "rules": ["Quiet hours after 10 PM", "No alcohol or smoking"],
            "deposit": 6000.0,
            "minimum_stay": "3 Months",
            "verification_status": "Verified",
            "property_status": "Published",
            "rating": 4.6,
            "review_count": 38,
            "views": 720,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "owner_id": str(owner1_id),
            "manager_ids": [],
            "name": "Rankala View Girls Residency",
            "slug": "rankala-view-girls-residency-kolhapur",
            "property_type": "PG",
            "gender_policy": "Girls",
            "description": "Exclusive and highly secure girls PG with scenic Rankala lake view. Bio-metric access, 24/7 security guard, healthy meals, and high-speed fiber internet.",
            "address": "Rankala Lake Promenade Road",
            "city": "Kolhapur",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "416012",
            "latitude": 16.6900,
            "longitude": 74.2200,
            "location": {"type": "Point", "coordinates": [74.2200, 16.6900]},
            "nearby_places": ["Rankala Lake (100m)", "Mahalaxmi Temple (1.2km)"],
            "images": [
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["High-Speed WiFi", "Food Included", "Daily Cleaning", "CCTV", "Biometric Security", "Attached Bathroom"],
            "rules": ["Girls Only", "Curfew 9:30 PM"],
            "deposit": 7000.0,
            "minimum_stay": "1 Month",
            "verification_status": "Verified",
            "property_status": "Published",
            "rating": 4.9,
            "review_count": 52,
            "views": 1150,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "owner_id": str(owner1_id),
            "manager_ids": [],
            "name": "The Grand Oak Scholar's Residence",
            "slug": "the-grand-oak-scholars-residence",
            "property_type": "PG",
            "gender_policy": "Unisex",
            "description": "Experience premium student living designed for comfort and academic focus. Located just a short walk from campus, offering high-speed WiFi, nutritious meals, and study lounges.",
            "address": "12th Main Rd, Koramangala 4th Block",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "India",
            "postal_code": "560034",
            "latitude": 12.9345,
            "longitude": 77.6265,
            "location": {"type": "Point", "coordinates": [77.6265, 12.9345]},
            "nearby_places": ["Christ University (800m)", "Forum Mall (1.2km)", "Koramangala Bus Station (400m)"],
            "images": [
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["High-Speed WiFi", "Nutritious Meals", "Laundry Service", "Daily Cleaning", "24/7 Security", "Gymnasium", "Power Backup", "Attached Bathroom"],
            "rules": ["No Smoking", "Visitor Entry till 10 PM", "Gate Closes at 11 PM"],
            "deposit": 15000.0,
            "minimum_stay": "3 Months",
            "verification_status": "Verified",
            "property_status": "Published",
            "rating": 4.9,
            "review_count": 127,
            "views": 1420,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "owner_id": str(owner1_id),
            "manager_ids": [],
            "name": "Elite Colive KRM",
            "slug": "elite-colive-krm",
            "property_type": "Co-living",
            "gender_policy": "Unisex",
            "description": "Modern co-living space for working professionals and techies in Koramangala. Fully furnished rooms with bi-weekly housekeeping.",
            "address": "80 Feet Rd, 6th Block, Koramangala",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "India",
            "postal_code": "560095",
            "latitude": 12.9380,
            "longitude": 77.6290,
            "location": {"type": "Point", "coordinates": [77.6290, 12.9380]},
            "nearby_places": ["Sony World Signal (500m)", "Wipro Park (700m)"],
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["High-Speed WiFi", "AC", "Gymnasium", "Parking", "Daily Cleaning", "CCTV"],
            "rules": ["Quiet hours after 11 PM", "No Pets"],
            "deposit": 12000.0,
            "minimum_stay": "1 Month",
            "verification_status": "Verified",
            "property_status": "Published",
            "rating": 4.7,
            "review_count": 45,
            "views": 850,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "owner_id": str(owner1_id),
            "manager_ids": [],
            "name": "Oasis Girls Hostel",
            "slug": "oasis-girls-hostel",
            "property_type": "Hostel",
            "gender_policy": "Girls",
            "description": "Safe, vibrant girls hostel equipped with bio-metric access, 24/7 security wardens, homemade meals, and dedicated study desks.",
            "address": "15th Cross, HSR Layout Sector 1",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "India",
            "postal_code": "560102",
            "latitude": 12.9110,
            "longitude": 77.6490,
            "location": {"type": "Point", "coordinates": [77.6490, 12.9110]},
            "nearby_places": ["NIFT Campus (600m)", "HSR Club (1km)"],
            "images": [
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["Nutritious Meals", "High-Speed WiFi", "Biometric Security", "Laundry Service", "Power Backup"],
            "rules": ["Girls Only", "Curfew 10 PM"],
            "deposit": 10000.0,
            "minimum_stay": "6 Months",
            "verification_status": "Verified",
            "property_status": "Published",
            "rating": 4.8,
            "review_count": 89,
            "views": 1100,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "owner_id": str(owner1_id),
            "manager_ids": [],
            "name": "Kothrud Student Palms PG",
            "slug": "kothrud-student-palms-pg-pune",
            "property_type": "PG",
            "gender_policy": "Unisex",
            "description": "Spacious PG located near MIT College, Kothrud. Premium wooden furniture, high-speed WiFi, laundry, and daily meal options.",
            "address": "Paud Road, Near MIT Campus, Kothrud",
            "city": "Pune",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "411038",
            "latitude": 18.5074,
            "longitude": 73.8077,
            "location": {"type": "Point", "coordinates": [73.8077, 18.5074]},
            "nearby_places": ["MIT WPU College (400m)", "Ideal Colony Metro (300m)"],
            "images": [
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["High-Speed WiFi", "Food Included", "AC", "Laundry", "Gym", "Parking"],
            "rules": ["No Smoking", "Quiet hours after 10:30 PM"],
            "deposit": 10000.0,
            "minimum_stay": "1 Month",
            "verification_status": "Verified",
            "property_status": "Published",
            "rating": 4.7,
            "review_count": 55,
            "views": 980,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "owner_id": str(owner1_id),
            "manager_ids": [],
            "name": "Powai Lake View Co-Living",
            "slug": "powai-lake-view-coliving-mumbai",
            "property_type": "Co-living",
            "gender_policy": "Unisex",
            "description": "Luxury co-living apartment near Hiranandani Powai and IIT Bombay. Fully air-conditioned, rooftop deck, gaming lounge, and bi-weekly housekeeping.",
            "address": "Central Avenue, Hiranandani Gardens, Powai",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "400076",
            "latitude": 19.1176,
            "longitude": 72.9060,
            "location": {"type": "Point", "coordinates": [72.9060, 19.1176]},
            "nearby_places": ["IIT Bombay (1km)", "Hiranandani Business Park (500m)"],
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["High-Speed WiFi", "AC", "Gymnasium", "Gaming Area", "Daily Cleaning", "24/7 Security"],
            "rules": ["No smoking inside rooms", "Guests welcome with prior notice"],
            "deposit": 20000.0,
            "minimum_stay": "2 Months",
            "verification_status": "Verified",
            "property_status": "Published",
            "rating": 4.9,
            "review_count": 92,
            "views": 1650,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]

    for pdata in properties_data:
        pid = (await db.properties.insert_one(pdata)).inserted_id
        prop_id_str = str(pid)

        # Create rooms
        r1_id = (await db.rooms.insert_one({
            "property_id": prop_id_str,
            "room_number": "101",
            "floor": 1,
            "room_type": "Single",
            "capacity": 1,
            "price": 14000.0,
            "deposit": 15000.0,
            "amenities": ["AC", "Attached Bathroom", "Study Table", "Wardrobe"],
            "description": "Private premium single room with en-suite bathroom.",
            "status": "AVAILABLE",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })).inserted_id

        # Beds for room 101
        await db.beds.insert_one({
            "property_id": prop_id_str,
            "room_id": str(r1_id),
            "bed_number": "Bed A",
            "status": "AVAILABLE",
            "resident_id": None,
            "booking_id": None,
            "created_at": datetime.now(timezone.utc)
        })

        r2_id = (await db.rooms.insert_one({
            "property_id": prop_id_str,
            "room_number": "102",
            "floor": 1,
            "room_type": "Double Sharing",
            "capacity": 2,
            "price": 8500.0,
            "deposit": 10000.0,
            "amenities": ["Attached Bathroom", "Study Table", "Wardrobe"],
            "description": "Spacious double sharing room with balconies.",
            "status": "AVAILABLE",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })).inserted_id

        # Beds for room 102
        await db.beds.insert_many([
            {
                "property_id": prop_id_str,
                "room_id": str(r2_id),
                "bed_number": "Bed A",
                "status": "OCCUPIED",
                "resident_id": str(seeker1_id),
                "booking_id": None,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "property_id": prop_id_str,
                "room_id": str(r2_id),
                "bed_number": "Bed B",
                "status": "AVAILABLE",
                "resident_id": None,
                "booking_id": None,
                "created_at": datetime.now(timezone.utc)
            }
        ])

    print("✅ Database successfully seeded!")
    print("\nCredentials for testing:")
    print("  Admin:  email='admin@hms.com' password='AdminPassword123!'")
    print("  Owner:  email='owner@hms.com' password='OwnerPassword123!'")
    print("  Seeker: email='seeker@hms.com' password='SeekerPassword123!'")

if __name__ == "__main__":
    asyncio.run(seed_database())
