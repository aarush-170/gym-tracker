"use client"

import { useRouter } from "next/navigation"
import { createWorkout } from "../../lib/api"

export default function StartWorkout() {

  const router = useRouter()

  async function handleStart() {

    const res = await createWorkout({
      routine_id: null
    })

    const workoutId = res.workout_id

    router.push(`/workout?wid=${workoutId}`)
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Start Workout</h1>

      <button onClick={handleStart}>
        Start Empty Workout
      </button>
    </div>
  )
}