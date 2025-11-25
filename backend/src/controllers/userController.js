import express from "express";
import UserService from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ResponseUtil from "../utils/response.js";
import { ValidationError } from "../utils/errors.js";

class UserController {
    createUser = asyncHandler(async (req, res) => {
        const { ten, email, password, role = 'sinhVien' } = req.body;

        const user = await UserService.createUser({ ten, email, password, role });
        
        ResponseUtil.created(res, {
            id: user.id,
            ten: user.ten,
            email: user.email,
            role: user.role,
            status: user.status
        }, 'Tạo người dùng thành công');
    });

    getAllUsers = asyncHandler(async (req, res) => {
        const { role, status, search, page = 1, limit = 20 } = req.query;
        
        const filters = {
            role: role || null,
            status: status === 'true' ? true : status === 'false' ? false : null,
            search: search || null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await UserService.getAllUsers(filters);
        
        ResponseUtil.successWithPagination(res, result.users, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách người dùng thành công');
    });

    getUserById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const user = await UserService.getUserById(id);
        
        ResponseUtil.success(res, {
            id: user.id,
            ten: user.ten,
            email: user.email,
            role: user.role,
            status: user.status,
            avatar: user.avatar,
            createAt: user.createAt
        }, 'Lấy thông tin người dùng thành công');
    });

    updateUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        
        const user = await UserService.updateUser(id, updateData);
        
        ResponseUtil.success(res, {
            id: user.id,
            ten: user.ten,
            email: user.email,
            role: user.role,
            status: user.status,
            avatar: user.avatar
        }, 'Cập nhật người dùng thành công');
    });

    deleteUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        await UserService.deleteUser(id);
        
        ResponseUtil.success(res, null, 'Xóa người dùng thành công');
    });

    getUserProfile = asyncHandler(async (req, res) => {
        // req.user được set bởi checkLogin middleware
        const user = req.user;
        
        ResponseUtil.success(res, {
            id: user.id,
            ten: user.ten,
            email: user.email,
            role: user.role
        }, 'Lấy thông tin người dùng thành công');
    });

    getUserClasses = asyncHandler(async (req, res) => {
        const user = req.user; // From auth middleware
        const { hocKyId, page = 1, limit = 10 } = req.query;
        
        const filters = {
            hocKyId: hocKyId || null,
            page: parseInt(page),
            limit: parseInt(limit)
        };
        
        const result = await UserService.getUserClasses(user, filters);
        
        ResponseUtil.successWithPagination(res, result.classes, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách lớp học thành công');
    });

    loginUser = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const user = await UserService.authenticate(email, password);
        req.session.user = {
            id: user.id,
            ten: user.ten,
            email: user.email,
            role: user.role
        };

        ResponseUtil.success(res, {
            user: {
                id: user.id,
                ten: user.ten,
                email: user.email,
                role: user.role
            }
        }, 'Đăng nhập thành công');
    });

    logoutUser = asyncHandler(async (req, res) => {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                    return ResponseUtil.success(res, null, 'Đăng xuất thành công (session cleanup failed)');
                }
                
                // Clear session cookie
                res.clearCookie('sessionId');
                ResponseUtil.success(res, null, 'Đăng xuất thành công');
            });
        } else {
            ResponseUtil.success(res, null, 'Đã đăng xuất');
        }
    });

    changePassword = asyncHandler(async (req, res) => {
        const user = req.user; // From auth middleware
        const { currentPassword, newPassword } = req.body;
        
        await UserService.changePassword(user.id, currentPassword, newPassword);
        
        ResponseUtil.success(res, null, 'Đổi mật khẩu thành công');
    });
}

export default new UserController();
