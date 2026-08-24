from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import MaintenanceCreate, MaintenanceStatus, ReviewCreate
from app.core.database import get_database
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="", tags=["Maintenance & Reviews"])

# --- Maintenance ---
@router.post("/maintenance")
async def create_maintenance_request(m_in: MaintenanceCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    prop = await db.properties.find_one({"_id": ObjectId(m_in.property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    doc = {
        "property_id": m_in.property_id,
        "room_id": m_in.room_id,
        "seeker_id": current_user["id"],
        "owner_id": prop["owner_id"],
        "category": m_in.category,
        "title": m_in.title,
        "description": m_in.description,
        "priority": m_in.priority,
        "assigned_to": None,
        "status": MaintenanceStatus.REPORTED,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    res = await db.maintenance_requests.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return doc

@router.get("/maintenance")
async def get_maintenance_requests(current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {}
    if current_user["role"] == "SEEKER":
        query = {"seeker_id": current_user["id"]}
    elif current_user["role"] in ["OWNER", "MANAGER"]:
        query = {"owner_id": current_user["id"]}
        
    cursor = db.maintenance_requests.find(query).sort("created_at", -1)
    items = []
    async for m in cursor:
        m["id"] = str(m["_id"])
        if ObjectId.is_valid(m["property_id"]):
            p = await db.properties.find_one({"_id": ObjectId(m["property_id"])})
            if p:
                m["property_name"] = p.get("name")
        items.append(m)
    return items

@router.patch("/maintenance/{m_id}/status")
async def update_maintenance_status(m_id: str, status: MaintenanceStatus, current_user: dict = Depends(require_roles(["OWNER", "MANAGER", "ADMIN"]))):
    db = get_database()
    await db.maintenance_requests.update_one({"_id": ObjectId(m_id)}, {"$set": {"status": status, "updated_at": datetime.utcnow()}})
    doc = await db.maintenance_requests.find_one({"_id": ObjectId(m_id)})
    doc["id"] = str(doc["_id"])
    return doc

# --- Reviews ---
@router.post("/reviews")
async def create_review(r_in: ReviewCreate, current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    
    # Check duplicate review
    existing = await db.reviews.find_one({
        "property_id": r_in.property_id,
        "seeker_id": current_user["id"],
        "booking_id": r_in.booking_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a review for this stay")
        
    overall = (r_in.cleanliness + r_in.food + r_in.location + r_in.safety + r_in.owner + r_in.facilities) / 6.0
    
    doc = {
        "property_id": r_in.property_id,
        "seeker_id": current_user["id"],
        "booking_id": r_in.booking_id,
        "overall": round(overall, 1),
        "cleanliness": r_in.cleanliness,
        "food": r_in.food,
        "location": r_in.location,
        "safety": r_in.safety,
        "owner": r_in.owner,
        "facilities": r_in.facilities,
        "comment": r_in.comment,
        "response": None,
        "created_at": datetime.utcnow()
    }
    
    res = await db.reviews.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    
    # Recalculate property rating
    all_reviews = await db.reviews.find({"property_id": r_in.property_id}).to_list(1000)
    avg_rating = sum(r["overall"] for r in all_reviews) / len(all_reviews)
    await db.properties.update_one(
        {"_id": ObjectId(r_in.property_id)},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(all_reviews)}}
    )
    
    return doc

@router.get("/properties/{property_id}/reviews")
async def get_property_reviews(property_id: str):
    db = get_database()
    cursor = db.reviews.find({"property_id": property_id}).sort("created_at", -1)
    reviews = []
    async for r in cursor:
        r["id"] = str(r["_id"])
        if ObjectId.is_valid(r["seeker_id"]):
            u = await db.users.find_one({"_id": ObjectId(r["seeker_id"])})
            if u:
                r["author_name"] = u.get("name")
        reviews.append(r)
    return reviews
