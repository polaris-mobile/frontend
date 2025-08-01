import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Vite proxy forwards to http://localhost:5000/api
});

export default api;
