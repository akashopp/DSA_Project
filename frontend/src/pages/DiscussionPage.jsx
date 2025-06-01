import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReplyManager from '../components/discussion/ReplyManager';
import ReplyBox from '../components/discussion/ReplyBox';
import { useSocketStore } from '../store/useSocketStore';

function DiscussionPage() {
  const { postId } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState([]);  // Manage replies state

  const { socket } = useSocketStore();

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`http://localhost:5000/discuss/${postId}`);
      const data = await res.json();
      setQuestion(data);
      setReplies(data.answers);  // Initialize replies state
    } catch (error) {
      console.error('Failed to fetch question:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(socket) {
      socket.on('refresh', () => {
        console.log('refreshing page!');
        fetchQuestion();
      });
      return () => {
        socket.off('refresh');
      }
    }
  }, [socket]);

  useEffect(() => {

    fetchQuestion();
  }, [postId]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading discussion...</div>;
  }

  if (!question) {
    return <div className="text-center mt-10 text-red-500">Question not found.</div>;
  }

  const onSubmitReply = async (replyBody) => {
    console.log('Replying to:', replyBody.parentReplyId, 'Content:', replyBody.body);
    try {
      const res = await fetch(`http://localhost:5000/discuss/${postId}/reply`, {
        method: "POST",
        body: JSON.stringify(replyBody),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });

    } catch (error) {
      console.error(error);
    }
  }

  const handleMarkAsAnswer = async (reply) => {
    try {
      const res = await fetch(`http://localhost:5000/discuss/${postId}/resolve/${reply._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await res.json();
      
      // Update the local state after the reply is marked as the correct answer
      setReplies(prevReplies =>
        prevReplies.map(r =>
          r._id === reply._id ? { ...r, isAnswer: true } : r
        )
      );
      setQuestion(prevQuestion => ({
        ...prevQuestion,
        isResolved: true,  // Set the isResolved property to true
      }));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <motion.div
      className="mx-4 p-8 bg-gray-900 text-white shadow-xl rounded-3xl mt-8 border border-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-blue-400 leading-snug">
          {question.title}
        </h1>
        {question.isResolved && (
          <span className="text-xs font-semibold bg-green-700 text-white px-3 py-1 rounded-full">
            Resolved
          </span>
        )}
      </div>
  
      {/* Body */}
      <p className="text-gray-300 text-lg mb-6 whitespace-pre-line leading-relaxed">
        {question.body}
      </p>
  
      {/* Tags */}
      <div className="flex flex-wrap gap-3 mb-6">
        {question.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full text-sm"
          >
            #{tag}
          </span>
        ))}
      </div>
  
      {/* Metadata */}
      <div className="text-sm text-gray-500 mb-8">
        Asked by{' '}
        <span className="font-semibold text-white">
          {question.authorId?.userId}
        </span>{' '}
        on {new Date(question.createdAt).toLocaleString()}
      </div>
  
      {/* Replies */}
      <hr className="border-gray-700 mb-6" />
      <h2 className="text-2xl font-semibold text-gray-100 mb-4">Replies</h2>
      <div className="text-gray-500 italic mb-6">
        <ReplyManager
          replies={replies}  // Pass updated replies
          onSubmitReply={onSubmitReply}
          handleMarkAsAnswer={handleMarkAsAnswer}
        />
      </div>

      <div className="bg-gray-800 p-6 rounded-xl">
        <ReplyBox onSubmitReply={onSubmitReply} />
      </div>
    </motion.div>
  );
}

export default DiscussionPage;