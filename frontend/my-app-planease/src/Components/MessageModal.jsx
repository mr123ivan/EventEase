import React from "react";

const MessageModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  // Detect if message is an error based on keywords
  const isError = message && (
    message.toLowerCase().includes("error") ||
    message.toLowerCase().includes("failed") ||
    message.toLowerCase().includes("invalid") ||
    message.toLowerCase().includes("missing") ||
    message.toLowerCase().includes("please") ||
    message.toLowerCase().includes("must") ||
    message.toLowerCase().includes("required") ||
    message.toLowerCase().includes("cannot")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative flex flex-col items-center">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          {/* Icon - show error or success based on message */}
          <div className="mb-4">
            {isError ? (
              // Error Icon - Red X in circle
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14"
                fill="none"
                viewBox="0 0 48 48"
              >
                <circle
                  cx="24"
                  cy="24"
                  r="15"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  fill="none"
                />
                <path
                  d="M18 18l12 12M30 18l-12 12"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // Success Icon - Green checkmark
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14"
                fill="none"
                viewBox="0 0 48 48"
              >
                <circle
                  cx="24"
                  cy="24"
                  r="15"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  fill="none"
                />
                <path
                  d="M17 24l6 6 8-10"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <p className="text-xl font-semibold text-black text-center">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageModal; 