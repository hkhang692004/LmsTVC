import React, { useState, useEffect } from 'react';
import { MdUploadFile } from "react-icons/md";
import Breadcrumb from '@/components/myui/Breadcrump';
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar';
import MyFooter from '@/components/myui/MyFooter';
import MyHeader from '@/components/myui/MyHeader';
import ScrollToTop from '@/components/myui/ScrollToTop';
import { TbFileSettings } from "react-icons/tb";
import formatDateTime from '@/components/myui/FormatDateTime';
import { useParams } from 'react-router-dom';
import useClassStore from '@/stores/useClassStore';

const UploadAssignment = () => {
    const { id: _assignmentId } = useParams();  // Get assignmentId from URL (for future API fetch)
    const selectedClass = useClassStore(state => state.selectedClass);
    const selectedContent = useClassStore(state => state.selectedContent);
    
    const courseName = selectedClass?.tenLop || 'Không xác định';
    const assignmentName = selectedContent?.ten || 'Bài tập';
    const text = selectedContent?.noiDung || '';
    const hanNop = selectedContent?.hanNop;
    const ngayDang = selectedContent?.ngayTao;
    const trangThai = selectedContent?.status;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [showFileInput, setShowFileInput] = useState(false);

    // COUNTDOWN
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        if (!hanNop) return;

        const updateTimeLeft = () => {
            const deadline = new Date(hanNop).getTime();
            const now = Date.now();
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeLeft("Đã hết hạn");
                return false; // báo hiệu ngừng interval
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            const dayPart = days > 0 ? `${days} ngày ` : "";
            const hh = hours.toString().padStart(2, '0');

            setTimeLeft(`${dayPart}${hh} giờ `);

            return true;
        };

        // Gọi ngay 1 lần khi effect chạy để cập nhật ngay lập tức
        if (!updateTimeLeft()) {
            // Nếu đã hết hạn ngay thì không tạo interval nữa
            return;
        }

        const interval = setInterval(() => {
            if (!updateTimeLeft()) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [hanNop]);


    const handleSelectFile = (e) => {
        const newFiles = Array.from(e.target.files);
        setAttachedFiles(prev => [...prev, ...newFiles].slice(0, 3)); // Giới hạn max 3 file
    };

    const handleRemoveFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Hàm xử lý khi nhấn nút Lưu bài nộp
    const handleSave = () => {
        if (attachedFiles.length === 0) {
            alert("Bạn chưa chọn file để nộp!");
            return;
        }
        // TODO: Thực hiện gửi attachedFiles lên server hoặc lưu dữ liệu
        alert(`Đang lưu ${attachedFiles.length} file...`);
    };

    return (
        <>
            <MyHeader />
            <SidebarToggle onClick={() => setSidebarOpen(true)} />

            <div className='flex pt-16'>
                <CourseSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
                    <div className='w-full px-4 lg:px-10'>
                        <div className="flex flex-col my-10 lg:my-20 space-y-6">

                            <Breadcrumb courseName={courseName} itemName={assignmentName} />

                            {/* TITLE */}
                            <div className='flex items-center space-x-3'>
                                <MdUploadFile className='text-cyan-500 w-8 h-8' />
                                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                                    {assignmentName}
                                </h2>
                            </div>

                            {/* THÔNG TIN NGÀY & TRẠNG THÁI */}
                            <div className="bg-white border rounded-lg p-5 shadow-sm space-y-2 text-sm">
                                <p><strong>Ngày đăng:</strong> {formatDateTime(ngayDang)}</p>
                                <p><strong>Hạn nộp:</strong> {formatDateTime(hanNop)}</p>
                            </div>

                            <hr className="border-gray-300" />

                            {/* ASSIGNMENT TEXT */}
                            <div className='bg-gray-50 p-4 rounded whitespace-pre-line'>
                                <p className="text-gray-700 text-sm">{text || "Không có nội dung."}</p>
                            </div>

                            {/* NÚT "THÊM BÀI NỘP" */}
                            <div>
                                <button
                                    onClick={() => setShowFileInput(prev => !prev)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-orange-500 transition"
                                >
                                    {showFileInput ? "Ẩn khu vực nộp bài" : "Thêm bài nộp"}
                                </button>
                            </div>

                            {/* KHU VỰC CHỌN FILE NỐI GIỐNG REPLYFORM */}
                            {showFileInput && (
                                <div className="mt-4 space-y-6">
                                    <label className="font-semibold block mb-2">Nộp bài:</label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Số lượng tập tin đính kèm tối đa 3
                                    </p>

                                    {/* Vùng kéo thả và click chọn file */}
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center bg-gray-50 cursor-pointer"
                                        onClick={() => document.getElementById('file-upload').click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const droppedFiles = Array.from(e.dataTransfer.files);
                                            setAttachedFiles(prev => [...prev, ...droppedFiles].slice(0, 3));
                                        }}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">Thêm các tập tin bằng cách kéo thả hoặc nhấn để chọn file.</p>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            id="file-upload"
                                            onChange={handleSelectFile}
                                        />
                                    </div>

                                    {/* Danh sách file đã chọn */}
                                    {attachedFiles.length > 0 && (
                                        <div className="my-6 flex flex-wrap gap-4">
                                            {attachedFiles.map((file, idx) => (
                                                <div key={idx} className="flex flex-col items-center text-sm w-20">
                                                    <div className="relative border rounded p-2 bg-white w-full flex justify-center items-center">
                                                        <TbFileSettings className="w-10 h-10 text-gray-600" />
                                                        <button
                                                            type="button"
                                                            className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                                                            onClick={() => handleRemoveFile(idx)}
                                                            aria-label="Xóa tập tin"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                    <span className="wrap-break-word text-center mt-1">{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Nút Lưu */}
                                    <div>
                                        <button
                                            onClick={handleSave}
                                            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-green-700 transition"
                                        >
                                            Lưu bài nộp
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* BẢNG HIỂN THỊ TRẠNG THÁI */}
                            <div className="mt-6 p-5 bg-white border rounded-lg shadow-sm max-w-md">
                                <h3 className="font-bold text-lg mb-3">Trạng thái bài nộp</h3>

                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                    <tbody>
                                        {/* Row Trạng thái */}
                                        <tr className="border-b border-gray-300">
                                            <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100 w-1/3">
                                                Trạng thái
                                            </td>
                                            <td className="px-4 py-2">
                                                {trangThai === "da-nop" ? (
                                                    <span className="text-green-600 font-semibold">Đã nộp</span>
                                                ) : (
                                                    <span className="text-red-500 font-semibold">Chưa nộp</span>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Row Thời gian còn lại */}
                                        <tr className="border-b border-gray-300">
                                            <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                Thời gian còn lại
                                            </td>
                                            <td className="px-4 py-2">Còn lại {timeLeft}</td>
                                        </tr>

                                        {/* Row File đã gửi */}
                                        <tr>
                                            <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                File đã gửi
                                            </td>
                                            <td className="px-4 py-2">
                                                {attachedFiles.length === 0 ? (
                                                    <span className="text-gray-500">Chưa có file</span>
                                                ) : (
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {attachedFiles.map((f, idx) => (
                                                            <li key={idx}>{f.name}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            <ScrollToTop />
            <MyFooter />
        </>
    );
};

export default UploadAssignment;
