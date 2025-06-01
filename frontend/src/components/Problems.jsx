import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; 
import { fetchProblems, fetchUserProblems, ProblemManager } from '../utils';

function Problems() {
  const [isExpanded, setIsExpanded] = useState({}); // Track expanded/collapsed state for each topic
  const [problems, setProblems] = useState([]); // Store the problem list in state
  const [groupedProblems, setGroupedProblems] = useState({}); // Store the grouped problems by topic
  const [userProblems, setUserProblems] = useState([]); // Store the user's problemId list
  const navigate = useNavigate();
  const userId = localStorage.getItem("userSession");
  
  useEffect(() => {
    if (!userId) {
      // If the user is not logged in, show a toast and redirect to /register
      toast.warn("You are not logged in. Please register.", {
        position: "top-center",
        autoClose: 5000, // The toast will be visible for 5 seconds
        onClose: () => {
          // Redirect the user to the /register page after the toast is closed
          navigate("/register");
        }
      });
    } 
  }, [userId, navigate]);

  const fetchData = async () => {
    const data = await fetchProblems();
    setProblems(data); // Update the problems state with the fetched data
    // Group problems by topic using ProblemManager
    const grouped = ProblemManager.groupByTopic(data);
    setGroupedProblems(grouped);

    const userData = await fetchUserProblems(userId);
    setUserProblems(userData.problems); // Set the user's problemId list
  }

  // Fetch problems and user problems when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this effect runs once when the component mounts

  // Toggle the expanded/collapsed state of a particular topic
  const toggleTopic = (topic) => {
    setIsExpanded((prev) => ({
      ...prev,
      [topic]: !prev[topic],
    }));
  };

  // Handle checkbox change, marking a problem as solved
  const toggleProblemStatus = async (index, topic) => {
    const problemId = groupedProblems[topic][index]._id; // Get the problem's ID
    const isProblemSolved = userProblems.includes(problemId); // Check if the problem is in the user's list

    try {
      // Send a PUT request to update the user's problem list
      const url = isProblemSolved
        ? 'http://localhost:5000/user/deleteproblem' // If problem is solved, we need to remove it
        : 'http://localhost:5000/user/addproblem'; // If problem is not solved, we add it

      const response = await fetch(url, {
        method: 'PUT', // Use PUT for both adding and deleting problems
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId, // The current user's ID
          problemId, // The ID of the problem being toggled
        }),
        credentials: "include",
      });

      if (response.ok) {
        // After the problem status is updated, reload the problems and user problems
        fetchData();
      } else {
        console.error('Failed to update user problem list');
        toast.warn("You are not logged in. Please register.", {
          position: "top-center",
          autoClose: 5000, // The toast will be visible for 5 seconds
          onClose: () => {
            // Redirect the user to the /register page after the toast is closed
            navigate("/register");
          }
        });
      }
    } catch (error) {
      console.error('Error updating user problem list:', error);
    }
  };

  return (
    <div className="flex-1 bg-slate text-white font-extrabold">
      {/* Render each topic section */}
      {Object.keys(groupedProblems).map((topic) => (
        <div key={topic} className="mb-4">
          {/* Topic Header */}
          <div
            className="flex justify-center mb-2 cursor-pointer p-5 bg-slate-900 rounded-xl"
            onClick={() => toggleTopic(topic)}
          >
            <div className="text-xl">{topic}</div>
            <div className='mx-5'>{isExpanded[topic] ? '▲' : '▼'}</div>
          </div>

          {/* Problem List (Only shown if the topic is expanded) */}
          <div
            style={{
              maxHeight: isExpanded[topic] ? '1000px' : '0px',
              overflow: 'hidden',
              transition: 'max-height 0.5s ease-in-out',
            }}
          >
            <table className="w-full table-auto bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Problem</th>
                  <th className="p-3 text-left">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {groupedProblems[topic].map((item, index) => (
                  <React.Fragment key={item._id || index}>
                    {/* Use a unique key for each item */}
                    <tr className="bg-gray-800 hover:bg-gray-700 cursor-pointer">
                      <td className="p-3">
                        {/* Checkbox with explicit styling */}
                        <input
                          type="checkbox"
                          checked={userProblems.includes(item._id)} // Check if the problemId exists in user's list
                          onChange={() => toggleProblemStatus(index, topic)} // Toggle the status of the specific problem
                          className="form-checkbox h-5 w-5 text-green-400" // Tailwind styles to ensure visibility and style
                        />
                      </td>
                      <td className="p-3">
                        {/* Make the problemName a clickable link */}
                        <Link 
                          to={`/problem/${item._id}`} 
                          className="text-blue-400 hover:underline"
                        >
                          {item.problemName}
                        </Link>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-sm font-semibold ${
                            item.difficulty === 'Easy'
                              ? 'text-green-400'
                              : item.difficulty === 'Medium'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Problems;