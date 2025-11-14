import React, { useState } from 'react'
import { Bell, MessageSquare, ChevronDown } from 'lucide-react'

const MyHeader = () => {

    const [openDropDown, setOpenDropDown] = useState(null);


    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-blue-500 py-2 shadow-md">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-6">
                {/* Left: Text */}
                <a href="/mycourse" className="block w-fit">
                    <div className="flex flex-row items-center gap-2">
                        <img
                            src="TVCLogo.webp"
                            alt="Logo"
                            className="h-10 w-auto"
                        />
                        <p className="text-lg font-semibold text-white">LMS TVC</p>
                    </div>
                </a>
                {/* Right: Notifications, Messages, User Menu */}
                <div className="flex items-center gap-4">
                    {/* Notification Dropdown */}
                    <div className="relative">
                        <div
                            onClick={() => setOpenDropDown(openDropDown === "notification" ? null : "notification")
                            }
                            className="relative p-2 text-white hover:bg-blue-700 rounded-lg transition"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 bg-orange-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center font-semibold">
                                2
                            </span>
                        </div>
                        {openDropDown === "notification" && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden">
                                <div className="p-3 bg-gray-50 border-b font-semibold text-gray-700">
                                    Thông báo
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <div className="p-3 hover:bg-gray-50 cursor-pointer border-b">
                                        <p className="text-sm text-gray-800">Bạn có bài tập mới cần nộp</p>
                                        <p className="text-xs text-gray-500 mt-1">2 giờ trước</p>
                                    </div>
                                    <div className="p-3 hover:bg-gray-50 cursor-pointer">
                                        <p className="text-sm text-gray-800">Điểm bài kiểm tra đã được cập nhật</p>
                                        <p className="text-xs text-gray-500 mt-1">5 giờ trước</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Message Dropdown */}
                    <div className="relative">
                        <div
                            onClick={() => setOpenDropDown(openDropDown === "message" ? null : "message")}
                            className="p-2 text-white hover:bg-blue-700 rounded-lg transition"
                        >
                            <MessageSquare size={20} />
                        </div>
                        {openDropDown === "message" && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden">
                                <div className="p-3 bg-gray-50 border-b font-semibold text-gray-700">
                                    Tin nhắn
                                </div>
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    Không có tin nhắn mới
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Avatar & Dropdown */}
                    <div className="relative">
                        <div
                            onClick={() => setOpenDropDown(openDropDown === "userMenu" ? null : "userMenu")}
                            className="flex items-center gap-2 hover:bg-blue-700 p-2 rounded-lg transition"
                        >
                            <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-gray-800">
                                TK
                            </div>
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                                <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                            </svg>
                        </div>
                        {openDropDown === "userMenu" && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border overflow-hidden">
                                <div className="py-1">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hồ sơ</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cài đặt</a>
                                </div>
                                <div className="border-t py-1">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Đăng xuất</a>
                                </div>
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </header>

    )
}

export default MyHeader