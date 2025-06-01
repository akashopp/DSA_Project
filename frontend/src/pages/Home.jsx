import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';

function Home() {
  useEffect(() => {
    // console.log(props.userId)
  }, []);
  
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center px-4 md:px-12 lg:px-24 py-10 text-white">
      
      {/* Heading Section */}
      <div className="text-center max-w-3xl">
        <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl mb-4">
          Data Structures & <br /> Algorithms
        </h1>
        <p className="text-base sm:text-lg font-light">
          Follow a structured path to learn all of the core data structures & algorithms. Perfect for coding preparation.
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 w-full max-w-6xl">
        
        {/* Card 1 */}
        <div className="border-4 p-3 rounded-2xl hover:scale-105 hover:translate-y-2 transition-transform duration-300">
          <img
            src="https://miro.medium.com/v2/resize:fit:1200/1*BtuHe_nyh2RqVnVsCHr4Hw.png"
            alt="DSA Practice"
            className="rounded-2xl h-48 w-full object-cover"
          />
          <div className="font-semibold text-center p-1 text-lg sm:text-xl">
            Practice Data Structures & Algorithms
          </div>
          <div className="font-light text-center text-sm p-1">
            Practice from the best ProblemSet for Data Structures and Algorithms.
          </div>
          <div className="flex justify-center">
            <button
              className="bg-red-500 font-bold p-2 rounded-xl hover:bg-red-700 mt-4"
              onClick={() => navigate("/practice")}
            >
              Practice
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="border-4 p-3 rounded-2xl hover:scale-105 hover:translate-y-2 transition-transform duration-300">
          <img
            src="https://media.istockphoto.com/id/1320033559/vector/pensive-man-standing-and-making-business-decision-isolated-flat-vector-illustration-cartoon.jpg?s=612x612&w=0&k=20&c=CwX0Ryk_gJVFXcsIHTsMjZX4jRMt4L0CrMPnDjXHlPo="
            alt="Discuss"
            className="rounded-2xl h-48 w-full object-cover"
          />
          <div className="font-semibold text-center p-1 text-lg sm:text-xl">
            Have a doubt?
          </div>
          <div className="font-light text-center text-sm p-1">
            Ask a question in our discuss section!
          </div>
          <div className="flex justify-center">
            <button
              className="bg-green-500 font-bold p-2 rounded-xl hover:bg-green-700 mt-4"
              onClick={() => navigate("/discuss")}
            >
              Discuss
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="border-4 p-3 rounded-2xl hover:scale-105 hover:translate-y-2 transition-transform duration-300">
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/coder-illustration-download-in-svg-png-gif-file-formats--programmer-developer-developing-programming-businex-colorful-pack-business-illustrations-2895977.png"
            alt="Code Playground"
            className="rounded-2xl h-48 w-full object-cover"
          />
          <div className="font-semibold text-center p-1 text-lg sm:text-xl">
            Code Playground
          </div>
          <div className="font-light text-center text-sm p-1">
            Write, test, and run your code in an interactive environment.
          </div>
          <div className="flex justify-center">
            <button
              className="bg-blue-500 font-bold p-2 rounded-xl hover:bg-blue-700 mt-4"
              onClick={() => navigate("/playground")}
            >
              Playground
            </button>
          </div>
        </div>

        {/* Card 4 */}
        <div className="border-4 p-3 rounded-2xl hover:scale-105 hover:translate-y-2 transition-transform duration-300">
          <img
            src="https://www.freeiconspng.com/uploads/roadmap-icon-png-7.png"
            alt="Recommendations"
            className="rounded-2xl h-48 w-full object-cover"
          />
          <div className="font-semibold text-center p-1 text-lg sm:text-xl">
            Personalized Recommendations
          </div>
          <div className="font-light text-center text-sm p-1">
            Get topic suggestions based on your progress and interests.
          </div>
          <div className="flex justify-center">
            <button
              className="bg-yellow-500 font-bold p-2 rounded-xl hover:bg-yellow-700 mt-4"
              onClick={() => navigate("/recommendation")}
            >
              Recommendations
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
