from datetime import datetime

def push_pull_insight(push_volume, pull_volume):

    if pull_volume == 0:
        return "No pulling exercises detected. Consider adding rows or pull-ups."

    ratio = push_volume / pull_volume

    if ratio > 1.5:
        return "Push volume is much higher than pull volume. This may cause shoulder imbalance."

    if ratio < 0.7:
        return "Pull volume is much higher than push volume. Consider adding pressing exercises."

    return "Push and pull training volume is balanced."

def leg_training_insight(muscle_volume):

    leg_volume = muscle_volume.get("glutes", 0) + muscle_volume.get("quadriceps", 0)

    if leg_volume < 3000:
        return "Leg training volume is low. Consider adding squats or lunges."

    return None


def workout_consistency_insight(last_leg_date):

    if not last_leg_date:
        return "No leg workouts detected."

    days_since = (datetime.utcnow() - last_leg_date).days

    if days_since > 7:
        return f"You haven't trained legs in {days_since} days."

    return None