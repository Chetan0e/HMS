from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging
import certifi

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_manager = DatabaseManager()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB at %s", settings.MONGODB_URL)
    kwargs = {}
    if "mongodb+srv" in settings.MONGODB_URL or "tls=true" in settings.MONGODB_URL.lower() or "ssl=true" in settings.MONGODB_URL.lower():
        kwargs["tlsCAFile"] = certifi.where()
        kwargs["tlsAllowInvalidCertificates"] = True

    db_manager.client = AsyncIOMotorClient(settings.MONGODB_URL, **kwargs)
    db_manager.db = db_manager.client[settings.MONGODB_DATABASE]
    logger.info("Connected to MongoDB database: %s", settings.MONGODB_DATABASE)
    await create_indexes()

async def close_mongo_connection():
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    return db_manager.db

async def create_indexes():
    db = get_database()
    if db is None:
        return
    
    try:
        # Users indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("phone")
        
        # Properties indexes
        await db.properties.create_index("owner_id")
        await db.properties.create_index("slug", unique=True)
        await db.properties.create_index("city")
        await db.properties.create_index("verification_status")
        await db.properties.create_index("property_status")
        await db.properties.create_index([("location", "2dsphere")])
        await db.properties.create_index("created_at")
        
        # Rooms & Beds indexes
        await db.rooms.create_index("property_id")
        await db.beds.create_index("room_id")
        await db.beds.create_index("status")
        
        # Bookings indexes
        await db.bookings.create_index("seeker_id")
        await db.bookings.create_index("owner_id")
        await db.bookings.create_index("property_id")
        await db.bookings.create_index("room_id")
        await db.bookings.create_index("bed_id")
        await db.bookings.create_index("status")
        
        # Enquiries & Visits indexes
        await db.enquiries.create_index("owner_id")
        await db.enquiries.create_index("seeker_id")
        await db.enquiries.create_index("property_id")
        await db.visits.create_index("property_id")
        await db.visits.create_index("seeker_id")
        await db.visits.create_index("owner_id")
        
        # Reviews & Notifications & Messages
        await db.reviews.create_index("property_id")
        await db.reviews.create_index("seeker_id")
        await db.notifications.create_index("user_id")
        await db.messages.create_index("conversation_id")
        await db.saved_properties.create_index([("seeker_id", 1), ("property_id", 1)], unique=True)
        
        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.warning("Failed creating indexes (might already exist or mongo connecting): %s", e)
