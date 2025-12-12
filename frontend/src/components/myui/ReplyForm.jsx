import React, { useState } from 'react';
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

import { TbFileSettings } from "react-icons/tb";
import ReactQuillNew from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ReplyForm = ({
    isAdvancedMode,
    setIsAdvancedMode,
    replyContent,
    setReplyContent,
    replySubject,
    setReplySubject,
    replyToTitle,
    onCancel,
    onSubmit,
}) => {

    const [attachedFiles, setAttachedFiles] = useState([]);

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
        'link', 'image', 'video',
    ];

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachedFiles(prev => [...prev, ...files].slice(0, 9)); // max 9 files
    };

    const handleRemoveFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, {
            subject: replySubject,
            content: replyContent,
            files: attachedFiles,
        });
    };

    return (
        <div id="reply-form" className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">Phúc đáp</h3>
                    {replyToTitle && (
                        <p className="text-sm text-gray-600 mt-1">
                            Phúc đáp cho: <span className="font-medium text-blue-600">{replyToTitle}</span>
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                >
                    {isAdvancedMode ? (
                        <>Đơn giản <HiChevronUp className="w-4 h-4" /></>
                    ) : (
                        <>Nâng cao <HiChevronDown className="w-4 h-4" /></>
                    )}
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Tiêu đề luôn hiển thị */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500">●</span>
                        Tiêu đề
                    </label>
                    <input
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        placeholder="Nhập tiêu đề..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Nội dung */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500">●</span>
                        Nội dung
                    </label>

                    <ReactQuillNew
                        value={replyContent}
                        onChange={setReplyContent}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Nhập nội dung trả lời..."
                        theme="snow"
                        style={{ minHeight: isAdvancedMode ? '250px' : '150px' }}
                    />


                </div>

                {/* File đính kèm chỉ hiện khi nâng cao */}
                {isAdvancedMode && (
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <span className="text-blue-500">ⓘ</span>
                            File đính kèm
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Số lượng tập tin đính kèm tối đa 9
                        </p>

                        <div
                            className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center bg-gray-50 cursor-pointer"
                            onClick={() => document.getElementById('file-upload').click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const droppedFiles = Array.from(e.dataTransfer.files);
                                setAttachedFiles(prev => [...prev, ...droppedFiles].slice(0, 9));
                            }}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Thêm các tập tin bằng cách kéo thả.</p>
                            </div>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                id="file-upload"
                                onChange={handleFilesChange}
                            />
                        </div>

                        {attachedFiles.length > 0 && (
                            <div className="my-10  flex flex-wrap gap-4 space-x-10">
                                {attachedFiles.map((file, idx) => (
                                    <div key={idx} className="flex flex-col ml-10 items-center text-sm w-15">
                                        {/* Khung chứa icon và nút xóa */}
                                        <div className="relative border rounded p-2 bg-white w-full flex justify-center items-center">
                                            <TbFileSettings className="w-10 h-10 text-gray-600" />
                                            <button
                                                type="button"
                                                className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                                                onClick={() => handleRemoveFile(idx)}
                                                aria-label="Xóa tập tin"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {/* Tên file */}
                                        <span className="wrap-break-word text-center mt-1">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Gửi bài viết lên diễn đàn
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReplyForm;
