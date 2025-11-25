import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Middleware kiểm tra đăng nhập dựa trên session
 * Verify session và gắn user info vào req.user
 */
export const checkLogin = (req, res, next) => {
    try {
        // 1. Kiểm tra session tồn tại
        if (!req.session) {
            throw new UnauthorizedError('Session không được khởi tạo');
        }

        // 2. Kiểm tra user trong session
        if (!req.session.user) {
            throw new UnauthorizedError('Vui lòng đăng nhập để tiếp tục');
        }

        // 3. Validate session user data
        const sessionUser = req.session.user;
        if (!sessionUser.id || !sessionUser.email || !sessionUser.role) {
            throw new UnauthorizedError('Session không hợp lệ');
        }

        // 4. Gắn user info vào request (từ session)
        req.user = {
            id: sessionUser.id,
            email: sessionUser.email,
            ten: sessionUser.ten,
            role: sessionUser.role
        };

        next();

    } catch (error) {
        next(error);
    }
};

/**
 * Middleware kiểm tra quyền truy cập theo role
 * @param {string|Array} allowedRoles - Role hoặc mảng roles được phép
 * @returns {Function} Express middleware
 */
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // 1. Đảm bảo user đã được authenticate
            if (!req.user) {
                throw new UnauthorizedError('Vui lòng đăng nhập trước');
            }

            // 2. Normalize allowedRoles thành array
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            // 3. Check user role
            if (!roles.includes(req.user.role)) {
                throw new ForbiddenError(`Chỉ ${roles.join(', ')} mới có quyền truy cập`);
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware kiểm tra quyền admin
 */
export const checkAdmin = checkRole('admin');

/**
 * Middleware kiểm tra quyền giảng viên
 */
export const checkTeacher = checkRole(['admin', 'giangVien']);

/**
 * Middleware kiểm tra quyền sinh viên
 */
export const checkStudent = checkRole(['admin', 'giangVien', 'sinhVien']);

/**
 * Middleware cho phép chỉ giảng viên
 */
export const teacherOnly = checkRole('giangVien');

/**
 * Middleware cho phép chỉ sinh viên
 */
export const studentOnly = checkRole('sinhVien');

/**
 * Middleware kiểm tra user có phải owner của resource hay không
 * @param {Function} getResourceUserId - Function lấy userId từ resource
 * @returns {Function} Express middleware
 */
export const checkOwnership = (getResourceUserId) => {
    return async (req, res, next) => {
        try {
            // 1. Đảm bảo user đã được authenticate
            if (!req.user) {
                throw new UnauthorizedError('Vui lòng đăng nhập trước');
            }

            // 2. Admin có full access
            if (req.user.role === 'admin') {
                return next();
            }

            // 3. Lấy userId của resource
            const resourceUserId = await getResourceUserId(req);
            
            // 4. Check ownership
            if (req.user.id !== resourceUserId) {
                throw new ForbiddenError('Bạn không có quyền truy cập tài nguyên này');
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};