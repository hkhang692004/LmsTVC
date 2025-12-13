import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, Clock, Calendar, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import MyHeader from '@/components/myui/MyHeader';
import MyFooter from '@/components/myui/MyFooter';
import AddQuestionDialog from '@/components/myui/AddQuestionDialog';

const ManageExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addQuestionOpen, setAddQuestionOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [collapsedQuestions, setCollapsedQuestions] = useState({});
    const questionsRef = useRef([]);
    const blockNavigationRef = useRef(false);
    const isShowingToastRef = useRef(false);

    // Calculate total score used
    const totalScoreUsed = questions.reduce((sum, q) => sum + (parseFloat(q.diemToiDa) || 0), 0);
    const isScoreComplete = totalScoreUsed >= (exam?.tongDiem || 0);

    // Update ref when questions change
    useEffect(() => {
        questionsRef.current = questions;
        // Update block flag based on questions
        blockNavigationRef.current = questions.length === 0;
    }, [questions]);

    useEffect(() => {
        fetchExamDetails();
    }, [examId]);

    // Prevent browser back when no questions
    useEffect(() => {
        const preventBack = () => {
            if (blockNavigationRef.current) {
                // Go forward to cancel the back navigation
                window.history.go(1);
                
                // Show warning only if not already showing
                if (!isShowingToastRef.current) {
                    isShowingToastRef.current = true;
                    toast.warning(
                        'Vui lòng thêm ít nhất một câu hỏi cho bài kiểm tra trước khi rời đi.',
                        {
                            description: 'Bài kiểm tra chưa có câu hỏi nào sẽ không hợp lệ.',
                            duration: 3000,
                            onDismiss: () => {
                                isShowingToastRef.current = false;
                            },
                            onAutoClose: () => {
                                isShowingToastRef.current = false;
                            }
                        }
                    );
                }
            }
        };

        // Add beforeunload for page refresh/close
        const handleBeforeUnload = (e) => {
            if (blockNavigationRef.current) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        // Push initial state
        window.history.pushState(null, '', window.location.href);
        
        // Add listeners
        window.addEventListener('popstate', preventBack);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('popstate', preventBack);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const fetchExamDetails = async () => {
        try {
            setLoading(true);
            const examResponse = await axiosClient.get(`/api/exams/${examId}`);
            setExam(examResponse.data?.data);

            const questionsResponse = await axiosClient.get(`/api/exams/${examId}/questions`);
            const questionsData = questionsResponse.data?.data || [];
            setQuestions(questionsData);
        } catch (error) {
            console.error('Error fetching exam details:', error);
            toast.error('Không thể tải thông tin bài kiểm tra');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

        try {
            await axiosClient.delete(`/api/exams/questions/${questionId}`);
            toast.success('Đã xóa câu hỏi');
            fetchExamDetails();
        } catch (error) {
            console.error('Error deleting question:', error);
            toast.error('Không thể xóa câu hỏi');
        }
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setAddQuestionOpen(true);
    };

    const toggleCollapse = (questionId) => {
        setCollapsedQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const handleComplete = () => {
        if (!exam?.idLop) {
            toast.error('Không tìm thấy thông tin lớp học');
            return;
        }
        
        toast.success('Bài kiểm tra đã hoàn thành!', {
            description: `Tổng ${questions.length} câu hỏi với ${totalScoreUsed} điểm`
        });
        navigate(`/mycontent/${exam.idLop}`, { replace: true });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <MyHeader />
                <div className="min-h-screen pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                </div>
                <MyFooter />
            </>
        );
    }

    if (!exam) {
        return (
            <>
                <MyHeader />
                <div className="min-h-screen pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500">Không tìm thấy bài kiểm tra</p>
                        <Button onClick={() => navigate(-1)} className="mt-4">
                            Quay lại
                        </Button>
                    </div>
                </div>
                <MyFooter />
            </>
        );
    }

    return (
        <>
            <MyHeader />
            <div className="min-h-screen pt-20 pb-10 px-4 lg:px-10 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h1 className="text-3xl font-bold text-orange-500 mb-4">
                                {exam.tieuDe}
                            </h1>
                            
                            {exam.moTa && (
                                <div 
                                    className="text-gray-600 mb-4 prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: exam.moTa }}
                                />
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Bắt đầu:</span>
                                    <span className="font-medium">{formatDateTime(exam.thoiGianBatDau)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Kết thúc:</span>
                                    <span className="font-medium">{formatDateTime(exam.thoiGianKetThuc)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Thời lượng:</span>
                                    <span className="font-medium">{exam.thoiLuong} phút</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Tổng điểm:</span>
                                    <span className="font-medium">{exam.tongDiem}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Danh sách câu hỏi ({questions.length})
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Điểm đã dùng: <span className={`font-semibold ${isScoreComplete ? 'text-green-600' : 'text-orange-600'}`}>
                                        {totalScoreUsed}/{exam?.tongDiem || 0}
                                    </span>
                                    {isScoreComplete && <span className="text-green-600 ml-2">✓ Đã đủ điểm</span>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {isScoreComplete ? (
                                    <Button
                                        onClick={handleComplete}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Hoàn thành
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            setEditingQuestion(null);
                                            setAddQuestionOpen(true);
                                        }}
                                        className="bg-orange-500 hover:bg-orange-600"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm câu hỏi
                                    </Button>
                                )}
                            </div>
                        </div>

                        {questions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 mb-4">Chưa có câu hỏi nào</p>
                                <Button
                                    onClick={() => setAddQuestionOpen(true)}
                                    variant="outline"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm câu hỏi đầu tiên
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {questions.map((question, index) => {
                                    const isCollapsed = collapsedQuestions[question.id];
                                    return (
                                        <div
                                            key={question.id}
                                            className="border rounded-lg hover:border-orange-300 transition-colors"
                                        >
                                            <div className="flex items-start justify-between p-4">
                                                <button
                                                    onClick={() => toggleCollapse(question.id)}
                                                    className="flex-1 text-left"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm font-medium">
                                                            Câu {index + 1}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {question.diemToiDa} điểm
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            ({question.loaiCauHoi === 'motDapAn' ? 'Một đáp án' : 'Nhiều đáp án'})
                                                        </span>
                                                    </div>
                                                    <div 
                                                        className="text-gray-800 font-medium prose max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: question.noiDung }}
                                                    />
                                                </button>
                                                <div className="flex gap-2 ml-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleCollapse(question.id)}
                                                    >
                                                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditQuestion(question)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteQuestion(question.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Answers */}
                                            {!isCollapsed && question.luaChons && question.luaChons.length > 0 && (
                                                <div className="space-y-2 px-4 pb-4">
                                                    {question.luaChons.map((choice, choiceIndex) => (
                                                        <div
                                                            key={choice.id}
                                                            className={`flex items-start gap-2 p-2 rounded ${
                                                                choice.laDapAnDung
                                                                    ? 'bg-green-50 border border-green-200'
                                                                    : 'bg-gray-50'
                                                            }`}
                                                        >
                                                            <span className="font-medium text-gray-600 min-w-[24px]">
                                                                {String.fromCharCode(65 + choiceIndex)}.
                                                            </span>
                                                            <span className={choice.laDapAnDung ? 'font-medium text-green-700' : 'text-gray-700'}>
                                                                {choice.noiDung}
                                                            </span>
                                                            {choice.laDapAnDung && (
                                                                <span className="ml-auto text-green-600 text-xs">✓ Đáp án đúng</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Question Dialog */}
            <AddQuestionDialog
                open={addQuestionOpen}
                onOpenChange={(open) => {
                    setAddQuestionOpen(open);
                    if (!open) setEditingQuestion(null);
                }}
                examId={examId}
                question={editingQuestion}
                onSuccess={() => {
                    fetchExamDetails();
                    setEditingQuestion(null);
                }}
            />

            <MyFooter />
        </>
    );
};

export default ManageExam;