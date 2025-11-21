import React, { useState } from 'react'
import { FaBold, FaItalic, FaListUl, FaListOl, FaLink, FaImage, FaFile, FaMicrophone, FaVideo } from "react-icons/fa";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

const NewTopicForm = ({ onSubmit, onCancel }) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }
    onSubmit({
      title: newTopicTitle.trim(),
      content: newTopicContent.trim()
    });
    setNewTopicTitle('');
    setNewTopicContent('');
    setIsAdvancedMode(false);
  };

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
            <>Nâng cao <HiChevronDown className="w-4 h-4" />
            </>
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

        {!isAdvancedMode ? (
          <div className="mb-4">
            <textarea
              value={newTopicContent}
              onChange={(e) => setNewTopicContent(e.target.value)}
              rows={6}
              className="w-full border px-4 py-2 rounded"
              placeholder="Nội dung chủ đề"
              required
            />
          </div>
        ) : (
          <div className="mb-4">
            <div className="border p-2 mb-2 bg-gray-50 rounded flex gap-2 flex-wrap">
              <button type="button" title="Bold" className="p-2 hover:bg-gray-200 rounded"><FaBold /></button>
              <button type="button" title="Italic" className="p-2 hover:bg-gray-200 rounded"><FaItalic /></button>
              <button type="button" title="Bullet list" className="p-2 hover:bg-gray-200 rounded"><FaListUl /></button>
              <button type="button" title="Numbered list" className="p-2 hover:bg-gray-200 rounded"><FaListOl /></button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button type="button" title="Link" className="p-2 hover:bg-gray-200 rounded"><FaLink /></button>
              <button type="button" title="Image" className="p-2 hover:bg-gray-200 rounded"><FaImage /></button>
              <button type="button" title="File" className="p-2 hover:bg-gray-200 rounded"><FaFile /></button>
              <button type="button" title="Audio" className="p-2 hover:bg-gray-200 rounded"><FaMicrophone /></button>
              <button type="button" title="Video" className="p-2 hover:bg-gray-200 rounded"><FaVideo /></button>
            </div>
            <textarea
              value={newTopicContent}
              onChange={(e) => setNewTopicContent(e.target.value)}
              rows={10}
              className="w-full border px-4 py-2 rounded resize-none"
              required
            />
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
  )
}

export default NewTopicForm;
