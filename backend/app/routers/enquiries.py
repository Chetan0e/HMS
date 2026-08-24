from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import EnquiryCreate, VisitCreate, EnquiryStatus, VisitStatus
from app.core.database import get_database
from app.dependencies import get_current_user, require_roles

from app.utils.helpers import clean_doc

router = APIRouter(prefix="", tags=["Enquiries & Visits"])

# --- Enquiries ---
@router.post("/enquiries")
async def create_enquiry(enquiry_in: EnquiryCreate, current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    if not ObjectId.is_valid(enquiry_in.property_id):
        raise HTTPException(status_code=400, detail="Invalid property ID")
        
    prop = await db.properties.find_one({"_id": ObjectId(enquiry_in.property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    doc = {
        "seeker_id": current_user["id"],
        "owner_id": prop["owner_id"],
        "property_id": enquiry_in.property_id,
        "room_id": enquiry_in.room_id,
        "message": enquiry_in.message,
        "status": EnquiryStatus.OPEN,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    res = await db.enquiries.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return clean_doc(doc)

@router.get("/enquiries")
async def get_enquiries(current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {}
    if current_user["role"] == "SEEKER":
        query = {"seeker_id": current_user["id"]}
    elif current_user["role"] in ["OWNER", "MANAGER"]:
        query = {"owner_id": current_user["id"]}
        
    cursor = db.enquiries.find(query).sort("created_at", -1)
    enquiries = []
    async for e in cursor:
        e = clean_doc(e)
        if ObjectId.is_valid(e.get("property_id")):
            p = await db.properties.find_one({"_id": ObjectId(e["property_id"])})
            if p:
                e["property_name"] = p.get("name")
        if ObjectId.is_valid(e.get("seeker_id")):
            u = await db.users.find_one({"_id": ObjectId(e["seeker_id"])})
            if u:
                e["seeker_name"] = u.get("name")
        enquiries.append(e)
    return enquiries

# --- Visits ---
@router.post("/visits")
async def create_visit(visit_in: VisitCreate, current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    if not ObjectId.is_valid(visit_in.property_id):
        raise HTTPException(status_code=400, detail="Invalid property ID")
        
    prop = await db.properties.find_one({"_id": ObjectId(visit_in.property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    doc = {
        "seeker_id": current_user["id"],
        "owner_id": prop["owner_id"],
        "property_id": visit_in.property_id,
        "proposed_date": visit_in.proposed_date,
        "proposed_time": visit_in.proposed_time,
        "status": VisitStatus.PENDING,
        "notes": visit_in.notes or "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    res = await db.visits.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return clean_doc(doc)

@router.get("/visits")
async def get_visits(current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {}
    if current_user["role"] == "SEEKER":
        query = {"seeker_id": current_user["id"]}
    elif current_user["role"] in ["OWNER", "MANAGER"]:
        query = {"owner_id": current_user["id"]}
        
    cursor = db.visits.find(query).sort("created_at", -1)
    visits = []
    async for v in cursor:
        v = clean_doc(v)
        if ObjectId.is_valid(v.get("property_id")):
            p = await db.properties.find_one({"_id": ObjectId(v["property_id"])})
            if p:
                v["property_name"] = p.get("name")
                v["address"] = p.get("address")
        if ObjectId.is_valid(v.get("seeker_id")):
            u = await db.users.find_one({"_id": ObjectId(v["seeker_id"])})
            if u:
                v["seeker_name"] = u.get("name")
                v["seeker_phone"] = u.get("phone")
        visits.append(v)
    return visits

@router.patch("/visits/{visit_id}/status")
async def update_visit_status(visit_id: str, status: VisitStatus, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if not ObjectId.is_valid(visit_id):
        raise HTTPException(status_code=400, detail="Invalid visit ID")
        
    await db.visits.update_one({"_id": ObjectId(visit_id)}, {"$set": {"status": status, "updated_at": datetime.utcnow()}})
    visit = await db.visits.find_one({"_id": ObjectId(visit_id)})
    return clean_doc(visit)

@router.patch("/visits/{visit_id}/cancel")
async def cancel_visit(visit_id: str, current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    if not ObjectId.is_valid(visit_id):
        raise HTTPException(status_code=400, detail="Invalid visit ID")
        
    await db.visits.update_one(
        {"_id": ObjectId(visit_id), "seeker_id": current_user["id"]},
        {"$set": {"status": VisitStatus.CANCELLED, "updated_at": datetime.utcnow()}}
    )
    visit = await db.visits.find_one({"_id": ObjectId(visit_id)})
    return clean_doc(visit)

