import axios from "axios";

const client = axios.create({
    baseURL: `https://product-admin-backend.onrender.com`,
})
export default client;