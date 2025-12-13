import ExamRepository from "../repositories/examRepository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class ExamService {
    async generateExamId() {
        const lastExam = await ExamRepository.findLastExam();
        
        if (!lastExam || !lastExam.id || !lastExam.id.startsWith('BKT')) {
            return 'BKT001';
        }
        
        const lastNumber = parseInt(lastExam.id.substring(3));
        
        if (isNaN(lastNumber)) {
            return 'BKT001';
        }
        
        const newNumber = lastNumber + 1;
        return `BKT${String(newNumber).padStart(3, '0')}`;
    }

    async getAllExams(filters) {
        this.validateFilters(filters);
        return await ExamRepository.findWithFilters(filters);
    }

    async getExamById(id) {
        if (!id) {
            throw new ValidationError('ID bài kiểm tra là bắt buộc');
        }
        
        const exam = await ExamRepository.findById(id);
        if (!exam) {
            throw new NotFoundError('Không tìm thấy bài kiểm tra');
        }
        
        return exam;
    }

    async getExamStudentView(examId, userId) {
        if (!examId || !userId) {
            throw new ValidationError('ID bài kiểm tra và người dùng là bắt buộc');
        }
        
        const exam = await ExamRepository.findByIdWithSubmission(examId, userId);
        if (!exam) {
            throw new NotFoundError('Không tìm thấy bài kiểm tra');
        }
        
        return exam;
    }

    async createExam(examData) {
        this.validateExamData(examData);
        
        // Generate ID
        const newId = await this.generateExamId();
        const dataWithId = {
            id: newId,
            ...examData
        };
        
        return await ExamRepository.create(dataWithId);
    }

    async updateExam(id, examData) {
        if (!id) {
            throw new ValidationError('ID bài kiểm tra là bắt buộc');
        }
        
        this.validateExamData(examData, false);
        
        const existingExam = await ExamRepository.findById(id);
        if (!existingExam) {
            throw new NotFoundError('Không tìm thấy bài kiểm tra');
        }
        
        return await ExamRepository.update(id, examData);
    }

    async deleteExam(id) {
        if (!id) {
            throw new ValidationError('ID bài kiểm tra là bắt buộc');
        }
        
        const existingExam = await ExamRepository.findById(id);
        if (!existingExam) {
            throw new NotFoundError('Không tìm thấy bài kiểm tra');
        }
        
        // Check if any students have submitted this exam
        const submissionsCount = await ExamRepository.countSubmissions(id);
        if (submissionsCount > 0) {
            throw new ValidationError(
                `Không thể xóa bài kiểm tra này vì đã có ${submissionsCount} học viên làm bài`
            );
        }
        
        return await ExamRepository.delete(id);
    }

    async getExamQuestions(examId, filters) {
        if (!examId) {
            throw new ValidationError('ID bài kiểm tra là bắt buộc');
        }
        
        this.validateFilters(filters);
        return await ExamRepository.findQuestions(examId, filters);
    }

    async updateExamStatus(id, status) {
        if (!id) {
            throw new ValidationError('ID bài kiểm tra là bắt buộc');
        }
        
        if (!['chuaMo', 'dangMo', 'daDong'].includes(status)) {
            throw new ValidationError('Trạng thái không hợp lệ');
        }
        
        const existingExam = await ExamRepository.findById(id);
        if (!existingExam) {
            throw new NotFoundError('Không tìm thấy bài kiểm tra');
        }
        
        return await ExamRepository.updateStatus(id, status);
    }

    async getExamStats(examId) {
        if (!examId) {
            throw new ValidationError('ID bài kiểm tra là bắt buộc');
        }
        
        const exam = await ExamRepository.findById(examId);
        if (!exam) {
            throw new NotFoundError('Không tìm thấy bài kiểm tra');
        }
        
        return await ExamRepository.getStats(examId);
    }

    async getExamSubmissions(examId, filters) {
        if (!examId) {
            throw new ValidationError('ID bài kiểm tra là bắt buộc');
        }
        
        this.validateFilters(filters);
        return await ExamRepository.findSubmissions(examId, filters);
    }

    validateExamData(data, isCreate = true) {
        if (isCreate) {
            if (!data.tieuDe?.trim()) {
                throw new ValidationError('Tiêu đề bài kiểm tra là bắt buộc');
            }
            if (!data.idLop?.trim()) {
                throw new ValidationError('ID lớp học là bắt buộc');
            }
            if (!data.thoiGianBatDau) {
                throw new ValidationError('Thời gian bắt đầu là bắt buộc');
            }
            if (!data.thoiGianKetThuc) {
                throw new ValidationError('Thời gian kết thúc là bắt buộc');
            }
            if (!data.thoiLuong || data.thoiLuong <= 0) {
                throw new ValidationError('Thời lượng phải lớn hơn 0');
            }
        }

        if (data.thoiGianBatDau && data.thoiGianKetThuc) {
            const startDate = new Date(data.thoiGianBatDau);
            const endDate = new Date(data.thoiGianKetThuc);
            
            if (startDate >= endDate) {
                throw new ValidationError('Thời gian bắt đầu phải trước thời gian kết thúc');
            }
        }

        if (data.tongDiem !== undefined && data.tongDiem <= 0) {
            throw new ValidationError('Tổng điểm phải lớn hơn 0');
        }
    }

    validateFilters(filters) {
        if (filters.limit && filters.limit > 100) {
            throw new ValidationError('Không thể lấy quá 100 bản ghi cùng lúc');
        }

        if (filters.page && filters.page < 1) {
            throw new ValidationError('Trang phải lớn hơn 0');
        }
    }
}

export default new ExamService();