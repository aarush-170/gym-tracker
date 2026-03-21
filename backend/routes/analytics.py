from fastapi import APIRouter
from database import sets_collection, exercises_collection
from datetime import datetime, timedelta
from services.insights import push_pull_insight, leg_training_insight,workout_consistency_insight

router = APIRouter(prefix="/analytics", tags=["Analytics"])

exercises_cache = {
    e["_id"]: e
    for e in exercises_collection.find({})
}

PUSH_MUSCLES = {"chest", "triceps", "shoulders"}
PULL_MUSCLES = {"back", "biceps"}
LEG_MUSCLES = {"quadriceps", "hamstrings", "glutes", "calves"}

@router.get("/previous-workout/{exercise_id}")
def get_previous_workout(exercise_id: str):

    last_set = sets_collection.find_one(
        {"exercise_id": exercise_id},
        sort=[("_id", -1)]
    )

    if not last_set:
        return {"sets": []}

    workout_id = last_set["workout_id"]

    sets = list(
        sets_collection.find({
            "workout_id": workout_id,
            "exercise_id": exercise_id
        }).sort("set_number", 1)
    )

    result = []

    for s in sets:
        result.append({
            "set_number": s.get("set_number", 0),
            "weight": s.get("weight"),
            "reps": s.get("reps"),
})
    return {"sets": result}

@router.get("/exercise-volume/{exercise_id}")
def get_exercise_volume(exercise_id: str):

    sets = list(
        sets_collection.find({"exercise_id": exercise_id})
    )

    total_volume = 0
    total_sets = len(sets)

    for s in sets:
        weight = s.get("weight", 0)
        reps = s.get("reps", 0)

        total_volume += weight * reps

    return {
        "exercise": exercise_id,
        "total_sets": total_sets,
        "total_volume": total_volume
    }

@router.get("/workout-volume/{workout_id}")
def get_workout_volume(workout_id: str):

    sets = list(
        sets_collection.find({"workout_id": workout_id})
    )

    total_volume = 0
    muscle_volume = {}

    for s in sets:

        weight = s.get("weight", 0)
        reps = s.get("reps", 0)

        set_volume = weight * reps
        total_volume += set_volume

        exercise = exercises_cache.get(s["exercise_id"])

        if not exercise:
            continue

        muscles = exercise.get("muscles", {})

        for muscle, contribution in muscles.items():

            volume = set_volume * contribution

            muscle_volume[muscle] = muscle_volume.get(muscle, 0) + volume
    return {
        "workout_id": workout_id,
        "total_volume": total_volume,
        "muscle_volume": muscle_volume
    }

@router.get("/muscle-volume")
def get_muscle_volume(days: int | None = None):

    query = {}

    if days:
        cutoff = datetime.utcnow() - timedelta(days=days)
        query["timestamp"] = {"$gte": cutoff}

    sets = list(sets_collection.find(query))

    muscle_volume = {}

    for s in sets:

        weight = s.get("weight", 0)
        reps = s.get("reps", 0)

        set_volume = weight * reps

        exercise = exercises_cache.get(s["exercise_id"])

        if not exercise:
            continue

        muscles = exercise.get("muscles", {})

        for muscle, contribution in muscles.items():

            volume = set_volume * contribution

            muscle_volume[muscle] = muscle_volume.get(muscle, 0) + volume

    return muscle_volume

@router.get("/training-summary")
def get_training_summary(days: int = 7):

    cutoff = datetime.utcnow() - timedelta(days=days)

    sets = list(
        sets_collection.find({
            "timestamp": {"$gte": cutoff}
        })
    )

    total_volume = 0
    total_sets = len(sets)
    muscle_volume = {}
    last_leg_date = None

    for s in sets:

        weight = s.get("weight", 0)
        reps = s.get("reps", 0)

        set_volume = weight * reps
        total_volume += set_volume

        exercise = exercises_cache.get(s["exercise_id"])

        if not exercise:
            continue

        muscles = exercise.get("muscles", {})

        if any(m in LEG_MUSCLES for m in muscles):

            timestamp = s.get("timestamp")

            if timestamp and (not last_leg_date or timestamp > last_leg_date):
                last_leg_date = timestamp

        for muscle, contribution in muscles.items():

            volume = set_volume * contribution
            muscle_volume[muscle] = muscle_volume.get(muscle, 0) + volume
        
    push_volume = sum(
        muscle_volume.get(m, 0) for m in PUSH_MUSCLES
)

    pull_volume = sum(
        muscle_volume.get(m, 0) for m in PULL_MUSCLES
    )

    insights = []

    balance_insight = push_pull_insight(push_volume, pull_volume)
    insights.append(balance_insight)

    leg_insight = leg_training_insight(muscle_volume)

    if leg_insight:
        insights.append(leg_insight)

    consistency = workout_consistency_insight(last_leg_date)

    if consistency:
        insights.append(consistency)


    return {
        "days": days,
        "total_sets": total_sets,
        "total_volume": total_volume,
        "muscle_volume": muscle_volume,
        "insights": insights
    }

@router.get("/progression/{exercise_id}")
def get_exercise_progression(exercise_id: str):

    sets = list(
        sets_collection.find(
            {"exercise_id": exercise_id}
        ).sort("timestamp", 1)
    )

    progression = []

    for s in sets:
        progression.append({
            "date": s.get("timestamp"),
            "weight": s.get("weight"),
            "reps": s.get("reps")
        })

    return progression

@router.get("/split-detection")
def detect_training_split(days: int = 7):

    cutoff = datetime.utcnow() - timedelta(days=days)

    sets = list(
        sets_collection.find({
            "timestamp": {"$gte": cutoff}
        })
    )

    push_volume = 0
    pull_volume = 0
    leg_volume = 0

    for s in sets:

        weight = s.get("weight", 0)
        reps = s.get("reps", 0)

        set_volume = weight * reps

        exercise = exercises_cache.get(s["exercise_id"])

        if not exercise:
            continue

        muscles = exercise.get("muscles", {})

        for muscle, contribution in muscles.items():

            volume = set_volume * contribution

            if muscle in PUSH_MUSCLES:
                push_volume += volume

            if muscle in PULL_MUSCLES:
                pull_volume += volume

            if muscle in LEG_MUSCLES:
                leg_volume += volume

    return {
        "days": days,
        "push_volume": push_volume,
        "pull_volume": pull_volume,
        "leg_volume": leg_volume
    }

@router.get("/muscle-recovery")
def get_muscle_recovery():

    sets = list(
        sets_collection.find({})
    )

    last_trained = {}

    for s in sets:

        exercise = exercises_cache.get(s["exercise_id"])

        if not exercise:
            continue

        muscles = exercise.get("muscles", {})
        timestamp = s.get("timestamp")

        if not timestamp:
            continue

        for muscle in muscles:

            if muscle not in last_trained:
                last_trained[muscle] = timestamp
            else:
                last_trained[muscle] = max(last_trained[muscle], timestamp)

    recovery = {}

    now = datetime.utcnow()

    for muscle, last_time in last_trained.items():

        hours_since = (now - last_time).total_seconds() / 3600

        if hours_since < 24:
            recovery[muscle] = "fatigued"

        elif hours_since < 48:
            recovery[muscle] = "recovering"

        else:
            recovery[muscle] = "recovered"

    return recovery