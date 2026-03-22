"use client"

export default function StartWorkout(){

async function startEmptyWorkout(){

const res = await fetch("http://127.0.0.1:8000/workouts",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
routine_id:null
})

})

const data = await res.json()

window.location.href=`/workout?wid=${data.workout_id}`

}


return(

<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">

<div className="w-full max-w-sm px-6 space-y-6">

<h1 className="text-2xl font-semibold">

Start Workout

</h1>



<button

onClick={startEmptyWorkout}

className="
w-full
bg-gradient-to-r
from-green-400
to-blue-500
py-3
rounded-xl
font-medium
shadow-lg
shadow-green-500/20
"

>

Empty Workout

</button>



<button

className="
w-full
border border-neutral-700
py-3
rounded-xl
text-neutral-300
"

>

Choose Routine (soon)

</button>


</div>

</div>

)

}