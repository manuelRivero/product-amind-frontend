import axios from 'axios'

const client = axios.create({
    // baseURL: `https://product-admin-backend.onrender.com`,
    // baseURL: `https://08e0-2803-9800-98c4-7f3d-8053-24eb-db73-bb88.ngrok-free.app`,
     baseURL: `http://localhost:5000`,
    withCredentials: true,
})
export default client
