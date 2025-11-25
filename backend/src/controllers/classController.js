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
        // 1. Kiểm tra user đã đăng nhập (middleware auth should set req.user)
        if (!req.user) {
            throw new ValidationError('Người dùng chưa đăng nhập');
        }
        
        // 2. Extract and validate query parameters
        const { hocKyId, q, page = 1, limit = 10 } = req.query;

        // 3. Input validation
        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 50)) {
            throw new ValidationError('Limit phải từ 1-50');
        }

        // 4. Build filters object
        const filters = {
            hocKyId: hocKyId || null,
            search: q || null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        // 5. Call service layer với user object từ middleware
        const result = await ClassService.getClassesForCurrentUser(req.user, filters);

        // 6. Format successful response
        const message = req.user.role === 'giangVien' 
            ? 'Lấy danh sách lớp giảng dạy thành công' 
            : 'Lấy danh sách lớp học thành công';

        ResponseUtil.successWithPagination(res, {
            classes: result.classes,
            summary: result.summary
        }, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, message);
    });
    getClassById = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    updateClass = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    getClassStats = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    getClassOverview = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    getStudentsInClass = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    addStudentToClass = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    updateStudentInClass = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    removeStudentFromClass = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    addStudentsBulk = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    updateStudentsBulk = asyncHandler(async (req, res) => {
        // TODO: Implement
    });

    removeStudentsBulk = asyncHandler(async (req, res) => {
        // TODO: Implement
    });
}

export default new ClassController();