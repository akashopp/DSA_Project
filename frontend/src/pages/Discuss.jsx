import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import QuestionBox from '../components/discuss/QuestionBox';
import QuestionBoxSkeleton from '../components/discuss/QuestionBoxSkeleton';
import NewQuestionModal from '../components/discuss/NewQuestionModal';
import AlertModal from '../components/AlertModal';
import { useSocketStore } from '../store/useSocketStore';

function Discuss() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 5);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const [questions, setQuestions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setModalOpen] = useState(false);

  const [alertData, setAlertData] = useState({});
  const [showAlert, setShowAlert] = useState(false);

  const { socket } = useSocketStore();

  // Fetch questions function (memoized to avoid unnecessary recreation)
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: searchQuery,
        limit,
        page: currentPage,
      });

      const res = await fetch(`http://localhost:5000/discuss?${query}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();

      setQuestions(data.questions || []);
      setTotalPages(Math.ceil((data.total || 0) / limit));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, limit, currentPage]);

  // Sync URL params with state
  useEffect(() => {
    const params = {
      search: searchQuery || '',
      limit: limit !== 5 ? String(limit) : '5',
      page: currentPage !== 1 ? String(currentPage) : '1',
    };
    setSearchParams(params);
  }, [searchQuery, limit, currentPage, setSearchParams]);

  // Fetch questions when searchQuery, limit or currentPage changes
  useEffect(() => {
    const controller = new AbortController();
    const debounceTimeout = setTimeout(() => {
      fetchQuestions();
    }, 400);

    return () => {
      clearTimeout(debounceTimeout);
      controller.abort();
    };
  }, [fetchQuestions]);

  // Listen to socket 'refresh' event to trigger refetch
  useEffect(() => {
    if (!socket) return;

    const onRefresh = () => {
      fetchQuestions();
    };

    socket.on('refresh', onRefresh);

    return () => {
      socket.off('refresh', onRefresh);
    };
  }, [socket, fetchQuestions]);

  const handleSubmitQuestion = async (questionData) => {
    const res = await fetch('http://localhost:5000/discuss/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
      credentials: 'include',
    });

    if (!res.ok) {
      setAlertData({
        type: 'error',
        header: 'Failed to add your question',
        data: `Please try again later`,
        duration: 6000
      });
      setShowAlert(true);
      throw new Error('Failed to post question');
    } else {
      setAlertData({
        type: 'success',
        header: 'Success',
        data: `Your question has been added successfully!`,
        duration: 6000
      });
      setShowAlert(true);
    }
    // After successful post, fetch questions to update list
    fetchQuestions();
  };

  return (
    <div className="p-10 min-h-screen bg-gray-900 text-gray-100 mt-8 mx-4 rounded-lg">
      {showAlert && (
        <AlertModal
          data={alertData.data}
          type={alertData.type}
          header={alertData.header}
          duration={alertData.duration}
          onClose={() => setShowAlert(false)}
        />
      )}
      <NewQuestionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitQuestion}
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg"
        >
          + Ask Question
        </button>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
        >
          {[5, 10, 20].map(val => (
            <option key={val} value={val}>Show {val}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: limit }).map((_, i) => (
            <QuestionBoxSkeleton key={i} />
          ))
        ) : questions.length > 0 ? (
          questions.map(q => <QuestionBox key={q._id} {...q} />)
        ) : (
          <p className="text-center text-gray-500">No questions found.</p>
        )}
      </div>

      {/* Footer: Pagination */}
      <div className="flex justify-center items-center gap-4 pt-6 mt-8 border-t border-gray-700 text-gray-400">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="px-4 py-2 border border-gray-700 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700"
        >
          Prev
        </button>
        <span>
          Page <strong>{currentPage}</strong> of {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          className="px-4 py-2 border border-gray-700 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Discuss;