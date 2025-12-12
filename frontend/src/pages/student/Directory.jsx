import React, { useState, useEffect } from 'react'
import { motion as Motion } from 'framer-motion'
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import { GoFileDirectory } from "react-icons/go";
import { HiChevronDown } from 'react-icons/hi'
import Breadcrumb from '@/components/myui/Breadcrump'
import { useParams } from 'react-router-dom'
import { FaFile, FaDownload } from "react-icons/fa";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { FiFileText } from 'react-icons/fi'
import { PiMicrosoftWordLogoFill } from 'react-icons/pi'
import { BsFiletypePdf } from 'react-icons/bs'
import useClassStore from '@/stores/useClassStore';
import axiosClient from '@/lib/axios';
import { toast } from 'sonner';

// Helper to get icon by file type
const getIconByMimeType = (mimeType, fileName) => {
    if (!mimeType && !fileName) return <FaFile className="text-gray-500 w-4 h-4" />;
    
    const ext = fileName?.split('.').pop()?.toLowerCase();
    
    if (mimeType?.includes('pdf') || ext === 'pdf') {
        return <BsFiletypePdf className="text-red-500 w-4 h-4" />;
    }
    if (mimeType?.includes('word') || mimeType?.includes('document') || ['doc', 'docx'].includes(ext)) {
        return <PiMicrosoftWordLogoFill className="text-blue-500 w-4 h-4" />;
    }
    if (mimeType?.includes('text') || ['txt', 'md'].includes(ext)) {
        return <FiFileText className="text-gray-500 w-4 h-4" />;
    }
    if (mimeType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return <FaFile className="text-green-500 w-4 h-4" />;
    }
    if (mimeType?.includes('video') || ['mp4', 'avi', 'mov'].includes(ext)) {
        return <FaFile className="text-purple-500 w-4 h-4" />;
    }
    
    return <FaFileCircleQuestion className="text-gray-500 w-4 h-4" />;
};

// Helper to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const Directory = () => {
  const { id: folderId } = useParams();
  const selectedClass = useClassStore(state => state.selectedClass);
  const selectedContent = useClassStore(state => state.selectedContent);
  
  const folderName = selectedContent?.ten || 'Thư mục';
  const courseName = selectedClass?.tenLop || 'Không xác định';
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Fetch folder data và files từ API
  useEffect(() => {
    if (folderId) {
      const fetchFolderData = async () => {
        try {
          setLoading(true);
          
          // Lấy thông tin folder
          const folderResponse = await axiosClient.get(`/api/content/${folderId}`);
          const folderData = folderResponse.data?.data;
          setFolder(folderData);
          
          // Lấy các files trong folder (children của folder này có loaiNoiDung = 'taiLieu')
          const filesResponse = await axiosClient.get(`/api/content/${folderId}/files`);
          const filesData = filesResponse.data?.data || [];
          setFiles(filesData);
          
          setError(null);
        } catch (err) {
          console.error('Error fetching folder data:', err);
          setError('Không thể tải dữ liệu thư mục');
          setFiles([]);
        } finally {
          setLoading(false);
        }
      };
      fetchFolderData();
    }
  }, [folderId]);

  // Download single file
  const handleDownloadFile = (fileId, fileName) => {
    const downloadUrl = `/api/content/files/${fileId}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Đang tải ${fileName}...`);
  };

  // Download all files in folder
  const handleDownloadFolder = async () => {
    if (files.length === 0) {
      toast.error('Thư mục trống, không có file để tải');
      return;
    }

    setDownloading(true);
    toast.info(`Đang tải ${files.length} file...`);

    try {
      // Download each file sequentially with delay
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.chiTiets && file.chiTiets.length > 0) {
          for (const detail of file.chiTiets) {
            handleDownloadFile(detail.id, detail.fileName);
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      toast.success('Tải thư mục thành công!');
    } catch (err) {
      console.error('Error downloading folder:', err);
      toast.error('Có lỗi khi tải thư mục');
    } finally {
      setDownloading(false);
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

        <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className='w-full space-y-6 px-4 lg:px-10'>
            <div className="flex flex-col my-10 lg:my-20 space-y-6">
              
              <Breadcrumb courseName={courseName} itemName={folderName} />

              <div className='flex items-center space-x-3'>
                <GoFileDirectory className='w-8 h-8 text-yellow-600' />
                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                  {folder?.tieuDe || folderName}
                </h2>
              </div>

              {/* Description if exists */}
              {folder?.noiDung && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: folder.noiDung }}
                  />
                </div>
              )}

            <div className='flex flex-row space-x-6 justify-between '>
              <div className='flex flex-col mt-8 flex-1'>
                
                {/* Toggle mở/đóng */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-200 rounded-md w-fit"
                >
                  <Motion.span
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    <HiChevronDown className="w-5 h-5 text-gray-500" />
                  </Motion.span>
                  <GoFileDirectory className="w-5 h-5 text-yellow-600" />
                </button>

                {/* Danh sách file dạng dotted */}
                {isOpen && (
                  <ul id="file-list" className="mt-1.5 space-y-3 relative ml-9">

                    {/* Dòng dọc nét đứt chính - căn với icon folder */}
                    <span className="absolute left-4 top-0 bottom-3 w-0.5 border-l-2 border-dotted border-gray-400"></span>

                    {loading ? (
                      <li className="text-gray-500 text-sm pl-8">Đang tải file...</li>
                    ) : error ? (
                      <li className="text-red-500 text-sm pl-8">{error}</li>
                    ) : files.length === 0 ? (
                      <li className="text-gray-500 text-sm pl-8">Thư mục trống</li>
                    ) : (
                      files.map((file) => (
                        <li key={file.id} className="relative pl-8">
                          {/* Đường ngang chữ L nét đứt */}
                          <span className="absolute left-4 top-6.5 w-5 border-t-2 border-dotted border-gray-400"></span>

                          <div 
                            onClick={() => file.chiTiets && file.chiTiets.length > 0 && handleDownloadFile(file.chiTiets[0].id, file.chiTiets[0].fileName)}
                            className="flex items-center justify-between group hover:bg-blue-50 p-2 rounded-md cursor-pointer transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {file.chiTiets && file.chiTiets.length > 0 && getIconByMimeType(file.chiTiets[0].fileType, file.chiTiets[0].fileName)}
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-800 truncate">
                                  {file.chiTiets && file.chiTiets.length > 0 ? file.chiTiets[0].fileName : file.tieuDe}
                                </span>
                                {file.chiTiets && file.chiTiets.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {formatFileSize(file.chiTiets[0].fileSize)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Download icon */}
                            {file.chiTiets && file.chiTiets.length > 0 && (
                              <FaDownload className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </li>
                      ))
                    )}

                  </ul>
                )}
              </div>

              <button 
                onClick={handleDownloadFolder}
                disabled={downloading || files.length === 0}
                className='flex items-center h-12 mt-8 justify-center gap-2 px-6 py-2 bg-orange-500 hover:bg-blue-400 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-lg rounded-md transition-colors'
              >
                <FaDownload className="w-5 h-5" />
                {downloading ? 'Đang tải...' : 'Tải thư mục về'}
              </button>
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

export default Directory
