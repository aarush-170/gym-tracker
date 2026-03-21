def detect_pr(set_data, previous_sets):

    weight = set_data.get("weight", 0)
    reps = set_data.get("reps", 0)

    volume = weight * reps

    max_weight = 0
    max_volume = 0

    for s in previous_sets:

        w = s.get("weight", 0)
        r = s.get("reps", 0)

        max_weight = max(max_weight, w)
        max_volume = max(max_volume, w * r)

    return {
        "weight_pr": weight > max_weight,
        "volume_pr": volume > max_volume
    }