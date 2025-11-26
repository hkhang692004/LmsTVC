import React, { useState, useRef } from 'react'
import { useLocation } from "react-router-dom"
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar'
import mockSections from '@/mocks/mockSections'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import Breadcrumb from '@/components/myui/Breadcrump'
import formatDateTime from '@/components/myui/FormatDateTime'

import { MdOutlineChat } from "react-icons/md"
import { FaUser } from "react-icons/fa"
import ReplyForm from '@/components/myui/ReplyForm'


const ForumContent = () => {
  const location = useLocation();
  const title = location.state?.title;
  const courseName = location.state?.courseName;
  const post = location.state?.post;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('oldest');
  const [replyContent, setReplyContent] = useState('');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replySubject, setReplySubject] = useState('');

  const replyRefs = useRef({});
  const postRef = useRef(null);

  const sortedReplies = post?.repliesList ? [...post.repliesList].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date) - new Date(a.date);
    }
    return new Date(a.date) - new Date(b.date);
  }) : [];

  const handleSubmitReply = (e) => {
    e.preventDefault();
    // Xử lý gửi phúc đáp
    console.log('Reply content:', replyContent);
    console.log('Reply subject:', replySubject);
    setReplyContent('');
    setReplySubject('');
    setShowReplyForm(false);
    setIsAdvancedMode(false);
  };

  const handleShowReplyForm = () => {
    setShowReplyForm(true);
    setTimeout(() => {
      document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Hàm cuộn tới bài viết gốc
  const scrollToPost = () => {
    if (postRef.current) {
      postRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      postRef.current.classList.add('ring-2', 'ring-blue-400');
      setTimeout(() => {
        postRef.current.classList.remove('ring-2', 'ring-blue-400');
      }, 2000);
    }
  };

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

        <div
          className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className='w-full space-y-6 px-4 lg:px-10'>
            <div className="flex flex-col my-10 lg:my-20 space-y-6">
              <Breadcrumb
                courseName={courseName}
                itemName={title}
              />
              <div className='flex items-center space-x-3'>
                <MdOutlineChat className="text-pink-400 w-8 h-8" />
                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                  {post?.title || title}
                </h2>
              </div>

              {/* Thanh sắp xếp */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-gray-700 font-medium">Hiển thị phúc đáp theo kiểu:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="oldest">Cũ trước</option>
                    <option value="newest">Mới trước</option>
                  </select>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    ← Quay lại
                  </button>
                </div>
              </div>

              {/* Bài viết gốc */}
              {post && (
                <div
                  ref={postRef}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <FaUser className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <h3 className="text-xl font-bold text-orange-500 mb-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Bởi <span className="text-blue-600 hover:underline cursor-pointer">{post.author}</span> - {formatDateTime(post.date)}
                        </p>
                      </div>
                      <div className="text-gray-700 mt-4 whitespace-pre-line">
                        {post.content}
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <button
                          onClick={handleShowReplyForm}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Phúc đáp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách replies */}
              <div className="space-y-4">
                {sortedReplies.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    Chưa có phúc đáp nào
                  </div>
                ) : (
                  sortedReplies.map((reply) => (
                    <div
                      key={reply.id}
                      ref={el => replyRefs.current[reply.id] = el}
                      className="bg-white rounded-lg shadow border border-gray-200 p-6 ml-8 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                          <FaUser className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-2">
                            <h4 className="font-semibold text-orange-500 mb-1">
                              Trả lời: {post?.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Bởi <span className="text-blue-600 hover:underline cursor-pointer">{reply.author}</span> - {formatDateTime(reply.date)}
                            </p>
                          </div>
                          <div className="text-gray-700 mt-3 whitespace-pre-line">
                            {reply.content}
                          </div>
                          <div className="mt-4 flex items-center gap-4 flex-wrap">
                            <button
                              onClick={scrollToPost}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Xem bài được phúc đáp
                            </button>
                            <button
                              onClick={handleShowReplyForm}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Phúc đáp
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form trả lời - component tách riêng */}
              {showReplyForm && (
                <ReplyForm
                  isAdvancedMode={isAdvancedMode}
                  setIsAdvancedMode={setIsAdvancedMode}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  replySubject={replySubject}
                  setReplySubject={setReplySubject}
                  onCancel={() => {
                    setReplyContent('');
                    setReplySubject('');
                    setShowReplyForm(false);
                    setIsAdvancedMode(false);
                  }}
                  onSubmit={handleSubmitReply}
                />
              )}

            </div>
          </div>
          <ScrollToTop />
          <MyFooter />
        </div>
      </div>
    </>
  )
}

export default ForumContent;
