import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactQuillNew from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import { CalendarIcon, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddExamDialog = ({ open, onOpenChange, classId, onSuccess }) => {
    const navigate = useNavigate();
    const [tieuDe, setTieuDe] = useState('');
    const [moTa, setMoTa] = useState('');
    const [thoiGianBatDau, setThoiGianBatDau] = useState('');
    const [thoiGianKetThuc, setThoiGianKetThuc] = useState('');
    const [thoiLuong, setThoiLuong] = useState('');
    const [tongDiem, setTongDiem] = useState('10');
    const [choPhepXemDiem, setChoPhepXemDiem] = useState(false);
    const [minDateTime, setMinDateTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set minimum datetime when dialog opens
    useEffect(() => {
        if (open) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setMinDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        }
    }, [open]);

    const handleDateTimeClick = (e) => {
        try {
            e.target.showPicker();
        } catch (error) {
            console.log('showPicker not supported');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tieuDe.trim()) {
            toast.error('Vui lòng nhập tiêu đề bài kiểm tra');
            return;
        }

        if (!thoiGianBatDau) {
            toast.error('Vui lòng chọn thời gian bắt đầu');
            return;
        }

        if (!thoiGianKetThuc) {
            toast.error('Vui lòng chọn thời gian kết thúc');
            return;
        }

        // Validate times
        const startDate = new Date(thoiGianBatDau);
        const endDate = new Date(thoiGianKetThuc);
        const now = new Date();

        if (startDate <= now) {
            toast.error('Thời gian bắt đầu phải lớn hơn thời gian hiện tại');
            return;
        }

        if (startDate >= endDate) {
            toast.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
            return;
        }

        if (!thoiLuong || thoiLuong <= 0) {
            toast.error('Vui lòng nhập thời lượng làm bài (phút)');
            return;
        }

        if (!tongDiem || tongDiem <= 0) {
            toast.error('Vui lòng nhập tổng điểm');
            return;
        }

        setIsSubmitting(true);
        try {
            const examData = {
                tieuDe: tieuDe.trim(),
                moTa: moTa.trim() || null,
                thoiGianBatDau: new Date(thoiGianBatDau).toISOString(),
                thoiGianKetThuc: new Date(thoiGianKetThuc).toISOString(),
                thoiLuong: parseInt(thoiLuong),
                tongDiem: parseFloat(tongDiem),
                idLop: classId,
                choPhepXemDiem: choPhepXemDiem,
                status: 'dangMo'
            };

            const response = await axiosClient.post('/api/exams', examData);

            toast.success('Tạo bài kiểm tra thành công');
            
            const createdExam = response.data?.data;
            
            // Reset form
            setTieuDe('');
            setMoTa('');
            setThoiGianBatDau('');
            setThoiGianKetThuc('');
            setThoiLuong('');
            setTongDiem('10');
            setChoPhepXemDiem(false);
            
            onOpenChange(false);
            
            if (onSuccess) {
                onSuccess(createdExam);
            }

            // Redirect to question management page with replace to avoid history buildup
            if (createdExam?.id) {
                navigate(`/manage-exam/${createdExam.id}`, { replace: true });
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo bài kiểm tra');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTieuDe('');
            setMoTa('');
            setThoiGianBatDau('');
            setThoiGianKetThuc('');
            setThoiLuong('');
            setTongDiem('10');
            setChoPhepXemDiem(false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                <DialogHeader>
                    <DialogTitle>Tạo bài kiểm tra</DialogTitle>
                    <DialogDescription>
                        Tạo bài kiểm tra trắc nghiệm cho lớp học
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tieuDe">
                                Tiêu đề bài kiểm tra <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="tieuDe"
                                value={tieuDe}
                                onChange={(e) => setTieuDe(e.target.value)}
                                placeholder="Ví dụ: Kiểm tra giữa kỳ môn Lập trình Web"
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="thoiGianBatDau">
                                    Thời gian bắt đầu <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <input
                                        id="thoiGianBatDau"
                                        type="datetime-local"
                                        value={thoiGianBatDau}
                                        onChange={(e) => setThoiGianBatDau(e.target.value)}
                                        onClick={handleDateTimeClick}
                                        min={minDateTime}
                                        disabled={isSubmitting}
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                                        style={{ colorScheme: 'light' }}
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="thoiGianKetThuc">
                                    Thời gian kết thúc <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <input
                                        id="thoiGianKetThuc"
                                        type="datetime-local"
                                        value={thoiGianKetThuc}
                                        onChange={(e) => setThoiGianKetThuc(e.target.value)}
                                        onClick={handleDateTimeClick}
                                        min={thoiGianBatDau || minDateTime}
                                        disabled={isSubmitting}
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                                        style={{ colorScheme: 'light' }}
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="thoiLuong">
                                    Thời lượng làm bài (phút) <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="thoiLuong"
                                        type="number"
                                        value={thoiLuong}
                                        onChange={(e) => setThoiLuong(e.target.value)}
                                        placeholder="60"
                                        min="1"
                                        disabled={isSubmitting}
                                        className="pr-10"
                                    />
                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tongDiem">
                                    Tổng điểm <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tongDiem"
                                    type="number"
                                    value={tongDiem}
                                    onChange={(e) => setTongDiem(e.target.value)}
                                    placeholder="10"
                                    min="0"
                                    step="any"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="choPhepXemDiem"
                                type="checkbox"
                                checked={choPhepXemDiem}
                                onChange={(e) => setChoPhepXemDiem(e.target.checked)}
                                disabled={isSubmitting}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="choPhepXemDiem" className="cursor-pointer">
                                Cho phép sinh viên xem điểm sau khi nộp bài
                            </Label>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="moTa">Mô tả (tùy chọn)</Label>
                            <ReactQuillNew
                                value={moTa}
                                onChange={setMoTa}
                                placeholder="Mô tả chi tiết về bài kiểm tra..."
                                disabled={isSubmitting}
                                minHeight="120px"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-15">
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
                            {isSubmitting ? 'Đang tạo...' : 'Tạo & Thêm câu hỏi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddExamDialog;
