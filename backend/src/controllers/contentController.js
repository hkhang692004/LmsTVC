import ContentService from '../services/contentService.js';
import  asyncHandler  from '../utils/asyncHandler.js';
import ResponseUtil from '../utils/response.js';
import fs from 'fs/promises';

class ContentController {

    // GET /api/content/:id
    getContentById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const content = await ContentService.getContentById(id);

        ResponseUtil.success(res, content, 'Lấy thông tin nội dung thành công');
    });

    // GET /api/content/:id/comments - Get post with all nested comments (ForumContent page)
    getCommentsByContentId = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const data = await ContentService.getPostWithComments(id);

        ResponseUtil.success(res, data, 'Lấy bài viết và bình luận thành công');
    });

    // GET /api/content/:id/posts - Get forum with direct posts only (Forum page)
    getForumPosts = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const data = await ContentService.getForumWithDirectPosts(id);

        ResponseUtil.success(res, data, 'Lấy diễn đàn và bài viết thành công');
    });

    // GET /api/content/:id/files - Get folder children documents (Directory page)
    getFolderFiles = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const files = await ContentService.getFolderFiles(id);

        ResponseUtil.success(res, files, 'Lấy danh sách file thành công');
    });

    // GET /api/content/:id/submissions - Get my submissions for assignment
    getMySubmissions = asyncHandler(async (req, res) => {
        const { id: assignmentId } = req.params;
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return ResponseUtil.error(res, 'Bạn cần đăng nhập để xem bài nộp', 401);
        }

        const submissions = await ContentService.getMySubmissions(assignmentId, userId);

        ResponseUtil.success(res, submissions, 'Lấy danh sách bài nộp thành công');
    });

    // GET /api/content/:id/all-submissions - Get all submissions for assignment (teacher)
    getAllSubmissions = asyncHandler(async (req, res) => {
        const { id: assignmentId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return ResponseUtil.error(res, 'Bạn cần đăng nhập', 401);
        }

        const result = await ContentService.getAllSubmissions(assignmentId, parseInt(page), parseInt(limit));

        ResponseUtil.success(res, result, 'Lấy danh sách tất cả bài nộp thành công');
    });

    // POST /api/content
    createContent = asyncHandler(async (req, res) => {
        console.log('[ContentController] createContent called');
        console.log('[ContentController] req.files:', req.files);
        console.log('[ContentController] req.body:', { tieuDe: req.body.tieuDe, loaiNoiDung: req.body.loaiNoiDung });
        
        // Extract content data from body
        const contentData = {
            idChuDe: req.body.idChuDe,
            idNguoiDung: req.user?.id || req.body.idNguoiDung, // From auth middleware
            idNoiDungCha: req.body.idNoiDungCha,
            tieuDe: req.body.tieuDe,
            noiDung: req.body.noiDung,
            loaiNoiDung: req.body.loaiNoiDung,
            hanNop: req.body.hanNop,
            status: req.body.status,
            videoUrl: req.body.videoUrl, // Youtube URL if provided
            linkUrl: req.body.linkUrl // External link URL if provided
        };

        const files = req.files || [];
        console.log('[ContentController] Extracted files count:', files.length);

        const result = await ContentService.createContent(contentData, files);
        console.log('[ContentController] Content created, result id:', result?.id);

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
        
        // Extract remainFiles (IDs of files to keep)
        let remainFiles = [];
        if (req.body.remainFiles) {
            // remainFiles can be a single value or array
            remainFiles = Array.isArray(req.body.remainFiles) 
                ? req.body.remainFiles 
                : [req.body.remainFiles];
        }

        const result = await ContentService.updateContent(id, updateData, files, remainFiles);

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

    // GET /api/content/files/:fileId/download
    downloadFile = asyncHandler(async (req, res) => {
        const { fileId } = req.params;

        const fileData = await ContentService.getFileById(fileId);

        // Set headers for download with correct filename
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileData.fileName)}"`);
        res.setHeader('Content-Type', fileData.fileType || 'application/octet-stream');

        // Return Cloudinary URL as redirect
        res.redirect(fileData.filePath);
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
