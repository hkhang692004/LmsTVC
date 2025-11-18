import React, { useState } from 'react'
import { X, ChevronDown, Menu } from 'lucide-react'




const SidebarSection = ({ title, items, isOpen, onToggle }) => {
    return (
        <div className="border-b border-gray-200">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
            >
                <div className="flex items-center gap-2">
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                    <span className="text-lg font-bold text-gray-800">{title}</span>
                </div>
            </button>

            {isOpen && (
                <div className="bg-white ">
                    {items.map((item) => (
                        <a
                            key={item.id}
                            href="#"
                            className="block hover:bg-blue-50 transition"
                        >
                            <div className="flex items-center gap-6 px-4 py-2.5 pl-10 text-x text-gray-500 hover:text-blue-600">
                                <span className="line-clamp-1">{item.ten}</span>
                            </div>
                        </a>


                    ))}
                </div>
            )}
        </div>
    )
}

const CourseSidebar = ({ sections, isOpen, onClose }) => {
    const [openSections, setOpenSections] = useState({})

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }))
    }

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white text-white">
                    <h2 className="font-semibold text-xl text-black">Nội dung khóa học</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-blue-500 rounded transition text-black"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Sections */}
                <div className="divide-y divide-gray-200">
                    {sections.map((section) => (
                        <SidebarSection
                            key={section.id}
                            title={section.title}
                            items={section.items}
                            isOpen={openSections[section.id]}
                            onToggle={() => toggleSection(section.id)}
                        />
                    ))}
                </div>
            </aside>
        </>
    )
}

// Toggle Button Component (để hiện sidebar)
export const SidebarToggle = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed z-30 bg-orange-500 text-white p-3 rounded-r-full shadow-lg
             bottom-35 lg:top-20 lg:bottom-auto
             hover:bg-blue-500 hover:translate-x-2 transition-all duration-300 -ml-2 "
        >
            <Menu size={24} />
        </button>

    )
}

export default CourseSidebar