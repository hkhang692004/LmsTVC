import React, { useState } from 'react'
import { Bell, MessageSquare, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import useUserStore from '@/stores/useUserStore';
import axiosClient from '@/lib/axios';
import { toast } from 'sonner';

const MyHeader = () => {
    const navigate = useNavigate();
    const [openDropDown, setOpenDropDown] = useState(null);
    const user = useUserStore(state => state.user);
    const clearUser = useUserStore(state => state.clearUser);
    const avatar = user?.avatar || null;
    
    // Avatar default: vòng tròn + chữ cái đầu của tên
    const getAvatarDisplay = () => {
      if (avatar) {
        return (
          <img 
            src={avatar} 
            alt="avatar" 
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      }
      
      // Avatar default - chữ cái đầu của TÊN (từ cuối cùng)
      const userName = user?.ten?.trim() || user?.name?.trim() || user?.hoTen?.trim() || user?.email?.split('@')[0] || '';
      
      // Get first character of last word (Vietnamese name pattern: Họ Đệm Tên)
      let initials = '?';
      if (userName && userName.length > 0) {
        const nameParts = userName.trim().split(/\s+/); // Split by whitespace
        const firstName = nameParts[nameParts.length - 1]; // Get last word (Tên)
        initials = firstName.charAt(0).toUpperCase();
      } else if (user?.email) {
        initials = user.email.charAt(0).toUpperCase();
      } else if (user?.role) {
        initials = user.role.charAt(0).toUpperCase();
      }
      
      // Random color based on user id/email (consistent for same user)
      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'];
      const seedString = user?.id || user?.email || userName || 'default';
      
      // Simple hash function to get consistent color for same user
      let hash = 0;
      for (let i = 0; i < seedString.length; i++) {
        hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
      }
      const colorIndex = Math.abs(hash) % colors.length;
      const bgColor = colors[colorIndex];
      
      return (
        <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-sm font-semibold`}>
          {initials}
        </div>
      );
    };

    const handleLogout = async () => {
        try {
            await axiosClient.post('/api/users/logout');
            clearUser();
            toast.success('Đăng xuất thành công');
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Clear user even if API fails
            clearUser();
            navigate('/');
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-blue-500 py-2 shadow-md">
            <div className="flex justify-between items-center max-w-8xl mx-7 px-6">
                {/* Left: Text */}
                <a href="/mycourse" className="block w-fit">
                    <div className="flex flex-row items-center gap-2">
                        <img
                            src="/TVCLogo.webp"
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
                             {getAvatarDisplay()}
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                                <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                            </svg>
                        </div>
                        {openDropDown === "userMenu" && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border overflow-hidden">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setOpenDropDown(null);
                                            navigate('/profile');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Hồ sơ
                                    </button>
                                </div>
                                <div className="border-t py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Đăng xuất
                                    </button>
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