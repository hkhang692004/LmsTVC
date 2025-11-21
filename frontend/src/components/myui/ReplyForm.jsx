import React from 'react';
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { FaBold, FaItalic, FaListUl, FaListOl, FaLink, FaImage, FaFile, FaMicrophone, FaVideo } from "react-icons/fa";
import { GoFileDirectory } from 'react-icons/go';

const ReplyForm = ({
    isAdvancedMode,
    setIsAdvancedMode,
    replyContent,
    setReplyContent,
    replySubject,
    setReplySubject,
    onCancel,
    onSubmit,
}) => {
    return (
        <div id="reply-form" className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Phúc đáp</h3>
                <button
                    type="button"
                    onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                >
                    {isAdvancedMode ? (
                        <>Đơn giản <HiChevronUp className="w-4 h-4" /></>
                    ) : (
                        <>Nâng cao <HiChevronDown className="w-4 h-4" /></>  // <-- thêm đóng fragment ở đây
                    )}
                </button>

            </div>

            <form onSubmit={onSubmit}>
                {!isAdvancedMode ? (
                    <>
                        <div className="mb-4">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows="6"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Miêu cầu trả lời của bạn..."
                                required
                            />
                        </div>

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
                    </>
                ) : (
                    <>
                        {/* Form nâng cao */}
                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <span className="text-red-500">●</span>
                                Tiêu đề
                            </label>
                            <input
                                type="text"
                                value={replySubject}
                                onChange={(e) => setReplySubject(e.target.value)}
                                placeholder={`Trả lời: `}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <span className="text-red-500">●</span>
                                Nội dung
                            </label>

                            <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex items-center gap-1 flex-wrap">
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Format">
                                    <HiChevronDown className="w-4 h-4" />
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Font size">
                                    <span className="text-sm font-semibold">A</span>
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Bold">
                                    <FaBold className="w-4 h-4" />
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Italic">
                                    <FaItalic className="w-4 h-4" />
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Bullet list">
                                    <FaListUl className="w-4 h-4" />
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Numbered list">
                                    <FaListOl className="w-4 h-4" />
                                </button>
                                <div className="w-px h-6 bg-gray-300"></div>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Link">
                                    <FaLink className="w-4 h-4" />
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Remove link">
                                    <span className="text-sm">🔗✕</span>
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Image">
                                    <FaImage className="w-4 h-4" />
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="File">
                                    <FaFile className="w-4 h-4" />
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Audio">
                                    <FaMicrophone className="w-4 h-4" />
                                </button>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Video">
                                    <FaVideo className="w-4 h-4" />
                                </button>
                            </div>

                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows="10"
                                className="w-full px-4 py-2 border border-gray-300 border-t-0 rounded-b-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder=""
                                required
                            />

                            <div className="mt-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded" defaultChecked />
                                    <span className="text-sm text-gray-600">Đăng kí tham gia cuộc thảo luận</span>

                                    <button type="button" className="text-blue-500 hover:underline ml-1">
                                        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </label>
                            </div>

                        </div>

                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <span className="text-blue-500">ⓘ</span>
                                File đính kèm
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Kích thước tối đa với một tập tin 500 KB, số lượng tập tin đính kèm tối đa 9
                            </p>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center bg-gray-50">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">Thêm các tập tin bằng cách kéo thả.</p>
                                </div>
                                <input type="file" multiple className="hidden" id="file-upload" />
                            </div>
                            <div className="mt-2 flex gap-2 items-center">
                                <GoFileDirectory className="w-4 h-4 text-gray-500 " />
                                <label
                                    htmlFor="file-upload"
                                    className=" py-2  text-blue-600 hover:underline cursor-pointer"
                                >
                                    Chọn tập tin để tải lên
                                </label>
                            </div>
                        </div>

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
                    </>
                )}
            </form>
        </div>
    );
};

export default ReplyForm;
