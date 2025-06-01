// ProblemDetails.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ProblemDetails() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`/api/problems/${id}`);
        setProblem(response.data);
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    };
    fetchProblem();
  }, [id]);

  const toggleStatus = async () => {
    try {
      const response = await axios.put(`/api/problems/${id}`);
      setProblem(response.data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (!problem) return <div>Loading...</div>;

  return (
    <div>
      <h1>{problem.problemName}</h1>
      <p>Difficulty: {problem.difficulty}</p>
      <p>Topic: {problem.topic}</p>
      <p>{problem.details}</p>
      <button onClick={toggleStatus}>
        Mark as {problem.status ? 'Unsolved' : 'Solved'}
      </button>
    </div>
  );
}

export default ProblemDetails;
