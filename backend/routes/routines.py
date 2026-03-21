from fastapi import APIRouter
from database import db

router = APIRouter(prefix="/routines", tags=["Routines"])

routines_collection = db["routines"]

@router.post("/")
def create_routine(routine: dict):
    result = routines_collection.insert_one(routine)
    return {"routine_id": str(result.inserted_id)}

@router.get("/")
def get_routines():
    return list(routines_collection.find({}, {"_id": 0}))