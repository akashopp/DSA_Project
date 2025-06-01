import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function QuestionBox({
  _id,
  title,
  body,
  tags,
  authorId,
  createdAt,
  views,
  isResolved
}) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-4 border border-gray-200 hover:shadow-lg transition duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex justify-between items-center">
        <Link to={`/discuss/${_id}`}>
          <h2 className="text-xl font-semibold text-blue-600 hover:underline">{title}</h2>
        </Link>
        {isResolved && (
          <span className="text-sm text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
            Resolved
          </span>
        )}
      </div>

      <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
        {body}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full text-sm"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        <span>By <span className="font-medium">{authorId?.userId}</span></span>
        <div className="flex gap-4">
          <span>{views} views</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default QuestionBox;