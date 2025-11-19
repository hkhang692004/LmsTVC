import express from "express";
import ClassService from "../services/classService.js";
class ClassController {
    async getAllClasses(req, res) {
        try {
            // 1. Extract and validate query parameters
            const { hocKyId, giangVienId, q, page = 1, limit = 20 } = req.query;
            
            // 2. Input validation
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
            res.json({
                success: true,
                message: 'Lấy danh sách lớp thành công',
                data: result.classes,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });

        } catch (error) {
            // 6. Error handling
            console.error('Error in getAllClasses:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách lớp',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    async getClassesForCurrentUser(req, res) {
        try {
            // 1. Kiểm tra user đã đăng nhập (middleware auth should set req.user)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Người dùng chưa đăng nhập'
                });
            }
            
            // 2. Extract and validate query parameters
            const { hocKyId, q, page = 1, limit = 10 } = req.query;

            // 3. Input validation
            if (page && (isNaN(page) || page < 1)) {
                return res.status(400).json({
                    success: false,
                    message: 'Page phải là số dương'
                });
            }

            if (limit && (isNaN(limit) || limit < 1 || limit > 50)) {
                return res.status(400).json({
                    success: false,
                    message: 'Limit phải từ 1-50'
                });
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
            res.json({
                success: true,
                message: req.user.role === 'giangVien' 
                    ? 'Lấy danh sách lớp giảng dạy thành công' 
                    : 'Lấy danh sách lớp học thành công',
                data: result.classes,
                summary: result.summary,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });

        } catch (error) {
            // 7. Error handling
            console.error('Error in getClassesForCurrentUser:', error);
            
            if (error.message.includes('không hợp lệ') || error.message.includes('bắt buộc')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách lớp',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    getClassById(req, res) {
    }
    updateClass(req, res) {
    }
    getClassStats(req, res) {
    }
    getClassOverview(req, res) {
    }
    getStudentsInClass(req, res) {
    }
    addStudentToClass(req, res) {
    }
    updateStudentInClass(req, res) {
    }
    removeStudentFromClass(req, res) {
    }
    addStudentsBulk(req, res) {
    }
    updateStudentsBulk(req, res) {
    }
    removeStudentsBulk(req, res) {
    }
}

export default new ClassController();