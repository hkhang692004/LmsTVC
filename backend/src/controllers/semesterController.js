import express from "express";
import SemesterService from "../services/semesterService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ResponseUtil from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class SemesterController {
    getAllSemesters = asyncHandler(async (req, res) => {
        const { namhoc, active, page = 1, limit = 20 } = req.query;
        
        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            throw new ValidationError('Limit phải từ 1-100');
        }

        const filters = {
            namHocId: namhoc || null,
            active: active === 'true' ? true : active === 'false' ? false : null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await SemesterService.getAllSemesters(filters);

        ResponseUtil.successWithPagination(res, result.semesters, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách học kỳ thành công');
    });
    
    getCurrentSemester = asyncHandler(async (req, res) => {
        const result = await SemesterService.getCurrentSemester();
        
        if (!result) {
            throw new NotFoundError('Không tìm thấy học kỳ hiện tại');
        }

        ResponseUtil.success(res, result, 'Lấy thông tin học kỳ hiện tại thành công');
    });
    
    getSemesterById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const result = await SemesterService.getSemesterById(id);
        
        if (!result) {
            throw new NotFoundError('Không tìm thấy học kỳ');
        }

        ResponseUtil.success(res, result, 'Lấy thông tin học kỳ thành công');
    });
}

export default new SemesterController();