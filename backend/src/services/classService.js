import ClassRepository from "../repositories/classRepository.js";

class ClassService {
    async getAllClasses(filters) {
        try {
            this.validateFilters(filters);

            const processedFilters = await this.applyBusinessRules(filters);

            const result = await ClassRepository.findWithFilters(processedFilters);

            if (result.classes.length === 0 && (filters.hocKyId || filters.giangVienId)) {
                console.log('No classes found with filters:', filters);
            }

            return result;

        } catch (error) {
            throw error;
        }
    }

    validateFilters(filters) {
        // Business validation rules
        if (filters.limit > 100) {
            throw new Error('Không thể lấy quá 100 bản ghi cùng lúc');
        }

        if (filters.page < 1) {
            throw new Error('Trang phải lớn hơn 0');
        }
    }

    async applyBusinessRules(filters) {
        // Business rule: Nếu không có học kỳ, lấy học kỳ hiện tại
        if (!filters.hocKyId) {
            // Có thể thêm logic lấy học kỳ hiện tại nếu cần
            const currentSemester = await SemesterRepository.findCurrent();
            if (currentSemester) {
                filters.hocKyId = currentSemester.id;
            }
        }

        return filters;
    }

    /**
     * Lấy danh sách lớp cho người dùng hiện tại
     * @param {Object} user - User object từ middleware auth {id, role, ...}
     * @param {Object} filters - Filters và pagination options
     */
    async getClassesForCurrentUser(user, filters = {}) {
        try {
            const { id: userId, role: userRole } = user;

            // 1. Validate inputs
            this.validateUserInputs(userId, userRole, filters);

            // 2. Validate role-specific business rules
            this.validateRoleAccess(userRole, filters);

            // 3. Apply business rules và data processing
            const processedFilters = await this.applyBusinessRules(filters);

            // 4. Repository call
            const result = await ClassRepository.findClassesForUser(user, processedFilters);


            return result;

        } catch (error) {
            console.error(`Error in getClassesForCurrentUser for ${userRole}:`, error);
            throw error;
        }
    }

    /**
     * Validate user inputs
     */
    validateUserInputs(userId, userRole, filters) {
        if (!userId) {
            throw new Error('User ID là bắt buộc');
        }

        if (!['giangVien', 'sinhVien'].includes(userRole)) {
            throw new Error('Role không hợp lệ. Chỉ chấp nhận giangVien hoặc sinhVien');
        }

        // Validate pagination
        if (filters.page && (isNaN(filters.page) || filters.page < 1)) {
            throw new Error('Page phải là số dương');
        }

        if (filters.limit && (isNaN(filters.limit) || filters.limit < 1 || filters.limit > 50)) {
            throw new Error('Limit phải từ 1-50 cho user classes');
        }
    }

    /**
     * Validate role-specific access rules
     */
    validateRoleAccess(userRole, filters) {
        if (userRole === 'sinhVien' && filters.giangVienId) {
            throw new Error('Sinh viên không thể filter theo giảng viên');
        }

        // Business rule: Sinh viên chỉ có thể xem lớp của học kỳ hiện tại hoặc quá khứ
        if (userRole === 'sinhVien' && filters.future === true) {
            throw new Error('Sinh viên không thể xem lớp tương lai');
        }
    }


    // Helper method - có thể implement sau
    async getCurrentSemesterId() {
        // Logic để lấy học kỳ hiện tại
        return null;
    }

}

export default new ClassService();