import express from "express";
import SubjectService from "../services/subjectService.js";

class SubjectController {
    async getAllSubjects(req, res) {
        try {
            const { nganh, search, page = 1, limit = 20 } = req.query;
            
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
                nganhId: nganh || null,
                search: search || null,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await SubjectService.getAllSubjects(filters);

            res.json({
                success: true,
                message: 'Lấy danh sách môn học thành công',
                data: result.subjects,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });

        } catch (error) {
            console.error('Error in getAllSubjects:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách môn học',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    async getSubjectById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await SubjectService.getSubjectById(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy môn học'
                });
            }

            res.json({
                success: true,
                message: 'Lấy thông tin môn học thành công',
                data: result
            });

        } catch (error) {
            console.error('Error in getSubjectById:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin môn học',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default new SubjectController();