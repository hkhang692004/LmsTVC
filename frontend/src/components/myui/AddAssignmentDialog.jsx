import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import ReactQuillNew from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { CalendarIcon } from 'lucide-react';

const AddAssignmentDialog = ({ open, onOpenChange, topicId, onSuccess }) => {
    const [tieuDe, setTieuDe] = useState('');
    const [noiDung, setNoiDung] = useState('');
    const [hanNop, setHanNop] = useState('');
    const [minDateTime, setMinDateTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ReactQuill modules configuration
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
        ]
    };

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'link', 'image'
    ];

    // Set minimum datetime to current time when dialog opens
    useEffect(() => {
        if (open) {
            const now = new Date();
            // Format to YYYY-MM-DDTHH:MM for datetime-local input
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setMinDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tieuDe.trim()) {
            toast.error('Vui lòng nhập tiêu đề bài tập');
            return;
        }

        // Check if noiDung has actual content (not just HTML tags)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = noiDung;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        if (!textContent.trim()) {
            toast.error('Vui lòng nhập yêu cầu bài tập');
            return;
        }

        // Validate deadline is in the future
        if (hanNop) {
            const selectedDate = new Date(hanNop);
            const now = new Date();
            if (selectedDate <= now) {
                toast.error('Hạn nộp phải lớn hơn thời gian hiện tại');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('idChuDe', topicId);
            formData.append('tieuDe', tieuDe.trim());
            formData.append('noiDung', noiDung); // Send HTML content from ReactQuill
            formData.append('loaiNoiDung', 'baiTap');
            
            if (hanNop) {
                formData.append('hanNop', new Date(hanNop).toISOString());
            }

            const response = await axiosClient.post('/api/content', formData);

            toast.success('Tạo bài tập thành công');
            
            // Reset form
            setTieuDe('');
            setNoiDung('');
            setHanNop('');
            
            onOpenChange(false);
            
            if (onSuccess) {
                onSuccess(response.data?.data);
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo bài tập');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTieuDe('');
            setNoiDung('');
            setHanNop('');
            onOpenChange(false);
        }
    };

    const handleDateTimeClick = (e) => {
        try {
            e.target.showPicker();
        } catch (error) {
            // showPicker not supported in some browsers
            console.log('showPicker not supported');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                <DialogHeader>
                    <DialogTitle>Tạo bài tập</DialogTitle>
                    <DialogDescription>
                        Giao bài tập cho học viên nộp và chấm điểm
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tieuDe">
                                Tiêu đề bài tập <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="tieuDe"
                                value={tieuDe}
                                onChange={(e) => setTieuDe(e.target.value)}
                                placeholder="Ví dụ: Bài tập thực hành chương 1"
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2 mb-8">
                            <Label htmlFor="hanNop">Hạn nộp (tùy chọn)</Label>
                            <div className="relative">
                                <input
                                    id="hanNop"
                                    type="datetime-local"
                                    value={hanNop}
                                    onChange={(e) => setHanNop(e.target.value)}
                                    onClick={handleDateTimeClick}
                                    min={minDateTime}
                                    disabled={isSubmitting}
                                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:outline-none focus:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                                    style={{ colorScheme: 'light' }}
                                />
                                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                            <p className="text-xs text-gray-500">
                                Click vào ô để chọn ngày giờ
                            </p>
                        </div>
                        <div className="grid gap-2 mb-16">
                            <Label htmlFor="noiDung">
                                Yêu cầu bài tập <span className="text-red-500">*</span>
                            </Label>
                            <ReactQuillNew
                                theme="snow"
                                value={noiDung}
                                onChange={setNoiDung}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Mô tả chi tiết yêu cầu, nội dung bài tập..."
                                style={{ minHeight: '200px' }}
                            />
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
                            {isSubmitting ? 'Đang tạo...' : 'Tạo bài tập'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddAssignmentDialog;
