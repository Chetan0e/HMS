from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import RoomCreate, RoomUpdate, RoomResponse, BedCreate, BedResponse, BedStatus
from app.core.database import get_database
from app.dependencies import get_current_user, require_roles
from app.utils.helpers import clean_doc

router = APIRouter(prefix="/properties/{property_id}/rooms", tags=["Rooms"])

@router.post("", response_model=RoomResponse)
async def create_room(property_id: str, room_in: RoomCreate, current_user: dict = Depends(require_roles(["OWNER", "MANAGER", "ADMIN"]))):
    db = get_database()
    if not ObjectId.is_valid(property_id):
        raise HTTPException(status_code=400, detail="Invalid property ID")
        
    prop = await db.properties.find_one({"_id": ObjectId(property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    doc = {
        "property_id": property_id,
        "room_number": room_in.room_number,
        "floor": room_in.floor,
        "room_type": room_in.room_type,
        "capacity": room_in.capacity,
        "price": room_in.price,
        "deposit": room_in.deposit,
        "amenities": room_in.amenities,
        "description": room_in.description or "",
        "status": "AVAILABLE",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    res = await db.rooms.insert_one(doc)
    room_id = str(res.inserted_id)
    
    # Auto create beds based on room capacity
    beds_docs = []
    bed_letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
    for i in range(room_in.capacity):
        letter = bed_letters[i] if i < len(bed_letters) else str(i+1)
        beds_docs.append({
            "property_id": property_id,
            "room_id": room_id,
            "bed_number": f"Bed {letter}",
            "status": BedStatus.AVAILABLE,
            "resident_id": None,
            "booking_id": None,
            "created_at": datetime.utcnow()
        })
        
    if beds_docs:
        await db.beds.insert_many(beds_docs)
        
    doc["id"] = room_id
    doc["available_beds"] = room_in.capacity
    doc["total_beds"] = room_in.capacity
    return clean_doc(doc)

@router.get("", response_model=List[RoomResponse])
async def get_rooms_by_property(property_id: str):
    db = get_database()
    cursor = db.rooms.find({"property_id": property_id})
    rooms = []
    async for room in cursor:
        room = clean_doc(room)
        r_id = room["id"]
        
        # Fetch beds
        beds_cursor = db.beds.find({"room_id": r_id})
        beds = []
        avail_count = 0
        async for b in beds_cursor:
            b = clean_doc(b)
            if b.get("status") == BedStatus.AVAILABLE:
                avail_count += 1
            beds.append(b)
            
        room["beds"] = beds
        room["available_beds"] = avail_count
        room["total_beds"] = len(beds)
        rooms.append(room)
        
    return rooms

@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(
    property_id: str,
    room_id: str,
    room_update: RoomUpdate,
    current_user: dict = Depends(require_roles(["OWNER", "MANAGER", "ADMIN"]))
):
    db = get_database()
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="Invalid room ID")

    existing = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Room not found")

    update_data = {k: v for k, v in room_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.rooms.update_one({"_id": ObjectId(room_id)}, {"$set": update_data})

    # Adjust bed count if capacity changed
    if "capacity" in update_data:
        new_cap = update_data["capacity"]
        existing_beds = await db.beds.find({"room_id": room_id}).to_list(100)
        curr_len = len(existing_beds)
        bed_letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
        if new_cap > curr_len:
            add_docs = []
            for i in range(curr_len, new_cap):
                letter = bed_letters[i] if i < len(bed_letters) else str(i+1)
                add_docs.append({
                    "property_id": property_id,
                    "room_id": room_id,
                    "bed_number": f"Bed {letter}",
                    "status": BedStatus.AVAILABLE,
                    "resident_id": None,
                    "booking_id": None,
                    "created_at": datetime.utcnow()
                })
            if add_docs:
                await db.beds.insert_many(add_docs)
        elif new_cap < curr_len:
            # remove excess available beds
            excess = curr_len - new_cap
            avail_beds = [b for b in existing_beds if b.get("status") == BedStatus.AVAILABLE]
            to_remove = avail_beds[-excess:]
            if to_remove:
                del_ids = [b["_id"] for b in to_remove]
                await db.beds.delete_many({"_id": {"$in": del_ids}})

    updated = await db.rooms.find_one({"_id": ObjectId(room_id)})
    updated = clean_doc(updated)

    beds_cursor = db.beds.find({"room_id": room_id})
    beds = []
    avail_count = 0
    async for b in beds_cursor:
        b = clean_doc(b)
        if b.get("status") == BedStatus.AVAILABLE:
            avail_count += 1
        beds.append(b)

    updated["beds"] = beds
    updated["available_beds"] = avail_count
    updated["total_beds"] = len(beds)
    return updated

@router.delete("/{room_id}")
async def delete_room(property_id: str, room_id: str, current_user: dict = Depends(require_roles(["OWNER", "MANAGER", "ADMIN"]))):
    db = get_database()
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="Invalid room ID")
        
    await db.rooms.delete_one({"_id": ObjectId(room_id)})
    await db.beds.delete_many({"room_id": room_id})
    return {"message": "Room and associated beds deleted"}
