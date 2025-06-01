import React, { useEffect, useState } from 'react';
import { fetchProblems, fetchUserProblems, ProblemManager } from '../utils';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Recommendation = () => {
    const userId = localStorage.getItem("userSession");
    const [problems, setProblems] = useState([]);
    const [userSolved, setUserSolved] = useState([]);
    const [groupedProblems, setGroupedProblems] = useState({});
    const [groupedUserSolvedProblems, setGroupedUserSolvedProblems] = useState({});
    const [recommendation, setRecommendation] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertData, setAlertData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            toast.warn("You are not logged in. Please register.", {
                position: "top-center",
                autoClose: 5000,
                onClose: () => navigate("/register")
            });
        } 
    }, [userId, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchProblems(() => {
                    setAlertData({
                        type: 'error',
                        header: 'Failed to fetch problems',
                        data: `Please try again later`,
                        duration: 6000
                    })
                    setShowAlert(true);
                });
                setProblems(data);
                // Group problems by topic
                const grouped = ProblemManager.groupByTopic(data);
                setGroupedProblems(grouped);

                // Fetch user solved problem IDs
                const userSolvedData = await fetchUserProblems(userId);
                // Ensure we extract the correct array
                const userSolvedIds = Array.isArray(userSolvedData) 
                    ? userSolvedData 
                    : userSolvedData.problems || [];

                // Filter problems that the user has solved
                const userSolvedProblems = data.filter((problem) => userSolvedIds.includes(problem._id));
                setUserSolved(userSolvedProblems);

                // Group user-solved problems by topic
                const groupedUserProblems = ProblemManager.groupByTopic(userSolvedProblems);
                setGroupedUserSolvedProblems(groupedUserProblems);

                // Compute the recommendation
                computeRecommendation(grouped, groupedUserProblems);
                
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (userId) fetchData();
    }, [userId]); // Add userId as a dependency to re-run when userId changes    

    // Function to compute the recommended problem
    const computeRecommendation = (grouped, groupedUserSolved) => {
        const topicOrder = ["Arrays", "Stack/Queue", "Two Pointers", "Hashing", "Binary Search", "Dynamic Programming", "Trees", "Graphs"];

        // Step 1: Compute ratio for each topic
        const topicRatios = Object.keys(grouped).map(topic => {
            const total = grouped[topic].length;
            const solved = groupedUserSolved[topic]?.length || 0;
            return {
                topic,
                solved,
                total,
                ratio: solved / total
            };
        });

        // Step 2: Sort by ratio (ascending), using topicOrder for tie-breaking
        topicRatios.sort((a, b) => {
            if (a.ratio !== b.ratio) return a.ratio - b.ratio;
            return topicOrder.indexOf(a.topic) - topicOrder.indexOf(b.topic);
        });

        // Step 3: Find the first unsolved problem in the topic with the lowest ratio
        for (let { topic } of topicRatios) {
            const unsolved = grouped[topic].find(problem => 
                !groupedUserSolved[topic]?.some(solvedProblem => solvedProblem._id === problem._id)
            );

            if (unsolved) {
                setRecommendation({ problem: unsolved, topic });
                return;
            }
        }
        setRecommendation(null);
    };

    return (
        <div className="mx-4 mt-8 p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Problem Recommendation</h1>
            {showAlert && (
                <AlertModal
                data={alertData.data}
                type={alertData.type}
                header={alertData.header}
                duration={alertData.duration}
                onClose={() => setShowAlert(false)}
                />
            )}
            {/* Recommended Problem */}
            {recommendation ? (
                <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
                    <h2 className="text-xl font-semibold">{recommendation.problem.problemName}</h2>
                    <p className="text-gray-400">Topic: {recommendation.topic}</p>
                    <Link 
                        to={`/problem/${recommendation.problem._id}`} 
                        className="text-blue-400 hover:underline mt-2 block"
                    >
                        Solve Now →
                    </Link>
                </div>
            ) : (
                <p className="text-gray-400">All problems are solved!</p>
            )}

            {/* Progress Bars */}
            <h2 className="text-lg font-semibold text-white mt-6">Progress by Topic</h2>
            <div className="mt-4 space-y-3">
                {Object.keys(groupedProblems).map(topic => {
                    const total = groupedProblems[topic].length;
                    const solved = groupedUserSolvedProblems[topic]?.length || 0;
                    const percentage = (solved / total) * 100;

                    return (
                        <div key={topic}>
                            <p className="text-gray-300">{topic}: {solved}/{total} solved</p>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <div 
                                    className="bg-green-500 h-3 rounded-full transition-[width] duration-700 ease-in-out"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Recommendation;