import DepartmentRepository from "../repositories/departmentRepository.js";

class DepartmentService {
    async getAllDepartments(filters) {
        try {
            this.validateFilters(filters);
            return await DepartmentRepository.findWithFilters(filters);
        } catch (error) {
            throw error;
        }
    }

    async getDepartmentById(id) {
        try {
            if (!id) {
                throw new Error('ID ngành là bắt buộc');
            }
            return await DepartmentRepository.findById(id);
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

export default new DepartmentService();