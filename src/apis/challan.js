import apiClient from "@/utilities/apiClients";
import { handleApiError } from "@/utilities/functions";

const extractResponse = (response) => response?.data ?? {};

// -----------------------------------------------------
// GET CHALLAN NUMBER
// -----------------------------------------------------
export const getChallanNumber = async (payload) => {
  try {
    const res = await apiClient.get(`/challans/invoice-number/?date=${payload}`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to fetch challan number");
    throw error;
  }
};

// -----------------------------------------------------
// GET ALL CHALLANS
// -----------------------------------------------------
export const getAllChallans = async () => {
  try {
    const res = await apiClient.get(`/challans/`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to fetch challans");
    throw error;
  }
};

// -----------------------------------------------------
// GET CHALLANS With Pagination
// -----------------------------------------------------
export const getChallans = async (page) => {
  try {
    const res = await apiClient.get(`/challans/?page=${page}`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to fetch challans");
    throw error;
  }
};

// -----------------------------------------------------
// CREATE CHALLAN
// -----------------------------------------------------
export const createChallan = async (payload) => {
  try {
    const res = await apiClient.post(`/challans/`, payload);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to create challan");
    throw error;
  }
};

// -----------------------------------------------------
// RETRIEVE CHALLAN DETAILS
// -----------------------------------------------------
export const getChallan = async (id) => {
  try {
    const res = await apiClient.get(`/challans/${id}/`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to fetch challan details");
    throw error;
  }
};

// -----------------------------------------------------
// UPDATE CHALLAN
// -----------------------------------------------------
export const updateChallan = async (id, payload) => {
  try {
    const res = await apiClient.put(`/challans/${id}/`, payload);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to update challan");
    throw error;
  }
};

// -----------------------------------------------------
// DELETE CHALLAN
// -----------------------------------------------------
export const deleteChallan = async (id, userId) => {
  try {
    const res = await apiClient.delete(`/challans/${id}/`, userId);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to delete challan");
    throw error;
  }
};
