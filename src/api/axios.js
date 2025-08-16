import axios from "axios";

const instance = axios.create({
  baseURL: "https://interviewpal-h2xx.onrender.com",
  withCredentials: true,
});



export default instance;
