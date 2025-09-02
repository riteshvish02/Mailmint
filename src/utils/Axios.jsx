import axios from 'axios';

const baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'http://91.108.110.205';
const Instance = axios.create({
    baseURL,
    withCredentials: true,
})

Instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("userToken");
  
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
  
      return config;
    },
    (error) => {
      // Handle any request errors
      return Promise.reject(error);
    }
  );
  
  
export default Instance;