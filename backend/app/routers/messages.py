from fastapi import APIRouter, HTTPException, status, Depends, WebSocket, WebSocketDisconnect
from typing import List, Optional, Dict
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.dependencies import get_current_user
from app.core.security import decode_token

router = APIRouter(prefix="/messages", tags=["Messaging"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()

@router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["id"]
    
    cursor = db.conversations.find({
        "$or": [{"seeker_id": user_id}, {"owner_id": user_id}]
    }).sort("updated_at", -1)
    
    conversations = []
    async for c in cursor:
        c["id"] = str(c["_id"])
        
        # Get recipient details
        other_user_id = c["owner_id"] if c["seeker_id"] == user_id else c["seeker_id"]
        if ObjectId.is_valid(other_user_id):
            other_user = await db.users.find_one({"_id": ObjectId(other_user_id)})
            if other_user:
                c["other_user_name"] = other_user.get("name")
                c["other_user_role"] = other_user.get("role")
                
        if ObjectId.is_valid(c.get("property_id")):
            p = await db.properties.find_one({"_id": ObjectId(c["property_id"])})
            if p:
                c["property_name"] = p.get("name")
                
        conversations.append(c)
    return conversations

@router.post("/conversations/start")
async def start_conversation(property_id: str, recipient_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    sender_id = current_user["id"]
    
    seeker_id = sender_id if current_user["role"] == "SEEKER" else recipient_id
    owner_id = recipient_id if current_user["role"] == "SEEKER" else sender_id
    
    existing = await db.conversations.find_one({
        "seeker_id": seeker_id,
        "owner_id": owner_id,
        "property_id": property_id
    })
    
    if existing:
        existing["id"] = str(existing["_id"])
        return existing
        
    doc = {
        "seeker_id": seeker_id,
        "owner_id": owner_id,
        "property_id": property_id,
        "last_message": "Started conversation",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    res = await db.conversations.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return doc

@router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.messages.find({"conversation_id": conversation_id}).sort("created_at", 1)
    messages = []
    async for m in cursor:
        m["id"] = str(m["_id"])
        messages.append(m)
    return messages

@router.post("/conversations/{conversation_id}/messages")
async def send_message(conversation_id: str, text: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if not ObjectId.is_valid(conversation_id):
        raise HTTPException(status_code=400, detail="Invalid conversation ID")
        
    conv = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    sender_id = current_user["id"]
    recipient_id = conv["owner_id"] if conv["seeker_id"] == sender_id else conv["seeker_id"]
    
    msg_doc = {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "text": text,
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    res = await db.messages.insert_one(msg_doc)
    msg_doc["id"] = str(res.inserted_id)
    
    await db.conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$set": {"last_message": text, "updated_at": datetime.utcnow()}}
    )
    
    # Send WebSocket notification to recipient if connected
    await manager.send_personal_message(msg_doc, recipient_id)
    
    return msg_doc

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    payload = decode_token(token)
    if not payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    user_id = payload.get("sub")
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Echo or process incoming socket messages
            pass
    except WebSocketDisconnect:
        manager.disconnect(user_id)
