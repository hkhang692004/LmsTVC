import express from "express";
import SubjectService from "../services/subjectService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ResponseUtil from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class SubjectController {
    getAllSubjects = asyncHandler(async (req, res) => {
        const { nganh, search, page = 1, limit = 20 } = req.query;
        
        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            throw new ValidationError('Limit phải từ 1-100');
        }

        const filters = {
            nganhId: nganh || null,
            search: search || null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await SubjectService.getAllSubjects(filters);

        ResponseUtil.successWithPagination(res, result.subjects, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách môn học thành công');
    });
    
    getSubjectById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const result = await SubjectService.getSubjectById(id);
        
        if (!result) {
            throw new NotFoundError('Không tìm thấy môn học');
        }

        ResponseUtil.success(res, result, 'Lấy thông tin môn học thành công');
    });
}

export default new SubjectController();