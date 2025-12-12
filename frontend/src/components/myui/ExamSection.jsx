import React, { useState, useEffect } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import useClassStore from "@/stores/useClassStore";
import axiosClient from "@/lib/axios";

const ExamSection = ({ classId }) => {
    const [exams, setExams] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
            console.log('📚 [Frontend] Fetching exams for classId:', classId);
            const response = await axiosClient.get(`/api/exams`, {
                params: { lopId: classId }
            });
            console.log(' [Frontend] API response status:', response.status);
            console.log(' [Frontend] response.data:', response.data);
            const examsData = response.data?.data || [];
            console.log(' [Frontend] Setting exams with count:', examsData.length);
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

    return (
        <div className="border rounded-lg bg-white shadow-sm">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-5"
            >
                <div className="flex items-center gap-3">
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
                </div>
            </button>

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
                                        className="flex items-center py-4 px-6 hover:bg-purple-50 cursor-pointer transition border-b last:border-b-0"
                                    >
                                        <FileText className="w-5 h-5 text-purple-600 mr-3" />
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-blue-600 hover:underline">
                                                {exam.tenBaiKiemTra}
                                            </h3>
                                            {exam.hanNop && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Thời lượng: {exam.thoiLuong} phút 
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExamSection;
