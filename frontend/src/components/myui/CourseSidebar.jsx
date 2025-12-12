import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, Menu, MoreHorizontal } from 'lucide-react';
import { BsFiletypePdf } from "react-icons/bs";
import { FiFileText } from "react-icons/fi";
import { MdUploadFile, MdOutlineChat } from "react-icons/md";
import { FaLink } from "react-icons/fa6";
import { LuFileQuestion } from "react-icons/lu";
import { FaFilePen } from "react-icons/fa6";
import { Folder } from "lucide-react";
import { PiMicrosoftWordLogoFill } from "react-icons/pi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import useClassStore from '@/stores/useClassStore';
import axiosClient from '@/lib/axios';
import "../mycss/CourseSidebar.css";


const SidebarSection = ({ title, items, isOpen, onToggle }) => {
  const navigate = useNavigate();
  const setSelectedContent = useClassStore(state => state.setSelectedContent);

  // Trích xuất YouTube video ID từ URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleItemClick = (item) => {
    const type = item.loaiNoiDung || item.type;
    
    console.log("Item clicked:", item);
    console.log("Item type:", type);
    console.log("Item chiTiets:", item.chiTiets);
    
    // Kiểm tra nếu là YouTube video
    const isYouTube = item.chiTiets && item.chiTiets.length > 0 &&
                     item.chiTiets[0].loaiChiTiet === 'video' && 
                     (item.chiTiets[0].filePath?.includes('youtube.com') || item.chiTiets[0].filePath?.includes('youtu.be')) &&
                     getYouTubeVideoId(item.chiTiets[0].filePath);
    
    console.log("Is YouTube:", isYouTube);
    
    if (isYouTube) {
      // Scroll tới phần YouTube video
      const element = document.getElementById(`content-item-${item.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    
    // Xử lý các loại khác
    switch (type) {
      case "taiLieu":
        console.log("Processing taiLieu");
        if (item.chiTiets && item.chiTiets.length > 0) {
          const detail = item.chiTiets[0];
          console.log("Detail:", detail);
          console.log("Detail loaiChiTiet:", detail.loaiChiTiet);
          console.log("Detail filePath:", detail.filePath);
          
          // File (PDF, Word, ...) - Chỉ mở file, không update breadcrumb
          if (detail.loaiChiTiet === 'file') {
            if (detail.fileType?.includes('docx') || detail.fileType?.includes('word')) {
              const viewURL = `https://docs.google.com/viewer?url=${encodeURIComponent(detail.filePath)}&embedded=true`;
              window.open(viewURL, "_blank");
            } else {
              window.open(detail.filePath, "_blank");
            }
          }
          // Link - Chỉ mở link, không update breadcrumb
          else if (detail.loaiChiTiet === 'duongDan') {
            window.open(detail.filePath, "_blank");
          }
          // Folder - Navigate + update breadcrumb
          else if (detail.loaiChiTiet === 'thuMuc') {
            setSelectedContent(item);
            navigate(`/directory/${item.id}`);
          }
          // Video không phải YouTube - Chỉ mở video, không update breadcrumb
          else if (detail.loaiChiTiet === 'video') {
            window.open(detail.filePath, "_blank");
          }
        } else {
          console.log("No chiTiets found");
        }
        break;
      case "phucDap":
        setSelectedContent(item);
        navigate(`/forum/${item.id}`);
        break;
      case "baiTap":
        setSelectedContent(item);
        navigate(`/assignment/${item.id}`);
        break;
      case "baiNop":
        setSelectedContent(item);
        navigate(`/test/${item.id}`);
        break;
      case "kiemTra":
        setSelectedContent(item);
        navigate(`/test/${item.id}`);
        break;
      default:
        console.log("Loại không hỗ trợ:", type);
    }
  };

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          />
          <span className="text-lg font-bold text-gray-800">{title}</span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <Motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="flex items-center gap-3 px-4 py-2.5 pl-10 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                <span className="line-clamp-1">{item.ten}</span>
              </div>
            ))}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CourseSidebar = ({ isOpen, onClose, myClass = {} }) => {
  const [openSections, setOpenSections] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [baiKiemTras, setBaiKiemTras] = useState([]);
  const storedMyClass = useClassStore(state => state.myClass);
  const classId = useClassStore(state => state.classId);
  
  // Sử dụng myClass từ prop hoặc từ store (fallback)
  const classData = useMemo(() => 
    Object.keys(myClass).length > 0 ? myClass : (storedMyClass || {}),
    [myClass, storedMyClass]
  );

  // Fetch exams riêng từ API
  useEffect(() => {
    if (classId) {
      const fetchExams = async () => {
        try {
          const response = await axiosClient.get(`/api/exams`, {
            params: { lopId: classId }
          });
          console.log('✅ Exams fetched:', response.data?.data);
          setBaiKiemTras(response.data?.data || []);
        } catch (error) {
          console.error('❌ Error fetching exams:', error);
        }
      };
      fetchExams();
    }
  }, [classId]);

  // Xây dựng sections từ API data
  const sections = useMemo(() => {
    console.log("CourseSidebar classData:", classData);
    console.log("chuDes data:", classData.chuDes);
    console.log("baiKiemTras data:", baiKiemTras);
    
    const allSections = [];

    // Thêm các chủ đề
    if (classData.chuDes && classData.chuDes.length > 0) {
      const topicSections = classData.chuDes.map(chuDe => ({
        id: chuDe.id,
        title: chuDe.tenChuDe,
        items: chuDe.noiDungs ? chuDe.noiDungs.map(nd => ({
          id: nd.id,
          ten: nd.tieuDe,
          loaiNoiDung: nd.loaiNoiDung,
          url: nd.url,
          text: nd.files ? nd.files.map(f => f.fileName).join(', ') : nd.noiDung,
          hanNop: nd.hanNop,
          ngayDang: nd.ngayTao,
          trangThai: nd.status,
          chiTiets: nd.files || []
        })) : []
      }));
      allSections.push(...topicSections);
    }

    // Thêm section bài kiểm tra (từ state, không phải classData)
    if (baiKiemTras && baiKiemTras.length > 0) {
      allSections.push({
        id: '__exams__',
        title: 'Bài kiểm tra',
        items: baiKiemTras.map(exam => ({
          id: exam.id,
          ten: exam.tenBaiKiemTra,
          type: 'kiemTra',
          moTa: exam.moTa,
          thoiGianBatDau: exam.thoiGianBatDau,
          thoiGianKetThuc: exam.thoiGianKetThuc,
          thoiLuong: exam.thoiLuong,
          tongDiem: exam.tongDiem,
          status: exam.status
        }))
      });
    }

    return allSections;
  }, [classData, baiKiemTras]);

  // Initialize openSections
  useMemo(() => {
    if (sections.length > 0) {
      setOpenSections(Object.fromEntries(sections.map(s => [s.id, true])));
    }
  }, [sections]);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const openAll = () => {
    const allOpen = Object.fromEntries(sections.map(s => [s.id, true]));
    setOpenSections(allOpen);
    setShowMenu(false);
  };

  const closeAll = () => {
    const allClose = Object.fromEntries(sections.map(s => [s.id, false]));
    setOpenSections(allClose);
    setShowMenu(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => {
            onClose();
            setShowMenu(false);
          }}
        />
      )}

      <aside
        className={`fixed top-16 left-0 h-full w-80 bg-white shadow-lg z-50
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 relative">
          <h2 className="font-semibold text-xl">Nội dung khóa học</h2>
          <div className="relative px-4 py-2 bg-gray-50 flex justify-end">
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className="p-1 hover:bg-gray-200 rounded transition"
              aria-label="Toggle open/close all sections menu"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-4 top-full mt-1 bg-white border rounded shadow-md w-40 z-50">
                <button
                  onClick={openAll}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-100"
                >
                  Mở tất cả
                </button>
                <button
                  onClick={closeAll}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-100"
                >
                  Đóng tất cả
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-scroll divide-y divide-gray-200 overflow-y-auto max-h-[calc(100vh-150px)] scroll-smooth">
          {sections.map(section => (
            <SidebarSection
              key={section.id}
              title={section.title}
              items={section.items}
              isOpen={openSections[section.id]}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>
      </aside>
    </>
  );
};
export const SidebarToggle = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed z-30 bg-orange-500 text-white p-3 rounded-r-full shadow-lg
                     bottom-35 lg:top-20 lg:bottom-auto
                     hover:bg-blue-500 hover:translate-x-2 transition-all duration-300 -ml-2"
    >
      <Menu size={24} />
    </button>
  )
}

export default CourseSidebar;
