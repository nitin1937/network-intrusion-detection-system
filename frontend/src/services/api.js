import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
});

export default API;