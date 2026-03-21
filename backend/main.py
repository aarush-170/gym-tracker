from fastapi import FastAPI
from routes import exercises, workouts, sets, analytics
from routes import routines
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exercises.router)
app.include_router(workouts.router)
app.include_router(sets.router)
app.include_router(analytics.router)
app.include_router(routines.router)


@app.get("/")
def home():
    return {"message": "Gym Tracker API Running"}