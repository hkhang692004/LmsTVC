import express from "express";
import SemesterService from "../services/semesterService.js";

class SemesterController {
    async getAllSemesters(req, res) {
        try {
            const { namhoc, active, page = 1, limit = 20 } = req.query;
            
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
                namHocId: namhoc || null,
                active: active === 'true' ? true : active === 'false' ? false : null,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await SemesterService.getAllSemesters(filters);

            res.json({
                success: true,
                message: 'Lấy danh sách học kỳ thành công',
                data: result.semesters,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });

        } catch (error) {
            console.error('Error in getAllSemesters:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách học kỳ',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    async getCurrentSemester(req, res) {
        try {
            const result = await SemesterService.getCurrentSemester();
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy học kỳ hiện tại'
                });
            }

            res.json({
                success: true,
                message: 'Lấy thông tin học kỳ hiện tại thành công',
                data: result
            });

        } catch (error) {
            console.error('Error in getCurrentSemester:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy học kỳ hiện tại',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    async getSemesterById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await SemesterService.getSemesterById(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy học kỳ'
                });
            }

            res.json({
                success: true,
                message: 'Lấy thông tin học kỳ thành công',
                data: result
            });

        } catch (error) {
            console.error('Error in getSemesterById:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin học kỳ',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default new SemesterController();