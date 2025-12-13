import React, { useState } from "react";
import { FileText, Folder, Play, Pencil, Trash2 } from "lucide-react";
import { BsFiletypePdf } from "react-icons/bs";
import { FiFileText } from "react-icons/fi";
import { MdUploadFile, MdOutlineChat } from "react-icons/md";
import { FaLink } from "react-icons/fa6";
import { LuFileQuestion } from "react-icons/lu";
import { FaFilePen } from "react-icons/fa6";
import { PiMicrosoftWordLogoFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import useClassStore from "@/stores/useClassStore";
import useUserStore from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';

// Constants
const CONTENT_TYPES = {
    TAI_LIEU: 'taiLieu',
    PHUC_DAP: 'phucDap',
    BAI_TAP: 'baiTap',
    BAI_NOP: 'baiNop'
};

const DETAIL_TYPES = {
    FILE: 'file',
    DUONG_DAN: 'duongDan',
    VIDEO: 'video',
    THU_MUC: 'thuMuc'
};

/**
 * Lấy icon dựa trên loại file
 */
const getFileIcon = (fileType) => {
    const lowerType = fileType?.toLowerCase() || '';
    if (lowerType.includes('pdf')) {
        return <BsFiletypePdf className="text-red-500 w-6 h-6" />;
    }
    if (lowerType.includes('word') || lowerType.includes('docx')) {
        return <PiMicrosoftWordLogoFill className="text-blue-600 w-6 h-6" />;
    }
    return <FileText className="text-gray-500 w-6 h-6" />;
};

/**
 * Xác định icon dựa trên loaiNoiDung và loaiChiTiet
 */
const getIcon = (loaiNoiDung, loaiChiTiet = null, fileType = null) => {
    // taiLieu: check loaiChiTiet
    if (loaiNoiDung === CONTENT_TYPES.TAI_LIEU && loaiChiTiet) {
        switch (loaiChiTiet) {
            case DETAIL_TYPES.FILE:
                return getFileIcon(fileType);
            case DETAIL_TYPES.DUONG_DAN:
                return <FaLink className="text-cyan-500 w-6 h-6" />;
            case DETAIL_TYPES.VIDEO:
                return <Play className="text-purple-500 w-6 h-6" />;
            case DETAIL_TYPES.THU_MUC:
                return <Folder className="text-yellow-600 w-6 h-6" />;
            default:
                return <LuFileQuestion className="text-cyan-500 w-6 h-6" />;
        }
    }

    // phucDap (diễn đàn)
    if (loaiNoiDung === CONTENT_TYPES.PHUC_DAP) {
        return <MdOutlineChat className="text-pink-400 w-6 h-6" />;
    }

    // baiTap
    if (loaiNoiDung === CONTENT_TYPES.BAI_TAP) {
        return <MdUploadFile className="text-cyan-500 w-6 h-6" />;
    }

  

    return <LuFileQuestion className="text-cyan-500 w-6 h-6" />;
};

/**
 * Trích xuất YouTube video ID từ URL
 */
const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Kiểm tra xem item có được hiển thị hay không
 */
const shouldDisplay = (item) => {
    const { loaiNoiDung, idNoiDungCha } = item;

    // phucDap: chỉ hiển thị nếu !idNoiDungCha (là bài gốc)
    if (loaiNoiDung === CONTENT_TYPES.PHUC_DAP) {
        return !idNoiDungCha;
    }

    // baiNop: hiển thị trong section bài kiểm tra riêng
    // (không hiển thị trong chủ đề thông thường)
    if (loaiNoiDung === CONTENT_TYPES.BAI_NOP) {
        return true; // Sẽ được lọc riêng ở ContentList
    }

    // taiLieu, baiTap: luôn hiển thị
    return true;
};


const ContentItem = ({ item, onRefresh }) => {
    const setSelectedContent = useClassStore(state => state.setSelectedContent);
    const userRole = useUserStore(state => state.user?.role);
    const isTeacher = userRole === 'giangVien';
    const navigate = useNavigate();
    const [editingTitle, setEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState(item.tieuDe);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    // Kiểm tra xem item có được hiển thị hay không
    if (!shouldDisplay(item)) {
        return null;
    }

    // Update content title
    const handleUpdateTitle = async () => {
        if (!newTitle.trim()) {
            toast.error('Tiêu đề không được để trống');
            return;
        }
        
        try {
            await axiosClient.put(`/api/content/${item.id}`, { tieuDe: newTitle.trim() });
            toast.success('Cập nhật tiêu đề thành công');
            setEditingTitle(false);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error updating content:', error);
            toast.error('Không thể cập nhật tiêu đề');
        }
    };

    // Delete content
    const handleDeleteContent = async () => {
        try {
            await axiosClient.delete(`/api/content/${item.id}`);
            toast.success('Xóa nội dung thành công');
            setDeleteDialogOpen(false);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error deleting content:', error);
            const message = error.response?.data?.message || 'Không thể xóa nội dung';
            toast.error(message);
        }
    };

    const fileDetail = item.files && item.files.length > 0 ? item.files[0] : null;
    const loaiChiTiet = fileDetail?.loaiChiTiet;
    const fileType = fileDetail?.fileType;
    const filePath = fileDetail?.filePath;
    
    // Kiểm tra nếu là video YouTube
    const isYouTube = loaiChiTiet === DETAIL_TYPES.VIDEO && filePath && (filePath.includes('youtube.com') || filePath.includes('youtu.be'));
    const youtubeVideoId = isYouTube ? getYouTubeVideoId(filePath) : null;
    
    const handleClick = () => {
        const { loaiNoiDung, id, files } = item;
        const fileDtl = files && files.length > 0 ? files[0] : null;

        // 1. taiLieu (documents)
        if (loaiNoiDung === CONTENT_TYPES.TAI_LIEU) {
            if (!fileDtl) return;

            const { loaiChiTiet: detailType, filePath: path } = fileDtl;

            // 1a. File (PDF, Word, ...)
            if (detailType === DETAIL_TYPES.FILE) {
                if (fileDtl.fileType?.includes('docx') || fileDtl.fileType?.includes('word')) {
                    // Mở Word qua Google Docs Viewer
                    const viewURL = `https://docs.google.com/viewer?url=${encodeURIComponent(
                        path
                    )}&embedded=true`;
                    window.open(viewURL, "_blank");
                } else {
                    // Mở PDF hoặc file khác trực tiếp
                    window.open(path, "_blank");
                }
            }
            // 1b. Đường dẫn (links)
            else if (detailType === DETAIL_TYPES.DUONG_DAN) {
                window.open(path, "_blank");
            }
            // 1c. Video (Cloudinary): tải file
            else if (detailType === DETAIL_TYPES.VIDEO && !isYouTube) {
                window.open(path, "_blank");
            }
            // 1d. Thư mục
            else if (detailType === DETAIL_TYPES.THU_MUC) {
                setSelectedContent(item);
                navigate(`/directory/${id}`);
            }
        }
        // 2. phucDap (forum/discussion)
        else if (loaiNoiDung === CONTENT_TYPES.PHUC_DAP) {
            setSelectedContent(item);
            navigate(`/forum/${id}`);
        }
        // 3. baiTap (assignment/task)
        else if (loaiNoiDung === CONTENT_TYPES.BAI_TAP) {
            setSelectedContent(item);
            navigate(`/assignment/${id}`);
        }
        // 4. baiNop (exam/test)
        else if (loaiNoiDung === CONTENT_TYPES.BAI_NOP) {
            setSelectedContent(item);
            navigate(`/test/${id}`);
        }
    };

    // Render video YouTube inline
    if (youtubeVideoId) {
        return (
            <>
                <div id={`content-item-${item.id}`} className="py-6 px-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                        {editingTitle ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="text-sm font-medium border-b-2 border-orange-500 outline-none px-2 flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateTitle();
                                        if (e.key === 'Escape') {
                                            setEditingTitle(false);
                                            setNewTitle(item.tieuDe);
                                        }
                                    }}
                                    autoFocus
                                />
                                <Button size="sm" onClick={handleUpdateTitle}>Lưu</Button>
                                <Button size="sm" variant="outline" onClick={() => {
                                    setEditingTitle(false);
                                    setNewTitle(item.tieuDe);
                                }}>Hủy</Button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-sm text-blue-500 font-medium">
                                    {item.tieuDe}
                                </h2>
                                {isTeacher && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingTitle(true);
                                            }}
                                            className="h-7 w-7 p-0"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteDialogOpen(true);
                                            }}
                                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', position: 'relative', height: 0 }}>
                        <iframe
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                            title={item.tieuDe}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
                {deleteDialogOpen && (
                    <DeleteConfirmationDialog
                        item={item}
                        onConfirm={handleDeleteContent}
                        onCancel={() => setDeleteDialogOpen(false)}
                    />
                )}
            </>
        );
    }

    // Render content item thông thường
    return (
        <>
            <div
                className="flex items-center justify-between py-6 px-6 hover:bg-gray-50 border-t group"
            >
                <div onClick={handleClick} className="flex items-center flex-1 cursor-pointer">
                    {getIcon(item.loaiNoiDung, loaiChiTiet, fileType)}

                    {editingTitle ? (
                        <div className="flex items-center gap-2 flex-1 ml-3">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="text-sm font-medium border-b-2 border-orange-500 outline-none px-2 flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateTitle();
                                    if (e.key === 'Escape') {
                                        setEditingTitle(false);
                                        setNewTitle(item.tieuDe);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                            <Button size="sm" onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateTitle();
                            }}>Lưu</Button>
                            <Button size="sm" variant="outline" onClick={(e) => {
                                e.stopPropagation();
                                setEditingTitle(false);
                                setNewTitle(item.tieuDe);
                            }}>Hủy</Button>
                        </div>
                    ) : (
                        <>
                            <h2 className="ml-3 text-sm text-blue-500 font-medium hover:underline">
                                {item.tieuDe}
                            </h2>

                            {item.loaiNoiDung === CONTENT_TYPES.TAI_LIEU && fileType && (
                                <span className="ml-2 text-gray-400 text-sm">{fileType.toUpperCase()}</span>
                            )}
                        </>
                    )}
                </div>

                {isTeacher && !editingTitle && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingTitle(true);
                            }}
                            className="h-7 w-7 p-0"
                        >
                            <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialogOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                )}
            </div>

            {deleteDialogOpen && (
                <DeleteConfirmationDialog
                    item={item}
                    onConfirm={handleDeleteContent}
                    onCancel={() => setDeleteDialogOpen(false)}
                />
            )}
        </>
    );
};

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({ item, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Xác nhận xóa nội dung</h3>
                <p className="text-gray-600 mb-2">
                    Bạn có chắc chắn muốn xóa nội dung <strong>{item.tieuDe}</strong>?
                </p>
                <p className="text-sm text-red-600 mb-6">
                    Chỉ có thể xóa khi:
                </p>
                <ul className="text-sm text-gray-600 mb-6 list-disc list-inside space-y-1">
                    <li>Không có nội dung con</li>
                    <li>Không có sinh viên nộp bài tập</li>
                    <li>Không có sinh viên làm kiểm tra</li>
                </ul>
                <p className="text-sm text-red-600 mb-6 font-semibold">
                    Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3">
                    <Button onClick={onCancel} variant="outline">
                        Hủy
                    </Button>
                    <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
                        Xóa
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ContentItem;
