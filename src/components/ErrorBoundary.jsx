import { useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-700 mb-4">
          Sorry, an unexpected error has occurred.
        </p>
        <p className="text-gray-500 italic">
          {error?.statusText || error?.message || "Unknown error"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
