import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:1880',
});
export const swrFetcher = (url: string) => axiosInstance.get(url).then(r => r.data);
