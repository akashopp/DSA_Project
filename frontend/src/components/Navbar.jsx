import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RocketIcon } from './RocketIcon';
import { User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSocketStore } from '../store/useSocketStore.js'

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userSession"); // Check for user session

  const [user, setUser] = useState({});
  const { socket } = useSocketStore();

  const setUp = async () => {
    if (userId) {
      const user = await fetch(`http://localhost:5000/user/getUser/${userId}`, {
        method: "GET",
        credentials: "include",
      })
      setUser(await user.json());
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }

  // Update isLoggedIn state when userId changes
  useEffect(() => {
    console.log('userid : ', userId);
    setUp();
  }, [userId]);

  useEffect(() => {
    if(socket) {
      socket.on('mention', () => {
        setUp();
        toast.info("You have a new mention!", {
        position: "top-center",
        autoClose: 5000, // The toast will be visible for 5 seconds
      });
      });

      return () => {
        socket.off('mention');
      }
    }
  })

  // Logout function
  const handleLogout = async () => {
    try {
      // Send a logout request to the server
      const response = await fetch("http://localhost:5000/user/logout", {
        method: "POST", // Or "GET" depending on your backend setup
        headers: {
          "Content-Type": "application/json",
          // Include any authorization headers or cookies if necessary
        },
        credentials: "include",
      });
  
      const result = await response.json();
      
      if (result.success) {
        // If the logout was successful, proceed with frontend actions
        localStorage.removeItem("userSession"); // Remove the session from localStorage
        setIsLoggedIn(false); // Update the state to reflect logout
        navigate('/'); // Redirect to the homepage or any other route
      } else {
        // Handle any errors that occur during the logout process
        console.log("Logout failed:", result.message);
      }
    } catch (error) {
      console.log("Error during logout:", error);
      // Handle errors (e.g., network issues)
    }
  };

  return (
    <div className="flex justify-between bg-[#404040] p-2 relative">
      <div className="flex items-center space-x-8">
        {/* Logo and brand */}
        <Link to="/" className="flex items-center space-x-2 px-6 py-2">
          <RocketIcon className="w-8 h-8 text-white" />
        </Link>
      </div>

      {/* Middle section - Centered */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-white font-extrabold text-4xl">
        LearnDSA
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            {/* Profile section */}
            <div className="relative">
              <Link to="/profile" className="hover:text-gray-300 transition-colors text-white font-extrabold">
                <User className="h-6 w-6" />
              </Link>
              {user?.hasMentions && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900" />
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 px-4 py-1.5 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-md transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;