from fastapi import APIRouter
from database import workouts_collection
from datetime import datetime

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.post("/")
def create_workout(data: dict):

    workout = {
        "routine_id": data.get("routine_id"),
        "timestamp": datetime.utcnow()
    }

    result = workouts_collection.insert_one(workout)

    return {"workout_id": str(result.inserted_id)}