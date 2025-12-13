import axiosClient from '../lib/axios.js';

const examService = {
    // Get exam details with student's submission status
    getExamStudentView: (examId) => {
        return axiosClient.get(`/api/exams/${examId}/student-view`);
    },

    // Get questions for an exam (for doing the test)
    getExamQuestions: (examId) => {
        return axiosClient.get(`/api/exams/${examId}/questions`);
    },

    // Get exam basic info
    getExamById: (examId) => {
        return axiosClient.get(`/api/exams/${examId}`);
    },

    // Get exam submissions (teacher only) with pagination
    getExamSubmissions: (examId, page = 1, limit = 10) => {
        return axiosClient.get(`/api/exams/${examId}/submissions`, {
            params: { page, limit }
        });
    }
};

export default examService;
