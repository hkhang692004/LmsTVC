import SubjectRepository from "../repositories/subjectRepository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class SubjectService {
    async getAllSubjects(filters) {
        this.validateFilters(filters);
        return await SubjectRepository.findWithFilters(filters);
    }

    async getSubjectById(id) {
        if (!id) {
            throw new ValidationError('ID môn học là bắt buộc');
        }
        
        const subject = await SubjectRepository.findById(id);
        if (!subject) {
            throw new NotFoundError('Không tìm thấy môn học');
        }
        
        return subject;
    }

    validateFilters(filters) {
        if (filters.limit > 100) {
            throw new ValidationError('Không thể lấy quá 100 bản ghi cùng lúc', 'limit');
        }

        if (filters.page < 1) {
            throw new ValidationError('Trang phải lớn hơn 0', 'page');
        }
    }
}

export default new SubjectService();