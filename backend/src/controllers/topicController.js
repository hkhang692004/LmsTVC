import topicService from '../services/topicService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ResponseUtil } from '../utils/responseUtil.js';
import fs from 'fs/promises';

class TopicController {
    // No need for constructor anymore since topicService is already an instance

    // GET /api/content/topics
    getAllTopics = asyncHandler(async (req, res) => {
        const filters = {
            chudeId: req.query.chudeId,
            loaiNoiDung: req.query.loaiNoiDung,
            trangThai: req.query.trangThai,
            nguoiTao: req.query.nguoiTao,
            idNoiDungCha: req.query.idNoiDungCha
        };

        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            sortBy: req.query.sortBy || 'ngayTao',
            sortOrder: req.query.sortOrder || 'DESC'
        };

        const result = await topicService.getAllTopics(filters, pagination);

        ResponseUtil.success(res, result, 'Lấy danh sách nội dung thành công');
    });

    // GET /api/content/topics/:id
    getTopicById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const topic = await topicService.getTopicById(id);
        
        ResponseUtil.success(res, topic, 'Lấy thông tin nội dung thành công');
    });

    // POST /api/content/topics
    createTopic = asyncHandler(async (req, res) => {
        // Extract topic data from body
        const topicData = {
            idChuDe: req.body.idChuDe,
            idNguoiDung: req.user?.id || req.body.idNguoiDung, // From auth middleware
            idNoiDungCha: req.body.idNoiDungCha,
            tieuDe: req.body.tieuDe,
            noiDung: req.body.noiDung,
            loaiNoiDung: req.body.loaiNoiDung,
            hanNop: req.body.hanNop,
            trangThai: req.body.trangThai
        };

        // Extract files from multer if multipart/form-data
        const files = req.files || [];

        const result = await topicService.createTopic(topicData, files);

        ResponseUtil.success(res, result, 'Tạo nội dung thành công', 201);
    });

    // PUT /api/content/topics/:id
    updateTopic = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        // Extract update data
        const updateData = {};
        const allowedFields = [
            'tieuDe', 'noiDung', 'loaiNoiDung', 'hanNop', 
            'trangThai', 'idNoiDungCha'
        ];

        // Only include provided fields
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Extract new files if any
        const files = req.files || [];

        const result = await topicService.updateTopic(id, updateData, files);

        ResponseUtil.success(res, result, 'Cập nhật nội dung thành công');
    });

    // DELETE /api/content/topics/:id
    deleteTopic = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        await topicService.deleteTopic(id);
        
        ResponseUtil.success(res, null, 'Xóa nội dung thành công');
    });

    // PUT /api/content/topics/:id/status
    changeTopicStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { trangThai } = req.body;

        if (!trangThai) {
            return ResponseUtil.error(res, 'Trạng thái là bắt buộc', 400, 'MISSING_STATUS');
        }

        const result = await topicService.changeTopicStatus(id, trangThai);

        ResponseUtil.success(res, result, 'Cập nhật trạng thái thành công');
    });

    // GET /api/content/search
    searchTopics = asyncHandler(async (req, res) => {
        const searchParams = {
            q: req.query.q,
            loaiNoiDung: req.query.loaiNoiDung,
            chudeId: req.query.chudeId,
            trangThai: req.query.trangThai,
            page: req.query.page || 1,
            limit: req.query.limit || 10
        };

        const result = await topicService.searchTopics(searchParams);

        ResponseUtil.success(res, result, 'Tìm kiếm nội dung thành công');
    });

    // GET /api/content/files/:id/download
    downloadFile = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const fileInfo = await topicService.downloadFile(id);

        // Set appropriate headers
        res.setHeader('Content-Type', fileInfo.fileType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
        
        // Stream the file
        const fileBuffer = await fs.readFile(fileInfo.filePath);
        res.send(fileBuffer);
    });

    // DELETE /api/content/files/:id
    deleteFile = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        await topicService.deleteFile(id);
        
        ResponseUtil.success(res, null, 'Xóa file thành công');
    });

    // GET /api/content/topics/:id/children
    getChildTopics = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const children = await topicService.getChildTopics(id);
        
        ResponseUtil.success(res, children, 'Lấy danh sách nội dung con thành công');
    });

    // POST /api/content/topics/:id/reply
    replyToTopic = asyncHandler(async (req, res) => {
        const { id } = req.params; // parent topic ID
        
        const replyData = {
            ...req.body,
            idNoiDungCha: id,
            idNguoiDung: req.user?.id || req.body.idNguoiDung,
            loaiNoiDung: 'phucDap'
        };

        const files = req.files || [];
        
        const result = await topicService.createTopic(replyData, files);
        
        ResponseUtil.success(res, result, 'Phản hồi thành công', 201);
    });

    // GET /api/content/topics/:id/submissions
    getTopicSubmissions = asyncHandler(async (req, res) => {
        const { id } = req.params; // assignment topic ID
        
        const filters = {
            idNoiDungCha: id,
            loaiNoiDung: 'baiNop'
        };

        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
            sortBy: 'ngayTao',
            sortOrder: 'DESC'
        };

        const result = await topicService.getAllTopics(filters, pagination);
        
        ResponseUtil.success(res, result, 'Lấy danh sách bài nộp thành công');
    });

    // GET /api/content/subjects/:id/root-topics
    getRootTopics = asyncHandler(async (req, res) => {
        const { id } = req.params; // subject ID
        
        const rootTopics = await topicService.getRootTopics(id);
        
        ResponseUtil.success(res, rootTopics, 'Lấy danh sách nội dung gốc thành công');
    });

    // GET /api/content/subjects/:id/stats
    getTopicStats = asyncHandler(async (req, res) => {
        const { id } = req.params; // subject ID
        
        const stats = await topicService.getTopicStats(id);
        
        ResponseUtil.success(res, stats, 'Lấy thống kê nội dung thành công');
    });
}

export default new TopicController();