import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import ReactQuillNew from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AddForumDialog = ({ open, onOpenChange, topicId, onSuccess }) => {
    const [tieuDe, setTieuDe] = useState('');
    const [noiDung, setNoiDung] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tieuDe.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        // Check if noiDung has actual content (not just HTML tags)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = noiDung;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        if (!textContent.trim()) {
            toast.error('Vui lòng nhập nội dung thảo luận');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('idChuDe', topicId);
            formData.append('tieuDe', tieuDe.trim());
            formData.append('noiDung', noiDung); // Send HTML content from ReactQuill
            formData.append('loaiNoiDung', 'phucDap');

            const response = await axiosClient.post('/api/content', formData);

            toast.success('Tạo phúc đáp thành công');
            
            // Reset form
            setTieuDe('');
            setNoiDung('');
            
            onOpenChange(false);
            
            if (onSuccess) {
                onSuccess(response.data?.data);
            }
        } catch (error) {
            console.error('Error creating forum:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo phúc đáp');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTieuDe('');
            setNoiDung('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                <DialogHeader>
                    <DialogTitle>Tạo phúc đáp</DialogTitle>
                    <DialogDescription>
                        Tạo chủ đề thảo luận cho học viên trao đổi, hỏi đáp
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tieuDe">
                                Tiêu đề <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="tieuDe"
                                value={tieuDe}
                                onChange={(e) => setTieuDe(e.target.value)}
                                placeholder="Ví dụ: Thảo luận về bài tập chương 1"
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2 mb-16">
                            <Label htmlFor="noiDung">
                                Nội dung <span className="text-red-500">*</span>
                            </Label>
                            <ReactQuillNew
                                theme="snow"
                                value={noiDung}
                                onChange={setNoiDung}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Nhập nội dung câu hỏi hoặc chủ đề thảo luận..."
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
                            {isSubmitting ? 'Đang tạo...' : 'Tạo phúc đáp'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddForumDialog;
