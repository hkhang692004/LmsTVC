import express from "express";
import DepartmentService from "../services/departmentService.js";

class DepartmentController {
    async getAllDepartments(req, res) {
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

            const result = await DepartmentService.getAllDepartments(filters);

            res.json({
                success: true,
                message: 'Lấy danh sách ngành thành công',
                data: result.departments,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });

        } catch (error) {
            console.error('Error in getAllDepartments:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách ngành',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    async getDepartmentById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await DepartmentService.getDepartmentById(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ngành'
                });
            }

            res.json({
                success: true,
                message: 'Lấy thông tin ngành thành công',
                data: result
            });

        } catch (error) {
            console.error('Error in getDepartmentById:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin ngành',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default new DepartmentController();