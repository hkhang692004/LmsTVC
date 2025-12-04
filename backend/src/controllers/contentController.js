import ContentService from '../services/contentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import ResponseUtil from '../utils/response.js';
import fs from 'fs/promises';

class ContentController {

    // GET /api/content/:id
    getContentById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const content = await ContentService.getContentById(id);
        
        ResponseUtil.success(res, content, 'Lấy thông tin nội dung thành công');
    });

    // POST /api/content
    createContent = asyncHandler(async (req, res) => {
        // Extract content data from body
        const contentData = {
            idChuDe: req.body.idChuDe,
            idNguoiDung: req.user?.id || req.body.idNguoiDung, // From auth middleware
            idNoiDungCha: req.body.idNoiDungCha,
            tieuDe: req.body.tieuDe,
            noiDung: req.body.noiDung,
            loaiNoiDung: req.body.loaiNoiDung,
            hanNop: req.body.hanNop,
            status: req.body.status
        };

        // Extract files from multer if multipart/form-data
        const files = req.files || [];

        const result = await ContentService.createContent(contentData, files);

        ResponseUtil.success(res, result, 'Tạo nội dung thành công', 201);
    });

    // PUT /api/content/:id
    updateContent = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        // Extract update data
        const updateData = {};
        const allowedFields = [
            'tieuDe', 'noiDung', 'loaiNoiDung', 'hanNop', 
            'status', 'idNoiDungCha'
        ];

        // Only include provided fields
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Extract new files if any
        const files = req.files || [];

        const result = await ContentService.updateContent(id, updateData, files);

        ResponseUtil.success(res, result, 'Cập nhật nội dung thành công');
    });

    // DELETE /api/content/:id
    deleteContent = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        await ContentService.deleteContent(id);
        
        ResponseUtil.success(res, null, 'Xóa nội dung thành công');
    });

    // PUT /api/content/:id/status
    changeContentStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return ResponseUtil.error(res, 'Trạng thái là bắt buộc', 400, 'MISSING_STATUS');
        }

        const result = await ContentService.changeContentStatus(id, status);

        ResponseUtil.success(res, result, 'Cập nhật trạng thái thành công');
    });



    // DELETE /api/content/files/:id
    deleteFile = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        await ContentService.deleteFile(id);
        
        ResponseUtil.success(res, null, 'Xóa file thành công');
    });

    // GET /api/content/:assignmentId/assignment-view
    getAssignmentView = asyncHandler(async (req, res) => {
        const { assignmentId } = req.params;
        const userId = req.user.id; 

        const result = await ContentService.getAssignmentView(assignmentId, userId);
        
        ResponseUtil.success(res, result, 'Lấy thông tin bài tập thành công');
    });


}

export default new ContentController();
