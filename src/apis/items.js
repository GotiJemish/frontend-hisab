import apiClient from "@/utilities/apiClients";
import { handleApiError } from "@/utilities/functions";

const extractResponse = (response) => response?.data ?? {};

// -----------------------------------------------------
// GET ALL ITEMS
// -----------------------------------------------------
export const getAllItems = async () => {
  try {
    const res = await apiClient.get(`/items/`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to fetch items");
    throw error;
  }
};

// -----------------------------------------------------
// CREATE ITEM
// -----------------------------------------------------
export const createItem = async (payload) => {
  try {
    const res = await apiClient.post(`/items/`, payload);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to create item");
    throw error;
  }
};

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------
export const updateItem = async (id, payload) => {
  try {
    const res = await apiClient.put(`/items/${id}/`, payload);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to update item");
    throw error;
  }
};

// -----------------------------------------------------
// DELETE
// -----------------------------------------------------
export const deleteItemApi = async (id) => {
  try {
    const res = await apiClient.delete(`/items/${id}/`);
    return extractResponse(res);
  } catch (error) {
    handleApiError(error, "Failed to delete item");
    throw error;
  }
};
