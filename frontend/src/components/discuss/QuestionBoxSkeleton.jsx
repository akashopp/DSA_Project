import React from 'react';

function QuestionBoxSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-4 border border-gray-200 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-5 bg-green-200 dark:bg-green-800 rounded-full w-16" />
      </div>

      <div className="mt-2 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-5 bg-blue-200 dark:bg-blue-800 rounded-full w-16" />
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32" />
        <div className="flex gap-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export default QuestionBoxSkeleton;
