import Breadcrumb from '@/components/myui/Breadcrump';
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar';
import MyHeader from '@/components/myui/MyHeader';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaFilePen } from "react-icons/fa6";
import ScrollToTop from '@/components/myui/ScrollToTop';
import MyFooter from '@/components/myui/MyFooter';
import formatDateTime from '@/components/myui/FormatDateTime';
import useClassStore from '@/stores/useClassStore';
import examService from '@/services/examService';
import { toast } from 'sonner';

const TestExercise = () => {
    const { id: testId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const selectedClass = useClassStore(state => state.selectedClass);

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // If coming from submit, replace current history entry to remove old test page
    useEffect(() => {
        if (location.state?.fromSubmit) {
            // Replace current entry to clear the duplicate test page
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Fetch exam data with submission status
    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);
                const response = await examService.getExamStudentView(testId);
                console.log('Exam data:', response.data?.data);
                setExam(response.data?.data);
            } catch (error) {
                console.error('Error fetching exam:', error);
                toast.error('Không thể tải thông tin bài kiểm tra');
            } finally {
                setLoading(false);
            }
        };

        if (testId) {
            fetchExam();
        }
    }, [testId]);

    const courseName = selectedClass?.tenLop || exam?.iop?.tenLop || exam?.lop?.tenLop || 'Không xác định';
    const testName = exam?.tenBaiKiemTra || exam?.tieuDe || 'Bài kiểm tra';
    const text = exam?.noiDung || exam?.moTa || '';
    const thoiLuong = exam?.thoiLuong || 0;
    const ngayketthuc = exam?.thoiGianKetThuc;
    const ngaybatdau = exam?.thoiGianBatDau;
    const mySubmission = exam?.mySubmission;
    const trangThai = mySubmission?.trangThai || 'chuaLam';
    const tongDiem = mySubmission?.tongDiem;
    const choPhepXemDiem = exam?.choPhepXemDiem;

    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!exam?.thoiGianKetThuc) return;

        const updateTimeLeft = () => {
            const deadline = new Date(exam.thoiGianKetThuc).getTime();
            const now = Date.now();
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeLeft("Đã hết hạn");
                return false; // báo hiệu dừng interval
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            const dayPart = days > 0 ? `${days} ngày ` : "";
            const hh = hours.toString().padStart(2, "0");
            const mm = minutes.toString().padStart(2, "0");

            setTimeLeft(`Còn lại ${dayPart}${hh} giờ ${mm} phút`);
            return true;
        };

        if (!updateTimeLeft()) {
            return; // Nếu hết hạn luôn thì không set interval
        }

        const interval = setInterval(() => {
            if (!updateTimeLeft()) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [exam?.thoiGianKetThuc]);




    // Kiểm tra thời gian hiện tại có được làm bài không
    const now = new Date().getTime();
    const start = exam?.thoiGianBatDau ? new Date(exam.thoiGianBatDau).getTime() : null;
    const end = exam?.thoiGianKetThuc ? new Date(exam.thoiGianKetThuc).getTime() : null;

    const duocLamBai = start && end && now >= start && now <= end && trangThai !== 'daNop';

    if (loading) {
        return (
            <>
                <MyHeader />
                <div className="min-h-screen flex items-center justify-center pt-20">
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            </>
        );
    }


    return (
        <>
            <MyHeader />
            <SidebarToggle onClick={() => setSidebarOpen(true)} />

            <div className='flex pt-16'>
                <CourseSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
                    <div className='w-full space-y-6 px-4 lg:px-10'>
                        <div className="flex flex-col my-10 lg:my-20 space-y-6">

                            <Breadcrumb courseName={courseName} itemName={testName} />

                            {/* TITLE */}
                            <div className='flex items-center space-x-3'>
                                <FaFilePen className='w-8 h-8 text-gray-500' />
                                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                                    {testName}
                                </h2>
                            </div>

                            {/* NGÀY BẮT ĐẦU + NGÀY KẾT THÚC */}
                            <div className="bg-white border rounded-lg p-5 shadow-sm space-y-2 text-sm">
                                <p><strong>Ngày bắt đầu:</strong> {formatDateTime(ngaybatdau)}</p>
                                <p><strong>Ngày kết thúc:</strong> {formatDateTime(ngayketthuc)}</p>
                            </div>

                            <hr className="border-gray-300" />

                            {/* NỘI DUNG BÀI KIỂM TRA */}
                            <div className='bg-gray-50 p-4 rounded whitespace-pre-line'>
                                <p className="text-gray-700 text-sm">{text || "Không có nội dung."}</p>
                            </div>

                            {/* NÚT LÀM BÀI TRẮC NGHIỆM — NGAY DƯỚI TEXT */}
                            {duocLamBai && (
                                <button
                                    className="px-6 py-3 bg-orange-500 hover:bg-blue-500 text-white rounded-lg shadow font-semibold w-fit"
                                    onClick={() => navigate(`/kiemtra/${testId}`)}
                                >
                                    {trangThai === 'dangLam' ? 'Tiếp tục bài làm' : 'Làm bài trắc nghiệm'}
                                </button>
                            )}

                            {trangThai === 'daNop' && (
                                <div className="text-green-600 font-semibold">
                                    ✓ Bạn đã hoàn thành bài kiểm tra này
                                </div>
                            )}

                            {/* BẢNG TRẠNG THÁI */}
                            <div className="mt-6 p-5 bg-white border rounded-lg shadow-sm max-w-md">
                                <h3 className="font-bold text-lg mb-3">Trạng thái bài kiểm tra</h3>

                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                    <tbody>

                                        {/* Row Trạng thái */}
                                        <tr className="border-b border-gray-300">
                                            <td className="w-1/3 border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                Trạng thái
                                            </td>
                                            <td className="px-4 py-2">
                                                {trangThai === 'daNop' ? (
                                                    <span className="text-green-600 font-semibold">Đã hoàn thành</span>
                                                ) : trangThai === 'dangLam' ? (
                                                    <span className="text-blue-600 font-semibold">Đang làm</span>
                                                ) : (
                                                    <span className="text-red-500 font-semibold">Chưa làm</span>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Row Thời lượng */}
                                        <tr className="border-b border-gray-300">
                                            <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                Thời lượng
                                            </td>
                                            <td className="px-4 py-2">
                                                {thoiLuong} phút
                                            </td>
                                        </tr>

                                        {/* Row Thời gian còn lại */}
                                        <tr className="border-b border-gray-300">
                                            <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                Thời gian còn lại
                                            </td>
                                            <td className="px-4 py-2">
                                                {trangThai === 'daNop' ? (
                                                    <span className="text-green-600 font-semibold">Hoàn thành</span>
                                                ) : (
                                                    timeLeft
                                                )}
                                            </td>
                                        </tr>

                                        {/* Row Điểm */}
                                        <tr>
                                            <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                Điểm
                                            </td>
                                            <td className="px-4 py-2">
                                                {trangThai === 'daNop' ? (
                                                    choPhepXemDiem ? (
                                                        tongDiem ? `${tongDiem}/10` : "Chưa có điểm"
                                                    ) : (
                                                        <span className="text-gray-600 font-semibold">Không có quyền xem điểm</span>
                                                    )
                                                ) : (
                                                    "Chưa có điểm"
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

export default TestExercise;
