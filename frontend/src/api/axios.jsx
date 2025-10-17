// src/api/axios.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,  // important for cookie-based JWT auth
});

export default api;
