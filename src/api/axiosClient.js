
import axios from 'axios';

/**
 * B1. axios instance dùng chung cho toàn bộ ứng dụng.
 * Đổi server chỉ cần sửa file .env (VITE_API_URL).
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 8000,
  headers: { 'Content-Type': 'application/json' },
  // Mảng trong params được gửi dạng `_expand=brand&_expand=category`
  // (mặc định axios gửi `_expand[]=brand...` – json-server 0.17 không hiểu).
  paramsSerializer: { indexes: null },
});

// B2. Request interceptor: gắn token, ghi thời điểm bắt đầu, log
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.metadata = { start: performance.now() };

  if (import.meta.env.DEV) {
    console.log(
      `[API] ${config.method.toUpperCase()} ${config.url}`,
      config.params ?? ''
    );
  }

  return config;
});

const getDuration = (config) =>
  config?.metadata
    ? Math.round(performance.now() - config.metadata.start)
    : 0;

export default axiosClient;
