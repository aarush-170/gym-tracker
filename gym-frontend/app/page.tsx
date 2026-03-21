import { getExercises } from "../lib/api"

export default async function Home() {

  const exercises = await getExercises()

  return (
    <div style={{ padding: "40px" }}>
      <h1>Gym Tracker</h1>

      <h2>Exercises</h2>

      <ul>
        {exercises.map((exercise:any, index:number) => (
          <li key={index}>
            {exercise.name}
          </li>
        ))}
      </ul>
    </div>
  )
}