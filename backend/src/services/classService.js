import ClassRepository from "../repositories/classRepository.js";
import SemesterRepository from "../repositories/semesterRepository.js";
import userRepository from "../repositories/userRepository.js";
import { ValidationError, UnauthorizedError, ForbiddenError, DatabaseError } from "../utils/errors.js";

class ClassService {
    async getAllClasses(filters) {
        this.validateFilters(filters);

        const processedFilters = await this.applyBusinessRules(filters);

        const result = await ClassRepository.findWithFilters(processedFilters);

        if (result.classes.length === 0 && (filters.hocKyId || filters.giangVienId)) {
            console.log('No classes found with filters:', filters);
        }

        return result;
    }

    validateFilters(filters) {
        // Business validation rules
        if (filters.limit > 100) {
            throw new ValidationError('Không thể lấy quá 100 bản ghi cùng lúc', 'limit');
        }

        if (filters.page < 1) {
            throw new ValidationError('Trang phải lớn hơn 0', 'page');
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
    }

    /**
     * Validate user inputs
     */
    validateUserInputs(userId, userRole, filters) {
        if (!userId) {
            throw new ValidationError('User ID là bắt buộc');
        }

        if (!['giangVien', 'sinhVien'].includes(userRole)) {
            throw new UnauthorizedError('Role không hợp lệ. Chỉ chấp nhận giangVien hoặc sinhVien');
        }

        // Validate pagination
        if (filters.page && (isNaN(filters.page) || filters.page < 1)) {
            throw new ValidationError('Page phải là số dương', 'page');
        }

        if (filters.limit && (isNaN(filters.limit) || filters.limit < 1 || filters.limit > 50)) {
            throw new ValidationError('Limit phải từ 1-50 cho user classes', 'limit');
        }
    }

    /**
     * Validate role-specific access rules
     */
    validateRoleAccess(userRole, filters) {
        if (userRole === 'sinhVien' && filters.giangVienId) {
            throw new ForbiddenError('Sinh viên không thể filter theo giảng viên');
        }
    }

    async getClassById(id) {
        const lop = await ClassRepository.findById(id);
        if (!lop) {
            throw new ValidationError('Lớp không tồn tại', 'id');
        }
        return lop;
    }

    async getStudentsInClass(classId, filters = {}) {
        if (!(await ClassRepository.existsById(classId))) {
            throw new ValidationError('Lớp không tồn tại', 'id');
        }
        return await ClassRepository.findStudentsInClass(classId, filters);
    }
    async addStudentToClass(classId, studentId) {
        // 1. Validate class exists
        if (!(await ClassRepository.existsById(classId))) {
            throw new ValidationError('Lớp không tồn tại', 'classId');
        }

        // 2. Validate student exists
        const student = await userRepository.findById(studentId);
        if (!student || student.role !== 'sinhVien') {
            throw new ValidationError('Sinh viên không tồn tại', 'studentId');
        }

        // 3. Check if student is already in class
        const existingEnrollment = await ClassRepository.findStudentInClass(classId, studentId);
        if (existingEnrollment) {
            throw new ValidationError('Sinh viên đã đăng ký lớp này', 'studentId');
        }

        // 4. Add student to class
        return await ClassRepository.addStudentToClass(classId, studentId);
    }


    async removeStudentFromClass(classId, studentId) {
        // 1. Validate class exists
        if (!(await ClassRepository.existsById(classId))) {
            throw new ValidationError('Lớp không tồn tại', 'classId');
        }

        // 2. Validate student exists in class
        const enrollment = await ClassRepository.findStudentInClass(classId, studentId);
        if (!enrollment) {
            throw new ValidationError('Sinh viên không có trong lớp này', 'studentId');
        }

        // 3. Remove student from class
        await ClassRepository.removeStudentFromClass(classId, studentId);

        return { message: 'Xóa sinh viên khỏi lớp thành công' };
    }
    async addStudentsBulk(classId, students) {
        // 1. Validate class exists
        if (!(await ClassRepository.existsById(classId))) {
            throw new ValidationError('Lớp không tồn tại', 'classId');
        }

        // 3. Extract student IDs and validate format
        const studentIds = students.map((student, index) => {
            if (!student.idSinhVien) {
                throw new ValidationError(`Sinh viên thứ ${index + 1}: thiếu idSinhVien`, 'students');
            }
            return student.idSinhVien;
        });

        const validStudents = await userRepository.findByIds(studentIds, { role: 'sinhVien' });
        const validStudentIds = new Set(validStudents.map(s => s.id));
        
        const invalidIds = studentIds.filter(id => !validStudentIds.has(id));
        if (invalidIds.length > 0) {
            throw new ValidationError(
                `Các ID không hợp lệ hoặc không phải sinh viên: ${invalidIds.join(', ')}`,
                'students'
            );
        }

        // 6. Call repository method (handles duplicate checking internally)
        const result = await ClassRepository.addStudentsBulk(classId, students);

        // 7. Add summary message
        const summary = `Thêm ${result.created} sinh viên thành công` +
            (result.skipped > 0 ? `, bỏ qua ${result.skipped} sinh viên đã có trong lớp` : '');

        return {
            ...result,
            summary
        };
    }

    async removeStudentsBulk(classId, studentIds) {
        // 1. Validate class exists
        if (!(await ClassRepository.existsById(classId))) {
            throw new ValidationError('Lớp không tồn tại', 'classId');
        }

        // 2. Validate input format
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            throw new ValidationError('Danh sách ID sinh viên phải là mảng không rỗng', 'studentIds');
        }

        // 3. Validate each student ID format
        studentIds.forEach((studentId, index) => {
            if (!studentId) {
                throw new ValidationError(`ID sinh viên thứ ${index + 1} không được để trống`, 'studentIds');
            }
        });

        // 4. Batch validate students exist (optional - Repository will handle not found)
        const existingStudents = await userRepository.findByIds(studentIds);
        const existingStudentIds = new Set(existingStudents.map(s => s.id));
        
        const nonExistentStudents = studentIds.filter(id => !existingStudentIds.has(id));
        if (nonExistentStudents.length > 0) {
            console.warn('Some students do not exist:', nonExistentStudents);
            // Continue anyway - Repository will handle gracefully
        }

        // 5. Call repository method (handles not found internally)
        const result = await ClassRepository.removeStudentsBulk(classId, studentIds);

        // 6. Add summary message
        const summary = `Xóa ${result.deleted} sinh viên thành công` +
            (result.notFound > 0 ? `, ${result.notFound} sinh viên không có trong lớp` : '');

        return {
            ...result,
            summary
        };
    }
}

export default new ClassService();