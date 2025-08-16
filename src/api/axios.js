import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5050",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Axios sending token:", token); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
