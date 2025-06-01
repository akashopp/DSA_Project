import React, { useState } from 'react';

function NewQuestionModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || !tags.trim()) {
      setError('All fields are required.');
      return;
    }

    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);

    const newQuestion = {
      title,
      body,
      tags: tagArray,
    };

    try {
      await onSubmit(newQuestion); // Call the passed handler
      onClose(); // Close modal on success
      setTitle('');
      setBody('');
      setTags('');
      setError('');
    } catch (err) {
      setError('Failed to submit question.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Ask a New Question</h2>

        {error && <p className="text-red-400 mb-2">{error}</p>}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Describe your question..."
            rows={5}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <input
            type="text"
            placeholder="Tags (comma-separated)"
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewQuestionModal;