import { create } from "zustand";
import { persist } from "zustand/middleware";


const useClassStore = create(
    persist(
        (set) => ({
            // State

            selectedClass: null,
            selectedContent: null,
            myClass: null,
            classId: null,  // Store classId for back navigation
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

            // Lưu toàn bộ class data (cho CourseSidebar)
            setMyClass: (classData) => set({
                myClass: classData,
                error: null
            }),

            // Lưu classId để quay về MyContent khi back
            setClassId: (id) => set({
                classId: id,
                error: null
            }),

            // Clear store
            clearSelection: () => set({
                selectedClass: null,
                selectedContent: null,
                myClass: null,
                classId: null,
                error: null
            }),
        }),
        {
            name: 'class-store', // localStorage key
            // Chỉ persist các state này
            partialize: (state) => ({
                selectedClass: state.selectedClass,
                selectedContent: state.selectedContent,
                myClass: state.myClass,
                classId: state.classId
            })
        }
    )
);

export default useClassStore;


