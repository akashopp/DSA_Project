import React from 'react'

function HomePage() {
  return (
    <>
      <div className='flex'>
      
        <div className='text-white font-extrabold text-4xl mx-36 my-10 flex justify-center flex-col'>
          Data Structures &
          <br></br> Algorithms

          <div className='text-lg font-light'>Follow a structured path to learn all of the core data structures & algorithms. Perfect for coding preparation.</div>
        </div>

        <div className="flex justify-evenly items-center h-5/6">


          <div className='border-4 h-4/5 w-1/3 p-3 duration-500 ease-in-out rounded-2xl hover:scale-110 hover:translate-y-4'>

            <img src="https://imagedelivery.net/CLfkmk9Wzy8_9HRyug4EVA/a65736b6-151f-4572-8e10-87b2b75ab100/public" alt="" className='rounded-2xl' />

            <div className='font-semibold flex justify-center p-3 text-xl'>
              Data Structures & Algorithms for Beginners</div>

            <div className='font-light flex justify-center p-3'>Learn the basic beginner friendly foundations for Data Structures and Algorithms.</div>

            <div className='flex justify-center'>
              <button className='bg-green-500 font-bold p-2 rounded-xl hover:bg-green-700'>Learn</button>

            </div>

          </div>

          


          <div className='border-4 h-4/5 w-1/3 p-3 duration-500 ease-in-out rounded-2xl hover:scale-110 hover:translate-y-4'>

            <img src="https://imagedelivery.net/CLfkmk9Wzy8_9HRyug4EVA/dd1abac9-220d-4c4d-a8c5-d755e2606800/public" alt="" className='rounded-2xl'/>

            <div className='font-semibold flex justify-center p-3 text-xl'>
              Practice Data Structures & Algorithms</div>

            <div className='font-light flex justify-center p-3'>Practice from the best ProblemSet for Data Structures and Algorithms.</div>

            <div className='flex justify-center'>
              <button className='bg-red-500 font-bold p-2 rounded-xl hover:bg-red-700'> Practice</button>

            </div>

          </div>


        </div>



      </div>
    </>
  )
}

export default HomePage
