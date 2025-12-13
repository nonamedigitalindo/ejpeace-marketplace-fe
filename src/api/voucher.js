import { api } from "./apiClient";

// GET ALL AVAILABLE VOUCHERS
export const getAllVouchers = async () => {
  const res = await api.get("/vouchers");
  return res.data;
};

// GET BY ID VOUCHERS
export const getVouchersById = async (id) => {
  const res = await api.get(`/vouchers/${id}`);
  return res.data;
};

// ADD VOUCHER
export const addVoucher = async (vouchersData) => {
  const res = await api.post("/vouchers", vouchersData);
  return res.data;
};


// DELETE VOUCHER
export const deleteVoucher = async (id) => {
  const res = await api.delete(`/vouchers/${id}`);
  return res.data;
};


export const updateVoucher = async (id, vouchersData) => {
  const res = await api.put(`/vouchers/${id}`, vouchersData);
  return res.data;
};

// GET VOUCHERS BY TYPE
export const getVouchersByType = async (type) => {
  const res = await api.get(`/vouchers?type=${type}`);
  return res.data;
};

// GET VOUCHER BY CODE
export const getVoucherByCode = async (code) => {
  const res = await api.get(`/vouchers/code/${code}`);
  return res.data;
};

// CLAIM VOUCHER
export const claimVoucher = async (voucherId) => {
  console.log("Claiming voucher with ID:", voucherId);
  const res = await api.post(`/vouchers/${voucherId}/claim`);
  return res.data;
};

// APPLY VOUCHER TO TICKET
export const applyVoucherToTicket = async (ticketId, voucherCode) => {
  const res = await api.post(`/tickets/${ticketId}/apply-voucher`, {
    voucher_code: voucherCode,
  });
  return res.data;
};

// ============ SCOPED VOUCHER API FUNCTIONS ============

// ADD VOUCHER WITH PRODUCT/EVENT SCOPING
export const addScopedVoucher = async (voucherData) => {
  const res = await api.post("/vouchers/scoped", voucherData);
  return res.data;
};

// GET VOUCHER WITH SCOPING (includes products/events)
export const getScopedVoucherById = async (id) => {
  const res = await api.get(`/vouchers/scoped/${id}`);
  return res.data;
};

// UPDATE VOUCHER WITH SCOPING
export const updateScopedVoucher = async (id, voucherData) => {
  const res = await api.put(`/vouchers/scoped/${id}`, voucherData);
  return res.data;
};

// VALIDATE VOUCHER FOR SPECIFIC ITEMS
export const validateVoucherForItems = async (code, orderAmount, productIds = [], eventIds = []) => {
  const res = await api.post("/vouchers/validate-for-items", {
    code,
    order_amount: orderAmount,
    product_ids: productIds,
    event_ids: eventIds,
  });
  return res.data;
};

