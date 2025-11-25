import express from "express";
import UserRepository from "../repositories/userRepository.js";
import ClassRepository from "../repositories/classRepository.js";
import bcrypt from "bcrypt";
import { ValidationError, UnauthorizedError, NotFoundError, ConflictError } from "../utils/errors.js";

class UserService {
    async authenticate(email, password) {
        if (!email || !password) {
            throw new ValidationError('Email và mật khẩu là bắt buộc');
        }

        const user = await UserRepository.findByEmail(email);
        if (!user || !user.status) {
            throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
        }

        return user;
    }

    async createUser(userData) {
        const { ten, email, password, role = 'sinhVien' } = userData;
        
        // Validation
        if (!ten || !email || !password) {
            throw new ValidationError('Tên, email và mật khẩu là bắt buộc');
        }

        if (!this.isValidEmail(email)) {
            throw new ValidationError('Email không đúng định dạng');
        }

        if (password.length < 6) {
            throw new ValidationError('Mật khẩu phải có ít nhất 6 ký tự');
        }

        if (!['admin', 'giangVien', 'sinhVien'].includes(role)) {
            throw new ValidationError('Role không hợp lệ');
        }

        // Check if email already exists
        const existingUserByEmail = await UserRepository.findByEmail(email);
        if (existingUserByEmail) {
            throw new ConflictError('Email đã được sử dụng');
        }

        // Generate unique ID based on role
        const id = await this.generateUserId(role);

        // Hash password
        const hashedPassword = await this.hashPassword(password);

        const newUser = {
            id,
            ten,
            email,
            password: hashedPassword,
            role,
            status: true
        };

        return await UserRepository.create(newUser);
    }

    async getAllUsers(filters) {
        this.validatePaginationFilters(filters);
        return await UserRepository.findWithFilters(filters);
    }

    async getUserById(id) {
        if (!id) {
            throw new ValidationError('ID người dùng là bắt buộc');
        }

        const user = await UserRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        return user;
    }

    async updateUser(id, updateData) {
        if (!id) {
            throw new ValidationError('ID người dùng là bắt buộc');
        }

        // Check if user exists
        const existingUser = await UserRepository.findById(id);
        if (!existingUser) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        // Validate update data
        if (updateData.email && !this.isValidEmail(updateData.email)) {
            throw new ValidationError('Email không đúng định dạng');
        }

        if (updateData.email && updateData.email !== existingUser.email) {
            const userWithEmail = await UserRepository.findByEmail(updateData.email);
            if (userWithEmail) {
                throw new ConflictError('Email đã được sử dụng');
            }
        }

        if (updateData.role && !['admin', 'giangVien', 'sinhVien'].includes(updateData.role)) {
            throw new ValidationError('Role không hợp lệ');
        }

        // Hash password if provided
        if (updateData.password) {
            if (updateData.password.length < 6) {
                throw new ValidationError('Mật khẩu phải có ít nhất 6 ký tự');
            }
            updateData.password = await this.hashPassword(updateData.password);
        }

        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.createAt;

        updateData.updateAt = new Date();

        return await UserRepository.update(id, updateData);
    }

    async deleteUser(id) {
        if (!id) {
            throw new ValidationError('ID người dùng là bắt buộc');
        }

        const user = await UserRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        // Soft delete by setting status to false
        return await UserRepository.update(id, { status: false });
    }

    async getUserClasses(user, filters) {
        if (!user || !user.id) {
            throw new ValidationError('Thông tin người dùng không hợp lệ');
        }

        this.validatePaginationFilters(filters);

        // Delegate to ClassRepository to get user's classes
        return await ClassRepository.findClassesForUser(user, filters);
    }

    async changePassword(userId, currentPassword, newPassword) {
        if (!userId || !currentPassword || !newPassword) {
            throw new ValidationError('Tất cả thông tin mật khẩu là bắt buộc');
        }

        if (newPassword.length < 6) {
            throw new ValidationError('Mật khẩu mới phải có ít nhất 6 ký tự');
        }

        // Get user with password for verification
        const user = await UserRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedError('Mật khẩu hiện tại không đúng');
        }

        // Hash new password
        const hashedNewPassword = await this.hashPassword(newPassword);

        // Update password
        return await UserRepository.update(userId, { 
            password: hashedNewPassword,
            updateAt: new Date()
        });
    }

    // Helper methods
    async generateUserId(role) {
        let prefix = '';
        switch (role) {
            case 'admin':
                prefix = 'AD';
                break;
            case 'giangVien':
                prefix = 'GV';
                break;
            case 'sinhVien':
                prefix = 'SV';
                break;
            default:
                prefix = 'US';
        }

        // Get current year
        const currentYear = new Date().getFullYear().toString().slice(-2);
        
        // Find the highest existing ID with this prefix and year
        const maxId = await UserRepository.findMaxIdByPrefix(prefix + currentYear);
        
        let nextNumber = 1;
        if (maxId) {
            // Extract number from existing ID (e.g., SV24001 -> 001)
            const existingNumber = parseInt(maxId.slice(-3));
            nextNumber = existingNumber + 1;
        }

        // Format with leading zeros (e.g., 001, 002, etc.)
        const formattedNumber = nextNumber.toString().padStart(3, '0');
        
        return `${prefix}${currentYear}${formattedNumber}`;
    }

    async hashPassword(password) {
        return bcrypt.hash(password, 12);
    }

    async verifyPassword(password, hashPassword) {
        return bcrypt.compare(password, hashPassword);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePaginationFilters(filters) {
        if (filters.page && (isNaN(filters.page) || filters.page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (filters.limit && (isNaN(filters.limit) || filters.limit < 1 || filters.limit > 100)) {
            throw new ValidationError('Limit phải từ 1-100');
        }
    }
}

export default new UserService();