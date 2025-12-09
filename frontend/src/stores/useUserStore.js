import UserService from "@/services/userService";
import { create } from "zustand";


const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (u) => set({ user: u, error: null }),
  clearUser: () => set({ user: null, error: null }),



fetchProfile: async (opts = {}) => {
  set({ loading: true, error: null });
  try {
    const res = await UserService.getProfile(opts);
    const data = res.data?.data || res.data;
    set({ user: data.user || data, loading: false });
    return data;
  } catch (err) {
    set({ user: null, loading: false, error: err });
    throw err;
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
