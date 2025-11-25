// Custom Error Classes để phân loại và handle lỗi

class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true; // Để phân biệt với programming error
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, field = null) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        this.field = field;
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Không tìm thấy tài nguyên') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Không có quyền truy cập') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Bị cấm truy cập') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}

class ConflictError extends AppError {
    constructor(message = 'Dữ liệu đã tồn tại') {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Lỗi cơ sở dữ liệu') {
        super(message, 500, 'DATABASE_ERROR');
        this.name = 'DatabaseError';
    }
}

export {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    DatabaseError
};