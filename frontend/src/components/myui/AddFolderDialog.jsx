import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import { Folder } from 'lucide-react';

const AddFolderDialog = ({ open, onOpenChange, topicId, onSuccess }) => {
    const [tieuDe, setTieuDe] = useState('');
    const [noiDung, setNoiDung] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tieuDe.trim()) {
            toast.error('Vui lòng nhập tên thư mục');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('idChuDe', topicId);
            formData.append('tieuDe', tieuDe.trim());
            formData.append('noiDung', noiDung.trim() || 'Thư mục tài liệu');
            formData.append('loaiNoiDung', 'taiLieu');
            formData.append('fileType', 'folder');

            const response = await axiosClient.post('/api/content', formData);

            toast.success('Tạo thư mục thành công');
            
            // Reset form
            setTieuDe('');
            setNoiDung('');
            
            onOpenChange(false);
            
            if (onSuccess) {
                onSuccess(response.data?.data);
            }
        } catch (error) {
            console.error('Error creating folder:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo thư mục');
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Folder className="w-5 h-5" />
                        Tạo thư mục mới
                    </DialogTitle>
                    <DialogDescription>
                        Tạo thư mục để tổ chức tài liệu học tập
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tieuDe">
                                Tên thư mục <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="tieuDe"
                                value={tieuDe}
                                onChange={(e) => setTieuDe(e.target.value)}
                                placeholder="Ví dụ: Bài giảng, Tài liệu tham khảo, ..."
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="noiDung">Mô tả (tùy chọn)</Label>
                            <Textarea
                                id="noiDung"
                                value={noiDung}
                                onChange={(e) => setNoiDung(e.target.value)}
                                placeholder="Mô tả ngắn gọn về nội dung thư mục..."
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <DialogFooter>
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
                            {isSubmitting ? 'Đang tạo...' : 'Tạo thư mục'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddFolderDialog;
