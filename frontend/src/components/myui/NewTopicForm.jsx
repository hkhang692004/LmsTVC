import React, { useState } from 'react';
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

import { TbFileSettings } from "react-icons/tb";

import ReactQuillNew from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const NewTopicForm = ({ onSubmit, onCancel }) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }
    onSubmit({
      title: newTopicTitle.trim(),
      content: newTopicContent.trim(),
      files: attachedFiles
    });
    setNewTopicTitle('');
    setNewTopicContent('');
    setAttachedFiles([]);
    setIsAdvancedMode(false);
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...files].slice(0, 9)); // giới hạn max 9 file
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

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

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Tạo chủ đề thảo luận mới</h3>
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
        <div className="mb-4">
          <label className="block mb-1 font-medium">Tiêu đề</label>
          <input
            type="text"
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <ReactQuillNew
            value={newTopicContent}
            onChange={setNewTopicContent}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Nhập nội dung chủ đề..."
            theme="snow"
            style={{ minHeight: '200px' }}
          />
        </div>

        {isAdvancedMode && (
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <span className="text-blue-500">ⓘ</span>
              Đính kèm tập tin (kéo thả hoặc chọn)
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
                <p className="text-sm text-gray-600 mt-2">Kéo tập tin vào đây hoặc nhấn để chọn tập tin</p>
              </div>
              <input
                type="file"
                multiple
                id="file-upload"
                className="hidden"
                onChange={handleFilesChange}
              />
            </div>

            {attachedFiles.length > 0 && (
              <div className="my-10 ml-10 flex flex-wrap gap-4 space-x-10">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex flex-col items-center text-sm w-15">
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

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Tạo chủ đề
          </button>
          <button
            type="button"
            onClick={() => {
              setNewTopicTitle('');
              setNewTopicContent('');
              setAttachedFiles([]);
              setIsAdvancedMode(false);
              onCancel();
            }}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTopicForm;
