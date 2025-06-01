import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { Moon, Sun, Code2, Play, Terminal } from "lucide-react";
import { EditorState } from "@uiw/react-codemirror";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import { useLocation } from "react-router-dom";
import AlertModal from "./AlertModal";

// Error Boundary Component to catch errors in the app

const CodeEditor = ({ problem_name = ''}) => {
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("oneDark");
  const [fontSize, setFontSize] = useState(14); // Default font size
  const [problemName, setProblemName] = useState(problem_name); // Problem name input
  const [testCases, setTestCases] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [compiling, setCompiling] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userSession");
  const location = useLocation();
  const problemId = location.pathname.split('/')[2] || null;
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({
    type: 'error',
    data: '',
    duration: 5000
  });

  // Example templates for code
  const templates = {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  cout << "Hello, World!" << endl;
  return 0;
}`,
    python: `# Python program to print Hello World
print("Hello, World!")`,
    java: `import java.util.*;
import java.io.*;

public class Solution {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}`
  };

  const themes = {
    oneDark: oneDark,
    dracula: dracula,
    monokai: monokai,
    github: isDarkMode ? githubDark : githubLight
  };

  const languages = {
    cpp: [cpp()],
    java: [java()],
    python: [python()],
    javascript: [javascript()]
  };

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

  useEffect(() => {
    setCode(templates[language]);
  }, [language]);

  // Fetch test cases for the given problem name
  const fetchTestCases = async () => {
    if(!userId) {
      toast.warn("You are not logged in. Please register.", {
        position: "top-center",
        autoClose: 5000, // The toast will be visible for 5 seconds
        onClose: () => {
          // Redirect the user to the /register page after the toast is closed
          navigate("/register");
        }
      });
    }
    if (!problemName) {
      setError("Problem name is required!");
      return;
    }
    setLoading(true);
    setTestResults([]);
    setTestCases([]);
    setError("");
    try {
      const response = await fetch('http://localhost:5000/testcases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problemName }), // Send the problem name in the request body
        credentials: "include",
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError("Failed to fetch valid test cases.");
      } else {
        setTestCases(data.tests);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching test cases.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const debouncedFetch = debounce(() => {
      if (problemName) {
        fetchTestCases();
      }
    }, 500); // 500ms delay

    // Call the debounced function
    debouncedFetch();

    // Cleanup function to cancel the debounced function if the component unmounts or problemName changes
    return () => {
      debouncedFetch.cancel();
    };
  }, [problemName]); // Dependency on problemName

  // Handle running code with the given input (for the "Run" button)
  const handleRunCode = async () => {
    if(!userId) {
      toast.warn("You are not logged in. Please register.", {
        position: "top-center",
        autoClose: 5000, // The toast will be visible for 5 seconds
        onClose: () => {
          // Redirect the user to the /register page after the toast is closed
          navigate("/register");
        }
      });
    }
    setLoading(true);
    setCompiling(true); // Show compiling animation
    setTestResults([]);
    setOutput("");
    setError("");
  
    const results = testCases.map(() => ({
      output: null,
      status: "Pending",
    }));
  
    setTestResults(results);
  
    try {
      // Compilation step
      const compileResponse = await fetch("http://localhost:5000/runcode/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language, code, problemName,  }),
        credentials: "include",
      });
  
      if (!compileResponse.ok) {
        const errorBody = await compileResponse.json();
        // Show AlertModal
        setAlertData({
          type: 'error',
          header: 'Compilation Error',
          data: `Compilation Error ${problemName ? `on ${problemName}` : ''}`,
          duration: 6000
        });
        setShowAlert(true);
        throw new Error(errorBody.output || "Compilation failed with no details.");
      }
  
      setCompiling(false); // Stop showing compiling animation
  
      // Running test cases
      try {
        const response = await fetch("http://localhost:5000/runcode/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language,
            input,
          }),
          credentials: "include",
        });

        if (!response.ok) {
          const responseBody = await response.json();
          throw new Error(responseBody.output || "No output provided.");
        }

        const result = await response.json();
        setOutput(result.output);
      } catch (err) {
        console.log("Error running code", err.message);
        const errorMessage = err.stderr || err.message || "Unknown error occurred.";
        const isCompileError = errorMessage.toLowerCase().includes("compilation error");
        setError(err.message);
        };
      }
    catch (err) {
      console.error("Unexpected error during test execution:", err.message);
      setError(`An unexpected error occurred. Please try again.\n${err.message}`);
    } finally {
      setLoading(false);
      setCompiling(false);
      // Cleanup compiled executables
      try {
        const deleteResponse = await fetch(
          "http://localhost:5000/runcode/delete-executable",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ language }),
            credentials: "include",
          }
        );
        if (!deleteResponse.ok) {
          console.error("Error cleaning up compiled file:", deleteResponse.statusText);
        }
      } catch (err) {
        console.log("Error cleaning up compiled file:", err.message);
      }
    }
  };

  const handleSubmit = async () => {
    if(!userId) {
      toast.warn("You are not logged in. Please register.", {
        position: "top-center",
        autoClose: 5000, // The toast will be visible for 5 seconds
        onClose: () => {
          // Redirect the user to the /register page after the toast is closed
          navigate("/register");
        }
      });
    }
    if (!problemName) {
      setError("Please enter a problem name first!");
      return;
    }
  
    if (testCases.length === 0) {
      setError("No test cases found for this problem.");
      return;
    }
  
    setLoading(true);
    setCompiling(true); // Show compiling animation
    setTestResults([]);
    setOutput("");
    setError("");
  
    const results = testCases.map(() => ({
      output: null,
      status: "Pending",
    }));
  
    setTestResults(results);
    let passedAll = true;
    let tle = false;
    try {
      // Compilation step
      const compileResponse = await fetch("http://localhost:5000/runcode/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language, code, problemName }),
        credentials: "include",
      });
  
      if (!compileResponse.ok) {
        const errorBody = await compileResponse.json();
        passedAll = false;

        // Log activity
        await fetch('http://localhost:5000/user/activities', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            activityType: 'compilation_error',
            activityDescription: `You got a compilation error on ${problemName}`,
            link: `/problem/${problemId}`
          }),
          credentials: "include"
        });

        // Show AlertModal
        setAlertData({
          type: 'error',
          header: 'Compilation Error',
          data: `Compilation Error on "${problemName}"`,
          duration: 6000
        });
        setShowAlert(true);

        throw new Error(errorBody.output || "Compilation failed with no details.");
      }
  
      setCompiling(false); // Stop showing compiling animation
  
      // Running test cases
      for (let i = 0; i < testCases.length; i++) {
        const { input: testCaseInput, output: expectedOutput } = testCases[i];
  
        try {
          const response = await fetch("http://localhost:5000/runcode/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              language,
              code,
              problemName,
              testNumber: i + 1,
            }),
            credentials: "include",
          });
  
          if (!response.ok) {
            const responseBody = await response.json();
            console.log(responseBody.output);
            console.log('condition: ', responseBody.output === 'Runtime Error: Time Limit Exceeded');
            if(responseBody.output === 'Runtime Error: Time Limit Exceeded') {
              tle = true;
            }
            passedAll = false;
            throw new Error(responseBody.output || "No output provided.");
          }
  
          const result = await response.json();
          const isPass = result.status === "Passed";
          if(!isPass) passedAll = false;
          results[i] = {
            output: result.output,
            status: isPass ? "Passed" : "Failed",
            runtime: result.runtime
          };
        } catch (err) {
          console.log("Error running test case:", err.message);
  
          const errorMessage = err.stderr || err.message || "Unknown error occurred.";
          const isCompileError = errorMessage.toLowerCase().includes("compilation error");
  
          results[i] = {
            output: isCompileError
              ? `Compilation Error: ${errorMessage}`
              : `Runtime Error: ${errorMessage}`,
            status: isCompileError ? "Compile Error" : "Runtime Error",
            runtime: 'NA'
          };
          passedAll = false;
        }
        setTestResults([...results]); // Update test results after each test case
      }
      if(!passedAll) {
        // add a wrong answer activity on this problem!
        await fetch('http://localhost:5000/user/activities', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: tle ? JSON.stringify({
            userId,
            activityType: 'time_limit_exceeded',
            activityDescription: `You got a TLE on ${problemName}`,
            link: `/problem/${problemId}`
          }) : JSON.stringify({
            userId,
            activityType: 'wrong_answer',
            activityDescription: `You got a wrong answer on ${problemName}`,
            link: `/problem/${problemId}`
          }),
          credentials: "include"
        });
        // Show AlertModal
        setAlertData(tle ? {
          type: 'warning',
          header: 'Time limit Exceeded',
          data: `Some test cases crossed the time limit for "${problemName}". Please check your logic and try again.`,
          duration: 6000
        } : {
          type: 'warning',
          header: 'Wrong Answer',
          data: `Some test cases failed for "${problemName}". Please check your logic and try again.`,
          duration: 6000
        });
        setShowAlert(true);
      } else {
        // add a correct answer activity on this problem!
        await fetch('http://localhost:5000/user/activities', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            activityType: 'solved',
            activityDescription: `You solved ${problemName}!`,
            link: `/problem/${problemId}`
          }),
          credentials: "include"
        });
        // Show AlertModal
        setAlertData({
          type: 'success',
          header: 'Correct Answer!',
          data: `Well done! You passed all test cases for "${problemName}".`,
          duration: 5000
        });
        setShowAlert(true);
      }
    } catch (err) {
      console.error("Unexpected error during test execution:", err.message);
      setError(`An unexpected error occurred. Please try again.\n${err.message}`);
    } finally {
      setLoading(false);
      setCompiling(false);
      // Cleanup compiled executables
      try {
        const deleteResponse = await fetch(
          "http://localhost:5000/runcode/delete-executable",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ language }),
            credentials: "include",
          }
        );
        if (!deleteResponse.ok) {
          console.error("Error cleaning up compiled file:", deleteResponse.statusText);
        }
        if(passedAll) {
          try {
            const response = await fetch(`http://localhost:5000/user/addproblem`, {
              method: 'PUT',
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId, // The current user's ID
                problemId, // The ID of the problem being toggled
              }),
              credentials: "include"
            });
            console.log('response : ', await response.json());
          } catch (error) {
            console.error('error updating user status : ', error);
          }
        }
      } catch (err) {
        console.log("Error cleaning up compiled file:", err.message);
      }
    }
  };  

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const editorExtensions = [
    basicSetup,
    ...languages[language],
    // autocompletion(),
    // closeBrackets(),
    // Explicitly set the tab size and indent unit here
    EditorState.tabSize.of(4)
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200`}>
      <div className="mx-auto px-4 py-8">
        <div className={`rounded-xl shadow-2xl p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          { location.pathname.endsWith('/playground') && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Code2 className="w-8 h-8 text-blue-500" />
                <h1 className="text-3xl font-bold text-white">Code Runner</h1>
              </div>
            </div>
          )}

          {!location.pathname.endsWith('/playground') && (
            <div className="mb-6">
              <input
                type="text"
                value={problem_name} // Set a fixed value
                readOnly // Make it uneditable
                className={`w-full p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"
                }`}
              />
            </div>
          )}

          <div className="flex gap-4">
            {showAlert && (
              <AlertModal
                data={alertData.data}
                type={alertData.type}
                header={alertData.header}
                duration={alertData.duration}
                onClose={() => setShowAlert(false)}
              />
            )}
            <select
              className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>

            <select
              className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
            >
              <option value="oneDark">One Dark</option>
              <option value="dracula">Dracula</option>
              <option value="monokai">Monokai</option>
              <option value="github">GitHub</option>
            </select>

            <select
              className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
            </select>
          </div>

          <div className="my-4">
            <CodeMirror
              value={code}
              height="300px"
              extensions={editorExtensions}
              theme={themes[selectedTheme]}
              onChange={(value) => setCode(value)}
              style={{ fontSize: `${fontSize}px` }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="mb-6 flex gap-4">
            <button
              onClick={handleRunCode}
              className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-semibold flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Terminal className="animate-spin w-6 h-6 mr-2" />
              ) : (
                <Play className="w-6 h-6 mr-2" />
              )}
              {loading ? "Running..." : "Run"}
            </button>
            {!location.pathname.endsWith('/playground') && (
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold flex items-center justify-center"
                disabled={loading}
              >
                {compiling ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent border-solid rounded-full animate-spin mr-2"></div> Compiling...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            )}
          </div>


          <div className="mb-4">
            <textarea
              className={`w-full p-4 rounded-lg ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}
              rows="5"
              placeholder="Enter input for your code"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {output && (
            <div className={`mb-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"} p-4 rounded-md`}>
              <h3 className="text-xl font-semibold">Output</h3>
              <pre className={`mt-2 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-800"} p-4 rounded-md`}>
                {output}
              </pre>
            </div>
          )}

          {error && (
            <div className="mb-6 w-full mx-auto rounded-lg border border-red-300 bg-red-100 text-red-900 shadow-md">
              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold mb-3">Compilation Error</h2>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-red-50 p-4 rounded-md border border-red-200 overflow-auto">
                  {error}
                </pre>
              </div>
            </div>
          )}

          {/* Test Case Table */}
          {testCases.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Test Cases</h3>
              <table className="min-w-full table-auto text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Test Case</th>
                  </tr>
                </thead>
                <tbody>
                  {testCases.map((testCase, index) => {
                    const testResult = testResults[index];
                    const status = testResult ? testResult.status : "Pending";
                    const runtime = testResult ? testResult.runtime : "NA";
                    // Assign colors based on status
                    let statusColor = "bg-yellow-300"; // Default for Pending
                    if (status === "Passed") statusColor = "bg-green-500"; // Green for Passed
                    else if (status === "Compile Error") statusColor = "bg-blue-500"; // Blue for Compile Error
                    else if (status === "Runtime Error") statusColor = "bg-orange-500"; // Orange for Runtime Error
                    else if (status === "Failed") statusColor = "bg-red-500"; // Red for Wrong Answer

                    return (
                      <tr key={index}>
                        <td className="py-2 px-4 flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white mr-2 transition-all duration-500 ${statusColor}`}
                          >
                            #{index + 1}
                          </div>
                          {/* <span>{testCase.input}</span> */}
                          <span>{`Runtime : ${runtime == undefined ? "waiting" : runtime}`}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;