import { useState } from "react";
import OrderCard from "./OrderCard";

export default function OrderHistorySection({ orders }) {
  const [filter, setFilter] = useState("all"); // "all" | "products" | "events"
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest"
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5; // Number of orders per page

  // Ensure orders is an array and filter for paid status only
  const ordersArray = Array.isArray(orders)
    ? orders.filter((order) => order.status?.toLowerCase() === "paid")
    : [];

  // Filter orders
  const filteredOrders = ordersArray.filter((order) => {
    if (filter === "all") return true;
    if (filter === "products") {
      // For products, check if product exists and category is not "ticket"
      return (
        order.product && order.product.category?.toLowerCase() !== "ticket"
      );
    }
    if (filter === "events") {
      // For events, check if product exists and category is "ticket"
      return (
        order.product && order.product.category?.toLowerCase() === "ticket"
      );
    }
    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of orders section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (ordersArray.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 mx-auto text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
        <p className="text-gray-500 mb-6">
          You haven't made any purchases yet. Start shopping!
        </p>
        <a
          href="/ejpeace/store"
          className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Browse Store
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Filters & Sort */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            All ({ordersArray.length})
          </button>
          <button
            onClick={() => setFilter("products")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "products"
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setFilter("events")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "events"
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Events
          </button>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {paginatedOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Empty Filtered State */}
      {sortedOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">No {filter} orders found.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedOrders.length)}{" "}
            of {sortedOrders.length} orders
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Show first, last, current, and nearby pages
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNumber
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }

              // Show ellipsis for skipped pages
              if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <span key={pageNumber} className="px-2 py-2 text-gray-500">
                    ...
                  </span>
                );
              }

              return null;
            })}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
