from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.dependencies import get_current_user, require_roles
from app.utils.storage import save_uploaded_file

router = APIRouter(prefix="", tags=["Notifications, Saved & Uploads"])

# --- Notifications ---
@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.notifications.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(50)
    items = []
    async for n in cursor:
        n["id"] = str(n["_id"])
        items.append(n)
    return items

@router.patch("/notifications/{n_id}/read")
async def mark_notification_read(n_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    await db.notifications.update_one({"_id": ObjectId(n_id), "user_id": current_user["id"]}, {"$set": {"read": True}})
    return {"message": "Marked read"}

@router.patch("/notifications/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    db = get_database()
    await db.notifications.update_many({"user_id": current_user["id"]}, {"$set": {"read": True}})
    return {"message": "All marked read"}

# --- Saved Properties ---
@router.get("/saved-properties")
async def get_saved_properties(current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    cursor = db.saved_properties.find({"seeker_id": current_user["id"]})
    prop_ids = [s["property_id"] async for s in cursor]
    
    props = []
    for pid in prop_ids:
        if ObjectId.is_valid(pid):
            p = await db.properties.find_one({"_id": ObjectId(pid)})
            if p:
                p["id"] = str(p["_id"])
                props.append(p)
    return props

@router.post("/saved-properties/{property_id}")
async def toggle_save_property(property_id: str, current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    existing = await db.saved_properties.find_one({
        "seeker_id": current_user["id"],
        "property_id": property_id
    })
    
    if existing:
        await db.saved_properties.delete_one({"_id": existing["_id"]})
        return {"saved": False, "message": "Removed from saved"}
    else:
        await db.saved_properties.insert_one({
            "seeker_id": current_user["id"],
            "property_id": property_id,
            "created_at": datetime.utcnow()
        })
        return {"saved": True, "message": "Saved successfully"}

# --- Uploads ---
@router.post("/uploads")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    url = await save_uploaded_file(file)
    return {"url": url, "filename": file.filename}
