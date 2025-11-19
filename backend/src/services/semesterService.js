import SemesterRepository from "../repositories/semesterRepository.js";

class SemesterService {
    async getAllSemesters(filters) {
        try {
            this.validateFilters(filters);
            return await SemesterRepository.findWithFilters(filters);
        } catch (error) {
            throw error;
        }
    }

    async getCurrentSemester() {
        try {
            return await SemesterRepository.findCurrent();
        } catch (error) {
            throw error;
        }
    }

    async getSemesterById(id) {
        try {
            if (!id) {
                throw new Error('ID học kỳ là bắt buộc');
            }
            return await SemesterRepository.findById(id);
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

export default new SemesterService();