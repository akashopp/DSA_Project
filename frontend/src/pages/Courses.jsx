// Courses.jsx
import React, { useState } from 'react';
import Box from '../components/Box';
import CardImg from "../assets/CardImage.png"
import { useNavigate } from 'react-router-dom';

function Courses() {
    const navigate=useNavigate();
    const [data, setData] = useState([
        {
            id: 1,
            img: CardImg,
            heading: "Algorithms & Data Structures for Beginners",
            content: "Learn the foundation of coding interviews",
            time: "8.5 hours",
            level: "easy"
        },
        {
            id: 2,
            img: CardImg,
            heading: "Advanced Algorithms",
            content: "Learn every algorithm you would ever need",
            time: "8 hours",
            level: "Hard"
        },
        {
            id: 3,
            img: CardImg,
            heading: "System Design for Beginners",
            content: "Learn the foundation of system design",
            time: "6 hours",
            level: "medium"
        },
        {
            id: 4,
            img: CardImg,
            heading: "Data Structures & Algorithms Projects",
            content: "Implement real world DSA projects",
            time: "5.5 hours",
            level: "easy"
        },
        {
            id: 5,
            img: CardImg,
            heading: "Open Source Contribution",
            content: "Learn how to contribute in open source & improve your dev skills",
            time: "5.5 hours",
            level: "easy"
        }
    ]);
    function handleCourses(){
        navigate("/courses");
    }
    function handleLessons(){
        navigate("/lessons");
    }

    return (
        <>
            <div className='text-white gap-4 flex justify-center mt-5'>
                <button onClick={handleCourses}  className='text-center bg-green-600 pl-4 pr-4 pt-4 pb-4 rounded-lg hover:bg-white hover:text-green-600'>Courses</button>
                <button onClick={handleLessons} className='text-center bg-green-600 pl-4 pr-4 pt-4 pb-4 rounded-lg hover:bg-white hover:text-green-600'>Lessons</button>
            </div>
            <div className='gap-6 h-auto flex flex-wrap mt-20 mb-20 justify-center '>
                {data.map((d) => (
                    <Box key={d.id} img={d.img} heading={d.heading} content={d.content} time={d.time} level={d.level} />
                ))}
            </div>
        </>
    );
}

export default Courses;
