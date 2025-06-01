import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProblems, fetchUserProblems, ProblemManager } from '../utils'; // Assuming these are in the utils file
import { toast } from 'react-toastify';
import { useSocketStore } from '../store/useSocketStore';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedProblems, setGroupedProblems] = useState({});
  const [groupedUserSolvedProblems, setGroupedUserSolvedProblems] = useState({});
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();
  const { socket } = useSocketStore();

  const userId = localStorage.getItem('userSession'); // Get user ID from localStorage

  // Redirect if user is not logged in
  useEffect(() => {
    if (!userId) {
      toast.warn('You are not logged in. Please log in to access your profile.', {
        position: 'top-center',
        autoClose: 5000,
        onClose: () => navigate('/login'), // Redirect to login page
      });
    }
  }, [userId, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/user/getuser/${userId}`, {
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const clearResponse = await fetch('http://localhost:5000/user/clearMentions', {
        method: "POST",
        body: {},
        credentials: "include"
      })
      const data = await clearResponse.json();
      console.log('data : ', data);
      setUserData(data);
      const problems = await fetchProblems();
      const grouped = ProblemManager.groupByTopic(problems);
      setGroupedProblems(grouped);

      const userSolvedData = await fetchUserProblems(userId);
      const userSolvedIds = Array.isArray(userSolvedData) ? userSolvedData : userSolvedData.problems || [];
      const userSolvedProblems = problems.filter((problem) => userSolvedIds.includes(problem._id));
      setGroupedUserSolvedProblems(ProblemManager.groupByTopic(userSolvedProblems));

      const userActivities = await fetch('http://localhost:5000/user/activities', {
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });
      const rawActivities = await userActivities.json();
      const sortedActivities = rawActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivities(sortedActivities);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if(socket) {
      const onRefresh = () => {
        console.log('mentioned in profile lol');
        if(userId) fetchUserData();
      }
      socket.off('mention', onRefresh); // 👈 Ensure we don't register it multiple times
      socket.on('mention', onRefresh);  
      return () => {
        socket.off('mention', onRefresh); // 👈 Clean up on unmount
      };
    }
  })

  // Prevent rendering profile content if userId is null
  if (!userId) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <span className="text-xl text-white">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <span className="text-xl text-red-500">Error: {error}</span>
      </div>
    );
  }

  let grand_total = 0;
  // Progress computation logic
  const progressByTopic = Object.keys(groupedProblems).map((topic) => {
    const total = groupedProblems[topic]?.length || 0;
    const solved = groupedUserSolvedProblems[topic]?.length || 0;
    const percentage = (solved / total) * 100;
    grand_total += solved;
    return { topic, solved, total, percentage };
  });

  // Group activities by date (e.g. "2025-05-18")
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-extrabold text-green-500 mb-6">Profile</h2>
      <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
        <div className="mb-4 text-white">
          <p className="text-xl font-semibold"><strong>Name:</strong> {userData?.name}</p>
          <p className="text-xl font-semibold"><strong>User ID:</strong> {userData?.userId}</p>
          <p className="text-xl font-semibold"><strong>Email:</strong> {userData?.email}</p>
          <p className="text-xl font-semibold"><strong>Phone Number:</strong> {userData?.phoneNumber}</p>
          <p className="text-xl font-semibold"><strong>Joined:</strong> {new Date(userData?.createdAt).toLocaleDateString()}</p>
          <p className="text-xl font-semibold"><strong>Last Updated:</strong> {new Date(userData?.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Progress by Topic */}
      <h3 className="text-2xl font-extrabold text-red-500 mb-4">Progress by Topic</h3>
      <div className="space-y-4">
        {progressByTopic.map(({ topic, solved, total, percentage }) => (
          <div key={topic}>
            <p className="text-gray-300">
              {topic}: {solved}/{total} solved
            </p>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-[width] duration-700 ease-in-out"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
        <div className='text-center text-2xl text-gray-300'>
          Total solved : {grand_total}
        </div>
      </div>

      {/* Activities */}
      <h3 className="text-2xl font-bold text-white mb-6">Recent Activities</h3>
      <div className="space-y-8">
        {Object.keys(groupedActivities).length === 0 ? (
          <p className="text-gray-400 text-lg">No recent activities found.</p>
        ) : (
          Object.entries(groupedActivities).map(([date, activities]) => (
            <div key={date}>
              <h4 className="text-lg font-semibold text-gray-300 mb-3 border-b border-gray-700 pb-1">
                {date}
              </h4>
              <div className="space-y-4">
                {activities.map((activity) => {
                  const { activityType, activityDescription, link, createdAt } = activity;

                  // Define styles
                  const activityStyles = {
                    solved: "border-green-500",
                    wrong_answer: "border-red-500",
                    compilation_error: "border-yellow-400",
                    replied: "border-blue-400",
                    asked_question: "border-purple-400",
                    mentioned: "border-pink-400",
                  };
                  const borderColor = activityStyles[activityType] || "border-gray-600";

                  return (
                    <div
                      key={activity._id}
                      className={`border-l-4 ${borderColor} bg-gray-800 rounded-md px-4 py-3 shadow-sm hover:shadow-md hover:border-l-8 transition-[border] duration-150`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-100 capitalize">
                          {activityType.replace("_", " ")}
                        </p>
                        <span className="text-xs text-gray-400">{new Date(createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-gray-300">{activityDescription}</p>
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 underline mt-1 inline-block"
                        >
                          View Link
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;