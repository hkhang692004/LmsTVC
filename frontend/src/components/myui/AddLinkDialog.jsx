import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';

const AddLinkDialog = ({ open, onOpenChange, topicId, onSuccess }) => {
    const [tieuDe, setTieuDe] = useState('');
    const [noiDung, setNoiDung] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tieuDe.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        if (!linkUrl.trim()) {
            toast.error('Vui lòng nhập đường dẫn');
            return;
        }

        // Basic URL validation
        try {
            new URL(linkUrl.trim());
        } catch {
            toast.error('Đường dẫn không hợp lệ. Vui lòng nhập URL đầy đủ (http://... hoặc https://...)');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('idChuDe', topicId);
            formData.append('tieuDe', tieuDe.trim());
            formData.append('noiDung', noiDung.trim() || linkUrl.trim());
            formData.append('loaiNoiDung', 'taiLieu');
            formData.append('linkUrl', linkUrl.trim());

            const response = await axiosClient.post('/api/content', formData);

            toast.success('Thêm đường dẫn thành công');
            
            // Reset form
            setTieuDe('');
            setNoiDung('');
            setLinkUrl('');
            
            onOpenChange(false);
            
            if (onSuccess) {
                onSuccess(response.data?.data);
            }
        } catch (error) {
            console.error('Error creating link:', error);
            toast.error(error.response?.data?.message || 'Không thể thêm đường dẫn');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTieuDe('');
            setNoiDung('');
            setLinkUrl('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Thêm đường dẫn</DialogTitle>
                    <DialogDescription>
                        Thêm link đến tài nguyên bên ngoài (trang web, Google Drive, ...)
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
                                placeholder="Ví dụ: Tài liệu tham khảo từ Google Drive"
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="linkUrl">
                                Đường dẫn (URL) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="linkUrl"
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com/tai-lieu"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500">
                                Link đến trang web, Google Drive, Dropbox, OneDrive, v.v.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="noiDung">Mô tả (tùy chọn)</Label>
                            <Textarea
                                id="noiDung"
                                value={noiDung}
                                onChange={(e) => setNoiDung(e.target.value)}
                                placeholder="Mô tả ngắn gọn về tài nguyên này..."
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
                            {isSubmitting ? 'Đang thêm...' : 'Thêm đường dẫn'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddLinkDialog;
