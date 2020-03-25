import axios from "axios";

const apiBaseAddress = process.env.REACT_APP_API_ADDR || "";

const api = axios.create({
  baseURL: apiBaseAddress
});

export default api;
