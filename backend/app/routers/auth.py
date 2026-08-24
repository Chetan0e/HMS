from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.core.database import get_database
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    db = get_database()
    
    # Check existing user
    existing_email = await db.users.find_one({"email": user_data.email.lower()})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    existing_phone = await db.users.find_one({"phone": user_data.phone})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    user_doc = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "phone": user_data.phone,
        "password_hash": get_password_hash(user_data.password),
        "role": user_data.role,
        "profile_image": None,
        "account_status": "ACTIVE",
        "verification_status": "UNVERIFIED",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, role=user_data.role)
    refresh_token = create_refresh_token(user_id, role=user_data.role)
    
    user_dict = {
        "id": user_id,
        "name": user_doc["name"],
        "email": user_doc["email"],
        "phone": user_doc["phone"],
        "role": user_doc["role"],
        "account_status": user_doc["account_status"],
        "verification_status": user_doc["verification_status"],
        "profile_image": user_doc["profile_image"],
        "created_at": user_doc["created_at"].isoformat()
    }
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if user.get("account_status") == "SUSPENDED":
        raise HTTPException(status_code=403, detail="Account is suspended. Contact support.")
        
    user_id = str(user["_id"])
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})
    
    access_token = create_access_token(user_id, role=user["role"])
    refresh_token = create_refresh_token(user_id, role=user["role"])
    
    user_dict = {
        "id": user_id,
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"],
        "account_status": user.get("account_status", "ACTIVE"),
        "verification_status": user.get("verification_status", "UNVERIFIED"),
        "profile_image": user.get("profile_image"),
        "created_at": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else str(user["created_at"])
    }
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        phone=current_user["phone"],
        role=current_user["role"],
        profile_image=current_user.get("profile_image"),
        account_status=current_user.get("account_status", "ACTIVE"),
        verification_status=current_user.get("verification_status", "UNVERIFIED"),
        created_at=current_user["created_at"],
        updated_at=current_user["updated_at"]
    )
