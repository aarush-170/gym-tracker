from fastapi import APIRouter
from database import sets_collection
from datetime import datetime
from services.pr_detection import detect_pr

router = APIRouter(prefix="/sets", tags=["Sets"])


@router.post("/")
def log_set(set_data: dict):

    set_data["timestamp"] = datetime.utcnow()

    exercise_id = set_data["exercise_id"]

    previous_sets = list(
        sets_collection.find({"exercise_id": exercise_id})
    )

    pr_result = detect_pr(set_data, previous_sets)

    set_data["weight_pr"] = pr_result["weight_pr"]
    set_data["volume_pr"] = pr_result["volume_pr"]

    result = sets_collection.insert_one(set_data)

    return {
        "set_id": str(result.inserted_id),
        "weight_pr": pr_result["weight_pr"],
        "volume_pr": pr_result["volume_pr"]
    }