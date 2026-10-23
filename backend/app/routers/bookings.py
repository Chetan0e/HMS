from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import BookingCreate, BookingResponse, BookingStatus, BookingStatusUpdate, BedStatus
from app.core.database import get_database
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse)
async def create_booking(booking_in: BookingCreate, current_user: dict = Depends(require_roles(["SEEKER", "OWNER", "ADMIN"]))):
    db = get_database()
    
    if not ObjectId.is_valid(booking_in.property_id) or not ObjectId.is_valid(booking_in.room_id):
        raise HTTPException(status_code=400, detail="Invalid property or room ID")
        
    prop = await db.properties.find_one({"_id": ObjectId(booking_in.property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    room = await db.rooms.find_one({"_id": ObjectId(booking_in.room_id)})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Check if user already has an active pending or approved booking for this property
    existing_active = await db.bookings.find_one({
        "seeker_id": current_user["id"],
        "property_id": booking_in.property_id,
        "status": {"$in": [BookingStatus.PENDING, BookingStatus.APPROVED]}
    })

    if existing_active:
        if existing_active.get("status") == BookingStatus.APPROVED:
            raise HTTPException(status_code=400, detail="You already have an active approved booking for this property.")
            
        # Update existing pending booking request with new preferences
        await db.bookings.update_one(
            {"_id": existing_active["_id"]},
            {"$set": {
                "room_id": booking_in.room_id,
                "move_in_date": booking_in.move_in_date,
                "stay_duration": booking_in.stay_duration,
                "notes": booking_in.notes or "",
                "updated_at": datetime.utcnow()
            }}
        )
        existing_active["id"] = str(existing_active["_id"])
        existing_active["property_name"] = prop["name"]
        existing_active["seeker_name"] = current_user["name"]
        existing_active["room_id"] = booking_in.room_id
        existing_active["move_in_date"] = booking_in.move_in_date
        existing_active["stay_duration"] = booking_in.stay_duration
        existing_active["notes"] = booking_in.notes or ""
        return existing_active
        
    stay_dur = booking_in.stay_duration if (booking_in.stay_duration and booking_in.stay_duration.strip()) else prop.get("minimum_stay", "1 Month")
    doc = {
        "seeker_id": current_user["id"],
        "owner_id": prop["owner_id"],
        "property_id": booking_in.property_id,
        "room_id": booking_in.room_id,
        "bed_id": None,
        "move_in_date": booking_in.move_in_date,
        "stay_duration": stay_dur,
        "status": BookingStatus.PENDING,
        "notes": booking_in.notes or "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    res = await db.bookings.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc["property_name"] = prop["name"]
    doc["seeker_name"] = current_user["name"]
    
    # Notify owner
    await db.notifications.insert_one({
        "user_id": prop["owner_id"],
        "title": "New Booking Request",
        "message": f"{current_user['name']} requested a booking at {prop['name']}",
        "type": "BOOKING",
        "read": False,
        "created_at": datetime.utcnow()
    })
    
    return doc

@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {}
    if current_user["role"] == "SEEKER":
        query = {"seeker_id": current_user["id"]}
    elif current_user["role"] in ["OWNER", "MANAGER"]:
        query = {"owner_id": current_user["id"]}
    elif current_user["role"] == "ADMIN":
        query = {}
        
    cursor = db.bookings.find(query).sort("created_at", -1)
    bookings = []
    async for b in cursor:
        b["id"] = str(b["_id"])
        
        # Enrich with property info
        if ObjectId.is_valid(b.get("property_id")):
            p = await db.properties.find_one({"_id": ObjectId(b["property_id"])})
            if p:
                b["property_name"] = p.get("name")
                b["property_address"] = p.get("address")
                b["property_city"] = p.get("city")

        # Enrich with seeker info
        if ObjectId.is_valid(b.get("seeker_id")):
            u = await db.users.find_one({"_id": ObjectId(b["seeker_id"])})
            if u:
                b["seeker_name"] = u.get("name")
                b["seeker_email"] = u.get("email")
                b["seeker_phone"] = u.get("phone")

        # Enrich with room info
        if ObjectId.is_valid(b.get("room_id")):
            r = await db.rooms.find_one({"_id": ObjectId(b["room_id"])})
            if r:
                b["room_number"] = r.get("room_number")
                b["room_type"] = r.get("room_type")
                b["room_price"] = r.get("price")
                
        bookings.append(b)
    return bookings

@router.patch("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: str,
    status_update: BookingStatusUpdate,
    current_user: dict = Depends(require_roles(["OWNER", "MANAGER", "ADMIN"]))
):
    db = get_database()
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
        
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    new_status = status_update.status
    assigned_bed_id = status_update.bed_id
    
    # If approving, assign available bed if not provided
    if new_status == BookingStatus.APPROVED:
        if not assigned_bed_id:
            # find available bed in room
            avail_bed = await db.beds.find_one({
                "room_id": booking["room_id"],
                "status": BedStatus.AVAILABLE
            })
            if not avail_bed:
                # Auto-create an available bed for this room so approval succeeds smoothly
                new_bed_doc = {
                    "property_id": booking["property_id"],
                    "room_id": booking["room_id"],
                    "bed_number": f"Bed-1",
                    "status": BedStatus.AVAILABLE,
                    "resident_id": None,
                    "booking_id": None,
                    "created_at": datetime.utcnow()
                }
                res_bed = await db.beds.insert_one(new_bed_doc)
                assigned_bed_id = str(res_bed.inserted_id)
            else:
                assigned_bed_id = str(avail_bed["_id"])
            
        # Update bed to RESERVED / OCCUPIED
        await db.beds.update_one(
            {"_id": ObjectId(assigned_bed_id)},
            {"$set": {
                "status": BedStatus.OCCUPIED,
                "resident_id": booking["seeker_id"],
                "booking_id": booking_id
            }}
        )
        
        # Also create a Resident record automatically
        prop_stay = prop.get("minimum_stay", "1 Month") if prop else "1 Month"
        stay_dur = booking.get("stay_duration") or prop_stay
        await db.residents.update_one(
            {"seeker_id": booking["seeker_id"], "property_id": booking["property_id"]},
            {"$set": {
                "seeker_id": booking["seeker_id"],
                "owner_id": booking["owner_id"],
                "property_id": booking["property_id"],
                "room_id": booking["room_id"],
                "bed_id": assigned_bed_id,
                "move_in_date": booking["move_in_date"],
                "stay_duration": stay_dur,
                "status": "ACTIVE",
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {
            "status": new_status,
            "bed_id": assigned_bed_id or booking.get("bed_id"),
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Notify Seeker
    await db.notifications.insert_one({
        "user_id": booking["seeker_id"],
        "title": f"Booking {new_status.value}",
        "message": f"Your booking request status has been updated to {new_status.value}.",
        "type": "BOOKING",
        "read": False,
        "created_at": datetime.utcnow()
    })
    
    updated = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    updated["id"] = str(updated["_id"])
    if ObjectId.is_valid(updated.get("property_id")):
        p = await db.properties.find_one({"_id": ObjectId(updated["property_id"])})
        if p:
            updated["property_name"] = p.get("name")
            updated["property_address"] = p.get("address")
            updated["property_city"] = p.get("city")
    if ObjectId.is_valid(updated.get("seeker_id")):
        u = await db.users.find_one({"_id": ObjectId(updated["seeker_id"])})
        if u:
            updated["seeker_name"] = u.get("name")
            updated["seeker_email"] = u.get("email")
            updated["seeker_phone"] = u.get("phone")
    if ObjectId.is_valid(updated.get("room_id")):
        r = await db.rooms.find_one({"_id": ObjectId(updated["room_id"])})
        if r:
            updated["room_number"] = r.get("room_number")
            updated["room_type"] = r.get("room_type")
            updated["room_price"] = r.get("price")
            
    return updated

@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(require_roles(["SEEKER"]))
):
    db = get_database()
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
        
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id), "seeker_id": current_user["id"]})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found")
        
    if booking.get("status") not in [BookingStatus.PENDING, BookingStatus.APPROVED]:
        raise HTTPException(status_code=400, detail="Cannot cancel this booking")
        
    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {
            "status": BookingStatus.CANCELLED,
            "updated_at": datetime.utcnow()
        }}
    )
    
    updated = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    updated["id"] = str(updated["_id"])
    return updated

