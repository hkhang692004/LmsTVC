import React, { useState, useRef, useEffect } from 'react'

import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import Breadcrumb from '@/components/myui/Breadcrump'
import formatDateTime from '@/components/myui/FormatDateTime'

import { MdOutlineChat } from "react-icons/md"
import { FaUser, FaFile, FaDownload } from "react-icons/fa"
import ReplyForm from '@/components/myui/ReplyForm'
import useClassStore from '@/stores/useClassStore';
import axiosClient from '@/lib/axios';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Component to display file list
const FileList = ({ files }) => {
  if (!files || files.length === 0) return null;

  const handleDownload = (fileId, fileName) => {
    // Use backend download endpoint for correct filename
    const downloadUrl = `/api/content/files/${fileId}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <FaFile className="text-blue-500" />
        Tập tin đính kèm ({files.length})
      </h5>
      <div className="space-y-2">
        {files.map((file) => (
          <button
            key={file.id}
            onClick={() => handleDownload(file.id, file.fileName)}
            className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors group text-left"
          >
            <FaFile className="text-gray-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
                {file.fileName}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.fileSize)}
              </p>
            </div>
            <FaDownload className="text-blue-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};

// Component to display replies (no nested)
const ReplyItem = ({ reply, post, onReplyClick, replyRefs, scrollToPost }) => {
  // Get parent title - if reply is replying to post, show post title; if replying to another reply, show that reply's title
  let parentTitle = post?.tieuDe || post?.title || 'Bài viết gốc';
  
  // If reply has parentContent info, use that title instead
  if (reply.noiDungCha?.tieuDe) {
    parentTitle = reply.noiDungCha.tieuDe;
  }

  // Scroll to parent content (either post or parent reply)
  const handleScrollToParent = () => {
    if (reply.idNoiDungCha === post?.id) {
      // Parent is the main post
      scrollToPost();
    } else {
      // Parent is another reply - scroll to it
      const parentReplyId = reply.idNoiDungCha;
      if (replyRefs.current[parentReplyId]) {
        replyRefs.current[parentReplyId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        replyRefs.current[parentReplyId].classList.add('ring-2', 'ring-blue-400');
        setTimeout(() => {
          replyRefs.current[parentReplyId]?.classList.remove('ring-2', 'ring-blue-400');
        }, 2000);
      }
    }
  };
  
  return (
    <div
      key={reply.id}
      ref={el => replyRefs.current[reply.id] = el}
      className="bg-white rounded-lg shadow border border-gray-200 p-6 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
          <FaUser className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="mb-2">
            <h4 className="font-semibold text-orange-500 mb-1">
              Trả lời: 
              <span className="text-gray-700 ml-2">{parentTitle}</span>
            </h4>
            <p className="text-sm text-gray-600">
              Bởi <span className="text-blue-600 hover:underline cursor-pointer">{reply.nguoiTao?.ten || 'Không xác định'}</span> - {formatDateTime(reply.ngayTao || reply.date)}
            </p>
          </div>
          <div 
            className="text-gray-700 mt-3 whitespace-pre-line prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_a]:text-blue-600 [&_a]:hover:underline [&_code]:bg-gray-200 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-md [&_blockquote]:border-l-4 [&_blockquote]:border-gray-400 [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: reply.noiDung || reply.content }}
          />
          <FileList files={reply.chiTiets} />
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <button
              onClick={handleScrollToParent}
              className="text-blue-600 hover:underline text-sm"
            >
              Xem bài được phúc đáp
            </button>
            <button
              onClick={() => onReplyClick(reply.id, reply.tieuDe)}
              className="text-blue-600 hover:underline text-sm"
            >
              Phúc đáp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ForumContent = () => {
  const { id: postId } = useParams();
  const selectedClass = useClassStore(state => state.selectedClass);
  const selectedContent = useClassStore(state => state.selectedContent);
  
  const title = selectedContent?.ten;
  const courseName = selectedClass?.tenLop;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('oldest');
  const [replyContent, setReplyContent] = useState('');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyToId, setReplyToId] = useState(null); // reply to post or specific reply
  const [replyToTitle, setReplyToTitle] = useState(''); // title of the item being replied to

  const replyRefs = useRef({});
  const postRef = useRef(null);

  // Fetch post và replies từ endpoint /comments
  useEffect(() => {
    if (postId) {
      const fetchPostAndReplies = async () => {
        try {
          const response = await axiosClient.get(`/api/content/${postId}/comments`);
          const data = response.data?.data;
          
          // Endpoint trả về object với post và replies
          if (data) {
            if (data.post) {
              console.log('[ForumContent] Fetched post:', data.post);
              setPost(data.post);
            }
            if (data.replies) {
              console.log('[ForumContent] Fetched replies:', data.replies);
              setReplies(data.replies || []);
            }
          }
        } catch (err) {
          console.error('Error fetching post and replies:', err);
          setPost(null);
          setReplies([]);
        }
      };

      fetchPostAndReplies();
    }
  }, [postId]);

  const sortedReplies = replies ? [...replies].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.ngayTao) - new Date(a.ngayTao);
    }
    return new Date(a.ngayTao) - new Date(b.ngayTao);
  }) : [];

  const handleSubmitReply = async (e, replyData) => {
    e.preventDefault();
    
    try {
      const { subject, content, files } = replyData;
      const formData = new FormData();
      formData.append('tieuDe', subject || `Trả lời: ${replyToTitle}`);
      formData.append('noiDung', content);
      formData.append('loaiNoiDung', 'phucDap');
      formData.append('idNoiDungCha', replyToId || postId); // reply to post or another reply
      formData.append('idChuDe', post?.idChuDe);
      
      // Append files if any
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }
      
      const response = await axiosClient.post(`/api/content`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.data) {
        // Add new reply to list
        setReplies([...replies, response.data.data]);
        
        // Reset form
        setReplyContent('');
        setReplySubject('');
        setReplyToId(null);
        setReplyToTitle('');
        setShowReplyForm(false);
        setIsAdvancedMode(false);
        
        // Show success notification
        if (files && files.length > 0) {
          toast.success(`Phúc đáp được gửi thành công với ${files.length} tập tin!`);
        } else {
          toast.success('Phúc đáp được gửi thành công!');
        }
      }
    } catch (err) {
      console.error('Error submitting reply:', err.response?.data || err.message);
      toast.error('Không thể gửi phúc đáp. Vui lòng thử lại.');
    }
  };

  const handleShowReplyForm = (targetId = null, targetTitle = '') => {
    setReplyToId(targetId);
    setReplyToTitle(targetTitle);
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
          isOpen={sidebarOpen}
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
                  {title}
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
                  {console.log('[ForumContent] Rendering post:', { id: post.id, tieuDe: post.tieuDe, title: post.title, nguoiTao: post.nguoiTao?.ten })}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <FaUser className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <h3 
                          className="text-xl font-bold text-orange-500 mb-1"
                          dangerouslySetInnerHTML={{ __html: post.title || post.tieuDe }}
                        />
                        <p className="text-sm text-gray-600">
                          Bởi <span className="text-blue-600 hover:underline cursor-pointer">{post.nguoiTao?.ten || 'Không xác định'}</span> - {formatDateTime(post.ngayTao || post.date)}
                        </p>
                      </div>
                      <div 
                        className="text-gray-700 mt-4 whitespace-pre-line prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_a]:text-blue-600 [&_a]:hover:underline [&_code]:bg-gray-200 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-md [&_blockquote]:border-l-4 [&_blockquote]:border-gray-400 [&_blockquote]:pl-4 [&_blockquote]:italic"
                        dangerouslySetInnerHTML={{ __html: post.noiDung || post.content }}
                      />
                      <FileList files={post.chiTiets} />
                      <div className="mt-4 flex items-center gap-4">
                        <button
                          onClick={() => handleShowReplyForm(postId, post?.tieuDe || post?.title)}
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
                    <ReplyItem
                      key={reply.id}
                      reply={reply}
                      post={post}
                      onReplyClick={(id, title) => handleShowReplyForm(id, title)}
                      replyRefs={replyRefs}
                      scrollToPost={scrollToPost}
                    />
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
                  replyToTitle={replyToTitle}
                  onCancel={() => {
                    setReplyContent('');
                    setReplySubject('');
                    setReplyToId(null);
                    setReplyToTitle('');
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
