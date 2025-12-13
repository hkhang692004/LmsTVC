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
import useUserStore from '@/stores/useUserStore';
import contentService from '@/services/contentService';
import { toast } from 'sonner';

const UploadAssignment = () => {
    const { id: assignmentId } = useParams();
    const selectedClass = useClassStore(state => state.selectedClass);
    const currentUser = useUserStore(state => state.user);
    const isTeacher = currentUser?.role === 'giangVien';
    
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]); // For student's own submissions
    const [allSubmissions, setAllSubmissions] = useState([]); // For teacher view
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]); // Files đã nộp trước đó
    const [showFileInput, setShowFileInput] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const limit = 1; // Số bài nộp mỗi trang - set 1 để dễ test phân trang

    // COUNTDOWN
    const [timeLeft, setTimeLeft] = useState("");

    // Fetch assignment data
    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                setLoading(true);
                const response = await contentService.getAssignment(assignmentId);
                setAssignment(response.data?.data);
            } catch (error) {
                console.error('Error fetching assignment:', error);
                toast.error('Không thể tải thông tin bài tập');
            } finally {
                setLoading(false);
            }
        };

        if (assignmentId) {
            fetchAssignment();
        }
    }, [assignmentId]);

    // Fetch submissions
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                if (isTeacher) {
                    // Giảng viên: lấy tất cả bài nộp của sinh viên với pagination
                    const response = await contentService.getAllSubmissions(assignmentId, currentPage, limit);
                    const data = response.data?.data;
                    setAllSubmissions(data?.submissions || []);
                    setTotalPages(data?.totalPages || 1);
                    setTotalSubmissions(data?.total || 0);
                } else {
                    // Sinh viên: chỉ lấy bài nộp của mình
                    const response = await contentService.getMySubmissions(assignmentId);
                    setSubmissions(response.data?.data || []);
                }
            } catch (error) {
                console.error('Error fetching submissions:', error);
                // Không hiển thị lỗi vì có thể chưa có bài nộp
            }
        };

        if (assignmentId) {
            fetchSubmissions();
        }
    }, [assignmentId, isTeacher, currentPage]);
    // Countdown effect
    useEffect(() => {
        if (!assignment?.hanNop) return;

        const updateTimeLeft = () => {
            const deadline = new Date(assignment.hanNop).getTime();
            const now = Date.now();
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeLeft("Đã trễ hạn");
                return false;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            const dayPart = days > 0 ? `${days} ngày ` : "";
            const hh = hours.toString().padStart(2, '0');

            setTimeLeft(`${dayPart}${hh} giờ `);

            return true;
        };

        if (!updateTimeLeft()) {
            return;
        }

        const interval = setInterval(() => {
            if (!updateTimeLeft()) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [assignment?.hanNop]);


    const handleSelectFile = (e) => {
        const newFiles = Array.from(e.target.files);
        setAttachedFiles(prev => [...prev, ...newFiles].slice(0, 3)); // Giới hạn max 3 file
    };

    const handleRemoveFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingFile = (index) => {
        setExistingFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Hàm xử lý khi nhấn nút Chỉnh sửa
    const handleEdit = () => {
        if (isEditing && showFileInput) {
            // Đang mở form edit, click lại để đóng
            setShowFileInput(false);
            setIsEditing(false);
            setExistingFiles([]);
            setAttachedFiles([]);
        } else {
            // Mở form edit
            setIsEditing(true);
            setShowFileInput(true);
            // Load files cũ vào existingFiles để có thể xóa
            if (submissions.length > 0 && submissions[0].chiTiets) {
                setExistingFiles(submissions[0].chiTiets);
            }
            setAttachedFiles([]);
        }
    };

    // Hàm xử lý khi nhấn nút Lưu bài nộp
    const handleSave = async () => {
        // Kiểm tra phải có ít nhất 1 file (mới hoặc cũ)
        if (attachedFiles.length === 0 && existingFiles.length === 0) {
            toast.error("Bạn cần có ít nhất 1 file để nộp!");
            return;
        }

        if (!currentUser) {
            toast.error("Bạn cần đăng nhập để nộp bài!");
            return;
        }

        try {
            setUploading(true);

            // Tạo FormData để gửi files + data
            const formData = new FormData();
            
            // Thêm files
            attachedFiles.forEach(file => {
                formData.append('files', file);
            });

            // Thêm data của bài nộp
            formData.append('tieuDe', `Bài nộp - ${assignment.tieuDe}`);
            formData.append('noiDung', `Bài nộp của sinh viên ${currentUser.hoTen || currentUser.ten}`);
            formData.append('loaiNoiDung', 'baiNop');
            formData.append('idChuDe', assignment.idChuDe);
            formData.append('idNguoiDung', currentUser.id);
            formData.append('idNoiDungCha', assignmentId);
            formData.append('status', 'daNop'); // Changed from 'hien' to 'daNop'

            // Gọi API tạo hoặc cập nhật content với files
            if (isEditing && submissions.length > 0) {
                // Cập nhật bài nộp hiện tại
                const submissionId = submissions[0].id;
                
                // Thêm remainFiles - danh sách ID của files giữ lại
                const remainFileIds = existingFiles.map(f => f.id);
                remainFileIds.forEach(id => {
                    formData.append('remainFiles', id);
                });
                
                await contentService.updateSubmission(submissionId, formData);
                toast.success("Cập nhật bài nộp thành công!");
            } else {
                // Tạo bài nộp mới
                await contentService.createSubmission(formData);
                toast.success("Nộp bài thành công!");
            }
            
            // Reset form
            setAttachedFiles([]);
            setExistingFiles([]);
            setShowFileInput(false);
            setIsEditing(false);
            
            // Refresh submissions list
            const refreshResponse = await contentService.getMySubmissions(assignmentId);
            setSubmissions(refreshResponse.data?.data || []);

        } catch (error) {
            console.error('Error submitting assignment:', error);
            const errorMsg = error.response?.data?.message || 'Nộp bài thất bại!';
            toast.error(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const courseName = selectedClass?.tenLop || 'Không xác định';
    const assignmentName = assignment?.tieuDe || 'Bài tập';
    const hasSubmitted = submissions.length > 0;

    // Tính toán trạng thái nộp bài
    const getSubmissionStatus = () => {
        if (!hasSubmitted) return null;
        
        const latestSubmission = submissions[0]; // Latest submission (sorted by DESC)
        const submissionTime = new Date(latestSubmission.ngayTao).getTime();
        const deadlineTime = new Date(assignment.hanNop).getTime();
        
        const diffMs = submissionTime - deadlineTime;
        const absDiffMs = Math.abs(diffMs);
        const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        const timeText = `${diffDays > 0 ? `${diffDays} ngày ` : ''}${diffHours} giờ`;
        
        if (diffMs < 0) {
            // Nộp sớm
            return {
                isLate: false,
                message: `Sớm hơn ${timeText}`,
                statusClass: 'bg-green-100 text-black',
                timeClass: 'bg-green-100 text-black'
            };
        } else {
            // Nộp trễ
            return {
                isLate: true,
                message: `Trễ ${timeText}`,
                statusClass: 'bg-red-100 text-black',
                timeClass: 'bg-red-100 text-black'
            };
        }
    };

    const submissionStatus = hasSubmitted ? getSubmissionStatus() : null;

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

                            {loading ? (
                                <div className="text-center py-20">
                                    <p className="text-gray-500">Đang tải...</p>
                                </div>
                            ) : !assignment ? (
                                <div className="text-center py-20">
                                    <p className="text-red-500">Không tìm thấy bài tập</p>
                                </div>
                            ) : (
                                <>
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
                                        <p><strong>Ngày đăng:</strong> {formatDateTime(assignment.ngayTao)}</p>
                                        <p><strong>Hạn nộp:</strong> {formatDateTime(assignment.hanNop)}</p>
                                    </div>

                                    <hr className="border-gray-300" />

                                    {/* ASSIGNMENT TEXT */}
                                    <div className='bg-gray-50 p-4 rounded'>
                                        <div 
                                            className="text-gray-700 text-sm prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: assignment.noiDung || "Không có nội dung." }}
                                        />
                                    </div>

                                    {/* NÚT "THÊM BÀI NỘP" hoặc "CHỈNH SỬA BÀI NỘP" - CHỈ CHO SINH VIÊN */}
                                    {!isTeacher && (
                                        <>
                                            <div className="flex gap-3">
                                                {!hasSubmitted && (
                                                    <button
                                                        onClick={() => setShowFileInput(prev => !prev)}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-orange-500 transition disabled:bg-gray-400"
                                                        disabled={uploading}
                                                    >
                                                        {showFileInput ? "Ẩn khu vực nộp bài" : "Thêm bài nộp"}
                                                    </button>
                                                )}
                                                
                                                {hasSubmitted && (
                                                    <button
                                                        onClick={handleEdit}
                                                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-blue-500 transition disabled:bg-gray-400"
                                                        disabled={uploading}
                                                    >
                                                        {showFileInput && isEditing ? "Ẩn khu vực chỉnh sửa" : "Chỉnh sửa bài nộp"}
                                                    </button>
                                                )}
                                            </div>

                                    {/* KHU VỰC CHỌN FILE */}
                                    {showFileInput && (
                                        <div className="mt-4 space-y-6">
                                            <label className="font-semibold block mb-2">
                                                {isEditing ? "Chỉnh sửa bài nộp:" : "Nộp bài:"}
                                            </label>
                                            <p className="text-xs text-gray-500 mb-2">
                                                Số lượng tập tin đính kèm tối đa 3
                                            </p>

                                            {/* Vùng kéo thả và click chọn file */}
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors"
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
                                                    disabled={uploading}
                                                />
                                            </div>

                                            {/* Danh sách file đã nộp trước đó (khi edit) */}
                                            {isEditing && existingFiles.length > 0 && (
                                                <div className="my-6">
                                                    <p className="text-sm font-medium mb-3 text-gray-700">File đã nộp:</p>
                                                    <div className="flex flex-wrap gap-4">
                                                        {existingFiles.map((file, idx) => (
                                                            <div key={idx} className="flex flex-col items-center text-sm w-32 border rounded-lg p-3 bg-blue-50">
                                                                <div className="relative w-full flex justify-center items-center mb-2">
                                                                    <TbFileSettings className="w-10 h-10 text-blue-600" />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 text-xs"
                                                                        onClick={() => handleRemoveExistingFile(idx)}
                                                                        aria-label="Xóa tập tin"
                                                                        disabled={uploading}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                                <span className="wrap-break-word text-center text-xs truncate w-full" title={file.fileName}>
                                                                    {file.fileName}
                                                                </span>
                                                                <span className="text-xs text-gray-500 mt-1">
                                                                    {(file.fileSize / 1024).toFixed(1)} KB
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Danh sách file mới được chọn */}
                                            {attachedFiles.length > 0 && (
                                                <div className="my-6">
                                                    <p className="text-sm font-medium mb-3 text-gray-700">
                                                        {isEditing ? 'File mới thêm:' : 'File đã chọn:'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-4">
                                                        {attachedFiles.map((file, idx) => (
                                                            <div key={idx} className="flex flex-col items-center text-sm w-32 border rounded-lg p-3 bg-green-50">
                                                                <div className="relative w-full flex justify-center items-center mb-2">
                                                                    <TbFileSettings className="w-10 h-10 text-green-600" />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 text-xs"
                                                                        onClick={() => handleRemoveFile(idx)}
                                                                        aria-label="Xóa tập tin"
                                                                        disabled={uploading}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                                <span className="wrap-break-word text-center text-xs truncate w-full" title={file.name}>
                                                                    {file.name}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Nút Lưu */}
                                            <div>
                                                <button
                                                    onClick={handleSave}
                                                    className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    disabled={uploading || (attachedFiles.length === 0 && existingFiles.length === 0)}
                                                >
                                                    {uploading ? (isEditing ? 'Đang cập nhật...' : 'Đang nộp bài...') : (isEditing ? 'Cập nhật bài nộp' : 'Lưu bài nộp')}
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
                                                        {hasSubmitted ? (
                                                            <span className={`px-3 py-1 rounded font-semibold ${submissionStatus?.statusClass || 'bg-green-100 text-black'}`}>
                                                                {submissionStatus?.isLate ? 'Trễ hạn' : 'Đã nộp'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-red-500 font-semibold">Chưa nộp</span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Row Thời gian còn lại */}
                                                <tr className="border-b border-gray-300">
                                                    <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                        Thời gian {hasSubmitted ? 'nộp' : 'còn lại'}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {hasSubmitted ? (
                                                            <span className={`px-3 py-1 rounded font-semibold ${submissionStatus?.timeClass || ''}`}>
                                                                {submissionStatus?.message || 'Đã nộp'}
                                                            </span>
                                                        ) : (
                                                            <span className={`${timeLeft === 'Đã trễ hạn' ? 'px-3 py-1 rounded font-semibold bg-red-100 text-black' : ''}`}>
                                                                {timeLeft === 'Đã trễ hạn' ? timeLeft : (timeLeft ? `Còn lại ${timeLeft}` : 'Đang tính...')}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Row File đã gửi */}
                                                <tr>
                                                    <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                        Bài nộp
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {submissions.length === 0 ? (
                                                            <span className="text-gray-500">Chưa có bài nộp</span>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {submissions.map((submission, idx) => (
                                                                    <div key={idx} className="text-xs">
                                                                        <p className="font-medium">{formatDateTime(submission.ngayTao)}</p>
                                                                        {submission.chiTiets && submission.chiTiets.length > 0 && (
                                                                            <ul className="list-disc list-inside ml-2 mt-1">
                                                                                {submission.chiTiets.map((file, fIdx) => (
                                                                                    <li key={fIdx} className="text-blue-600 hover:underline">
                                                                                        <a href={file.filePath} target="_blank" rel="noopener noreferrer">
                                                                                            {file.fileName}
                                                                                        </a>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                        </>
                                    )}

                                    {/* DANH SÁCH BÀI NỘP - CHỈ CHO GIẢNG VIÊN */}
                                    {isTeacher && (
                                        <div className="mt-6 bg-white border rounded-lg shadow-sm p-6">
                                            <h3 className="font-bold text-xl mb-4 text-orange-500">
                                                Danh sách bài nộp của sinh viên ({totalSubmissions})
                                            </h3>
                                            
                                            {allSubmissions.length === 0 ? (
                                                <p className="text-gray-500 text-center py-8">Chưa có sinh viên nào nộp bài</p>
                                            ) : (
                                                <>
                                                    <div className="space-y-4">
                                                        {allSubmissions.map((submission, idx) => {
                                                            const submissionTime = new Date(submission.ngayTao).getTime();
                                                            const deadlineTime = new Date(assignment.hanNop).getTime();
                                                            const isLate = submissionTime > deadlineTime;
                                                            
                                                            return (
                                                                <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-gray-800">
                                                                                {submission.nguoiTao?.ten || 'Sinh viên'}
                                                                            </p>
                                                                            <p className="text-sm text-gray-500">
                                                                                {submission.nguoiTao?.email || ''}
                                                                            </p>
                                                                        </div>
                                                                        <span className={`px-3 py-1 rounded text-sm font-semibold ${
                                                                            isLate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                                        }`}>
                                                                            {isLate ? 'Trễ hạn' : 'Đúng hạn'}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="text-sm text-gray-600 mb-3">
                                                                        <p><strong>Thời gian nộp:</strong> {formatDateTime(submission.ngayTao)}</p>
                                                                    </div>
                                                                    
                                                                    {submission.chiTiets && submission.chiTiets.length > 0 && (
                                                                        <div className="mt-3">
                                                                            <p className="text-sm font-medium mb-2">File đính kèm:</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {submission.chiTiets.map((file, fIdx) => (
                                                                                    <a 
                                                                                        key={fIdx}
                                                                                        href={file.filePath} 
                                                                                        target="_blank" 
                                                                                        rel="noopener noreferrer"
                                                                                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm"
                                                                                    >
                                                                                        <TbFileSettings className="w-4 h-4" />
                                                                                        {file.fileName}
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Pagination */}
                                                    {totalPages > 1 && (
                                                        <div className="flex items-center justify-center gap-2 mt-6">
                                                            <button
                                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                                disabled={currentPage === 1}
                                                                className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                Trước
                                                            </button>
                                                            
                                                            <span className="px-4 py-2 text-sm">
                                                                Trang {currentPage} / {totalPages}
                                                            </span>
                                                            
                                                            <button
                                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                                disabled={currentPage === totalPages}
                                                                className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                Sau
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}


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
