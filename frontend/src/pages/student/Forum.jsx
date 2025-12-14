import React, { useState, useEffect } from 'react';
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import { useNavigate, useParams } from "react-router-dom"
import { MdOutlineChat } from "react-icons/md";
import Breadcrumb from '@/components/myui/Breadcrump'
import { FaSearch, FaUser } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi";
import formatDateTime from '@/components/myui/FormatDateTime'
import NewTopicForm from '@/components/myui/NewTopicForm';
import useClassStore from '@/stores/useClassStore';
import axiosClient from '@/lib/axios';
import { toast } from 'sonner';

const Forum = () => {
  const { id: _forumId } = useParams();  // Get contentId from URL (for future API fetch)
  const navigate = useNavigate();
  const selectedClass = useClassStore(state => state.selectedClass);
  const selectedContent = useClassStore(state => state.selectedContent);
 
  // Use store data if available (cache), fallback to empty values
  const title = selectedContent?.tieuDe || selectedContent?.ten || 'Phúc đáp';
  const courseName = selectedClass?.tenLop || 'Không xác định';
  const text = selectedContent?.text || '';

  // Sync store with URL on back button
  useEffect(() => {
   
  }, [_forumId]);

  const handleClick = (post) => () => {
    navigate(`/ForumContent/${post.id}`);
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [topicId, setTopicId] = useState(null); // Store topic ID from parent content

  // Fetch forum posts và topic ID từ API khi component mount hoặc contentId thay đổi
  useEffect(() => {
    if (_forumId) {
      const fetchPosts = async () => {
        try {
          setLoading(true);
          
          // Fetch parent content để lấy idChuDe
          const contentResponse = await axiosClient.get(`/api/content/${_forumId}`);
          const parentContent = contentResponse.data?.data;
          if (parentContent?.idChuDe) {
            setTopicId(parentContent.idChuDe);
           
          }
          
          // Fetch posts - use /posts endpoint for direct children only
          const response = await axiosClient.get(`/api/content/${_forumId}/posts`);
          const data = response.data?.data;
          
          // Handle response structure { post, replies }
          if (data && data.replies) {
            setPosts(data.replies || []);
          } else if (Array.isArray(data)) {
            // Fallback if still array format
            setPosts(data);
          } else {
            setPosts([]);
          }
          setError(null);
        } catch (err) {
          console.error('Error fetching forum posts:', err);
          setError('Không thể tải danh sách bài viết');
          setPosts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [_forumId]);

  // Lọc bài viết dựa vào searchQuery (đã xác nhận)
  const filteredPosts = posts.filter(post => {
    const postTitle = post.tieuDe || post.title || '';
    const postAuthor = post.nguoiTao?.ten || post.author || '';
    return (
      postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      postAuthor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Bắt sự kiện nhấn Enter trong input tìm kiếm
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchQuery(searchInput.trim());
    }
  }

  // Bấm nút tìm kiếm
  const handleSearchClick = () => {
    setSearchQuery(searchInput.trim());
  }

  const handleNewTopicSubmit = async ({ title, content, files = [] }) => {
    try {
      // Create FormData để gửi files + content
      const formData = new FormData();
      formData.append('tieuDe', title);
      formData.append('noiDung', content);
      formData.append('loaiNoiDung', 'phucDap');
      formData.append('idNoiDungCha', _forumId);
      formData.append('idChuDe', topicId);
      
      // Append files nếu có
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      // POST với FormData (axios sẽ set content-type tự động)
      const response = await axiosClient.post(`/api/content`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.data) {
        setPosts([response.data.data, ...posts]);
        setShowNewTopicForm(false);
        
        // Show success notification
        if (files.length > 0) {
          toast.success(`Bài thảo luận được đăng thành công với ${files.length} tập tin!`);
        } else {
          toast.success('Bài thảo luận đăng thành công!');
        }
      }
    } catch (err) {
      console.error('Error creating forum post:', err.response?.data || err.message);
      toast.error('Không thể tạo bài viết. Vui lòng thử lại.');
    }
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

        <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className='w-full space-y-6 px-4 lg:px-10'>
            <div className="flex flex-col my-10 lg:my-20 space-y-6">
              <Breadcrumb
                courseName={courseName}
                itemName={title}
              />
              <div className='flex items-center space-x-3'>
                <MdOutlineChat className="text-pink-400 w-8 h-8" />
                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">{title}</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_a]:text-blue-600 [&_a]:hover:underline [&_code]:bg-gray-200 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-md [&_blockquote]:border-l-4 [&_blockquote]:border-gray-400 [&_blockquote]:pl-4 [&_blockquote]:italic"
                    dangerouslySetInnerHTML={{ __html: text || "Không có nội dung." }}
                  />
                </div>

                {/* Thanh tìm kiếm và nút tạo chủ đề */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-md">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleSearchClick}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-orange-500 transition-colors"
                    >
                      <FaSearch className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => setShowNewTopicForm(!showNewTopicForm)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-orange-500 transition-colors whitespace-nowrap"
                    >
                      {showNewTopicForm ? "Đóng form tạo chủ đề" : "Thêm một chủ đề thảo luận mới"}
                    </button>
                  </div>
                </div>

                {/* Form tạo chủ đề mới */}
                {showNewTopicForm && (
                  <NewTopicForm
                    onSubmit={handleNewTopicSubmit}
                    onCancel={() => setShowNewTopicForm(false)}
                  />
                )}

                {/* Danh sách bài viết */}
                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
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

                  <div className="divide-y">
                    {loading ? (
                      <div className="px-6 py-12 text-center text-gray-500">
                        Đang tải bài viết...
                      </div>
                    ) : error ? (
                      <div className="px-6 py-12 text-center text-red-500">
                        {error}
                      </div>
                    ) : filteredPosts.length === 0 ? (
                      <div className="px-6 py-12 text-center text-gray-500">
                        Không tìm thấy bài viết nào
                      </div>
                    ) : (
                      filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="hidden lg:grid lg:grid-cols-12 gap-4">
                            <div className="col-span-5 flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <a className='block w-fit' onClick={handleClick(post)}>
                                  <h3 className="font-semibold text-blue-600 hover:underline cursor-pointer">
                                    {post.title || post.tieuDe}
                                  </h3>
                                </a>
                              </div>
                            </div>

                            <div className="col-span-2 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <FaUser className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-sm text-gray-700 truncate">{post.author || post.nguoiTao?.ten || 'Ẩn danh'}</span>
                            </div>

                            <div className="col-span-2 flex items-center">
                              <span className="text-gray-700">{post.replyCount || 0}</span>
                            </div>

                            <div className="col-span-3 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                                <FaUser className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-gray-700 truncate">{post.author || post.nguoiTao?.ten || 'Ẩn danh'}</span>
                                <span className="text-xs text-gray-500">{formatDateTime(post.date || post.ngayTao)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="lg:hidden space-y-3">
                            <div className="flex items-start gap-3">
                              <h3 className="font-semibold text-blue-600 hover:underline cursor-pointer flex-1" onClick={handleClick(post)}>
                                {post.title || post.tieuDe}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaUser className="w-4 h-4" />
                              <span>{post.author || post.nguoiTao?.ten || 'Ẩn danh'}</span>
                              <span>•</span>
                              <span>{post.replyCount || 0} phúc đáp</span>
                            </div>
                            <div className="text-xs text-gray-500">{formatDateTime(post.date || post.ngayTao)}</div>
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

export default Forum;
