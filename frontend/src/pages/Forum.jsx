import {React,useState} from 'react'
import CourseSidebar,{SidebarToggle} from '@/components/myui/CourseSidebar'
import mockSections from '@/mocks/mockSections'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import {useLocation,useNavigate} from "react-router-dom"
import  {MdOutlineChat}  from "react-icons/md";
import Breadcrumb from '@/components/myui/Breadcrump'
import { FaSearch, FaStar, FaUser } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi";
import mockForumPosts from '@/mocks/mockForum'




const Forum = () => {
      const location = useLocation();
      const title = location.state?.title;  
      const courseName = location.state?.courseName;
      const text = location.state?.text;
         const navigate = useNavigate();
   const handleClick = () =>{
        navigate("/ForumContent",{
          state:{
            title: title,
            courseName:courseName,
            
          }
        });

   }

      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [searchQuery, setSearchQuery] = useState('');
      const [posts, setPosts] = useState(mockForumPosts);

      const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
 <>
      {/* Fixed Header */}
      <MyHeader />

      {/* Toggle Button for Mobile */}
      <SidebarToggle onClick={() => setSidebarOpen(true)} />

      <div className='flex pt-16'>
        {/* Sidebar */}
        <CourseSidebar
          sections={mockSections}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div
          className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className='w-full space-y-6 px-4 lg:px-10'>
            <div className="flex flex-col my-10 lg:my-20 space-y-6">
              <Breadcrumb
                courseName={courseName}
                itemName={title}
              />
              <div className='flex items-center space-x-3'>
                <MdOutlineChat className="text-pink-400 w-8 h-8"/>
                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                  {`${title}`}
                </h2>
              </div>

              {/* ============ PHẦN NỘI DUNG DIỄN ĐÀN - BẮT ĐẦU ============ */}
              <div className="space-y-6">
                {/* Phần hướng dẫn */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 whitespace-pre-line">
                    <p className="text-gray-600 text-lg">
                    {text || "Không có nội dung."}
              </p>
              </div>
                {/* Thanh tìm kiếm và nút action */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-md">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Tìm kiếm theo tên"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-orange-500 transition-colors">
                      <FaSearch className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-orange-500 transition-colors whitespace-nowrap">
                      Thêm một chủ đề thảo luận mới
                    </button>

                  </div>
                </div>

                {/* Bảng danh sách bài viết */}
                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                  {/* Header của bảng */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-gray-100 border-b font-semibold text-gray-700">
                    <div className="col-span-5">Thảo luận</div>
                    <div className="col-span-2">Người khởi tạo</div>
                    <div className="col-span-2 flex items-center gap-2">
                      Phúc đáp <HiChevronDown className="w-4 h-4" />
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      Bài viết gần đây nhất <HiChevronDown className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Nội dung bảng */}
                  <div className="divide-y">
                    {filteredPosts.length === 0 ? (
                      <div className="px-6 py-12 text-center text-gray-500">
                        Không tìm thấy bài viết nào
                      </div>
                    ) : (
                      filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                            !post.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          {/* Desktop layout */}
                          <div className="hidden lg:grid lg:grid-cols-12 gap-4">
                            {/* Tiêu đề thảo luận */}
                            <div className="col-span-5 flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <a className='block w-fit' onClick={handleClick}>
                                <h3 className="font-semibold text-blue-600 hover:underline cursor-pointer">
                                  {post.title}
                                </h3>
                                </a>
                              </div>
                            </div>

                            {/* Người khởi tạo */}
                            <div className="col-span-2 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <FaUser className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-sm text-gray-700 truncate">{post.author}</span>
                            </div>

                            {/* Số phúc đáp */}
                            <div className="col-span-2 flex items-center">
                              <span className="text-gray-700">{post.replies}</span>
                            </div>

                            {/* Bài viết gần nhất */}
                            <div className="col-span-3 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                                <FaUser className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-gray-700 truncate">{post.author}</span>
                                <span className="text-xs text-gray-500">{post.date}</span>
                              </div>
                            </div>
                          </div>

                          {/* Mobile layout */}
                          <div className="lg:hidden space-y-3">
                            <div className="flex items-start gap-3">

                              <h3 className="font-semibold text-blue-600 hover:underline cursor-pointer flex-1">
                                {post.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaUser className="w-4 h-4" />
                              <span>{post.author}</span>
                              <span>•</span>
                              <span>{post.replies} phúc đáp</span>
                            </div>
                            <div className="text-xs text-gray-500">{post.date}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
             

            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
      <MyFooter />
    </>
  )
}

export default Forum