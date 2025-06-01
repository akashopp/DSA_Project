import React, { useEffect } from 'react';

/**
 * AlertModal Component
 * @param {Object} props
 * @param {string} props.data - The message to display
 * @param {string} [props.header] - Optional header/title for the alert
 * @param {string} [props.type='info'] - Type of alert ('info', 'success', 'warning', 'error')
 * @param {number} [props.duration=3000] - Auto-dismiss duration in milliseconds
 * @param {function} [props.onClose] - Optional close callback
 */
function AlertModal({ data, header, type = 'info', duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    info: {
      bg: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    success: {
      bg: 'bg-green-100 text-green-900 border-green-300',
    },
    warning: {
      bg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    },
    error: {
      bg: 'bg-red-100 text-red-900 border-red-300',
    }
  };

  const { bg } = styles[type] || styles.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`w-full max-w-3xl min-w-[600px] mx-6 md:mx-auto p-8 rounded-lg shadow-xl border ${bg} transition-all duration-300`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {header && <h2 className="text-xl font-semibold mb-2 text-gray-900">{header}</h2>}
            <div className="text-base leading-relaxed font-medium break-words">
              {data}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl ml-6"
            aria-label="Close Alert"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;