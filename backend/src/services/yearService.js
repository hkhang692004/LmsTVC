import YearRepository from "../repositories/yearRepository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class YearService {
    async getAllYears(filters) {
        this.validateFilters(filters);
        return await YearRepository.findWithFilters(filters);
    }

    async getCurrentYear() {
        const year = await YearRepository.findCurrent();
        if (!year) {
            throw new NotFoundError('Không tìm thấy năm học hiện tại');
        }
        return year;
    }

    async getYearById(id) {
        if (!id) {
            throw new ValidationError('ID năm học là bắt buộc');
        }
        
        const year = await YearRepository.findById(id);
        if (!year) {
            throw new NotFoundError('Không tìm thấy năm học');
        }
        
        return year;
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

export default new YearService();