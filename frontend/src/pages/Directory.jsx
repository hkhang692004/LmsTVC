import {React,useState} from 'react'
import CourseSidebar,{SidebarToggle} from '@/components/myui/CourseSidebar'
import mockSections from '@/mocks/mockSections'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import { GoFileDirectory } from "react-icons/go";
import { useLocation } from 'react-router-dom'
import Breadcrumb from '@/components/myui/Breadcrump'



const Directory = () => {
  const location = useLocation();
  const folderName = location.state?.folderName;
  const title = location.state?.title;
  const courseName = location.state?.courseName;

 const [sidebarOpen, setSidebarOpen] = useState(false)
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
        sectionName={title}
        itemName={folderName}
              />
              <div className='flex items-center space-x-3'>
                <GoFileDirectory className='w-8 h-8 text-yellow-600' />
                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                  {`${folderName}`}
                </h2>
              </div>
              <div className=' p-4'>
                
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
