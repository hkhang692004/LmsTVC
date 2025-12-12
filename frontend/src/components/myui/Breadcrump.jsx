import React, { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"
import useClassStore from '@/stores/useClassStore';

const Breadcrumb = ({ courseName, itemName }) => {
   const navigate = useNavigate();
   const location = useLocation();
   const selectedClass = useClassStore(state => state.selectedClass);
   const selectedContent = useClassStore(state => state.selectedContent);
   const myClass = useClassStore(state => state.myClass);
   const setSelectedContent = useClassStore(state => state.setSelectedContent);
   
  
   useEffect(() => {
    
     if (myClass?.chuDes || myClass?.baiKiemTras) {
       const currentPath = location.pathname;
       console.log("Breadcrumb useEffect - current path:", currentPath);
       
       // Extract content ID from URL
       const urlMatch = currentPath.match(/\/(forum|assignment|test|directory)\/([A-Z0-9]+)/i);
       if (urlMatch) {
         const contentId = urlMatch[2]; // String ID like "ND004"
         const contentType = urlMatch[1].toLowerCase();
         
         console.log("Found URL match - Type:", contentType, "ID:", contentId);
         
         // Search for this content in myClass topics
         if (myClass.chuDes) {
           let foundContent = null;
           for (const topic of myClass.chuDes) {
             const found = topic.noiDungs?.find(nd => String(nd.id) === contentId);
             if (found) {
               foundContent = found;
               console.log("Found content in topics:", found);
               break;
             }
           }
           
           if (foundContent) {
             // Update store with found content
             const contentToSet = {
               id: foundContent.id,
               ten: foundContent.tieuDe,
               loaiNoiDung: foundContent.loaiNoiDung,
               text: foundContent.noiDung,
               chiTiets: foundContent.files || []
             };
             console.log("Setting selectedContent to:", contentToSet);
             setSelectedContent(contentToSet);
             return;
           }
         }
         
         // Search in baiKiemTras if not found in topics
         if (myClass.baiKiemTras) {
           const foundExam = myClass.baiKiemTras.find(exam => String(exam.id) === contentId);
           if (foundExam) {
             console.log("Found exam:", foundExam);
             const examToSet = {
               id: foundExam.id,
               ten: foundExam.tieuDe,
               type: 'kiemTra',
               moTa: foundExam.moTa,
               thoiGianBatDau: foundExam.thoiGianBatDau,
               thoiGianKetThuc: foundExam.thoiGianKetThuc
             };
             console.log("Setting selectedContent to exam:", examToSet);
             setSelectedContent(examToSet);
             return;
           }
         }
         
         console.log("Content not found for ID:", contentId);
       } else {
         console.log("URL doesn't match pattern");
       }
     } else {
       console.log("myClass not available");
     }
   }, [location.pathname, myClass, setSelectedContent]);
   
   const handleCourseClick = () =>{
        navigate("/mycourse");
   }
   
   const handleClassClick = () =>{
        if (selectedClass?.id) {
          navigate(`/mycontent/${selectedClass.id}`);
        }
   }
 
    return (
        <div className="flex items-center text-sm bg-gray-200 rounded-r-full w-fit px-3 py-2">
            
            <a className="block w-fit cursor-pointer" onClick={handleCourseClick} >
            {/* Course name */}
            <span className="text-lg text-gray-500 hover:text-blue-500">
                Các khóa học của tôi
            </span>
            </a>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
             <a className="block w-fit cursor-pointer" onClick={handleClassClick} >
            {/* Class name */}
            <span className=" text-lg text-gray-500 hover:text-blue-500">
                {courseName || selectedClass?.tenLop}
            </span>
            </a>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
            
            {/* Current page highlight */}
            <span className="text-lg bg-blue-600 text-white px-3 py-1 rounded-full ">
                {itemName || selectedContent?.ten}
            </span>
        
        </div>
    );
};

export default Breadcrumb;
