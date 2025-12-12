import { api } from "./apiClient";

// CREATE TICKET
export const createTicket = async (data) => {
  const res = await api.post("/tickets", data);
  return res.data;
};

// INITIATE PAYMENT FOR TICKET
export const initiateTicketPayment = async (data) => {
  // Add return URL for Xendit callback
  const paymentData = {
    ...data,
    success_redirect_url: `${window.location.origin}/ejpeace/event/payment-callback?status=SUCCESS`,
    failure_redirect_url: `${window.location.origin}/ejpeace/event/payment-callback?status=FAILED`,
  };

  const res = await api.post("/tickets/payment", paymentData);
  return res.data;
};

// CHECK TICKET BY PAYMENT ID
export const checkTicketByPaymentId = async (paymentId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${api.defaults.baseURL}/tickets/check-payment/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error checking ticket by payment ID:", error);
    throw error;
  }
};

// UPDATE TICKET STATUS
export const updateTicketStatus = async (ticketId, status) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${api.defaults.baseURL}/tickets/update-status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: parseInt(ticketId),
          status: status,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating ticket status:", error);
    throw error;
  }
};
