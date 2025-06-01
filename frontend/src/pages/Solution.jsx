import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';

function Solution() {
  const { problemId } = useParams();
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const res = await fetch(`http://localhost:5000/solution/${problemId}`);
        const json = await res.json();
        setSolution(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) fetchSolution();
    else setLoading(false);
  }, [problemId]);

  const renderCode = (lang, code, extension) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-2">{lang} Solution</h3>
      {code ? (
        <CodeMirror
          value={code}
          height="400px"
          extensions={[extension]}
          theme="dark"
          editable={false}
        />
      ) : (
        <div className="bg-gray-800 text-yellow-400 p-4 rounded-lg">
          No solution available in <span className="font-semibold">{lang}</span>.
        </div>
      )}
    </div>
  );

  if (!problemId) return <p className="text-red-500 p-4">Missing problemId in path.</p>;
  if (loading) return <p className="p-4">Loading...</p>;
  if (!solution) {
    return (
      <div className="mx-4 px-4 py-6 bg-gray-900 shadow-lg rounded-lg mt-6 text-white">
        <p>Problem not found.</p>
      </div>
    );
  }

  const hasCpp = !!solution.cppSolution;
  const hasJava = !!solution.javaSolution;
  const hasPython = !!solution.pythonSolution;
  const hasAny = hasCpp || hasJava || hasPython;

  return (
    <div className="mx-4 px-4 py-6 bg-gray-900 shadow-lg rounded-lg mt-6 text-white">
      <div className="mx-8 mt-2">
        <h1 className="text-2xl font-bold text-white mb-6">Solutions</h1>

        {!hasAny ? (
          <div className="bg-gray-800 text-yellow-400 p-4 rounded-lg">
            No solution has been uploaded yet in C++, Java, or Python.
          </div>
        ) : (
          <>
            {renderCode('C++', solution.cppSolution, cpp())}
            {renderCode('Java', solution.javaSolution, java())}
            {renderCode('Python', solution.pythonSolution, python())}
          </>
        )}
      </div>
    </div>
  );
}

export default Solution;