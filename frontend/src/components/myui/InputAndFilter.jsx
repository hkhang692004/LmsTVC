import React from 'react'
import { Search } from 'lucide-react'

const InputAndFilter = ({ onSearchChange, onSortChange, searchTerm = '', sortOption = 'classname' }) => {
    const handleSearch = (e) => {
        const value = e.target.value
        onSearchChange?.(value)
    }

    const handleSort = (e) => {
        const value = e.target.value
        onSortChange?.(value)
    }

    return (
        <div className="flex items-center gap-6 px-6 py-4 bg-white shadow rounded-md max-w-lg mx-auto">

            <div className="flex-1 relative">
                <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-300"
                    size={20}
                />
                <input
                    type="text"
                    placeholder="Tìm kiếm"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-md text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-shadow duration-300
                     hover:shadow-md"
                />
            </div>

            <select
                value={sortOption}
                onChange={handleSort}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-colors duration-300 cursor-pointer
                   hover:border-blue-400"
            >
                <option value="classname">Sắp xếp theo tên lớp</option>
                <option value="coursename">Sắp xếp theo tên khóa học</option>
            </select>

        </div>
    )
}

export default InputAndFilter
