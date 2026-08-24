from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_database
from app.dependencies import get_current_user, require_roles

from app.utils.helpers import clean_doc

router = APIRouter(prefix="/saved-properties", tags=["Saved Properties"])

@router.get("")
async def get_saved_properties(current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    cursor = db.saved_properties.find({"seeker_id": current_user["id"]}).sort("created_at", -1)
    
    saved_list = []
    async for s in cursor:
        prop_id = s.get("property_id")
        if ObjectId.is_valid(prop_id):
            prop = await db.properties.find_one({"_id": ObjectId(prop_id)})
            if prop:
                prop = clean_doc(prop)
                
                # Calculate starting price from rooms
                rooms_cursor = db.rooms.find({"property_id": prop["id"]})
                rooms = await rooms_cursor.to_list(100)
                prices = [r.get("price", 0) for r in rooms if "price" in r]
                prop["pricing_starting_from"] = min(prices) if prices else 0.0
                
                saved_list.append(prop)
    return saved_list

@router.post("/{property_id}")
async def save_property(property_id: str, current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    if not ObjectId.is_valid(property_id):
        raise HTTPException(status_code=400, detail="Invalid property ID")
        
    prop = await db.properties.find_one({"_id": ObjectId(property_id)})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    existing = await db.saved_properties.find_one({
        "seeker_id": current_user["id"],
        "property_id": property_id
    })
    
    if not existing:
        await db.saved_properties.insert_one({
            "seeker_id": current_user["id"],
            "property_id": property_id,
            "created_at": datetime.now(timezone.utc)
        })
        
    return {"message": "Property saved successfully", "saved": True}

@router.delete("/{property_id}")
async def remove_saved_property(property_id: str, current_user: dict = Depends(require_roles(["SEEKER"]))):
    db = get_database()
    await db.saved_properties.delete_one({
        "seeker_id": current_user["id"],
        "property_id": property_id
    })
    return {"message": "Property removed from saved stays", "saved": False}
