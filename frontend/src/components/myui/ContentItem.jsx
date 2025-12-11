import React from "react";
import { FileText, Folder, Play } from "lucide-react";
import { BsFiletypePdf } from "react-icons/bs";
import { FiFileText } from "react-icons/fi";
import { MdUploadFile, MdOutlineChat } from "react-icons/md";
import { FaLink } from "react-icons/fa6";
import { LuFileQuestion } from "react-icons/lu";
import { FaFilePen } from "react-icons/fa6";
import { PiMicrosoftWordLogoFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import useClassStore from "@/stores/useClassStore";

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


const ContentItem = ({ item }) => {
    const setSelectedContent = useClassStore(state => state.setSelectedContent);
    const navigate = useNavigate();
    
    // Kiểm tra xem item có được hiển thị hay không
    if (!shouldDisplay(item)) {
        return null;
    }

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
            <div className="py-6 px-6 border-t">
                <h2 className="text-sm text-blue-500 font-medium mb-4">
                    {item.tieuDe}
                </h2>
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
        );
    }

    // Render content item thông thường
    return (
        <div
            onClick={handleClick}
            className="flex items-center py-6 px-6 hover:bg-gray-50 cursor-pointer border-t"
        >
            {getIcon(item.loaiNoiDung, loaiChiTiet, fileType)}

            <h2 className="ml-3 text-sm text-blue-500 font-medium hover:underline">
                {item.tieuDe}
            </h2>

            {item.loaiNoiDung === CONTENT_TYPES.TAI_LIEU && fileType && (
                <span className="ml-2 text-gray-400 text-sm">{fileType.toUpperCase()}</span>
            )}
        </div>
    );
};

export default ContentItem;
