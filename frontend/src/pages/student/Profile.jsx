import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MyHeader from '@/components/myui/MyHeader';
import MyFooter from '@/components/myui/MyFooter';
import { toast } from 'sonner';
import useUserStore from '@/stores/useUserStore';
import axiosClient from '@/lib/axios';

const Profile = () => {
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);
    const setUser = useUserStore(state => state.setUser);

    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [avatarFile, setAvatarFile] = useState(null);

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Sync avatarPreview when user.avatar changes
    useEffect(() => {
        if (user?.avatar) {
            setAvatarPreview(user.avatar);
        }
    }, [user?.avatar]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước file không được vượt quá 5MB');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file ảnh');
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateAvatar = async () => {
        if (!avatarFile) {
            toast.error('Vui lòng chọn ảnh mới');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            

            const response = await axiosClient.put('/api/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            

            const updatedUser = response.data?.data;
            
            if (!updatedUser || !updatedUser.avatar) {
                throw new Error('Không nhận được URL avatar từ server');
            }

            // Update store
            setUser(updatedUser);
            
            // Force reload user data from server to ensure sync
            setTimeout(async () => {
                try {
                    const profileResponse = await axiosClient.get('/api/users/profile');
                    const latestUser = profileResponse.data?.data;
                    if (latestUser) {
                        setUser(latestUser);
                        setAvatarPreview(latestUser.avatar);
                       
                    }
                } catch (reloadError) {
                    console.error('Failed to reload user data:', reloadError);
                }
            }, 500);
            
            // Update preview
            setAvatarPreview(updatedUser.avatar);
            setAvatarFile(null);
            
            console.log('Avatar updated:', updatedUser.avatar);
            toast.success('Cập nhật ảnh đại diện thành công');
        } catch (error) {
            console.error('Error updating avatar:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Cập nhật ảnh đại diện thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setPasswordLoading(true);
            await axiosClient.post('/api/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success('Đổi mật khẩu thành công');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordForm(false);
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setPasswordLoading(false);
        }
    };

    const getAvatarDisplay = () => {
        if (avatarPreview) {
            return (
                <img 
                    src={avatarPreview} 
                    alt="avatar" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                />
            );
        }
        
        const initials = user?.ten?.charAt(0).toUpperCase() || '?';
        const bgColor = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500'][
            (user?.id?.charCodeAt(0) || 0) % 4
        ];
        
        return (
            <div className={`w-32 h-32 rounded-full ${bgColor} flex items-center justify-center text-white text-5xl font-semibold border-4 border-blue-500`}>
                {initials}
            </div>
        );
    };

    return (
        <>
            <MyHeader />
            
            <div className="min-h-screen bg-gray-50 pt-20 pb-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                        <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và bảo mật</p>
                    </div>

                    {/* Avatar Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ảnh đại diện</h2>
                        
                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0">
                                {getAvatarDisplay()}
                            </div>

                            <div className="flex-1">
                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="avatar-upload"
                                            className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition"
                                        >
                                            Chọn ảnh mới
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2">
                                            JPG, PNG hoặc GIF. Tối đa 5MB
                                        </p>
                                    </div>

                                    {avatarFile && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleUpdateAvatar}
                                                disabled={loading}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                                            >
                                                {loading ? 'Đang cập nhật...' : 'Cập nhật ảnh'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAvatarFile(null);
                                                    setAvatarPreview(user?.avatar || null);
                                                }}
                                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Info (Read-only) */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    value={user?.ten || ''}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vai trò
                                </label>
                                <input
                                    type="text"
                                    value={
                                        user?.role === 'sinhVien' ? 'Sinh viên' :
                                        user?.role === 'giangVien' ? 'Giảng viên' :
                                        user?.role === 'admin' ? 'Quản trị viên' : ''
                                    }
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mt-4">
                            * Để thay đổi thông tin cá nhân, vui lòng liên hệ quản trị viên
                        </p>
                    </div>

                    {/* Password Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Bảo mật</h2>
                            {!showPasswordForm && (
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                                >
                                    Đổi mật khẩu
                                </button>
                            )}
                        </div>

                        {showPasswordForm && (
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mật khẩu hiện tại
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            currentPassword: e.target.value
                                        })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value
                                        })}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value
                                        })}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {passwordLoading ? 'Đang lưu...' : 'Lưu mật khẩu'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                        }}
                                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        )}

                        {!showPasswordForm && (
                            <p className="text-sm text-gray-500">
                                Để bảo mật tài khoản, bạn nên thay đổi mật khẩu định kỳ
                            </p>
                        )}
                    </div>

                </div>
            </div>

            <MyFooter />
        </>
    );
};

export default Profile;
