import React, { useState } from 'react'

import CourseSidebar, { SidebarToggle } from '@/components/myui/CourseSidebar'
import mockSections from '@/mocks/mockSections'
import MyHeader from '@/components/myui/MyHeader'
import MyFooter from '@/components/myui/MyFooter'
import ScrollToTop from '@/components/myui/ScrollToTop'
import { FiFileText } from "react-icons/fi";
import { useLocation } from 'react-router-dom'
import Breadcrumb from '@/components/myui/Breadcrump'
import useClassStore from '@/stores/useClassStore';



const Text = () => {
    const selectedClass = useClassStore(state => state.selectedClass);
    const selectedContent = useClassStore(state => state.selectedContent);

    const courseName = selectedClass?.tenLop;
    const text = selectedContent?.text;
    const textName = selectedContent?.ten;


    const [sidebarOpen, setSidebarOpen] = useState(false)


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

                <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
                    <div className='w-full space-y-6 px-4 lg:px-10'>
                        <div className="flex flex-col my-10 lg:my-20 space-y-6">

                            <Breadcrumb courseName={courseName} itemName={textName} />

                            <div className='flex items-center space-x-3'>
                                <FiFileText className='w-8 h-8 text-yellow-600' />
                                <h2 className="text-orange-500 font-bold text-2xl lg:text-4xl">
                                    {textName}
                                </h2>
                            </div>
                            <div className='flex flex-row space-x-6 py-10 pl-10'>

                                <div className="bg-gray-50 whitespace-pre-line">
                                    <p className="text-gray-600 text-sm">{text || "Không có nội dung."}</p>
                                </div>

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

export default Text
