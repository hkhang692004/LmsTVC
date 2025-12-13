import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';

const AddTopicDialog = ({ open, onOpenChange, classId, onSuccess }) => {
    const [tenChuDe, setTenChuDe] = useState('');
    const [moTa, setMoTa] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tenChuDe.trim()) {
            toast.error('Vui lòng nhập tên chủ đề');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axiosClient.post('/api/topics', {
                idLop: classId,
                tenChuDe: tenChuDe.trim(),
                moTa: moTa.trim() || null
            });

            toast.success('Tạo chủ đề thành công');
            
            // Reset form
            setTenChuDe('');
            setMoTa('');
            
            // Close dialog
            onOpenChange(false);
            
            // Callback to refresh data
            if (onSuccess) {
                onSuccess(response.data?.data);
            }
        } catch (error) {
            console.error('Error creating topic:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo chủ đề');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTenChuDe('');
            setMoTa('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Thêm chủ đề mới</DialogTitle>
                    <DialogDescription>
                        Tạo chủ đề mới cho lớp học. Chủ đề sẽ chứa các nội dung học tập.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tenChuDe">
                                Tên chủ đề <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="tenChuDe"
                                value={tenChuDe}
                                onChange={(e) => setTenChuDe(e.target.value)}
                                placeholder="Ví dụ: Chương 1 - Giới thiệu"
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="moTa">Mô tả (tùy chọn)</Label>
                            <Textarea
                                id="moTa"
                                value={moTa}
                                onChange={(e) => setMoTa(e.target.value)}
                                placeholder="Mô tả ngắn gọn về chủ đề này..."
                                rows={4}
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
                            {isSubmitting ? 'Đang tạo...' : 'Tạo chủ đề'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddTopicDialog;
