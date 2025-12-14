import React, { useState, useEffect } from "react";
import { ChevronDown, FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import useClassStore from "@/stores/useClassStore";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddExamDialog from "./AddExamDialog";

const ExamSection = ({ classId, isTeacher }) => {
    const [exams, setExams] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addExamOpen, setAddExamOpen] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);
    const [newTitle, setNewTitle] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);
    const setSelectedContent = useClassStore(state => state.setSelectedContent);
    const navigate = useNavigate();

    useEffect(() => {
        if (classId) {
            fetchExams();
        }
    }, [classId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchExams = async () => {
        try {
            setLoading(true);
            
            const response = await axiosClient.get(`/api/exams`, {
                params: { lopId: classId }
            });
       
            const examsData = response.data?.data || [];
            
            setExams(examsData);
            setError(null);
        } catch (err) {
            console.error(' [Frontend] Error fetching exams:', err.message);
            console.error(' [Frontend] Full error:', err);
            setError('Không thể tải danh sách bài kiểm tra');
        } finally {
            setLoading(false);
        }
    };

    const handleExamClick = (exam) => {
        setSelectedContent(exam);
        navigate(`/test/${exam.id}`);
    };

    const handleEditClick = (e, exam) => {
        e.stopPropagation();
        setEditingExamId(exam.id);
        setNewTitle(exam.tenBaiKiemTra);
    };

    const handleUpdateTitle = async (examId) => {
        if (!newTitle.trim()) {
            toast.error("Tiêu đề không được để trống");
            return;
        }

        try {
            await axiosClient.put(`/api/exams/${examId}`, {
                tenBaiKiemTra: newTitle.trim()
            });
            toast.success("Cập nhật tiêu đề thành công");
            setEditingExamId(null);
            fetchExams();
        } catch (error) {
            console.error("Error updating exam title:", error);
            toast.error(error.response?.data?.message || "Cập nhật tiêu đề thất bại");
        }
    };

    const handleCancelEdit = () => {
        setEditingExamId(null);
        setNewTitle("");
    };

    const handleDeleteClick = (e, exam) => {
        e.stopPropagation();
        setExamToDelete(exam);
        setDeleteDialogOpen(true);
    };

    const handleDeleteExam = async () => {
        if (!examToDelete) return;

        try {
            await axiosClient.delete(`/api/exams/${examToDelete.id}`);
            toast.success("Xóa bài kiểm tra thành công");
            setDeleteDialogOpen(false);
            setExamToDelete(null);
            fetchExams();
        } catch (error) {
            console.error("Error deleting exam:", error);
            toast.error(error.response?.data?.message || "Xóa bài kiểm tra thất bại");
        }
    };

    return (
        <>
        <div className="border rounded-lg bg-white shadow-sm">
            {/* Header */}
            <div className="w-full flex items-center justify-between px-5 py-5">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 flex-1"
                >
                    {/* Icon xoay mượt */}
                    <Motion.div
                        animate={{ rotate: isOpen ? 0 : -90 }}
                        transition={{ duration: 0.25 }}
                    >
                        <ChevronDown />
                    </Motion.div>

                    <span className="text-2xl text-gray-700 font-bold">
                         Kiểm tra 
                    </span>
                </button>
                
                {/* Nút tạo bài kiểm tra cho giảng viên */}
                {isTeacher && (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-gray-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            setAddExamOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Tạo bài kiểm tra
                    </Button>
                )}
            </div>

            {/* Accordion Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <Motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-2">
                            {loading ? (
                                <p className="px-4 py-2 text-gray-400 text-sm">
                                    Đang tải...
                                </p>
                            ) : error ? (
                                <p className="px-4 py-2 text-red-500 text-sm">
                                    {error}
                                </p>
                            ) : exams.length === 0 ? (
                                <p className="px-4 py-2 text-gray-400 text-sm">
                                    Chưa có bài kiểm tra
                                </p>
                            ) : (
                                exams.map(exam => (
                                    <div
                                        key={exam.id}
                                        onClick={() => handleExamClick(exam)}
                                        className="group flex items-center py-4 px-6 hover:bg-purple-50 cursor-pointer transition border-b last:border-b-0"
                                    >
                                        <FileText className="w-5 h-5 text-purple-600 mr-3" />
                                        <div className="flex-1">
                                            {editingExamId === exam.id ? (
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={newTitle}
                                                        onChange={(e) => setNewTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleUpdateTitle(exam.id);
                                                            if (e.key === "Escape") handleCancelEdit();
                                                        }}
                                                        className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        autoFocus
                                                    />
                                                    <Button size="sm" onClick={() => handleUpdateTitle(exam.id)}>
                                                        Lưu
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                                        Hủy
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-sm font-medium text-blue-600 hover:underline">
                                                        {exam.tenBaiKiemTra}
                                                    </h3>
                                                    {exam.thoiLuong && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Thời lượng: {exam.thoiLuong} phút 
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {isTeacher && editingExamId !== exam.id && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleEditClick(e, exam)}
                                                    className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                                                    title="Chỉnh sửa tiêu đề"
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, exam)}
                                                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                                    title="Xóa bài kiểm tra"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Add Exam Dialog */}
        {isTeacher && (
            <AddExamDialog
                open={addExamOpen}
                onOpenChange={setAddExamOpen}
                classId={classId}
                onSuccess={() => {
                    fetchExams();
                }}
            />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && examToDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Xác nhận xóa bài kiểm tra</h3>
                    <p className="text-gray-600 mb-2">
                        Bạn có chắc chắn muốn xóa bài kiểm tra <strong>{examToDelete.tenBaiKiemTra}</strong>?
                    </p>
                    <p className="text-sm text-amber-600 font-medium mb-2">
                        ⚠️ Chỉ có thể xóa nếu:
                    </p>
                    <ul className="text-sm text-gray-600 mb-4 list-disc list-inside space-y-1">
                        <li>Không có học viên nào đã làm bài kiểm tra này</li>
                    </ul>
                    <p className="text-sm text-red-600 mb-6 font-semibold">
                        Hành động này sẽ xóa tất cả câu hỏi và lựa chọn. Không thể hoàn tác!
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button onClick={() => setDeleteDialogOpen(false)} variant="outline">
                            Hủy
                        </Button>
                        <Button onClick={handleDeleteExam} className="bg-red-600 hover:bg-red-700">
                            Xóa
                        </Button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default ExamSection;
