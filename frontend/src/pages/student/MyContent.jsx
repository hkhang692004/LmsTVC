import React, { useEffect, useState } from 'react'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import ContentList from '@/components/myui/ContentList'
import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar'
import AddTopicDialog from '@/components/myui/AddTopicDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

import { useParams } from 'react-router-dom'
import classService from '@/services/classService'
import useClassStore from '@/stores/useClassStore'
import useUserStore from '@/stores/useUserStore'

const MyContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [addTopicOpen, setAddTopicOpen] = useState(false)
  const {id} = useParams();
  const [myClass,setMyClass] = useState([]);
  const setSelectedClass = useClassStore(state => state.setSelectedClass);
  const setMyClassStore = useClassStore(state => state.setMyClass);
  const setClassId = useClassStore(state => state.setClassId);
  const userRole = useUserStore(state => state.user?.role);
  const isTeacher = userRole === 'giangVien';

  const fetchMyClass = async() =>{
    try {
      const response = await classService.getClassById(id);
      const classData = response.data?.data || [];
      console.log("Class data received:", classData);
      console.log("chuDes:", classData.chuDes);
      setMyClass(classData);
      setSelectedClass(classData);
      setMyClassStore(classData); // Persist vào store
    } catch (error) {
      console.log("Lỗi khi fetch chi tiết lớp học",error);
    }
  };

  useEffect(()=>{
    if (!id) return; // Skip if id is undefined
    setClassId(id);  // Save classId for back navigation
    fetchMyClass();
  },[id, setSelectedClass, setMyClassStore, setClassId]);

  const handleTopicCreated = () => {
    // Refresh class data after creating topic
    fetchMyClass();
  }

  
 
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
              <div className="flex items-center justify-between">
                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                  [{myClass.hocKy?.ten}] {myClass.tenLop} - {myClass.monHoc?.tenMon}
                </h2>
                {isTeacher && (
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => setAddTopicOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm chủ đề
                  </Button>
                )}
              </div>
              <div className='border rounded-lg border-gray-300 p-4'>
                <ContentList myClass={myClass} isTeacher={isTeacher} onRefresh={fetchMyClass}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Topic Dialog */}
      <AddTopicDialog
        open={addTopicOpen}
        onOpenChange={setAddTopicOpen}
        classId={id}
        onSuccess={handleTopicCreated}
      />

      <ScrollToTop />
      <MyFooter />
    </>
  )
}

export default MyContent;