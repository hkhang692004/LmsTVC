import SemesterRepository from "../repositories/semesterRepository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class SemesterService {
    async getAllSemesters(filters) {
        this.validateFilters(filters);
        return await SemesterRepository.findWithFilters(filters);
    }

    async getCurrentSemester() {
        const semester = await SemesterRepository.findCurrent();
        if (!semester) {
            throw new NotFoundError('Không tìm thấy học kỳ hiện tại');
        }
        return semester;
    }

    async getSemesterById(id) {
        if (!id) {
            throw new ValidationError('ID học kỳ là bắt buộc');
        }
        
        const semester = await SemesterRepository.findById(id);
        if (!semester) {
            throw new NotFoundError('Không tìm thấy học kỳ');
        }
        
        return semester;
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

export default new SemesterService();