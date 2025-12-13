import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import { Upload, Video, X } from 'lucide-react';

const AddVideoDialog = ({ open, onOpenChange, topicId, onSuccess }) => {
    const [tieuDe, setTieuDe] = useState('');
    const [noiDung, setNoiDung] = useState('');
    const [videoType, setVideoType] = useState('youtube'); // 'youtube' or 'upload'
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validate Youtube URL
    const isValidYoutubeUrl = (url) => {
        if (!url) return false;
        const youtubeRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}(\S*)?$/;
        return youtubeRegex.test(url);
    };

    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is video
            if (!file.type.startsWith('video/')) {
                toast.error('Vui lòng chọn file video hợp lệ (MP4, AVI, MOV, ...)');
                e.target.value = ''; // Reset input
                return;
            }
            
            // Check file size (limit 100MB for example)
            if (file.size > 100 * 1024 * 1024) {
                toast.error('File video quá lớn. Vui lòng chọn file nhỏ hơn 100MB');
                e.target.value = ''; // Reset input
                return;
            }
            setVideoFile(file);
        }
    };

    const removeVideoFile = () => {
        setVideoFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tieuDe.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }

        if (videoType === 'youtube' && !videoUrl.trim()) {
            toast.error('Vui lòng nhập link Youtube');
            return;
        }

        if (videoType === 'youtube' && !isValidYoutubeUrl(videoUrl.trim())) {
            toast.error('Link Youtube không hợp lệ. Vui lòng nhập link đúng định dạng');
            return;
        }

        if (videoType === 'upload' && !videoFile) {
            toast.error('Vui lòng chọn file video');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('idChuDe', topicId);
            formData.append('tieuDe', tieuDe.trim());
            formData.append('noiDung', noiDung.trim() || (videoType === 'youtube' ? videoUrl : 'Video bài giảng'));
            formData.append('loaiNoiDung', 'taiLieu');
            
            if (videoType === 'youtube') {
                formData.append('videoUrl', videoUrl.trim());
            } else {
                formData.append('files', videoFile);
            }

            const response = await axiosClient.post('/api/content', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Thêm video thành công');
            
            // Reset form
            setTieuDe('');
            setNoiDung('');
            setVideoUrl('');
            setVideoFile(null);
            setVideoType('youtube');
            
            onOpenChange(false);
            
            if (onSuccess) {
                onSuccess(response.data?.data);
            }
        } catch (error) {
            console.error('Error creating video:', error);
            toast.error(error.response?.data?.message || 'Không thể thêm video');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTieuDe('');
            setNoiDung('');
            setVideoUrl('');
            setVideoFile(null);
            setVideoType('youtube');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Thêm Video</DialogTitle>
                    <DialogDescription>
                        Thêm link Youtube hoặc upload video từ máy tính
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
                                placeholder="Ví dụ: Video bài giảng chương 1"
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>

                        {/* Video Type Selection */}
                        <div className="grid gap-2">
                            <Label>Loại video <span className="text-red-500">*</span></Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="videoType"
                                        value="youtube"
                                        checked={videoType === 'youtube'}
                                        onChange={(e) => setVideoType(e.target.value)}
                                        disabled={isSubmitting}
                                        className="w-4 h-4"
                                    />
                                    <span>Link Youtube</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="videoType"
                                        value="upload"
                                        checked={videoType === 'upload'}
                                        onChange={(e) => setVideoType(e.target.value)}
                                        disabled={isSubmitting}
                                        className="w-4 h-4"
                                    />
                                    <span>Upload video</span>
                                </label>
                            </div>
                        </div>

                        {/* Youtube URL Input */}
                        {videoType === 'youtube' && (
                            <div className="grid gap-2">
                                <Label htmlFor="videoUrl">
                                    Link Youtube <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="videoUrl"
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-gray-500">
                                    Hỗ trợ: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                                </p>
                            </div>
                        )}

                        {/* Video Upload */}
                        {videoType === 'upload' && (
                            <div className="grid gap-2">
                                <Label>
                                    File video <span className="text-red-500">*</span>
                                </Label>
                                {!videoFile ? (
                                    <div className="border-2 border-dashed rounded-lg p-4">
                                        <input
                                            type="file"
                                            id="video-upload"
                                            onChange={handleVideoFileChange}
                                            disabled={isSubmitting}
                                            className="hidden"
                                            accept="video/*"
                                        />
                                        <label
                                            htmlFor="video-upload"
                                            className="flex flex-col items-center gap-2 cursor-pointer"
                                        >
                                            <Upload className="w-8 h-8 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                Click để chọn video
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                MP4, AVI, MOV (tối đa 100MB)
                                            </span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center gap-2">
                                            <Video className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm">{videoFile.name}</span>
                                            <span className="text-xs text-gray-400">
                                                ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeVideoFile}
                                            disabled={isSubmitting}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="noiDung">Mô tả (tùy chọn)</Label>
                            <Textarea
                                id="noiDung"
                                value={noiDung}
                                onChange={(e) => setNoiDung(e.target.value)}
                                placeholder="Mô tả ngắn gọn về video..."
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
                            {isSubmitting ? 'Đang xử lý...' : 'Thêm video'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddVideoDialog;
