from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import PaymentCreate, PaymentStatus
from app.core.database import get_database
from app.dependencies import get_current_user, require_roles
from app.utils.helpers import clean_doc

router = APIRouter(prefix="", tags=["Residents & Payments"])

async def _enrich_stay(db, r: dict) -> dict:
    if "_id" in r:
        r["id"] = str(r["_id"])
        
    if ObjectId.is_valid(r.get("property_id")):
        p = await db.properties.find_one({"_id": ObjectId(r["property_id"])})
        if p:
            r["property_name"] = p.get("name")
            r["property_address"] = p.get("address")
            r["property_city"] = p.get("city")
            imgs = p.get("images", [])
            r["property_image"] = imgs[0] if imgs else None
            r["deposit"] = p.get("deposit")
            r["minimum_stay"] = p.get("minimum_stay")
            
            # Fetch owner contact info
            if ObjectId.is_valid(p.get("owner_id")):
                owner = await db.users.find_one({"_id": ObjectId(p["owner_id"])})
                if owner:
                    r["owner_name"] = owner.get("name")
                    phone = (owner.get("phone") or "").strip()
                    # Filter out auto-filled dummy phone numbers
                    if phone and phone not in ["93331113311", "+919812345678", "+919876543210"]:
                        r["owner_phone"] = phone
                    else:
                        r["owner_phone"] = None
                    r["owner_email"] = owner.get("email")

    # If room_id missing on resident record, try resolving from approved booking
    if (not r.get("room_id") or not ObjectId.is_valid(r.get("room_id"))) and r.get("seeker_id") and r.get("property_id"):
        b_match = await db.bookings.find_one({
            "seeker_id": str(r["seeker_id"]),
            "property_id": str(r["property_id"]),
            "status": "APPROVED"
        }, sort=[("_id", -1)])
        if b_match:
            if b_match.get("room_id"):
                r["room_id"] = b_match["room_id"]
            if not r.get("bed_id") and b_match.get("bed_id"):
                r["bed_id"] = b_match["bed_id"]

    # If stay_duration or move_in_date missing, resolve from approved booking
    if r.get("seeker_id") and r.get("property_id"):
        if not r.get("stay_duration") or not r.get("move_in_date"):
            b_match = await db.bookings.find_one({
                "seeker_id": str(r["seeker_id"]),
                "property_id": str(r["property_id"]),
                "status": "APPROVED"
            }, sort=[("_id", -1)])
            if b_match:
                if not r.get("stay_duration") and b_match.get("stay_duration"):
                    r["stay_duration"] = b_match["stay_duration"]
                if not r.get("move_in_date") and b_match.get("move_in_date"):
                    r["move_in_date"] = b_match["move_in_date"]

    if not r.get("stay_duration") and r.get("minimum_stay"):
        r["stay_duration"] = r["minimum_stay"]
                    
    if ObjectId.is_valid(r.get("room_id")):
        room = await db.rooms.find_one({"_id": ObjectId(r["room_id"])})
        if room:
            r["room_number"] = room.get("room_number")
            r["room_type"] = room.get("room_type")
            r["monthly_rent"] = room.get("price")
            if room.get("deposit"):
                r["deposit"] = room.get("deposit")
            
    if ObjectId.is_valid(r.get("bed_id")):
        bed = await db.beds.find_one({"_id": ObjectId(r["bed_id"])})
        if bed:
            r["bed_number"] = bed.get("bed_number")
            
    return r

# --- Residents ---
@router.get("/residents")
async def get_residents(current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {}
    if current_user["role"] in ["OWNER", "MANAGER"]:
        query = {"owner_id": current_user["id"]}
    elif current_user["role"] == "SEEKER":
        query = {"seeker_id": current_user["id"]}
        
    cursor = db.residents.find(query)
    residents = []
    async for r in cursor:
        r["id"] = str(r["_id"])
        
        # Enrich resident details
        if ObjectId.is_valid(r.get("seeker_id")):
            user = await db.users.find_one({"_id": ObjectId(r["seeker_id"])})
            if user:
                r["name"] = user.get("name")
                r["email"] = user.get("email")
                r["phone"] = user.get("phone")
                
        if ObjectId.is_valid(r.get("property_id")):
            p = await db.properties.find_one({"_id": ObjectId(r["property_id"])})
            if p:
                r["property_name"] = p.get("name")
                
        if ObjectId.is_valid(r.get("room_id")):
            room = await db.rooms.find_one({"_id": ObjectId(r["room_id"])})
            if room:
                r["room_number"] = room.get("room_number")
                r["rent"] = room.get("price")
                
        residents.append(clean_doc(r))
    return residents

@router.get("/residents/my-stays")
async def get_my_stays(current_user: dict = Depends(require_roles(["SEEKER", "OWNER", "ADMIN"]))):
    db = get_database()
    cursor = db.residents.find({"seeker_id": current_user["id"], "status": "ACTIVE"}).sort("_id", -1)
    stays = []
    seen_props = set()
    async for r in cursor:
        enriched = await _enrich_stay(db, r)
        stays.append(clean_doc(enriched))
        if enriched.get("property_id"):
            seen_props.add(str(enriched["property_id"]))

    # Also check if any approved booking exists not yet in residents
    b_cursor = db.bookings.find({"seeker_id": current_user["id"], "status": "APPROVED"}).sort("_id", -1)
    async for booking in b_cursor:
        p_id = str(booking.get("property_id")) if booking.get("property_id") else None
        if p_id and p_id not in seen_props:
            r = {
                "id": str(booking["_id"]),
                "seeker_id": booking["seeker_id"],
                "owner_id": booking.get("owner_id"),
                "property_id": p_id,
                "room_id": booking.get("room_id"),
                "bed_id": booking.get("bed_id"),
                "move_in_date": booking.get("move_in_date"),
                "stay_duration": booking.get("stay_duration"),
                "status": "ACTIVE"
            }
            enriched = await _enrich_stay(db, r)
            stays.append(clean_doc(enriched))
            seen_props.add(p_id)

    return stays

@router.get("/residents/my-stay")
async def get_my_stay(property_id: Optional[str] = None, current_user: dict = Depends(require_roles(["SEEKER", "OWNER", "ADMIN"]))):
    db = get_database()
    query = {"seeker_id": current_user["id"], "status": "ACTIVE"}
    if property_id and ObjectId.is_valid(property_id):
        query["property_id"] = property_id

    # Sort descending by _id so the newest stay/booking is returned first by default
    r = await db.residents.find_one(query, sort=[("_id", -1)])
    if not r:
        booking_query = {"seeker_id": current_user["id"], "status": "APPROVED"}
        if property_id and ObjectId.is_valid(property_id):
            booking_query["property_id"] = property_id
        booking = await db.bookings.find_one(booking_query, sort=[("_id", -1)])
        if not booking:
            return None
        r = {
            "id": str(booking["_id"]),
            "seeker_id": booking["seeker_id"],
            "owner_id": booking.get("owner_id"),
            "property_id": booking.get("property_id"),
            "room_id": booking.get("room_id"),
            "bed_id": booking.get("bed_id"),
            "move_in_date": booking.get("move_in_date"),
            "stay_duration": booking.get("stay_duration"),
            "status": "ACTIVE"
        }

    enriched = await _enrich_stay(db, r)
    return clean_doc(enriched)

# --- Payments ---
@router.post("/payments")
async def record_payment(payment_in: PaymentCreate, current_user: dict = Depends(require_roles(["OWNER", "MANAGER", "ADMIN"]))):
    db = get_database()
    doc = {
        "resident_id": payment_in.resident_id,
        "property_id": payment_in.property_id,
        "owner_id": current_user["id"],
        "amount": payment_in.amount,
        "currency": payment_in.currency,
        "due_date": payment_in.due_date,
        "paid_at": datetime.utcnow().isoformat(),
        "status": PaymentStatus.PAID,
        "method": payment_in.method,
        "transaction_reference": payment_in.transaction_reference or f"TXN-{int(datetime.utcnow().timestamp())}",
        "created_at": datetime.utcnow()
    }
    
    res = await db.payments.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return clean_doc(doc)

@router.get("/payments")
async def get_payments(current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {}
    if current_user["role"] in ["OWNER", "MANAGER"]:
        query = {"owner_id": current_user["id"]}
    elif current_user["role"] == "SEEKER":
        query = {"resident_id": current_user["id"]}
        
    cursor = db.payments.find(query).sort("created_at", -1)
    payments = []
    async for p in cursor:
        p["id"] = str(p["_id"])
        if ObjectId.is_valid(p.get("resident_id")):
            u = await db.users.find_one({"_id": ObjectId(p["resident_id"])})
            if u:
                p["resident_name"] = u.get("name")
        payments.append(clean_doc(p))
    return payments
