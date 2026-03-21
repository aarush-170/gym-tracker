"use client"

import { useEffect, useState } from "react"
import { getExercises, logSet } from "../../lib/api"
import { useSearchParams } from "next/navigation"
import { getPreviousWorkout } from "../../lib/api"

export default function WorkoutPage() {

  const [exercises, setExercises] = useState<any[]>([])
  const [selectedExercise, setSelectedExercise] = useState("")
  const [weight, setWeight] = useState("")
  const [reps, setReps] = useState("")
  const [message, setMessage] = useState("")
  const [previousSets, setPreviousSets] = useState<any[]>([])
  const [sets, setSets] = useState<any[]>([])

  const searchParams = useSearchParams()
  const workoutId = searchParams.get("wid")

  useEffect(() => {
    async function loadExercises() {
      const data = await getExercises()
      setExercises(data)
    }

    loadExercises()
  }, [])

  useEffect(() => {
  async function loadPrevious() {
    if (!selectedExercise) return

    const data = await getPreviousWorkout(selectedExercise)
    setPreviousSets(data.sets)

    // ✅ AUTO-FILL FIRST SET
    if (data.sets.length > 0) {
      setWeight(data.sets[0].weight)
      setReps(data.sets[0].reps)
    }
  }

  loadPrevious()
}, [selectedExercise])

useEffect(() => {
  setSets([]) // reset when switching exercise
}, [selectedExercise])

  async function handleLogSet() {

    if (!workoutId) {
      setMessage("Workout not started properly")
      return
    }

    if (!selectedExercise || !weight || !reps) {
      setMessage("Fill all fields")
      return
    }

    const newSet = {
      exercise_id: selectedExercise,
      weight: Number(weight),
      reps: Number(reps),
      set_number: sets.length + 1,
      workout_id: workoutId
    }

    const result = await logSet(newSet)

    setSets(prev => [...prev, newSet])


  
    if (result.weight_pr) {
      setMessage("🏆 Weight PR!")
    } else if (result.volume_pr) {
      setMessage("🔥 Volume PR!")
    } else {
      setMessage("Set logged!")
    }
    setWeight("")
    setReps("")

  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>Workout Logger</h1>

      <h2>Select Exercise</h2>

      <select
        value={selectedExercise}
        onChange={(e) => setSelectedExercise(e.target.value)}
      >
        <option value="">Select exercise</option>

        {exercises.map((ex:any, index:number) => (
          <option key={index} value={ex._id}>
            {ex.name}
          </option>
        ))}

      </select>

      <h3>Previous Workout</h3>

      {previousSets.length === 0 ? (
      <p>No previous data</p>
      ) : (
      previousSets.map((set, index) => (
      <p key={index}>
      Set {set.set_number}: {set.weight} x {set.reps}
      </p>
      ))
      )}

      <h3>Your Sets</h3>

      {sets.length === 0 ? (
      <p>No sets logged yet</p>
      ) : (
      sets.map((set, index) => (
      <p key={index}>
      Set {set.set_number}: {set.weight} x {set.reps}
      </p>
      ))
      )}

      <h2>Log Set</h2>

      <input
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      <input
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
      />

      <button onClick={handleLogSet}>
        Log Set
      </button>

      <p>{message}</p>

    </div>
  )
}