from fastapi import APIRouter, Query, Depends
from typing import List, Optional
from app.core.database import get_database
from app.schemas.schemas import PropertyResponse
from app.utils.helpers import clean_doc

router = APIRouter(prefix="/search", tags=["Search & Discovery"])

@router.get("", response_model=dict)
async def search_properties(
    q: Optional[str] = None,
    city: Optional[str] = None,
    gender_policy: Optional[str] = None,
    property_type: Optional[str] = None,
    room_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    amenities: Optional[str] = None, # comma-separated
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = None, # e.g. 1, 3, 5, 10
    sort: Optional[str] = "recommended", # recommended, price_asc, price_desc, rating, newest
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50)
):
    db = get_database()
    if db is None:
        return {"items": [], "total": 0, "page": 1, "page_size": 12, "total_pages": 1}

    query = {"property_status": "Published"}
    
    # Text query across name, city, address, nearby_places
    if q and q.strip():
        search_term = q.strip()
        query["$or"] = [
            {"name": {"$regex": search_term, "$options": "i"}},
            {"city": {"$regex": search_term, "$options": "i"}},
            {"address": {"$regex": search_term, "$options": "i"}},
            {"nearby_places": {"$regex": search_term, "$options": "i"}}
        ]
        
    if city and city.strip():
        query["city"] = {"$regex": city.strip(), "$options": "i"}
        
    if gender_policy and gender_policy != "All":
        query["gender_policy"] = gender_policy
        
    if property_type and property_type != "All":
        query["property_type"] = property_type
        
    if amenities:
        amenity_list = [a.strip() for a in amenities.split(",") if a.strip()]
        if amenity_list:
            query["amenities"] = {"$all": amenity_list}
            
    # Geospatial query ($geoWithin centerSphere works in count_documents and supports custom sorting)
    if lat is not None and lng is not None and radius_km:
        query["location"] = {
            "$geoWithin": {
                "$centerSphere": [
                    [float(lng), float(lat)],
                    float(radius_km) / 6378.1
                ]
            }
        }

    page_val = page if isinstance(page, int) else 1
    page_size_val = page_size if isinstance(page_size, int) else 12
    
    # Sorting logic
    sort_spec = [("created_at", -1)]
    if sort == "price_asc":
        sort_spec = [("deposit", 1)]
    elif sort == "price_desc":
        sort_spec = [("deposit", -1)]
    elif sort == "rating":
        sort_spec = [("rating", -1)]
    elif sort == "newest":
        sort_spec = [("created_at", -1)]
        
    cursor = db.properties.find(query).sort(sort_spec)
    
    all_matched = []
    async for prop in cursor:
        prop = clean_doc(prop)
        
        # Calculate room pricing
        rooms = await db.rooms.find({"property_id": prop["id"]}).to_list(50)
        prices = [r.get("price", 0) for r in rooms if "price" in r and r.get("price") is not None]
        prop["pricing_starting_from"] = min(prices) if prices else prop.get("deposit", 0.0)
        
        # Room price filtering check
        if min_price is not None and prop["pricing_starting_from"] < min_price:
            continue
        if max_price is not None and prop["pricing_starting_from"] > max_price:
            continue
            
        all_matched.append(prop)

    total = len(all_matched)
    skip = (page_val - 1) * page_size_val
    items = all_matched[skip:skip + page_size_val]
        
    return {
        "items": items,
        "total": total,
        "page": page_val,
        "page_size": page_size_val,
        "total_pages": (total + page_size_val - 1) // page_size_val if total > 0 else 1
    }

@router.get("/recommendations", response_model=List[dict])
async def get_recommendations(
    city: Optional[str] = None,
    gender: Optional[str] = None,
    limit: int = 6
):
    db = get_database()
    if db is None:
        return []
    query = {"property_status": "Published"}
    if city and city.strip():
        query["city"] = {"$regex": city.strip(), "$options": "i"}
    if gender and gender != "All":
        query["gender_policy"] = gender
        
    cursor = db.properties.find(query).sort([("rating", -1), ("views", -1)]).limit(limit)
    props = []
    async for p in cursor:
        p = clean_doc(p)
        rooms = await db.rooms.find({"property_id": p["id"]}).to_list(50)
        prices = [r.get("price", 0) for r in rooms if "price" in r and r.get("price") is not None]
        p["pricing_starting_from"] = min(prices) if prices else p.get("deposit", 0.0)
        props.append(p)
    return props


