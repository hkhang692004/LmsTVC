import axios from "axios";
import { toast } from "sonner";

const axiosClient = axios.create({
  baseURL:
    import.meta.env.MODE === "development" ? "http://localhost:5001/" : "/api",
  withCredentials: true,
});

let isRedirecting = false;

axiosClient.interceptors.response.use(
  res => res,
  err => {
    // Nếu request muốn skip auto-redirect, trả lỗi về cho caller
    if (err.config?.skipAuthRedirect) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      setTimeout(() => { window.location.href = "/signin"; }, 1500);
    }
    return Promise.reject(err);
  }
);



export default axiosClient;
