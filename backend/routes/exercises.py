from fastapi import APIRouter
from database import exercises_collection

router = APIRouter(prefix="/exercises", tags=["Exercises"])


@router.get("/")
def get_exercises():
    exercises = list(exercises_collection.find({}, {"_id": 0}))
    return exercises