import React from "react";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ courseName, sectionName, itemName }) => {
   
 
    return (
        <div className="flex items-center text-sm bg-gray-200 rounded-r-full w-fit px-3 py-2">
            
            <a className="block w-fit " href="/mycourse" >
            {/* Course name */}
            <span className="text-lg text-gray-500 hover:text-blue-500">
                {courseName}
            </span>
            </a>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
             <a className="block w-fit" href="/mycontent" >
            {/* Section name */}
            <span className=" text-lg text-gray-500 hover:text-blue-500">
                {sectionName}
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
