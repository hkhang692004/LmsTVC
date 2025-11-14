import ScrollToTop from '@/components/myui/ScrollToTop'
import Header from '@/components/base/Header'
import Footer from '@/components/base/Footer'
import { useNavigate } from 'react-router'

const StartPage = () => {

    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <Header />

            {/* Main nội dung */}
            <main >
                {/* Hero Section  */}
                <section className="relative bg-linear-to-br from-blue-600 via-blue-500 to-blue-400 pt-32 pb-20 overflow-hidden">
                    {/* Các vòng tròn bay */}
                    <div className="absolute top-20 right-20 w-32 h-32 bg-blue-400 rounded-full opacity-30 animate-float"></div>
                    <div
                        className="absolute top-40 right-60 w-24 h-24 bg-blue-300 rounded-full opacity-20 animate-float"
                        style={{ animationDelay: '1s' }}
                    ></div>
                    <div
                        className="absolute bottom-20 left-20 w-40 h-40 bg-blue-400 rounded-full opacity-20 animate-float"
                        style={{ animationDelay: '2s' }}
                    ></div>

                    {/* Nội dung hero */}
                    <div className="container mx-auto px-4 mt-20 text-center relative z-10">
                        <h2 className="text-4xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
                            HỆ THỐNG HỖ TRỢ HỌC TẬP
                        </h2>
                        <h3
                            className="text-3xl md:text-3xl font-bold text-white mb-8 animate-fade-in"
                            style={{ animationDelay: '0.2s' }}
                        >
                            LMS TVC
                        </h3>

                    </div>
                    <div className='flex flex-row items-center justify-center px-10 '>
                        <div className='flex flex-col relative my-50 '>
                            <hr className="w-48 h-1 bg-linear-to-r from-orange-400 via-orange-300 to-pink-400 border-0 rounded-sm  " />
                            <h2 className='text-white text-2xl font-bold my-4'>ĐĂNG NHẬP NGAY</h2>
                            <h3 className=' text-x text-gray-400 mb-4'>TVCID là tài khoản dùng chung cho tất cả trong hệ thống LMS</h3>
                            <button type="button" onClick={() => navigate("/signin")} className="text-white bg-linear-to-br from-pink-500 to-orange-400 hover:bg-linear-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-xs ">Đăng nhập bằng tài khoản TVCID</button>
                        </div>
                        <div className='flex relative my-50'>
                            <img src="DIYLogo.png" alt="Image" className='h-70 w-auto' ></img>
                        </div>
                    </div>
                </section>

            </main>
            <ScrollToTop />
            {/* Footer */}
            <Footer />

            {/* Hiệu ứng animation */}
            <style >{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
        </div>
    )
}

export default StartPage
