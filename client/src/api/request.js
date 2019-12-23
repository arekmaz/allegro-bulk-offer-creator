import axios from "axios";

const apiBaseAddress = process.env.REACT_APP_API_ADDR || "";
console.log({ env: process.env, apiBaseAddress });

export const get = relativeUrl =>
  axios.get(`http://${apiBaseAddress}${relativeUrl}`).then(({ data }) => data);

export const post = (relativeUrl, body) =>
  axios.post(`http://${apiBaseAddress}${relativeUrl}`, body);
