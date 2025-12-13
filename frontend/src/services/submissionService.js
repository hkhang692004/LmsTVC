import axiosClient from '../lib/axios.js';

const submissionService = {
    // Start exam - creates a submission
    startExam: (examId) => {
        return axiosClient.post('/api/submissions', { examId });
    },

    // Submit exam - finalize submission and calculate score
    submitExam: (submissionId) => {
        return axiosClient.post(`/api/submissions/${submissionId}/submit`);
    },

    // Sync answers during exam (auto-save)
    syncAnswers: (submissionId, answers) => {
        return axiosClient.post(`/api/submissions/${submissionId}/sync-answers`, { answers });
    },

    // Get submission details
    getSubmissionById: (submissionId) => {
        return axiosClient.get(`/api/submissions/${submissionId}`);
    }
};

export default submissionService;
