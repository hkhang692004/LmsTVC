import axios from "axios";
import { toast } from "sonner";

const axiosClient = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:5001" 
    : "/api",
  withCredentials: true,
});

let isRedirecting = false;

axiosClient.interceptors.response.use(
  res => res,
  err => {
    // ✅ Chỉ xử lý 401 cho các request KHÔNG PHẢI login
    // Nếu là login request thì để component tự xử lý
    const isLoginRequest = err.config?.url?.includes('/login');
    
    if (err.response?.status === 401 && !isRedirecting && !isLoginRequest) {
      isRedirecting = true;
      toast.error("Phiên đăng nhập đã hết hạn");
      setTimeout(() => { 
        window.location.href = "/signin";
        isRedirecting = false; // Reset sau khi redirect
      }, 1500);
    }
    return Promise.reject(err);
  }
);

export default axiosClient;