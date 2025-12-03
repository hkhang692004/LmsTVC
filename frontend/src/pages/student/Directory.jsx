import React, { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar'
import mockSections from '@/mocks/mockSections'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import { GoFileDirectory } from "react-icons/go";
import { HiChevronDown } from 'react-icons/hi'
import { useLocation } from 'react-router-dom'
import Breadcrumb from '@/components/myui/Breadcrump'
import { FaFile } from "react-icons/fa";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { FiFileText } from 'react-icons/fi'
import { PiMicrosoftWordLogoFill } from 'react-icons/pi'
import { BsFiletypePdf } from 'react-icons/bs'

// Mock danh sách file
const mockFiles = [
  { name: 'Add2Numbers-EN.txt', url: '/path/to/Add2Numbers-EN.txt' ,type :'text'},
  { name: 'Add2Numbers-VI.docx', url: '/path/to/Add2Numbers-VI.docx' ,type : 'word'},
  { name: 'DoiTuyenQuocGiaVN.pdf', url: '/path/to/DoiTuyenQuocGiaVN.pdf',type : 'pdf'},
  { name: 'DoiTuyenQuocGiaVN.java', url: '/path/to/DoiTuyenQuocGiaVN.java',type : 'java'},
];

const getIcon = (type) => {
    switch (type) {
        case "pdf":
            return <BsFiletypePdf className="text-gray-500 w-4 h-4" />;
        case "word":
            return <PiMicrosoftWordLogoFill className="text-gray-500 w-4 h-4" />
        case "text":
            return <FiFileText className="text-gray-500 w-4 h-4" />;


        default:
            return <FaFileCircleQuestion className="text-gray-500 w-4 h-4" />;
    }
};

const Directory = () => {
  const location = useLocation();
  const folderName = location.state?.folderName || 'Thư mục mặc định';
  const courseName = location.state?.courseName;
  

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

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

        <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className='w-full space-y-6 px-4 lg:px-10'>
            <div className="flex flex-col my-10 lg:my-20 space-y-6">
              
              <Breadcrumb courseName={courseName} itemName={folderName} />

              <div className='flex items-center space-x-3'>
                <GoFileDirectory className='w-8 h-8 text-yellow-600' />
                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                  {folderName}
                </h2>
              </div>
            <div className='flex flex-row space-x-6 justify-between '>
              <div className='flex flex-col mt-20'>
                
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
                  <GoFileDirectory className="w-5 h-5 text-gray-500" />
                </button>

                {/* Danh sách file dạng dotted */}
                {isOpen && (
                  <ul id="file-list" className="mt-1.5 ml-8 space-y-3 relative">

                    {/* Dòng dọc nét đứt chính */}
                    <span className="absolute left-5 top-0 bottom-0 w-0.5 border-r border-dotted border-gray-400"></span>

                    {mockFiles.map((file, idx) => (
                      <li key={idx} className="flex items-center space-x-2 relative pl-8">

                        {/* Đường ngang chữ L nét đứt */}
                        <span className="absolute left-5 top-3 w-2 border-t border-dotted border-gray-400"></span>

                        {getIcon(file.type)}
                        <a href={file.url} className="text-blue-600 hover:underline" download>
                          {file.name}
                        </a>
                      </li>
                    ))}

                  </ul>
                )}
              </div>
                <button className='flex items-center h-12 mt-18 justify-between px-4 py-2 bg-orange-500 hover:bg-blue-400 text-white text-lg rounded-md w-fit'>
                  Tải thư mục về
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
