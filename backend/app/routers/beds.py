from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from app.schemas.schemas import BedCreate, BedResponse, BedStatus
from app.core.database import get_database
from app.dependencies import require_roles
from app.utils.helpers import clean_doc

router = APIRouter(prefix="/rooms/{room_id}/beds", tags=["Beds"])

@router.get("", response_model=List[BedResponse])
async def get_beds_for_room(room_id: str):
    db = get_database()
    cursor = db.beds.find({"room_id": room_id})
    beds = []
    async for b in cursor:
        b = clean_doc(b)
        beds.append(b)
    return beds

@router.patch("/{bed_id}/status", response_model=BedResponse)
async def update_bed_status(room_id: str, bed_id: str, status: BedStatus, current_user: dict = Depends(require_roles(["OWNER", "MANAGER", "ADMIN"]))):
    db = get_database()
    if not ObjectId.is_valid(bed_id):
        raise HTTPException(status_code=400, detail="Invalid bed ID")
        
    await db.beds.update_one({"_id": ObjectId(bed_id)}, {"$set": {"status": status}})
    bed = await db.beds.find_one({"_id": ObjectId(bed_id)})
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
        
    return clean_doc(bed)
