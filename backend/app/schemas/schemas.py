from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Roles
class UserRole(str, Enum):
    SEEKER = "SEEKER"
    OWNER = "OWNER"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

# Account Status
class AccountStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"

# Property Enums
class PropertyType(str, Enum):
    PG = "PG"
    HOSTEL = "Hostel"
    DORMITORY = "Dormitory"
    COLIVING = "Co-living"
    APARTMENT = "Apartment"
    PRIVATE_ROOM = "Private Room"
    SHARED_ROOM = "Shared Room"

class GenderPolicy(str, Enum):
    BOYS = "Boys"
    GIRLS = "Girls"
    UNISEX = "Unisex"

class VerificationStatus(str, Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"
    CHANGES_REQUIRED = "Changes Required"

class PropertyStatus(str, Enum):
    DRAFT = "Draft"
    PENDING_VERIFICATION = "Pending Verification"
    PUBLISHED = "Published"
    SUSPENDED = "Suspended"
    ARCHIVED = "Archived"

class RoomType(str, Enum):
    SINGLE = "Single"
    DOUBLE_SHARING = "Double Sharing"
    TRIPLE_SHARING = "Triple Sharing"
    FOUR_SHARING = "Four Sharing"
    DORMITORY = "Dormitory"

class BedStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    OCCUPIED = "OCCUPIED"
    MAINTENANCE = "MAINTENANCE"

class BookingStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class EnquiryStatus(str, Enum):
    OPEN = "OPEN"
    RESPONDED = "RESPONDED"
    CLOSED = "CLOSED"

class VisitStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    RESCHEDULED = "RESCHEDULED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class PaymentStatus(str, Enum):
    PAID = "PAID"
    PENDING = "PENDING"
    OVERDUE = "OVERDUE"
    FAILED = "FAILED"

class MaintenancePriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class MaintenanceStatus(str, Enum):
    REPORTED = "REPORTED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

# --- User Schemas ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: UserRole
    profile_image: Optional[str] = None
    account_status: AccountStatus
    verification_status: str = "UNVERIFIED"
    created_at: datetime
    updated_at: datetime

# --- Location & Property Schemas ---
class GeoLocation(BaseModel):
    type: str = "Point"
    coordinates: List[float] # [longitude, latitude]

class PropertyCreate(BaseModel):
    name: str
    property_type: PropertyType
    gender_policy: GenderPolicy
    description: str
    address: str
    city: str
    state: str
    country: str = "India"
    postal_code: str
    latitude: float
    longitude: float
    nearby_places: Optional[List[str]] = []
    images: Optional[List[str]] = []
    amenities: List[str]
    rules: Optional[List[str]] = []
    deposit: float
    minimum_stay: str = "1 Month"
    manager_ids: Optional[List[str]] = []

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    property_type: Optional[PropertyType] = None
    gender_policy: Optional[GenderPolicy] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nearby_places: Optional[List[str]] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    rules: Optional[List[str]] = None
    deposit: Optional[float] = None
    minimum_stay: Optional[str] = None
    property_status: Optional[PropertyStatus] = None

class PropertyResponse(BaseModel):
    id: str
    owner_id: str
    manager_ids: List[str] = []
    name: str
    slug: str
    property_type: str
    gender_policy: str
    description: str
    address: str
    city: str
    state: str
    country: str
    postal_code: str
    latitude: float
    longitude: float
    nearby_places: List[str] = []
    images: List[str] = []
    amenities: List[str] = []
    rules: List[str] = []
    pricing_starting_from: float = 0.0
    deposit: float = 0.0
    minimum_stay: str = "1 Month"
    verification_status: str
    property_status: str
    rating: float = 0.0
    review_count: int = 0
    views: int = 0
    created_at: datetime
    updated_at: datetime
    rooms_summary: Optional[List[Dict[str, Any]]] = None

# --- Room & Bed Schemas ---
class RoomCreate(BaseModel):
    room_number: str
    floor: int
    room_type: RoomType
    capacity: int
    price: float
    deposit: float
    amenities: List[str] = []
    description: Optional[str] = ""

class RoomResponse(BaseModel):
    id: str
    property_id: str
    room_number: str
    floor: int
    room_type: str
    capacity: int
    price: float
    deposit: float
    amenities: List[str]
    description: str
    status: str
    available_beds: int
    total_beds: int
    beds: Optional[List[Dict[str, Any]]] = None

class BedCreate(BaseModel):
    bed_number: str

class BedResponse(BaseModel):
    id: str
    property_id: str
    room_id: str
    bed_number: str
    status: str
    resident_id: Optional[str] = None
    booking_id: Optional[str] = None

# --- Booking Schemas ---
class BookingCreate(BaseModel):
    property_id: str
    room_id: str
    move_in_date: str
    stay_duration: str
    notes: Optional[str] = ""

class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    bed_id: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    seeker_id: str
    owner_id: str
    property_id: str
    room_id: str
    bed_id: Optional[str] = None
    move_in_date: str
    stay_duration: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    property_name: Optional[str] = None
    seeker_name: Optional[str] = None

# --- Enquiry & Visit Schemas ---
class EnquiryCreate(BaseModel):
    property_id: str
    room_id: Optional[str] = None
    message: str

class VisitCreate(BaseModel):
    property_id: str
    proposed_date: str
    proposed_time: str
    notes: Optional[str] = None

# --- Review Schema ---
class ReviewCreate(BaseModel):
    property_id: str
    booking_id: str
    overall: float
    cleanliness: float
    food: float
    location: float
    safety: float
    owner: float
    facilities: float
    comment: str

# --- Maintenance Schema ---
class MaintenanceCreate(BaseModel):
    property_id: str
    room_id: str
    category: str
    title: str
    description: str
    priority: MaintenancePriority

# --- Payment Schema ---
class PaymentCreate(BaseModel):
    resident_id: str
    property_id: str
    amount: float
    currency: str = "INR"
    due_date: str
    method: str = "BANK_TRANSFER"
    transaction_reference: Optional[str] = None
