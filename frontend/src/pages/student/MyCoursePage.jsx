import InputAndFilter from '@/components/myui/InputAndFilter'
import MyFooter from '@/components/myui/MyFooter'
import MyHeader from '@/components/myui/MyHeader'
import CourseList from '@/components/myui/CourseList'
import ScrollToTop from '@/components/myui/ScrollToTop'
import React from 'react'


const MyCoursePage = () => {

    return (
        <>
            {/*Fixed Header */}
            <MyHeader />
            <div className='w-full pt-8 mx-auto min-h-screen'>
                <div className='w-full space-y-6 px-10'>
                    <div className="flex flex-col my-20 space-y-6 ">
                        <div>
                            <h2 className="text-orange-500 font-bold text-4xl">Hello, Name </h2>
                        </div>
                        <div className='w-full '>
                            <div className='border border-gray-300 p-4 '>
                                <h2 className="text-orange-500 font-bold text-xl ">Tổng quan về khóa học</h2>
                            </div>
                            <div className='border-x border-b border-gray-300 p-4 space-y-2 '>

                                {/* Tim kiem va Loc */}
                                <InputAndFilter />


                                {/* My Course List */}
                                <CourseList />

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

export default MyCoursePage
