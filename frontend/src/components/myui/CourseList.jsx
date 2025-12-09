import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import classService from '@/services/classService'
import useClassStore from '@/stores/useClassStore'
// Styles và pattern như bạn đã có
const courseStyles = [
    { color: 'bg-blue-500', pattern: 'hexagon', patternOpacity: 0.15 },
    { color: 'bg-purple-500', pattern: 'diamond', patternOpacity: 0.2 },
    { color: 'bg-teal-400', pattern: 'circles', patternOpacity: 0.12 },
    { color: 'bg-gray-400', pattern: 'hexagon', patternOpacity: 0.18 },
    { color: 'bg-green-500', pattern: 'diamond', patternOpacity: 0.15 },
    { color: 'bg-pink-500', pattern: 'circles', patternOpacity: 0.2 },
    { color: 'bg-orange-500', pattern: 'hexagon', patternOpacity: 0.16 },
    { color: 'bg-indigo-500', pattern: 'diamond', patternOpacity: 0.14 },
]




// SVG Patterns
const HexagonPattern = ({ id, opacity }) => (
    <pattern id={id} width="100" height="87" patternUnits="userSpaceOnUse">
        <path d="M50 0L93.3 25L93.3 62L50 87L6.7 62L6.7 25Z" fill="currentColor" opacity={opacity} />
        <path d="M0 43.5L43.3 18.5L43.3 56L0 81Z" fill="currentColor" opacity={opacity * 0.6} />
    </pattern>
)

const DiamondPattern = ({ id, opacity }) => (
    <pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M40 0L80 40L40 80L0 40Z" fill="currentColor" opacity={opacity} />
        <path d="M40 20L60 40L40 60L20 40Z" fill="currentColor" opacity={opacity * 0.5} />
    </pattern>
)

const CirclesPattern = ({ id, opacity }) => (
    <pattern id={id} width="100" height="100" patternUnits="userSpaceOnUse">
        <circle cx="25" cy="25" r="20" fill="currentColor" opacity={opacity} />
        <circle cx="75" cy="75" r="25" fill="currentColor" opacity={opacity * 0.7} />
        <circle cx="75" cy="25" r="15" fill="currentColor" opacity={opacity * 0.5} />
    </pattern>
)


const CourseCard = ({ course, index }) => {
    const style = courseStyles[index % courseStyles.length]
    const patternId = `pattern-${index}`
    const setSelectedClass = useClassStore(state => state.setSelectedClass);
    const navigate = useNavigate();
    const handleClick = () =>{
        setSelectedClass(course);
        navigate(`/mycontent/${course.id}`,{
        })

    }

    const renderPattern = () => {
        switch (style.pattern) {
            case 'hexagon': return <HexagonPattern id={patternId} opacity={style.patternOpacity} />
            case 'diamond': return <DiamondPattern id={patternId} opacity={style.patternOpacity} />
            case 'circles': return <CirclesPattern id={patternId} opacity={style.patternOpacity} />
            default: return <CirclesPattern id={patternId} opacity={style.patternOpacity} />
        }
    }
    return (
        <a className='block' onClick={handleClick}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 h-60 mx-2">
                <div className={`h-32 relative overflow-hidden ${style.color}`}>
                    <svg className="absolute inset-0 w-full h-full text-white" >
                        <defs>{renderPattern()}</defs>
                        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
                    </svg>
                </div>
                <div className="p-4">
                    <h3 className="font-medium text-blue-600 mb-2 hover:underline cursor-pointer line-clamp-2 text-base">
                        {course.tenLop}
                    </h3>
                    <h3 className="font-medium text-blue-600 mb-2 hover:underline cursor-pointer line-clamp-2 text-base">
                        {course.monHoc?.tenMon}
                    </h3>
                    <p className="text-sm text-gray-700">{course.giangVien?.ten}</p>
                </div>
            </div>
        </a>
    )
}

// Component danh sách nhiều khóa học
const CourseList = () => {
    const [classes,setClasses] = useState([]);
    const [loading,setLoading] = useState(false);

    useEffect (() => {
        const fetchClasses = async () => {
            setLoading (true);
            try{
                const response = await classService.getMyClass();
                setClasses (response.data?.classes || []);
            }catch (error){
                console.error("Lỗi khi fetch lớp học:", error);
            }finally{
                setLoading (false);
            }
    };
        fetchClasses();
    }, [])



    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 space-y-6">
            {classes.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    index={classes.indexOf(course)}
                />
            ))}
        </div>
    )
}

export default CourseList
