import React, { useState } from "react";
import { ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import ContentItem from "./ContentItem";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddDocumentDialog from "./AddDocumentDialog";
import AddVideoDialog from "./AddVideoDialog";
import AddForumDialog from "./AddForumDialog";
import AddAssignmentDialog from "./AddAssignmentDialog";
import AddLinkDialog from "./AddLinkDialog";


const ContentSection = ({ title, items, isTeacher, topicId, onContentAdded }) => {
    const [open, setOpen] = useState(true);
    const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [forumDialogOpen, setForumDialogOpen] = useState(false);
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState(title);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Update topic title
    const handleUpdateTitle = async () => {
        if (!newTitle.trim()) {
            toast.error('Tiêu đề không được để trống');
            return;
        }
        
        try {
            await axiosClient.put(`/api/topics/${topicId}`, { tenChuDe: newTitle.trim() });
            toast.success('Cập nhật tiêu đề thành công');
            setEditingTitle(false);
            if (onContentAdded) onContentAdded();
        } catch (error) {
            console.error('Error updating topic:', error);
            toast.error('Không thể cập nhật tiêu đề');
        }
    };

    // Delete topic
    const handleDeleteTopic = async () => {
        try {
            await axiosClient.delete(`/api/topics/${topicId}`);
            toast.success('Xóa chủ đề thành công');
            setDeleteDialogOpen(false);
            if (onContentAdded) onContentAdded();
        } catch (error) {
            console.error('Error deleting topic:', error);
            const message = error.response?.data?.message || 'Không thể xóa chủ đề';
            toast.error(message);
        }
    };
    return (
        <>
        <div className="border rounded-lg bg-white shadow-sm">

            {/* Header */}
            <div className="w-full flex items-center justify-between px-5 py-5">
                <div className="flex items-center gap-3 flex-1">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-3"
                    >
                        {/* Icon xoay mượt */}
                        <Motion.div
                            animate={{ rotate: open ? 0 : -90 }}
                            transition={{ duration: 0.25 }}
                        >
                            <ChevronDown />
                        </Motion.div>
                    </button>

                    {editingTitle ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="text-2xl font-bold border-b-2 border-orange-500 outline-none px-2 flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateTitle();
                                    if (e.key === 'Escape') {
                                        setEditingTitle(false);
                                        setNewTitle(title);
                                    }
                                }}
                                autoFocus
                            />
                            <Button size="sm" onClick={handleUpdateTitle}>Lưu</Button>
                            <Button size="sm" variant="outline" onClick={() => {
                                setEditingTitle(false);
                                setNewTitle(title);
                            }}>Hủy</Button>
                        </div>
                    ) : (
                        <>
                            <span className="text-2xl text-gray-700 font-bold">
                                {title}
                            </span>
                            {isTeacher && (
                                <div className="flex items-center gap-1 ml-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingTitle(true)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteDialogOpen(true)}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                {/* Nút thêm nội dung cho giảng viên */}
                {isTeacher && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="hover:bg-gray-100"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Thêm nội dung
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setDocumentDialogOpen(true);
                            }}>
                                📄 Tài liệu (PDF, DOCX, ...)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setVideoDialogOpen(true);
                            }}>
                                🎥 Video/Link Youtube
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setLinkDialogOpen(true);
                            }}>
                                🔗 Đường dẫn (Link)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setForumDialogOpen(true);
                            }}>
                                💬 Phúc đáp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setAssignmentDialogOpen(true);
                            }}>
                                📝 Bài tập
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Accordion Content */}
            <AnimatePresence initial={false}>
                {open && (
                    <Motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-2">
                            {items.length === 0 ? (
                                <p className="px-4 py-2 text-gray-400 text-sm">
                                    Không có nội dung
                                </p>
                            ) : (
                                items.map((item) => (
                                    <ContentItem key={item.id} item={item} onRefresh={onContentAdded} />
                                ))
                            )}
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>

        </div>
        
        {/* Dialogs */}
        {isTeacher && (
            <>
                <AddDocumentDialog
                    open={documentDialogOpen}
                    onOpenChange={setDocumentDialogOpen}
                    topicId={topicId}
                    onSuccess={onContentAdded}
                />
                <AddVideoDialog
                    open={videoDialogOpen}
                    onOpenChange={setVideoDialogOpen}
                    topicId={topicId}
                    onSuccess={onContentAdded}
                />
                <AddLinkDialog
                    open={linkDialogOpen}
                    onOpenChange={setLinkDialogOpen}
                    topicId={topicId}
                    onSuccess={onContentAdded}
                />
                <AddForumDialog
                    open={forumDialogOpen}
                    onOpenChange={setForumDialogOpen}
                    topicId={topicId}
                    onSuccess={onContentAdded}
                />
                <AddAssignmentDialog
                    open={assignmentDialogOpen}
                    onOpenChange={setAssignmentDialogOpen}
                    topicId={topicId}
                    onSuccess={onContentAdded}
                />
            </>
        )}

            {/* Delete Topic Confirmation Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Xác nhận xóa chủ đề</h3>
                        <p className="text-gray-600 mb-2">
                            Bạn có chắc chắn muốn xóa chủ đề <strong>{title}</strong>?
                        </p>
                        <p className="text-sm text-red-600 mb-6">
                            Chỉ có thể xóa khi:
                        </p>
                        <ul className="text-sm text-gray-600 mb-6 list-disc list-inside space-y-1">
                            <li>Không có nội dung con trong chủ đề</li>
                            <li>Không có sinh viên nộp bài tập</li>
                            <li>Không có sinh viên làm kiểm tra</li>
                        </ul>
                        <p className="text-sm text-red-600 mb-6 font-semibold">
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setDeleteDialogOpen(false)}
                                variant="outline"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleDeleteTopic}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Xóa
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ContentSection;
