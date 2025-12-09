import UserService from "@/services/userService";
import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (u) => set({ user: u, error: null }),
  clearUser: () => set({ user: null, error: null }),

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await UserService.getProfile(); // ✅ Bỏ opts
      const userData = res.data?.data;
      set({ user: userData, loading: false });
      return userData;
    } catch (err) {
      set({ user: null, loading: false, error: err });
      throw err; // Interceptor sẽ xử lý redirect
    }
  },

  logout: async () => {
    try {
      await UserService.logout();
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      set({ user: null });
    }
  }
}));

export default useUserStore;