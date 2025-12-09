import { create } from "zustand";


const useClassStore = create((set, get) => ({
    // State

    selectedClass: null,
    selectedContent: null,
    error: null,
    



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
    clearSelection: () => set({
        selectedClass: null,
        selectedContent: null,
        error: null
    }),




}));

export default useClassStore;


