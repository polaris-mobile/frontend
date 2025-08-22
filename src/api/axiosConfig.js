import axios from "axios";

const api = axios.create({
  baseURL: "https://polariss.liara.run/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
//baseURL: "http://127.0.0.1:5000/api"
export default api;
