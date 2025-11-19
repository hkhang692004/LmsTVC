import SubjectRepository from "../repositories/subjectRepository.js";

class SubjectService {
    async getAllSubjects(filters) {
        try {
            this.validateFilters(filters);
            return await SubjectRepository.findWithFilters(filters);
        } catch (error) {
            throw error;
        }
    }

    async getSubjectById(id) {
        try {
            if (!id) {
                throw new Error('ID môn học là bắt buộc');
            }
            return await SubjectRepository.findById(id);
        } catch (error) {
            throw error;
        }
    }

    validateFilters(filters) {
        if (filters.limit > 100) {
            throw new Error('Không thể lấy quá 100 bản ghi cùng lúc');
        }

        if (filters.page < 1) {
            throw new Error('Trang phải lớn hơn 0');
        }
    }
}

export default new SubjectService();