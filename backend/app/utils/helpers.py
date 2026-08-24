from bson import ObjectId
from typing import Any

def clean_doc(doc: Any) -> Any:
    """
    Recursively converts BSON ObjectId instances to strings in dicts/lists
    and ensures 'id' field is present from '_id'.
    """
    if doc is None:
        return doc
    if isinstance(doc, list):
        return [clean_doc(item) for item in doc]
    if isinstance(doc, dict):
        cleaned = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                cleaned[k] = str(v)
            elif isinstance(v, (dict, list)):
                cleaned[k] = clean_doc(v)
            else:
                cleaned[k] = v
        if "_id" in doc:
            cleaned["id"] = str(doc["_id"])
            cleaned["_id"] = str(doc["_id"])
        return cleaned
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc
