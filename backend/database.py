from pymongo import MongoClient

MONGO_URI = "mongodb+srv://gym-tracker-user:gym123@gym-tracker.h7lsi1s.mongodb.net/?appName=gym-tracker"

client = MongoClient(MONGO_URI)

db = client["gym_tracker"]

exercises_collection = db["exercises"]
workouts_collection = db["workouts"]
sets_collection = db["sets"]

sets_collection.create_index([("timestamp", -1)])
sets_collection.create_index([("exercise_id", 1), ("timestamp", 1)])
sets_collection.create_index("workout_id")