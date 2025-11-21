import React from "react";
import { ChevronRight } from "lucide-react";
import {useNavigate} from "react-router-dom"

const Breadcrumb = ({ courseName, itemName }) => {
   const navigate = useNavigate();
   const handleCourseClick = () =>{
        navigate("/mycourse");
        
   }
    const handleSectionClick = () =>{
        navigate("/mycontent",{
            state:{
               courseName: courseName
            }
        });
   }
 
    return (
        <div className="flex items-center text-sm bg-gray-200 rounded-r-full w-fit px-3 py-2">
            
            <a className="block w-fit " onClick={handleCourseClick} >
            {/* Course name */}
            <span className="text-lg text-gray-500 hover:text-blue-500">
                Các khóa học của tôi
            </span>
            </a>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
             <a className="block w-fit" onClick={handleSectionClick} >
            {/* Section name */}
            <span className=" text-lg text-gray-500 hover:text-blue-500">
                {courseName}
            </span>
            </a>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
            
            {/* Current page highlight */}
            <span className="text-lg bg-blue-600 text-white px-3 py-1 rounded-full ">
                {itemName}
            </span>
        
        </div>
    );
};

export default Breadcrumb;
