// 📁 /apis/contacts.js
import apiClient from "@/utilities/apiClients";
import { handleApiError } from "@/utilities/functions";
// contacts
export const getAllContacts = async () => {
  try {
    // ✅ Pass user as query param
    const response = await apiClient.get(`/contacts/`);
    return response.data; // or response.data.data based on your backend response
  } catch (error) {
    console.error("Error fetching contacts:", error);
    handleApiError(error, "error");
    throw error;
  }
};

export const createContact = async (payload) => {
  try {
    // ✅ Pass user as query param
    console.log(payload);

    const response = await apiClient.post(`/contacts/`, { ...payload });
    return response.data; // or response.data.data based on your backend response
  } catch (error) {
    console.error("Error fetching contacts:", error);
    handleApiError(error, "error");
    throw error;
  }
}

export const updateContact= async (id,payload) => {
  try {
    // ✅ Pass user as query param
    console.log(payload);

    const response = await apiClient.put(`/contacts/${id}/`, { ...payload });
    return response.data; // or response.data.data based on your backend response
  } catch (error) {
    console.error("Error fetching contacts:", error);
    handleApiError(error, "error");
    throw error;
  }
}

export const deleteContactApi= async (id) => {
  try {
    const response = await apiClient.delete(`/contacts/${id}/`);
    return response.data; // or response.data.data based on your backend response
  } catch (error) {
    console.error("Error fetching contacts:", error);
    handleApiError(error, "error");
    throw error;
  }
}
