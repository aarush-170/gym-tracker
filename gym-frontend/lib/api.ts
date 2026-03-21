const API = "http://127.0.0.1:8000"

export async function getExercises() {
  const res = await fetch(`${API}/exercises`)
  return res.json()
}

export async function logSet(data: any) {
  const res = await fetch(`${API}/sets/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  return res.json()
}

export async function createWorkout(data: any) {
  const res = await fetch(`${API}/workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return res.json()
}

export async function getPreviousWorkout(exerciseId: string) {
  const res = await fetch(
    `${API}/analytics/previous-workout/${exerciseId}`
  )
  return res.json()
}