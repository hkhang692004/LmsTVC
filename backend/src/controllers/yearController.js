import express from "express";
import YearService from "../services/yearService.js";

class YearController {
    async getAllYears(req, res) {
        try {
            const { search, page = 1, limit = 20 } = req.query;
            
            if (page && (isNaN(page) || page < 1)) {
                return res.status(400).json({
                    success: false,
                    message: 'Page phải là số dương'
                });
            }

            if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
                return res.status(400).json({
                    success: false,
                    message: 'Limit phải từ 1-100'
                });
            }

            const filters = {
                search: search || null,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await YearService.getAllYears(filters);

            res.json({
                success: true,
                message: 'Lấy danh sách năm học thành công',
                data: result.years,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });

        } catch (error) {
            console.error('Error in getAllYears:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách năm học',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    async getCurrentYear(req, res) {
        try {
            const result = await YearService.getCurrentYear();
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy năm học hiện tại'
                });
            }

            res.json({
                success: true,
                message: 'Lấy thông tin năm học hiện tại thành công',
                data: result
            });

        } catch (error) {
            console.error('Error in getCurrentYear:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy năm học hiện tại',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    async getYearById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await YearService.getYearById(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy năm học'
                });
            }

            res.json({
                success: true,
                message: 'Lấy thông tin năm học thành công',
                data: result
            });

        } catch (error) {
            console.error('Error in getYearById:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin năm học',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default new YearController();