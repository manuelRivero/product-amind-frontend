import axios from "axios";

const client = axios.create({
     baseURL: `https://product-admin-backend.onrender.com`,
    // baseURL: `http://localhost:5000`,
    withCredentials: true,
})
export default client;