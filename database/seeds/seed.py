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
        await client.admin.command('ping')
        print("🧹 Cleaning existing test collections...")
        await db.users.delete_many({})
        await db.properties.delete_many({})
        await db.rooms.delete_many({})
        await db.beds.delete_many({})
        await db.bookings.delete_many({})
        await db.reviews.delete_many({})
        await db.residents.delete_many({})
        await db.payments.delete_many({})
        await db.maintenance_requests.delete_many({})
        await db.enquiries.delete_many({})
    except Exception as e:
        print(f"\n❌ MongoDB Connection Failed: {e}\n")
        sys.exit(1)

    print("👤 Creating accounts (Admin, Chetan Rangari, Rahul Sharma, Anita Smith)...")
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

    chetan_owner_id = (await db.users.insert_one({
        "name": "Chetan Rangari",
        "email": "chetan@hms.com",
        "phone": "+919876500000",
        "password_hash": get_hash("OwnerPassword123!"),
        "role": "OWNER",
        "account_status": "ACTIVE",
        "verification_status": "VERIFIED",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })).inserted_id

    rahul_owner_id = (await db.users.insert_one({
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

    print("🏠 Creating properties assigned strictly per owner...")
    properties_data = [
        {
            "owner_id": str(chetan_owner_id),
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
            "nearby_places": ["Shivaji University (1.5km)", "Kolhapur Railway Station (800m)"],
            "images": [
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["High-Speed WiFi", "Food Included", "Daily Cleaning", "Parking", "CCTV"],
            "rules": ["No Smoking", "Visitor entry allowed till 9 PM"],
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
            "owner_id": str(chetan_owner_id),
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
            "nearby_places": ["Shivaji University Main Campus (200m)"],
            "images": [
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["WiFi", "Food Included", "Laundry", "Study Desk"],
            "rules": ["Quiet hours after 10 PM"],
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
            "owner_id": str(rahul_owner_id),
            "manager_ids": [],
            "name": "The Grand Oak Scholar's Residence",
            "slug": "the-grand-oak-scholars-residence",
            "property_type": "PG",
            "gender_policy": "Unisex",
            "description": "Experience premium student living designed for comfort and academic focus in Bengaluru.",
            "address": "12th Main Rd, Koramangala 4th Block",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "India",
            "postal_code": "560034",
            "latitude": 12.9345,
            "longitude": 77.6265,
            "location": {"type": "Point", "coordinates": [77.6265, 12.9345]},
            "nearby_places": ["Christ University (800m)"],
            "images": [
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80"
            ],
            "amenities": ["High-Speed WiFi", "Laundry Service"],
            "rules": ["No Smoking"],
            "deposit": 15000.0,
            "minimum_stay": "3 Months",
            "verification_status": "Verified",
            "property_status": "Published",
            "rating": 4.9,
            "review_count": 127,
            "views": 1420,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]

    for pdata in properties_data:
        pid = (await db.properties.insert_one(pdata)).inserted_id
        prop_id_str = str(pid)

        # Create room 101
        r1_id = (await db.rooms.insert_one({
            "property_id": prop_id_str,
            "owner_id": pdata["owner_id"],
            "room_number": "101",
            "floor": 1,
            "room_type": "Single",
            "capacity": 1,
            "price": 14000.0,
            "deposit": 15000.0,
            "amenities": ["AC", "Attached Bathroom"],
            "description": "Private single room.",
            "status": "AVAILABLE",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })).inserted_id

        await db.beds.insert_one({
            "property_id": prop_id_str,
            "owner_id": pdata["owner_id"],
            "room_id": str(r1_id),
            "bed_number": "Bed A",
            "status": "AVAILABLE",
            "resident_id": None,
            "booking_id": None,
            "created_at": datetime.now(timezone.utc)
        })

        # Create room 102
        r2_id = (await db.rooms.insert_one({
            "property_id": prop_id_str,
            "owner_id": pdata["owner_id"],
            "room_number": "102",
            "floor": 1,
            "room_type": "Double Sharing",
            "capacity": 2,
            "price": 8500.0,
            "deposit": 10000.0,
            "amenities": ["Attached Bathroom", "Study Table"],
            "description": "Double sharing room.",
            "status": "AVAILABLE",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })).inserted_id

        b1_id = (await db.beds.insert_one({
            "property_id": prop_id_str,
            "owner_id": pdata["owner_id"],
            "room_id": str(r2_id),
            "bed_number": "Bed A",
            "status": "OCCUPIED",
            "resident_id": str(seeker1_id),
            "booking_id": None,
            "created_at": datetime.now(timezone.utc)
        })).inserted_id

        await db.beds.insert_one({
            "property_id": prop_id_str,
            "owner_id": pdata["owner_id"],
            "room_id": str(r2_id),
            "bed_number": "Bed B",
            "status": "AVAILABLE",
            "resident_id": None,
            "booking_id": None,
            "created_at": datetime.now(timezone.utc)
        })

        # Create a sample resident record for Chetan's property
        if pdata["owner_id"] == str(chetan_owner_id):
            await db.residents.insert_one({
                "seeker_id": str(seeker1_id),
                "owner_id": str(chetan_owner_id),
                "property_id": prop_id_str,
                "room_id": str(r2_id),
                "bed_id": str(b1_id),
                "move_in_date": "2026-06-15",
                "status": "ACTIVE",
                "payment_status": "PAID",
                "created_at": datetime.now(timezone.utc)
            })

            await db.bookings.insert_one({
                "seeker_id": str(seeker1_id),
                "owner_id": str(chetan_owner_id),
                "property_id": prop_id_str,
                "room_id": str(r2_id),
                "bed_id": str(b1_id),
                "move_in_date": "2026-06-15",
                "stay_duration": "6 Months",
                "status": "APPROVED",
                "notes": "Move-in confirmed",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })

            await db.payments.insert_one({
                "resident_id": str(seeker1_id),
                "property_id": prop_id_str,
                "owner_id": str(chetan_owner_id),
                "amount": 8500.0,
                "currency": "INR",
                "due_date": "2026-08-05",
                "paid_at": datetime.now(timezone.utc).isoformat(),
                "status": "PAID",
                "method": "UPI",
                "transaction_reference": "TXN-984920412",
                "created_at": datetime.now(timezone.utc)
            })

            await db.maintenance_requests.insert_one({
                "property_id": prop_id_str,
                "room_id": str(r2_id),
                "seeker_id": str(seeker1_id),
                "owner_id": str(chetan_owner_id),
                "category": "Plumbing",
                "title": "Water Leakage in Bathroom Sink",
                "description": "Bathroom sink pipe leaking water.",
                "priority": "HIGH",
                "assigned_to": None,
                "status": "REPORTED",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })

    print("✅ Seed script executed cleanly!")
    print("Credentials:")
    print("  Chetan Rangari (Owner): email='chetan@hms.com' password='OwnerPassword123!'")
    print("  Rahul Sharma (Owner):  email='owner@hms.com'  password='OwnerPassword123!'")
    print("  Seeker:                email='seeker@hms.com' password='SeekerPassword123!'")

if __name__ == "__main__":
    asyncio.run(seed_database())
