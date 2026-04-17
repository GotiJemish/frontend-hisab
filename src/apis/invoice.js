import apiClient from "@/utilities/apiClients";
import { handleApiError } from "@/utilities/functions";

const extractResponse = (response) => response?.data ?? {};

// -----------------------------------------------------
// GET INVOICE NUMBER
// -----------------------------------------------------
export const getInvoiceNumber = async (payload) => {
  try {
    const res = await apiClient.get(`/invoices/invoice-number/?date=${payload}`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to fetch invoice number");
    throw error;
  }
}
// -----------------------------------------------------
// GET ALL ITEMS
// -----------------------------------------------------
export const getAllInvoices = async () => {
  try {
    const res = await apiClient.get(`/invoices/`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to fetch invoices");
    throw error;
  }
};

// -----------------------------------------------------
// GET ITEMS With Pagination
// -----------------------------------------------------
export const getInvoices = async (page) => {
  try {
    const res = await apiClient.get(`/invoices/?page=${page}`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to fetch invoices");
    throw error;
  }
};




// -----------------------------------------------------
// CREATE ITEM
// -----------------------------------------------------
export const createInvoice = async (payload) => {
  try {
    const res = await apiClient.post(`/invoices/`, payload);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to create item");
    throw error;
  }
};

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------
export const getInvoice = async (id) => {
  try {
    const res = await apiClient.get(`/invoices/${id}/`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to fetch invoice");
    throw error;
  }
};

export const updateInvoice = async (id, payload) => {
  try {
    const res = await apiClient.put(`/invoices/${id}/`, payload);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to update invoice");
    throw error;
  }
};

// -----------------------------------------------------
// DELETE
// -----------------------------------------------------
export const deleteInvoice = async (id,userId) => {
  try {
    const res = await apiClient.delete(`/invoices/${id}/`,userId);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to delete invoice");
    throw error;
  }
};
