import DepartmentService from "../services/departmentService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ResponseUtil from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class DepartmentController {
    getAllDepartments = asyncHandler(async (req, res) => {
        const { search, page = 1, limit = 20 } = req.query;

        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            throw new ValidationError('Limit phải từ 1-100');
        }

        const filters = {
            search: search || null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await DepartmentService.getAllDepartments(filters);

        ResponseUtil.successWithPagination(res, result.departments, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách ngành thành công');
    });

    getDepartmentById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const result = await DepartmentService.getDepartmentById(id);

        if (!result) {
            throw new NotFoundError('Không tìm thấy ngành');
        }

        ResponseUtil.success(res, result, 'Lấy thông tin ngành thành công');
    });
}

export default new DepartmentController();