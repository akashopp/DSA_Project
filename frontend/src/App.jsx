import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Lessons from "./pages/Lessons";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Roadmap from "./pages/Roadmap";
import Submit from "./pages/Submit";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { ToastContainer } from 'react-toastify';
import Problem from "./components/Problem";
import Recommendation from "./pages/Recommendation";
import Profile from "./pages/Profile";
import Discuss from "./pages/Discuss";
import DiscussionPage from "./pages/DiscussionPage";
import { useSocketStore } from "./store/useSocketStore";
import Solution from "./pages/Solution";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const { socket, connectSocket, subscribeTo, unsubscribeFrom, switchDiscussionRoom } = useSocketStore();

  // Validate user session and connect socket
  const validateSession = async () => {
    try {
      const response = await fetch('http://localhost:5000/', {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      connectSocket(localStorage.getItem('userSession'));
      // Always subscribe to 'mention'
      subscribeTo('mention');
      const path = location.pathname;
      if (path.startsWith('/discuss/')) {
        const postId = path.split('/discuss/')[1];
        subscribeTo('discuss');
        unsubscribeFrom('discuss');
        switchDiscussionRoom(postId);
      } else if (path.startsWith('/discuss')) {
        subscribeTo('discuss');
        switchDiscussionRoom(null);
      } else {
        unsubscribeFrom('discuss');
        switchDiscussionRoom(null);
      }
    } catch (err) {
      localStorage.removeItem("userSession");
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    validateSession();
  }, []);

  // Socket room logic based on route
  useEffect(() => {
    const path = location.pathname;
    subscribeTo('mention');
    if (path.startsWith('/discuss/')) {
      const postId = path.split('/discuss/')[1];
      subscribeTo('discuss');
      unsubscribeFrom('discuss');
      switchDiscussionRoom(postId);
    } else if (path.startsWith('/discuss')) {
      subscribeTo('discuss');
      switchDiscussionRoom(null);
    } else {
      unsubscribeFrom('discuss');
      switchDiscussionRoom(null);
    }

    return () => {
      // Optional: cleanup logic if needed
    };
  }, [location]);

  useEffect(() => {
    if(socket) {
      socket.on('mention', (body) => {
        console.log('mention received!\n', body);
      });
      return () => {
        socket.off('mention');
      }
    }
  }, [socket]);

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/playground" element={<Submit />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/problem/:problemId" element={<Problem />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/discuss" element={<Discuss />} />
        <Route path="/discuss/:postId" element={<DiscussionPage />} />
        <Route path="/solution/:problemId" element={<Solution />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}