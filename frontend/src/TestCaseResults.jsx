import { useState, useEffect } from 'react';

const TestCaseResults = ({ problemName, code }) => {
  const [results, setResults] = useState([]);

  // Function to update the test case result (pass/fail)
  const updateTestResult = (index, status) => {
    const updatedResults = [...results];
    updatedResults[index] = status;
    setResults(updatedResults);
  };

  // Fetch test cases and run the user's code
  useEffect(() => {
    // Fetch test cases from backend
    const fetchTestCases = async () => {
      const response = await fetch(`/testcases/${problemName}`);
      const testCases = await response.json();

      // Initialize test cases with 'running' status (yellow)
      setResults(testCases.map(() => 'running'));

      // Simulate running the test cases and updating the status
      testCases.forEach(async (testCase, index) => {
        const { input, expected } = testCase;

        // Run user's code (simulate with a delay here)
        const userOutput = await runUserCode(code, input);  // Assume you have a function for running the code

        if (userOutput === expected) {
          updateTestResult(index, 'passed');
        } else {
          updateTestResult(index, 'failed');
        }
      });
    };

    fetchTestCases();
  }, [problemName, code]);

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`py-2 px-4 rounded-lg transition-all duration-500 ${
              result === 'running'
                ? 'bg-yellow-400'
                : result === 'passed'
                ? 'bg-green-400'
                : 'bg-red-400'
            }`}
          >
            Test Case {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestCaseResults;