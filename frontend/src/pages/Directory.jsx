import React, { useState } from 'react'
import { motion as Motion} from 'framer-motion'
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar'
import mockSections from '@/mocks/mockSections'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import { GoFileDirectory, GoFile } from "react-icons/go";
import { HiChevronDown } from 'react-icons/hi'
import { useLocation } from 'react-router-dom'
import Breadcrumb from '@/components/myui/Breadcrump'

// Mock danh sách file con trong thư mục
const mockFiles = [
  { name: 'Add2Numbers-EN.txt', url: '/path/to/Add2Numbers-EN.txt' },
  { name: 'Add2Numbers-VI.txt', url: '/path/to/Add2Numbers-VI.txt' },
  { name: 'DoiTuyenQuocGiaVN.txt', url: '/path/to/DoiTuyenQuocGiaVN.txt' },
];

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
          onClose={() => setSidebarOpen(false)}
        />

        <div
          className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}
        >
          <div className='w-full space-y-6 px-4 lg:px-10'>
            <div className="flex flex-col my-10 lg:my-20 space-y-6">
              <Breadcrumb
                courseName={courseName}
                itemName={folderName}
              />
              <div className='flex items-center space-x-3'>
                <GoFileDirectory className='w-8 h-8 text-yellow-600' />
                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                  {folderName}
                </h2>
              </div>

              <div className='flex flex-col mt-20'>
                {/* Nút mở/đóng danh sách file */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-200 rounded-md w-fit"
                  aria-expanded={isOpen}
                  aria-controls="file-list"
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

                {/* Danh sách file con với đường nối chữ L */}
                {isOpen && (
                  <ul
                    id="file-list"
                    className="mt-4 ml-8 space-y-2 relative"
                  >
  
                    {/* Đường dọc chính nối từ nút toggle xuống */}
                    <span className="absolute left-5 border-dotted h-fit  w-0.5 bg-gray-400">

                                {mockFiles.map((file, idx) => (
                      <li key={idx} className="flex items-center space-x-2 relative pl-8">
                        {/* Đường dọc nhỏ */}
                        <span className="absolute left-0 top-2 h-4 w-0.5 bg-gray-400"></span>
                        {/* Đường ngang nối chữ L */}
                        <span className="absolute left-0 top-4 w-2 h-0.5 bg-gray-400"></span>

                        <GoFile className="w-4 h-4 text-gray-600 z-10" />
                        <a
                          href={file.url}
                          className="text-blue-600 hover:underline"
                          download
                        >
                          {file.name}
                        </a>
                      </li>
                    ))}
                    </span>
                  </ul>
                )}
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
