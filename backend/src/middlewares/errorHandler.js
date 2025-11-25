import { AppError } from '../utils/errors.js';

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error cho development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name,
            errorCode: err.errorCode,
            url: req.url,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query
        });
    }

    // Nếu đã là custom error (có errorCode), không cần transform
    if (err.errorCode) {
        error = err;
    }
    // Xử lý built-in library errors
    else if (err.name === 'SequelizeValidationError') {
        const messages = err.errors.map(e => e.message);
        error = new AppError(messages.join(', '), 400, 'VALIDATION_ERROR');
    }
    else if (err.name === 'SequelizeUniqueConstraintError') {
        const message = 'Dữ liệu đã tồn tại';
        error = new AppError(message, 409, 'CONFLICT');
    }
    else if (err.name === 'SequelizeForeignKeyConstraintError') {
        const message = 'Không thể thực hiện do ràng buộc dữ liệu';
        error = new AppError(message, 400, 'CONSTRAINT_ERROR');
    }
    else if (err.name === 'SequelizeDatabaseError') {
        const message = 'Lỗi cơ sở dữ liệu';
        error = new AppError(message, 500, 'DATABASE_ERROR');
    }
    else if (err.name === 'SequelizeConnectionError') {
        const message = 'Không thể kết nối cơ sở dữ liệu';
        error = new AppError(message, 503, 'CONNECTION_ERROR');
    }
    else if (err.name === 'JsonWebTokenError') {
        const message = 'Token không hợp lệ';
        error = new AppError(message, 401, 'INVALID_TOKEN');
    }
    else if (err.name === 'TokenExpiredError') {
        const message = 'Token đã hết hạn';
        error = new AppError(message, 401, 'EXPIRED_TOKEN');
    }
    // Generic validation error (for other libraries)
    else if (err.name === 'ValidationError' && !err.errorCode) {
        const message = 'Dữ liệu không hợp lệ';
        error = new AppError(message, 400, 'VALIDATION_ERROR');
    }
    // Unknown error
    else {
        error = new AppError('Lỗi server không xác định', 500, 'SERVER_ERROR');
    }

    // Chuẩn hóa response format
    const response = {
        success: false,
        message: error.message || 'Lỗi server không xác định',
        errorCode: error.errorCode || 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    };

    // Thêm thông tin debug cho development
    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
        response.details = {
            name: err.name,
            originalMessage: err.message,
            originalErrorCode: err.errorCode
        };
    }

    // Thêm field specific error nếu có
    if (error.field) {
        response.field = error.field;
    }

    // Trả về response với status code phù hợp
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(response);
};

export default errorHandler;