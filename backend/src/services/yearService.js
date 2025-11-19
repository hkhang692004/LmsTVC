import YearRepository from "../repositories/yearRepository.js";

class YearService {
    async getAllYears(filters) {
        try {
            this.validateFilters(filters);
            return await YearRepository.findWithFilters(filters);
        } catch (error) {
            throw error;
        }
    }

    async getCurrentYear() {
        try {
            return await YearRepository.findCurrent();
        } catch (error) {
            throw error;
        }
    }

    async getYearById(id) {
        try {
            if (!id) {
                throw new Error('ID năm học là bắt buộc');
            }
            return await YearRepository.findById(id);
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

export default new YearService();