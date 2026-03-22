"use client"

import Link from "next/link"

export default function Home(){

return(

<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">

<div className="w-full max-w-md px-6 flex flex-col items-center">


{/* app title */}

<h1 className="text-4xl font-semibold tracking-wide mb-12">

WE FIT

</h1>



{/* activity ring */}

<div className="relative w-44 h-44 mb-12 flex items-center justify-center">

{/* ring background */}

<div className="absolute w-full h-full rounded-full border-[12px] border-neutral-800"/>


{/* progress ring */}

<div
className="
absolute
w-full
h-full
rounded-full
border-[12px]
border-green-400
border-t-transparent
rotate-[120deg]
"
/>


{/* percentage text */}

<div className="text-2xl font-medium">

68%

</div>


</div>



{/* buttons */}

<div className="flex flex-col gap-4 w-full">


<Link href="/start-workout">

<button
className="
w-full
py-3
rounded-xl
bg-gradient-to-r
from-green-400
to-blue-500
text-black
font-medium
shadow-lg
transition
hover:scale-[1.02]
"
>

Start Workout

</button>

</Link>



<button
className="
w-full
py-3
rounded-xl
bg-neutral-900
border border-neutral-700
text-neutral-200
transition
hover:bg-neutral-800
"
>

Review Progress

</button>


</div>



{/* tagline */}

<p className="text-neutral-400 text-sm mt-12 text-center">

Stay consistent. Track progress.

</p>



</div>

</div>

)

}