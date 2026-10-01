import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : 'https://email-marketing-h939.onrender.com'
);
const Instance = axios.create({
    baseURL,
    withCredentials: true,
})

Instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("userToken");
  
      if (token && token !== "undefined" && token !== "null") {
        config.headers["Authorization"] = `Bearer ${token}`;
      } else {
        delete config.headers["Authorization"];
      }
  
      return config;
    },
    (error) => {
      // Handle any request errors
      return Promise.reject(error);
    }
  );
  
  
export default Instance;