import React, { useState } from 'react';
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
import "../mycss/CourseSidebar.css";


const SidebarSection = ({ title, items, isOpen, onToggle, courseName }) => {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    switch (item.loai) {
      case "folder":
        navigate("/directory", { state: { folderName: item.ten, courseName } });
        break;
      case "diendan":
        navigate("/forum", { state: { title: item.ten, courseName, text: item.text } });
        break;
      case "pdf":
        if (item.url) window.open(item.url, "_blank");
        break;
      case "word":
        if (item.url) {
          const viewURL = `https://docs.google.com/viewer?url=${encodeURIComponent(item.url)}&embedded=true`;
          window.open(viewURL, "_blank");
        }
        break;
      case "duongdan":
        if (item.url) window.open(item.url, "_blank");
        break;
      case "text":
        navigate("/text", { state: { textName: item.ten, courseName, text: item.text } });
        break;
      case "nopbai":
        navigate("/assignment", {
          state: {
            assignmentName: item.ten,
            courseName,
            text: item.text,
            hanNop: item.hanNop,
            ngayDang: item.ngayDang,
            trangThai: item.trangThai,
          },
        });
        break;
      default:
        console.log("Loại không hỗ trợ:", item.loai);
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

const CourseSidebar = ({ sections, isOpen, onClose, courseName }) => {
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map(s => [s.id, true]))
  );
  const [showMenu, setShowMenu] = useState(false);

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
              courseName={courseName}
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
