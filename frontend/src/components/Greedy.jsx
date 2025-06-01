import React, { useState } from 'react';

function Greedy() {
  const [isExpanded, setIsExpanded] = useState(false); // Track whether the section is expanded
  const [problems, setProblems] = useState([ // Store the problem list in state
    { status: false, problem: 'Design Dynamic Array (Resizable Array)', difficulty: 'Easy', details: 'This problem involves implementing a dynamic array.' },
    { status: false, problem: 'Design Linked List', difficulty: 'Medium', details: 'This problem requires implementing a singly or doubly linked list.' },
    { status: false, problem: 'Design Segment Tree', difficulty: 'Hard', details: 'This problem is about creating a segment tree for range queries.' }
  ]);

  // Toggle the expanded/collapsed state of the section
  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle checkbox change, marking a problem as solved
  const toggleProblemStatus = (index) => {
    // console.log('Before toggle, problem status:', problems[index].status); // Log before update
    
    setProblems((prevProblems) => {
      const updatedProblems = [...prevProblems];
      updatedProblems[index] = {
        ...updatedProblems[index],  // Ensure other properties remain unchanged
        status: !updatedProblems[index].status, // Toggle the status
      };
      // console.log('Updated problem status:', updatedProblems[index]); // Log the updated problem status
      return updatedProblems;
    });
  };

  return (
    <div className="flex-1 p-4 bg-gray-900 text-white">
      {/* Section Header */}
      <div className="flex justify-between mb-4 cursor-pointer" onClick={toggleSection}>
        <div className="text-lg">Greedy</div>
        {/* Icon to show/hide */}
        <div>{isExpanded ? '▲' : '▼'}</div>
      </div>

      {/* Problem List (Only shown if isExpanded is true) */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
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
            {problems.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="bg-gray-800 hover:bg-gray-700 cursor-pointer">
                  <td className="p-3">
                    {/* Checkbox with explicit styling */}
                    <input
                      type="checkbox"
                      checked={item.status} // Reflect the current status (checked or unchecked)
                      onChange={() => toggleProblemStatus(index)} // Toggle the status of the specific problem
                      className="form-checkbox h-5 w-5 text-green-400" // Tailwind styles to ensure visibility and style
                    />
                  </td>
                  <td className="p-3">{item.problem}</td>
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
  );
}

export default Greedy;