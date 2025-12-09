import { create } from "zustand";
import classService from "../services/classService";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const useClassStore = create((set, get) => ({
    // State
    classes: [],
    selectedClass: null,
    selectedContent: null,
    loading: false,
    error: null,
    lastFetch: null,

    // Fetch danh sách lớp với cache TTL
    fetchClasses: async (forceRefresh = false) => {
        const { classes, lastFetch } = get();
        const now = Date.now();

        // Kiểm tra cache - nếu còn hạn và không force refresh thì dùng cache
        if (!forceRefresh && classes.length > 0 && lastFetch && now - lastFetch < CACHE_TTL) {
            return classes; // 💾 Dùng CACHE
        }

        // Nếu cache hết hạn hoặc force refresh thì fetch API
        set({ loading: true, error: null });
        try {
            const response = await classService.getClasses();
            const classesData = response.data?.data || response.data || [];
            set({ 
                classes: classesData, 
                lastFetch: now,
                loading: false 
            });
            return classesData; // 🔄 Fetch API
        } catch (err) {
            set({ 
                error: err.message || "Failed to fetch classes",
                loading: false 
            });
            throw err;
        }
    },

    // Lưu lớp được chọn (courseName trong breadcrumb)
    setSelectedClass: (classData) => set({ 
        selectedClass: classData, 
        error: null 
    }),

    // Lưu nội dung được chọn (itemName trong breadcrumb)
    setSelectedContent: (contentData) => set({ 
        selectedContent: contentData, 
        error: null 
    }),

    // Clear store
    clearClasses: () => set({
        classes: [],
        selectedClass: null,
        selectedContent: null,
        lastFetch: null,
        error: null
    }),

    // Force refresh (wrapper)
    refetchClasses: async () => {
        return get().fetchClasses(true);
    },








}));

export default useClassStore;


