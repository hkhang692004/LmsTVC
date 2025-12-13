import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import { Upload, FileText, X } from 'lucide-react';

const AddDocumentDialog = ({ open, onOpenChange, topicId, parentId, onSuccess }) => {
    const [tieuDe, setTieuDe] = useState('');
    const [noiDung, setNoiDung] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        // Validate each file
        const invalidFiles = selectedFiles.filter(file => {
            const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain'
            ];
            return !validTypes.includes(file.type);
        });

        if (invalidFiles.length > 0) {
            toast.error('Một số file không hợp lệ. Chỉ chấp nhận: PDF, DOCX, PPT, Excel, TXT');
            // Only add valid files
            const validFiles = selectedFiles.filter(file => !invalidFiles.includes(file));
            if (validFiles.length > 0) {
                setFiles(prev => [...prev, ...validFiles]);
            }
            return;
        }
        
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tieuDe.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        if (files.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 file');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('idChuDe', topicId);
            if (parentId) {
                formData.append('idNoiDungCha', parentId);
            }
            formData.append('tieuDe', tieuDe.trim());
            formData.append('noiDung', noiDung.trim() || 'Tài liệu học tập');
            formData.append('loaiNoiDung', 'taiLieu');
            
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await axiosClient.post('/api/content', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Thêm tài liệu thành công');
            
            // Reset form
            setTieuDe('');
            setNoiDung('');
            setFiles([]);
            
            onOpenChange(false);
            
            if (onSuccess) {
                onSuccess(response.data?.data);
            }
        } catch (error) {
            console.error('Error creating document:', error);
            toast.error(error.response?.data?.message || 'Không thể thêm tài liệu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTieuDe('');
            setNoiDung('');
            setFiles([]);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Thêm tài liệu</DialogTitle>
                    <DialogDescription>
                        Tải lên tài liệu PDF, DOCX, PPT, Excel, ... cho học viên
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
                                placeholder="Ví dụ: Slide bài giảng chương 1"
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
                                placeholder="Mô tả ngắn gọn về tài liệu..."
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>
                                File tài liệu <span className="text-red-500">*</span>
                            </Label>
                            <div className="border-2 border-dashed rounded-lg p-4">
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    onChange={handleFileChange}
                                    disabled={isSubmitting}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center gap-2 cursor-pointer"
                                >
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        Click để chọn file hoặc kéo thả vào đây
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        PDF, DOCX, PPT, Excel, TXT
                                    </span>
                                </label>
                            </div>
                            {files.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">{file.name}</span>
                                                <span className="text-xs text-gray-400">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                disabled={isSubmitting}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                            {isSubmitting ? 'Đang tải lên...' : 'Thêm tài liệu'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddDocumentDialog;
