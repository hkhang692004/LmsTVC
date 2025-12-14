import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactQuillNew from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import { Plus, Trash2, Check } from 'lucide-react';

const AddQuestionDialog = ({ open, onOpenChange, examId, question, onSuccess }) => {
    const [noiDung, setNoiDung] = useState('');
    const [diemToiDa, setDiemToiDa] = useState('1');
    const [loaiCauHoi, setLoaiCauHoi] = useState('motDapAn');
    const [luaChons, setLuaChons] = useState([
        { noiDung: '', laDapAnDung: false },
        { noiDung: '', laDapAnDung: false },
        { noiDung: '', laDapAnDung: false },
        { noiDung: '', laDapAnDung: false }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [exam, setExam] = useState(null);
    const [existingQuestions, setExistingQuestions] = useState([]);

    // Fetch exam and questions data when dialog opens
    useEffect(() => {
        if (open && examId) {
            fetchExamData();
        }
    }, [open, examId]);

    const fetchExamData = async () => {
        try {
            const examResponse = await axiosClient.get(`/api/exams/${examId}`);
            setExam(examResponse.data?.data);

            const questionsResponse = await axiosClient.get(`/api/exams/${examId}/questions`);
            setExistingQuestions(questionsResponse.data?.data || []);
        } catch (error) {
            console.error('Error fetching exam data:', error);
        }
    };

    // Load question data when editing
    useEffect(() => {
        if (open && question) {
            setNoiDung(question.noiDung || '');
            setDiemToiDa(question.diemToiDa?.toString() || '1');
            setLoaiCauHoi(question.loaiCauHoi || 'motDapAn');
            if (question.luaChons && question.luaChons.length > 0) {
                setLuaChons(question.luaChons.map(lc => ({
                    id: lc.id,
                    noiDung: lc.noiDung,
                    laDapAnDung: lc.laDapAnDung
                })));
            }
        } else if (open && !question) {
            // Reset for new question
            setNoiDung('');
            setDiemToiDa('1');
            setLoaiCauHoi('motDapAn');
            setLuaChons([
                { noiDung: '', laDapAnDung: false },
                { noiDung: '', laDapAnDung: false },
                { noiDung: '', laDapAnDung: false },
                { noiDung: '', laDapAnDung: false }
            ]);
        }
    }, [open, question]);

    const handleChoiceChange = (index, value) => {
        const newChoices = [...luaChons];
        newChoices[index].noiDung = value;
        setLuaChons(newChoices);
    };

    const handleCorrectAnswerToggle = (index) => {
        const newChoices = [...luaChons];
        
        if (loaiCauHoi === 'motDapAn') {
            // Single answer: uncheck all others
            newChoices.forEach((choice, i) => {
                choice.laDapAnDung = i === index;
            });
        } else {
            // Multiple answers: toggle this one
            newChoices[index].laDapAnDung = !newChoices[index].laDapAnDung;
        }
        
        setLuaChons(newChoices);
    };

    const handleAddChoice = () => {
        setLuaChons([...luaChons, { noiDung: '', laDapAnDung: false }]);
    };

    const handleRemoveChoice = (index) => {
        if (luaChons.length <= 2) {
            toast.error('Phải có ít nhất 2 lựa chọn');
            return;
        }
        const newChoices = luaChons.filter((_, i) => i !== index);
        setLuaChons(newChoices);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Strip HTML tags to check actual text content
        const textContent = noiDung.replace(/<[^>]*>/g, '').trim();
        if (!textContent) {
            toast.error('Vui lòng nhập nội dung câu hỏi');
            return;
        }

        if (!diemToiDa || parseFloat(diemToiDa) <= 0) {
            toast.error('Vui lòng nhập điểm hợp lệ');
            return;
        }

        // Validate score against exam total
        const questionScore = parseFloat(diemToiDa);
        const examTotalScore = exam?.tongDiem || 10;
        
        // Calculate used score (excluding current question if editing)
        const usedScore = existingQuestions
            .filter(q => question ? q.id !== question.id : true)
            .reduce((sum, q) => sum + (parseFloat(q.diemToiDa) || 0), 0);
        
        const availableScore = examTotalScore - usedScore;
        
        if (questionScore > availableScore) {
            toast.error(
                `Điểm câu hỏi vượt quá điểm khả dụng!`,
                {
                    description: `Tổng điểm bài kiểm tra: ${examTotalScore}. Đã dùng: ${usedScore.toFixed(1)}. Còn lại: ${availableScore.toFixed(1)} điểm.`,
                    duration: 5000
                }
            );
            return;
        }

        // Validate choices
        const filledChoices = luaChons.filter(c => c.noiDung.trim());
        if (filledChoices.length < 2) {
            toast.error('Phải có ít nhất 2 lựa chọn');
            return;
        }

        const correctAnswers = filledChoices.filter(c => c.laDapAnDung);
        if (correctAnswers.length === 0) {
            toast.error('Phải có ít nhất 1 đáp án đúng');
            return;
        }

        setIsSubmitting(true);
        try {
            
            
            const questionData = {
                noiDung: noiDung.trim(),
                diemToiDa: parseFloat(diemToiDa),
                loaiCauHoi,
                luaChons: filledChoices.map((choice, index) => ({
                    ...(choice.id && { id: choice.id }),
                    noiDung: choice.noiDung.trim(),
                    laDapAnDung: choice.laDapAnDung,
                    thuTu: index + 1
                }))
            };

            // Only add idBaiKiemTra when creating new question
            if (!question?.id) {
                questionData.idBaiKiemTra = examId;
                console.log('✅ [DEBUG] Adding idBaiKiemTra for new question');
            } else {
                console.log('ℹ️ [DEBUG] Editing existing question, not adding idBaiKiemTra');
            }

            

            if (question?.id) {
                // Update existing question
               
                await axiosClient.put(`/api/exams/questions/${question.id}`, questionData);
                toast.success('Đã cập nhật câu hỏi');
            } else {
                // Create new question
              
                const response = await axiosClient.post(`/api/exams/${examId}/questions`, questionData);
               
                toast.success('Đã thêm câu hỏi');
            }

            onOpenChange(false);
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving question:', error);
            toast.error(error.response?.data?.message || 'Không thể lưu câu hỏi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onOpenChange(false);
        }
    };

    // Calculate available score
    const examTotalScore = exam?.tongDiem || 10;
    const usedScore = existingQuestions
        .filter(q => question ? q.id !== question.id : true)
        .reduce((sum, q) => sum + (parseFloat(q.diemToiDa) || 0), 0);
    const availableScore = examTotalScore - usedScore;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                <DialogHeader>
                    <DialogTitle>
                        {question ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                    </DialogTitle>
                    <DialogDescription>
                        Nhập nội dung câu hỏi và các lựa chọn đáp án
                    </DialogDescription>
                </DialogHeader>

                {/* Score Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">
                            <strong>Tổng điểm bài kiểm tra:</strong> {examTotalScore}
                        </span>
                        <span className="text-gray-700">
                            <strong>Đã dùng:</strong> {usedScore.toFixed(1)}
                        </span>
                        <span className="text-blue-600 font-semibold">
                            <strong>Còn lại:</strong> {availableScore.toFixed(1)} điểm
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="noiDung">
                                Nội dung câu hỏi <span className="text-red-500">*</span>
                            </Label>
                            <ReactQuillNew
                                value={noiDung}
                                onChange={setNoiDung}
                                placeholder="Nhập nội dung câu hỏi..."
                                disabled={isSubmitting}
                                minHeight="150px"
                                theme="snow"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                        [{ 'color': [] }, { 'background': [] }],
                                        ['link', 'image'],
                                        ['clean']
                                    ]
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <div className="grid gap-2 mt-6 ">
                                <Label htmlFor="diemToiDa" >
                                    Điểm <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="diemToiDa"
                                    type="number"
                                    value={diemToiDa}
                                    onChange={(e) => setDiemToiDa(e.target.value)}
                                    placeholder="1"
                                    min="0"
                                    max={availableScore}
                                    step="any"
                                    disabled={isSubmitting}
                                    
                                />
                          
                            </div>

                            <div className="grid gap-2 mt-6">
                                <Label htmlFor="loaiCauHoi">
                                    Loại câu hỏi <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="loaiCauHoi"
                                    value={loaiCauHoi}
                                    onChange={(e) => {
                                        setLoaiCauHoi(e.target.value);
                                        // Reset correct answers when switching type
                                        if (e.target.value === 'motDapAn') {
                                            const newChoices = luaChons.map(c => ({ ...c, laDapAnDung: false }));
                                            setLuaChons(newChoices);
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                >
                                    <option value="motDapAn">Một đáp án đúng</option>
                                    <option value="nhieuDapAn">Nhiều đáp án đúng</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>
                                    Lựa chọn <span className="text-red-500">*</span>
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddChoice}
                                    disabled={isSubmitting}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Thêm lựa chọn
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Click vào checkbox để đánh dấu đáp án đúng
                            </p>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {luaChons.map((choice, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleCorrectAnswerToggle(index)}
                                            disabled={isSubmitting}
                                            className={`mt-2 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                choice.laDapAnDung
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            {choice.laDapAnDung && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </button>
                                        <span className="mt-2 font-medium text-gray-600 min-w-[24px]">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        <Input
                                            value={choice.noiDung}
                                            onChange={(e) => handleChoiceChange(index, e.target.value)}
                                            placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                                            disabled={isSubmitting}
                                            className="flex-1"
                                        />
                                        {luaChons.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveChoice(index)}
                                                disabled={isSubmitting}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            {isSubmitting ? 'Đang lưu...' : (question ? 'Cập nhật' : 'Thêm câu hỏi')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddQuestionDialog;
