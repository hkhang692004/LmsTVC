import express from "express";
import ClassService from "../services/classService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ResponseUtil from "../utils/response.js";
import { ValidationError } from "../utils/errors.js";

class ClassController {
    getAllClasses = asyncHandler(async (req, res) => {
        // 1. Extract and validate query parameters
        const { hocKyId, giangVienId, q, page = 1, limit = 20 } = req.query;

        // 2. Input validation
        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            throw new ValidationError('Limit phải từ 1-100');
        }

        // 3. Build filters object
        const filters = {
            hocKyId: hocKyId || null,
            giangVienId: giangVienId || null,
            search: q || null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        // 4. Call service layer
        const result = await ClassService.getAllClasses(filters);

        // 5. Format successful response
        ResponseUtil.successWithPagination(res, result.classes, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách lớp thành công');
    });
    getClassesForCurrentUser = asyncHandler(async (req, res) => {
        if (!req.user) {
            throw new ValidationError('Người dùng chưa đăng nhập');
        }

        // 2. Extract and validate query parameters
        const { hocKyId, page = 1, limit = 10 } = req.query;

        // 3. Input validation
        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 50)) {
            throw new ValidationError('Limit phải từ 1-50');
        }

        // 4. Build filters object
        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            hocKyId: hocKyId || null
        };

        // 5. Call service layer với user object từ middleware
        const result = await ClassService.getClassesForCurrentUser(req.user, filters);

        // 6. Format successful response
        const message = req.user.role === 'giangVien'
            ? 'Lấy danh sách lớp giảng dạy thành công'
            : 'Lấy danh sách lớp học thành công';

        ResponseUtil.successWithPagination(res, {
            classes: result.classes,
        }, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, message);
    });
    getClassById = asyncHandler(async (req, res) => {
        // 1. Extract and validate parameters
        const { id } = req.params;

        // 2. Input validation
        if (!id) {
            throw new ValidationError('ID lớp học là bắt buộc');
        }

        // 3. Call service layer
        const classDetail = await ClassService.getClassById(id);

        // 4. Format successful response
        ResponseUtil.success(res, classDetail, 'Lấy chi tiết lớp học thành công');
    });

    getStudentsInClass = asyncHandler(async (req, res) => {
        // 1. Extract and validate parameters
        const { id } = req.params;
        const { q, page = 1, limit = 20 } = req.query;

        // 2. Input validation
        if (!id) {
            throw new ValidationError('ID lớp học là bắt buộc');
        }

        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            throw new ValidationError('Limit phải từ 1-100');
        }

        // 3. Build filters object
        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            search: q || null
        };
        // 4. Call service layer
        const result = await ClassService.getStudentsInClass(id, filters);

        // 5. Format successful response
        ResponseUtil.successWithPagination(res, result.students, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách sinh viên thành công');
    });

    addStudentToClass = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { idSinhVien } = req.body;

        // 2. Input validation
        if (!id) {
            throw new ValidationError('ID lớp học là bắt buộc');
        }

        if (!idSinhVien) {
            throw new ValidationError('ID sinh viên là bắt buộc');
        }

        // 3. Call service layer
        const result = await ClassService.addStudentToClass(id,
            idSinhVien
        );

        // 4. Format successful response
        ResponseUtil.success(res, result, 'Thêm sinh viên vào lớp thành công', 201);
    });

    removeStudentFromClass = asyncHandler(async (req, res) => {
        // 1. Extract and validate parameters
        const { id, studentId } = req.params;

        // 2. Input validation
        if (!id) {
            throw new ValidationError('ID lớp học là bắt buộc');
        }

        if (!studentId) {
            throw new ValidationError('ID sinh viên là bắt buộc');
        }

        // 3. Call service layer
        await ClassService.removeStudentFromClass(id, studentId);

        // 4. Format successful response
        ResponseUtil.success(res, null, 'Xóa sinh viên khỏi lớp thành công');
    });

    addStudentsBulk = asyncHandler(async (req, res) => {
        // 1. Extract and validate parameters
        const { id } = req.params;
        const { students } = req.body;

        // 2. Input validation
        if (!id) {
            throw new ValidationError('ID lớp học là bắt buộc');
        }

        if (!students || !Array.isArray(students) || students.length === 0) {
            throw new ValidationError('Danh sách sinh viên là bắt buộc và phải là mảng không rỗng');
        }

        // 3. Validate each student entry
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            if (!student.idSinhVien) {
                throw new ValidationError(`Sinh viên thứ ${i + 1}: ID sinh viên là bắt buộc`);
            }
        }

        // 4. Call service layer
        const result = await ClassService.addStudentsBulk(id, students);

        // 5. Format successful response
        ResponseUtil.success(res, result, 'Thêm danh sách sinh viên vào lớp thành công', 201);
    });

    removeStudentsBulk = asyncHandler(async (req, res) => {
        // 1. Extract and validate parameters
        const { id } = req.params;
        const { studentIds } = req.body;

        // 2. Input validation
        if (!id) {
            throw new ValidationError('ID lớp học là bắt buộc');
        }

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            throw new ValidationError('Danh sách ID sinh viên là bắt buộc và phải là mảng không rỗng');
        }

        // 3. Validate each student ID
        for (let i = 0; i < studentIds.length; i++) {
            const studentId = studentIds[i];
            if (!studentId) {
                throw new ValidationError(`ID sinh viên thứ ${i + 1} không được để trống`);
            }
        }

        // 4. Call service layer
        const result = await ClassService.removeStudentsBulk(id, studentIds);

        // 5. Format successful response
        ResponseUtil.success(res, result, 'Xóa danh sách sinh viên khỏi lớp thành công');
    });

    // REMOVED: updateStudentsBulk (không có gì để update trong junction table)
}

export default new ClassController();