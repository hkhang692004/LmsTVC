import express from "express";
import YearService from "../services/yearService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ResponseUtil from "../utils/response.js";
import { ValidationError } from "../utils/errors.js";

class YearController {
    getAllYears = asyncHandler(async (req, res) => {
        const { search, page = 1, limit = 20 } = req.query;
        
        // Validation sẽ được handle bởi service layer thông qua custom errors
        const filters = {
            search: search || null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await YearService.getAllYears(filters);

        ResponseUtil.successWithPagination(
            res,
            result.years,
            {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            },
            'Lấy danh sách năm học thành công'
        );
    });
    
    getCurrentYear = asyncHandler(async (req, res) => {
        const result = await YearService.getCurrentYear();
        
        ResponseUtil.success(
            res,
            result,
            'Lấy thông tin năm học hiện tại thành công'
        );
    });
    
    getYearById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const result = await YearService.getYearById(id);
        
        ResponseUtil.success(
            res,
            result,
            'Lấy thông tin năm học thành công'
        );
    });
}

export default new YearController();