import React from "react";

const NoDataMessage = ({
  title = "No Data Available",
  message = "There is no data to display at the moment.",
  actionText = "",
  onAction = null,
  icon = null,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      {icon ? (
        <div className="mx-auto mb-4 text-gray-300">{icon}</div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default NoDataMessage;
