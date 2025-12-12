import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserPurchases } from "../../api/purchase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faChevronLeft,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import OrderCard from "../../components/Profile/OrderCard";

const PurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPurchases = async () => {
      try {
        const response = await getUserPurchases();

        // Handle different response formats.
        // getUserPurchases() returns response.data from axios; however
        // backends may nest lists under different keys. Try common shapes.
        let purchasesData = [];

        if (Array.isArray(response)) purchasesData = response;
        else if (Array.isArray(response?.data)) purchasesData = response.data;
        else if (Array.isArray(response?.purchases))
          purchasesData = response.purchases;
        else if (Array.isArray(response?.results))
          purchasesData = response.results;
        else if (Array.isArray(response?.data?.data))
          purchasesData = response.data.data;
        else {
          // Try to find the first array property on the response object.
          if (response && typeof response === "object") {
            for (const v of Object.values(response)) {
              if (Array.isArray(v)) {
                purchasesData = v;
                break;
              }
            }
          }
        }

        // Normalize minimal fields to avoid rendering issues in OrderCard
        purchasesData = (purchasesData || []).map((p) => ({
          id: p.id ?? p.purchase_id ?? p.order_id,
          status: p.status ?? p.payment_status ?? p.state,
          total_amount: p.total_amount ?? p.amount ?? p.totalPrice ?? 0,
          created_at:
            p.created_at ?? p.createdAt ?? p.date ?? new Date().toISOString(),
          payment_id: p.payment_id ?? p.xendit_id ?? p.paymentId ?? null,
          product: p.product ?? p.item ?? p.product_details ?? null,
          _raw: p,
        }));

        setOrders(purchasesData);
      } catch (err) {
        setError("Failed to load purchase history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPurchases();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-3xl text-blue-600 mb-4"
          />
          <p>Loading purchase history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-black mr-4"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold">Purchase History</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FontAwesomeIcon
              icon={faShoppingBag}
              className="h-24 w-24 mx-auto text-gray-300 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">No Purchase History</h3>
            <p className="text-gray-500 mb-6">
              You haven't made any purchases yet.
            </p>
            <button
              onClick={() => navigate("/ejpeace/store")}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Browse Store
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
