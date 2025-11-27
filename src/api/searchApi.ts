import axios from "axios";

const BASE_URL = "/api/v1/search"; // Adjust if backend URL differs

export const searchApi = {
  // General search across all categories
  general: async (query: string, type: string = "all") => {
    const response = await axios.get(`${BASE_URL}`, {
      params: { q: query, type },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },

  // Search suggestions for autocomplete
  suggestions: async (query: string) => {
    const response = await axios.get(`${BASE_URL}/suggestions`, {
      params: { q: query },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },
};
