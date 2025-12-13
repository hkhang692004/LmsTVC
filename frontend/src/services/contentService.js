import axiosClient from '../lib/axios.js';

const ContentService = {
  // Lấy thông tin bài tập
  getAssignment: (id) => {
    return axiosClient.get(`/api/content/${id}`);
  },

  // Tạo bài nộp mới (với files sử dụng FormData)
  createSubmission: (formData) => {
    return axiosClient.post('/api/content', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Cập nhật bài nộp (với files sử dụng FormData)
  updateSubmission: (id, formData) => {
    return axiosClient.put(`/api/content/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Lấy danh sách bài nộp của sinh viên cho bài tập cụ thể
  getMySubmissions: (assignmentId) => {
    return axiosClient.get(`/api/content/${assignmentId}/submissions`);
  }
};

export default ContentService;
