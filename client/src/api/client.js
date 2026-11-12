import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "";

// Single axios instance: always sends the auth cookie
const api = axios.create({ baseURL: API_URL, withCredentials: true });

// Normalise errors to { message } so pages can just show err.message
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || (error.response ? `Request failed (${error.response.status})` : "Cannot reach the server. Please check your connection.");
    return Promise.reject(Object.assign(new Error(message), { status: error.response?.status, data: error.response?.data }));
  }
);

export default api;

/** fetch() drop-in: prefixes the API URL and always sends the auth cookie. Returns a normal Response. */
export const apiFetch = (path, options = {}) => {
  const url = /^https?:\/\//.test(path) || (API_URL && path.startsWith(API_URL)) ? path : `${API_URL}${path}`;
  return fetch(url, { credentials: "include", ...options });
};
