import React from 'react'

const Footer = () => {
    return (
        <footer className="w-screen bg-linear-to-tr from-blue-600 via-blue-500 to-blue-400 text-white py-12 relative overflow-hidden">
            {/* Hiệu ứng nền bay nhẹ giống hero */}
            <div className="absolute top-10 right-20 w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-300 rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>

            <div className="px-4 lg:px-16 xl:px-24 relative z-10">
                <div className="grid md:grid-cols-[auto_1fr_1fr] gap-8 mb-8">

                    {/* Logo */}
                    <div className="flex justify-center md:justify-start">
                        <img src="/TVCLogo.webp" alt="TVC Logo" className='h-40 w-auto object-contain' />
                    </div>

                    {/* Thông tin liên hệ */}
                    <div>
                        <h3 className="font-bold mb-4">THÔNG TIN LIÊN HỆ</h3>
                        <p className="text-sm mb-2">
                            Địa chỉ: Số 2, Bùi Hữu Nghĩa, khóm Vĩnh Yên, phường Long Đức, tỉnh Vĩnh Long.
                        </p>
                        <div className="space-y-1 text-sm mt-3">
                            <p>📞 Điện thoại: 0294 3746 354 - 0294 2210 415</p>
                            <p>✉️ Email: tvc.tuyensinh@gmail.com</p>
                            <p>🏠 Website: cdntv.edu.vn</p>
                        </div>
                    </div>

                    {/* Địa chỉ cơ sở */}
                    <div>
                        <h3 className="font-bold mb-4">ĐỊA CHỈ CƠ SỞ</h3>
                        <p className="text-sm mb-2">Cơ sở 2: Số 99, Phạm Ngũ Lão, phường Trà Vinh, tỉnh Vĩnh Long</p>
                        <p className="text-sm mb-2">Cơ sở 3: Ấp Xa Xi, xã Trà Cú, tỉnh Vĩnh Long.</p>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-6 text-center text-sm">
                    <p>Copyright © 2025 Trường Cao đẳng nghề Trà Vinh.</p>
                </div>
            </div>

            {/* Hiệu ứng animation */}
            <style >{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </footer>
    )
}

export default Footer
