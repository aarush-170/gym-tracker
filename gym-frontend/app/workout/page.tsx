"use client"

import { useEffect, useState } from "react"
import { getExercises, logSet, getPreviousWorkout } from "../../lib/api"
import { useSearchParams } from "next/navigation"

export default function WorkoutPage(){

const [exercises,setExercises]=useState<any[]>([])
const [blocks,setBlocks]=useState<any[]>([])
const [toast,setToast]=useState("")

const searchParams=useSearchParams()
const workoutId=searchParams.get("wid")



/* toast */

function showToast(msg:string){

setToast(msg)

setTimeout(()=>setToast(""),1500)

}



/* load exercises */

useEffect(()=>{

async function load(){

const data = await getExercises()

setExercises(data)

}

load()

},[])



/* add exercise */

function addExercise(){

setBlocks(prev=>[

...prev,

{

exercise_id:"",
previousSets:[],
sets:[

{

set_number:1,
weight:"",
reps:"",
completed:false

}

]

}

])

}



/* remove exercise */

function removeExercise(index:number){

setBlocks(prev=>prev.filter((_,i)=>i!==index))

showToast("exercise removed")

}



/* select exercise */

async function selectExercise(blockIndex:number,value:string){

const data = await getPreviousWorkout(value)

const previous = data.sets || []

const rows = previous.length>0

? previous.map((_:any,i:number)=>({

set_number:i+1,
weight:"",
reps:"",
completed:false

}))

: [{

set_number:1,
weight:"",
reps:"",
completed:false

}]


setBlocks(prev => prev.map((block,i)=>{

if(i!==blockIndex) return block

return{

...block,
exercise_id:value,
previousSets:[...previous],
sets:[...rows]

}

}))

}



/* update set */

function updateSet(blockIndex:number,setIndex:number,field:string,value:string){

setBlocks(prev => prev.map((block,i)=>{

if(i!==blockIndex) return block

const updatedSets=[...block.sets]

updatedSets[setIndex]={

...updatedSets[setIndex],
[field]:value

}

return{

...block,
sets:updatedSets

}

}))

}



/* add set */

function addSet(blockIndex:number){

setBlocks(prev => prev.map((block,i)=>{

if(i!==blockIndex) return block

return{

...block,

sets:[

...block.sets,

{

set_number:block.sets.length+1,
weight:"",
reps:"",
completed:false

}

]

}

}))

}



/* remove set */

function removeSet(blockIndex:number,setIndex:number){

setBlocks(prev => prev.map((block,i)=>{

if(i!==blockIndex) return block

const updatedSets = block.sets

.filter((_:any,index:number)=>index!==setIndex)

.map((set:any,i:number)=>({

...set,
set_number:i+1

}))

return{

...block,
sets:updatedSets

}

}))

showToast("set deleted")

}



/* log set */

async function logSingleSet(blockIndex:number,setIndex:number){

const block = blocks[blockIndex]

const set = block.sets[setIndex]

if(!set.weight || !set.reps){

showToast("enter values")

return

}


const result = await logSet({

exercise_id:block.exercise_id,

weight:Number(set.weight),

reps:Number(set.reps),

set_number:set.set_number,

workout_id:workoutId

})


setBlocks(prev => prev.map((b,i)=>{

if(i!==blockIndex) return b

const updatedSets=[...b.sets]

updatedSets[setIndex]={

...updatedSets[setIndex],
completed:true,
weight_pr:result.weight_pr,
volume_pr:result.volume_pr

}

return{

...b,
sets:updatedSets

}

}))


if(result.weight_pr){

showToast("🏆 weight PR")

}

else if(result.volume_pr){

showToast("🔥 volume PR")

}

else{

showToast("set logged")

}

}



return(

<div className="min-h-screen bg-neutral-950 text-white flex justify-center">

<div className="w-full max-w-md p-6 space-y-6">


<h1 className="text-2xl font-semibold">

Workout

</h1>



{blocks.map((block,blockIndex)=>(

<div

key={`exercise-${blockIndex}`}

className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3"

>


<div className="flex gap-2">


<select

value={block.exercise_id}

onChange={(e)=>selectExercise(blockIndex,e.target.value)}

className="flex-1 bg-neutral-800 border border-neutral-700 p-2 rounded text-sm text-white"

>

<option value="">

Select exercise

</option>


{exercises.map((ex:any,index:number)=>(

<option

key={ex._id || ex.id || ex.name || index}

value={ex._id || ex.id || ex.name}

>

{ex.name}

</option>

))}

</select>



<button

onClick={()=>removeExercise(blockIndex)}

className="text-xs text-neutral-400"

>

remove

</button>


</div>



<div className="grid grid-cols-5 text-xs text-neutral-500">

<div>SET</div>
<div>KG</div>
<div>REPS</div>
<div></div>
<div></div>

</div>



{block.sets.map((set:any,setIndex:number)=>{

const prev = block.previousSets?.[setIndex]

return(

<div

key={`set-${blockIndex}-${setIndex}-${set.set_number || setIndex}`}

className="grid grid-cols-5 gap-2 items-center text-sm"

>


<div className="text-neutral-500">

{set.set_number}

</div>



<input

value={set.weight}

placeholder={prev?.weight || ""}

onChange={(e)=>updateSet(blockIndex,setIndex,"weight",e.target.value)}

className="bg-neutral-800 text-white px-2 py-1 rounded border border-neutral-700 outline-none"

/>



<input

value={set.reps}

placeholder={prev?.reps || ""}

onChange={(e)=>updateSet(blockIndex,setIndex,"reps",e.target.value)}

className="bg-neutral-800 text-white px-2 py-1 rounded border border-neutral-700 outline-none"

/>



<button

onClick={()=>logSingleSet(blockIndex,setIndex)}

className={

set.completed

? "text-green-500"

: "text-neutral-500"

}

>

✓

</button>



<button

onClick={()=>removeSet(blockIndex,setIndex)}

className="text-neutral-500"

>

x

</button>


</div>

)

})}



<button

onClick={()=>addSet(blockIndex)}

className="text-xs text-neutral-400"

>

+ Add Set

</button>


</div>

))}



<button

onClick={addExercise}

className="w-full border border-neutral-700 py-2 rounded-lg text-sm"

>

+ Add Exercise

</button>



{/* toast */}

{toast && (

<div

className="
fixed
bottom-6
left-1/2
-translate-x-1/2
bg-neutral-800
px-4
py-2
rounded-lg
text-sm
shadow-lg
"

>

{toast}

</div>

)}



</div>

</div>

)

}