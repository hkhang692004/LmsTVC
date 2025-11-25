import DepartmentRepository from "../repositories/departmentRepository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class DepartmentService {
    async getAllDepartments(filters) {
        this.validateFilters(filters);
        return await DepartmentRepository.findWithFilters(filters);
    }

    async getDepartmentById(id) {
        if (!id) {
            throw new ValidationError('ID ngành là bắt buộc');
        }
        
        const department = await DepartmentRepository.findById(id);
        if (!department) {
            throw new NotFoundError('Không tìm thấy ngành học');
        }
        
        return department;
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

export default new DepartmentService();