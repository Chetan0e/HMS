from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import PaymentCreate, PaymentStatus
from app.core.database import get_database
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="", tags=["Residents & Payments"])

# --- Residents ---
@router.get("/residents")
async def get_residents(current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {}
    if current_user["role"] in ["OWNER", "MANAGER", "SEEKER"]:
        query = {"owner_id": current_user["id"]}

        
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
                
        residents.append(r)
    return residents

@router.get("/residents/my-stay")
async def get_my_stay(current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    r = await db.residents.find_one({"seeker_id": current_user["id"], "status": "ACTIVE"})
    if not r:
        return None
        
    r["id"] = str(r["_id"])
    
    if ObjectId.is_valid(r.get("property_id")):
        p = await db.properties.find_one({"_id": ObjectId(r["property_id"])})
        if p:
            r["property_name"] = p.get("name")
            r["property_address"] = p.get("address")
            r["property_city"] = p.get("city")
            r["property_image"] = p.get("images", [None])[0]
            
            # Fetch owner contact info
            if ObjectId.is_valid(p.get("owner_id")):
                owner = await db.users.find_one({"_id": ObjectId(p["owner_id"])})
                if owner:
                    r["owner_name"] = owner.get("name")
                    r["owner_phone"] = owner.get("phone")
                    r["owner_email"] = owner.get("email")
                    
    if ObjectId.is_valid(r.get("room_id")):
        room = await db.rooms.find_one({"_id": ObjectId(r["room_id"])})
        if room:
            r["room_number"] = room.get("room_number")
            r["room_type"] = room.get("room_type")
            r["monthly_rent"] = room.get("price")
            r["deposit"] = room.get("deposit")
            
    if ObjectId.is_valid(r.get("bed_id")):
        bed = await db.beds.find_one({"_id": ObjectId(r["bed_id"])})
        if bed:
            r["bed_number"] = bed.get("bed_number")
            
    return r

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
    return doc

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
        payments.append(p)
    return payments
