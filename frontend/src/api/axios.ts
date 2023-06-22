import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_NODE_RED_URL,
});
export const swrFetcher = (url: string) => axiosInstance.get(url).then(r => r.data);
