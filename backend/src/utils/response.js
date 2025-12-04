
class ResponseUtil {
    static success(res, data, message = 'Thành công', statusCode = 200, meta = null) {
        const response = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };

        if (meta) {
            response.meta = meta;
        }

        return res.status(statusCode).json(response);
    }

    static successWithPagination(res, data, pagination, message = 'Thành công') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages: pagination.totalPages,
                hasNext: pagination.page < pagination.totalPages,
                hasPrev: pagination.page > 1
            },
            timestamp: new Date().toISOString()
        });
    }

    static created(res, data, message = 'Tạo thành công') {
        return this.success(res, data, message, 201);
    }

    static noContent(res, message = 'Xử lý thành công') {
        return res.status(204).json({
            success: true,
            message,
            timestamp: new Date().toISOString()
        });
    }

}

export default ResponseUtil;