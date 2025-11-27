import Breadcrumb from '@/components/myui/Breadcrump';
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar';
import MyHeader from '@/components/myui/MyHeader';
import mockSections from '@/mocks/mockSections';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFilePen } from "react-icons/fa6";
import ScrollToTop from '@/components/myui/ScrollToTop';
import MyFooter from '@/components/myui/MyFooter';
import formatDateTime from '@/components/myui/FormatDateTime';

const TestExercise = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const courseName = location.state?.courseName;
    const testName = location.state?.testName;
    const text = location.state?.text;
    const ngayketthuc = location.state?.ngayketthuc;
    const ngaybatdau = location.state?.ngaybatdau;
    const trangThai = location.state?.trangThai;
    const tongDiem = location.state?.tongDiem;

    const cauHoi = location.state?.cauHoi;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // --- COUNTDOWN GIỐNG UploadAssignment ---
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!ngayketthuc) return;

        const updateTimeLeft = () => {
            const deadline = new Date(ngayketthuc).getTime();
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
    }, [ngayketthuc]);




    // --- KIỂM TRA THỜI GIAN HIỆN TẠI CÓ ĐƯỢC LÀM BÀI KHÔNG ---
    const now = new Date().getTime();
    const start = new Date(ngaybatdau).getTime();
    const end = new Date(ngayketthuc).getTime();

    const duocLamBai = now >= start && now <= end;


    return (
        <>
            <MyHeader />
            <SidebarToggle onClick={() => setSidebarOpen(true)} />

            <div className='flex pt-16'>
                <CourseSidebar
                    sections={mockSections}
                    isOpen={sidebarOpen}
                    courseName={courseName}
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
                                    onClick={() => navigate("/kiemtra", {
                                        state: {

                                            testName,
                                            cauHoi
                                        }
                                    })}
                                >
                                    Làm bài trắc nghiệm
                                </button>
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
                                                {trangThai === "da-nop" ? (
                                                    <span className="text-green-600 font-semibold">Đã hoàn thành</span>
                                                ) : (
                                                    <span className="text-red-500 font-semibold">Chưa làm</span>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Row Thời gian còn lại */}
                                        <tr className="border-b border-gray-300">
                                            <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                Thời gian còn lại
                                            </td>
                                            <td className="px-4 py-2">
                                                {timeLeft}
                                            </td>
                                        </tr>

                                        {/* Row Điểm */}
                                        <tr>
                                            <td className="border-r border-gray-300 font-semibold px-4 py-2 bg-gray-100">
                                                Điểm
                                            </td>
                                            <td className="px-4 py-2">
                                                {tongDiem ? `${tongDiem}/10` : "Chưa có điểm"}
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
