from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.dependencies import require_roles, get_current_user

from app.utils.helpers import clean_doc

router = APIRouter(prefix="", tags=["Admin & Analytics"])

# --- Verification & Admin ---
@router.get("/admin/verification-queue")
async def get_verification_queue(current_user: dict = Depends(require_roles(["ADMIN"]))):
    db = get_database()
    cursor = db.properties.find({"verification_status": "Pending"}).sort("created_at", -1)
    props = []
    async for p in cursor:
        props.append(clean_doc(p))
    return props

@router.post("/admin/properties/{property_id}/verify")
async def verify_property(property_id: str, verification_status: str, notes: Optional[str] = "", current_user: dict = Depends(require_roles(["ADMIN"]))):
    db = get_database()
    if not ObjectId.is_valid(property_id):
        raise HTTPException(status_code=400, detail="Invalid property ID")
        
    prop_status = "Published" if verification_status == "Verified" else "Pending Verification"
    if verification_status == "Rejected":
        prop_status = "Archived"
        
    await db.properties.update_one(
        {"_id": ObjectId(property_id)},
        {"$set": {
            "verification_status": verification_status,
            "property_status": prop_status,
            "verification_notes": notes,
            "updated_at": datetime.utcnow()
        }}
    )
    
    prop = await db.properties.find_one({"_id": ObjectId(property_id)})
    if prop:
        # Notify owner
        await db.notifications.insert_one({
            "user_id": prop["owner_id"],
            "title": f"Property Verification {verification_status}",
            "message": f"Your property '{prop['name']}' verification status has been set to {verification_status}.",
            "type": "VERIFICATION",
            "read": False,
            "created_at": datetime.utcnow()
        })
        
    return {"message": f"Property verification updated to {verification_status}"}

@router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(require_roles(["ADMIN"]))):
    db = get_database()
    cursor = db.users.find().sort("created_at", -1)
    users = []
    async for u in cursor:
        u_clean = clean_doc(u)
        u_clean.pop("password_hash", None)
        users.append(u_clean)
    return users

# --- Owner & Admin Analytics ---
@router.get("/analytics/owner")
async def get_owner_analytics(current_user: dict = Depends(get_current_user)):
    db = get_database()
    owner_id = current_user["id"]
    
    owner_props = []
    async for p in db.properties.find({"$or": [{"owner_id": owner_id}, {"manager_ids": owner_id}]}):
        owner_props.append(p)
        
    prop_ids = [str(p["_id"]) for p in owner_props]
    total_properties = len(owner_props)
    
    total_rooms = await db.rooms.count_documents({"property_id": {"$in": prop_ids}}) if prop_ids else 0
    
    beds_cursor = db.beds.find({"property_id": {"$in": prop_ids}}) if prop_ids else None
    total_beds = 0
    occupied_beds = 0
    available_beds = 0
    if beds_cursor:
        async for b in beds_cursor:
            total_beds += 1
            if b.get("status") == "OCCUPIED":
                occupied_beds += 1
            elif b.get("status") == "AVAILABLE":
                available_beds += 1
                
    total_bookings = await db.bookings.count_documents({"owner_id": owner_id})
    pending_enquiries = await db.enquiries.count_documents({"owner_id": owner_id, "status": "OPEN"})
    upcoming_visits = await db.visits.count_documents({"owner_id": owner_id, "status": "PENDING"}) if "visits" in await db.list_collection_names() else 0
    
    payments_cursor = db.payments.find({"owner_id": owner_id, "status": "PAID"})
    total_revenue = sum([p.get("amount", 0) async for p in payments_cursor])
    
    occupancy_rate = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0.0

    property_comparison = []
    for prop in owner_props:
        pid_str = str(prop["_id"])
        p_beds = await db.beds.count_documents({"property_id": pid_str})
        p_occ = await db.beds.count_documents({"property_id": pid_str, "status": "OCCUPIED"})
        p_rate = round((p_occ / p_beds * 100), 1) if p_beds > 0 else 0.0
        property_comparison.append({
            "name": prop.get("name", "Stay"),
            "occupancy": p_rate,
            "beds": p_beds
        })
    
    return {
        "total_properties": total_properties,
        "total_rooms": total_rooms,
        "total_beds": total_beds,
        "occupied_beds": occupied_beds,
        "available_beds": available_beds,
        "occupancy_rate": occupancy_rate,
        "total_bookings": total_bookings,
        "pending_enquiries": pending_enquiries,
        "upcoming_visits": upcoming_visits,
        "total_revenue": total_revenue,
        "occupancy_trend": [
            {"month": "Jan", "occupancy": round(occupancy_rate * 0.7, 1) if occupancy_rate > 0 else 0},
            {"month": "Feb", "occupancy": round(occupancy_rate * 0.8, 1) if occupancy_rate > 0 else 0},
            {"month": "Mar", "occupancy": round(occupancy_rate * 0.85, 1) if occupancy_rate > 0 else 0},
            {"month": "Apr", "occupancy": round(occupancy_rate * 0.9, 1) if occupancy_rate > 0 else 0},
            {"month": "May", "occupancy": round(occupancy_rate * 0.95, 1) if occupancy_rate > 0 else 0},
            {"month": "Jun", "occupancy": occupancy_rate}
        ],
        "property_comparison": property_comparison
    }




@router.get("/analytics/admin")
async def get_admin_analytics(current_user: dict = Depends(require_roles(["ADMIN"]))):
    db = get_database()
    
    total_users = await db.users.count_documents({})
    total_seekers = await db.users.count_documents({"role": "SEEKER"})
    total_owners = await db.users.count_documents({"role": "OWNER"})
    total_properties = await db.properties.count_documents({})
    verified_properties = await db.properties.count_documents({"verification_status": "Verified"})
    total_bookings = await db.bookings.count_documents({})
    
    return {
        "total_users": total_users,
        "total_seekers": total_seekers,
        "total_owners": total_owners,
        "total_properties": total_properties,
        "verified_properties": verified_properties,
        "total_bookings": total_bookings
    }
