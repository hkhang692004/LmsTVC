import React, { useEffect, useState } from 'react'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import ContentList from '@/components/myui/ContentList'
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar'

import { useParams } from 'react-router-dom'
import classService from '@/services/classService'

const MyContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {classId} = useParams();
  const [myClass,setMyClass] = useState([]);
  const[loading,setLoading] = useState(false);

  useEffect(()=>{
    const fetchMyClass = async() =>{
      setLoading(true);
        try {
          const response = await classService.getClassById(classId);
          setMyClass(response.data?.data || []);
        } catch (error) {
          console.log("Lỗi khi fetch chi tiết lớp học",error);
        } finally{
          setLoading(false);
        }
    };
    fetchMyClass();
  },[classId]);

  
 
  return (
    <>
      {/* Fixed Header */}
      <MyHeader />

      {/* Toggle Button for Mobile */}
      <SidebarToggle onClick={() => setSidebarOpen(true)} />

      <div className='flex pt-16'>
        {/* Sidebar */}
        <CourseSidebar
          
          isOpen={sidebarOpen}
          myClass={myClass}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div
          className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className='w-full space-y-6 px-4 lg:px-10'>
            <div className="flex flex-col my-10 lg:my-20 space-y-6">
              <div>
                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                  {myClass.tenLop}
                </h2>
              </div>
              <div className='border rounded-lg border-gray-300 p-4'>
                <ContentList myClass={myClass}/>
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

export default MyContent;