import React from "react";
import { FileText, Folder } from "lucide-react";
import { BsFiletypePdf } from "react-icons/bs"
import { FiFileText } from "react-icons/fi";
import { MdUploadFile, MdOutlineChat } from "react-icons/md";
import { FaLink } from "react-icons/fa6";
import { LuFileQuestion } from "react-icons/lu";
import { FaFilePen } from "react-icons/fa6";
import { PiMicrosoftWordLogoFill } from "react-icons/pi";
import {useNavigate} from "react-router-dom"

const getIcon = (type) => {
    switch (type) {
        case "pdf":
            return <BsFiletypePdf className="text-red-500 w-6 h-6" />;
        case "word":
            return <PiMicrosoftWordLogoFill className="text-blue-600 w-6 h-6" />
        case "folder":
            return <Folder className="text-yellow-600 w-6 h-6" />;
        case "text":
            return <FiFileText className="text-cyan-500 w-6 h-6" />;
        case "nopbai":
            return <MdUploadFile className="text-cyan-500 w-6 h-6" />;
        case "diendan":
            return <MdOutlineChat className="text-pink-400 w-6 h-6" />;
        case "duongdan":
            return <FaLink className="text-cyan-500 w-6 h-6" />
        case "kiemtra":
            return <FaFilePen className="text-gray-500 w-6 h-6" />


        default:
            return <LuFileQuestion className="text-cyan-500 w-6 h-6" />;
    }
};

const ContentItem = ({ item, courseName,title }) => {
    const navigate = useNavigate();
    const handleClick= () =>{
        switch(item.loai)
    {
        case "folder":
            navigate("/directory",{
                state:{
                folderName : item.ten,
                title: title,
                courseName: courseName
            }
        });
            break;
        case "diendan":
            navigate("/forum",{
                state:{
                    title:item.ten
                }
        });
    }
}

        

    
    return (
        <div 
        onClick={handleClick}
        className="flex items-center py-6 px-6 hover:bg-gray-50 cursor-pointer border-t">
            {getIcon(item.loai)}

            <h2 className="ml-3 text-x text-blue-500 font-medium hover:underline">
                {item.ten}
            </h2>

            {item.loai === "pdf" && (
                <span className="ml-2 text-gray-400 text-sm">PDF</span>
            )}
        </div>
    );
};

export default ContentItem;
