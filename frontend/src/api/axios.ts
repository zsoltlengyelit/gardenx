import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { axiosInstance } from './axiosInstance';

export function useAxiosFetcher() {

  const navigate = useNavigate();
  const { accessToken } = useAuth();

  useEffect(() => {
    axiosInstance.interceptors.request.clear();
    axiosInstance.interceptors.request.use(config => {
      (config.headers as any).Authorization = `Bearer ${accessToken}`;
      return config;
    });
  }, [accessToken]);

  useEffect(() => {
    axiosInstance.interceptors.response.clear();
    axiosInstance.interceptors.response.use(response => {
      return response;
    }, error => {
      navigate('/signin');
      return error;
    });
  }, []);

  const fetcher = async (url: string) => {
    const resp = await axiosInstance.get(url);
    return await resp.data;
  };

  const poster = async (url: string, data: any) => {
    const resp = await axiosInstance.post(url, data);
    return await resp.data;
  };

  return {
    fetch: fetcher,
    post: poster,
  };
}
