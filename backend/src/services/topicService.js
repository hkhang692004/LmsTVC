import TopicRepository from '../repositories/topicRepository.js';
import { 
    AppError, 
    ValidationError, 
    NotFoundError, 
    ConflictError,
    DatabaseError 
} from '../utils/errors.js';
import { generateId } from '../utils/idGenerator.js';
import path from 'path';
import fs from 'fs/promises';

class TopicService {
    constructor() {
        this.topicRepository = new TopicRepository();
    }

    // Tạo Topic mới với optional files
    async createTopic(topicData, files = []) {
        try {
            // Validate required fields
            if (!topicData.tieuDe || !topicData.noiDung || !topicData.loaiNoiDung) {
                throw new ValidationError('Thiếu thông tin bắt buộc: tiêu đề, nội dung hoặc loại nội dung');
            }

            if (!topicData.idChuDe) {
                throw new ValidationError('ID chủ đề là bắt buộc');
            }

            if (!topicData.idNguoiDung) {
                throw new ValidationError('ID người dùng là bắt buộc');
            }

            // Generate topic ID
            const topicId = await this.generateTopicId();

            // Prepare topic data
            const newTopicData = {
                id: topicId,
                idChuDe: topicData.idChuDe,
                idNguoiDung: topicData.idNguoiDung,
                idNoiDungCha: topicData.idNoiDungCha || null,
                tieuDe: topicData.tieuDe,
                noiDung: topicData.noiDung,
                loaiNoiDung: topicData.loaiNoiDung,
                hanNop: topicData.hanNop || null,
                trangThai: topicData.trangThai || 'an'
            };

            // Validate enum values
            const validLoaiNoiDung = ['taiLieu', 'phucDap', 'baiTap', 'baiNop'];
            if (!validLoaiNoiDung.includes(newTopicData.loaiNoiDung)) {
                throw new ValidationError('Loại nội dung không hợp lệ. Chỉ chấp nhận: taiLieu, phucDap, baiTap, baiNop');
            }

            const validTrangThai = ['an', 'daNop', 'treHan'];
            if (!validTrangThai.includes(newTopicData.trangThai)) {
                throw new ValidationError('Trạng thái không hợp lệ. Chỉ chấp nhận: an, daNop, treHan');
            }

            // Prepare file details if files provided
            let fileDetails = [];
            if (files && files.length > 0) {
                fileDetails = await this.processFiles(files, topicId);
            }

            // Create topic with files in transaction
            const result = await this.topicRepository.createTopicWithFiles(newTopicData, fileDetails);
            
            return result;
        } catch (error) {
            // Clean up uploaded files if error occurs
            if (files && files.length > 0) {
                await this.cleanupFiles(files);
            }
            throw error;
        }
    }

    // Get all topics với filters
    async getAllTopics(filters = {}, pagination = {}) {
        return await this.topicRepository.findWithFilters(filters, pagination);
    }

    // Get topic by ID với files
    async getTopicById(topicId) {
        const topic = await this.topicRepository.findByIdWithFiles(topicId);
        
        if (!topic) {
            throw new NotFoundError('Không tìm thấy nội dung');
        }

        return topic;
    }

    // Update topic và files
    async updateTopic(topicId, updateData, files = []) {
        try {
            // Check if topic exists
            const existingTopic = await this.topicRepository.findById(topicId);
            if (!existingTopic) {
                throw new NotFoundError('Không tìm thấy nội dung');
            }

            // Validate enum values if provided
            if (updateData.loaiNoiDung) {
                const validLoaiNoiDung = ['taiLieu', 'phucDap', 'baiTap', 'baiNop'];
                if (!validLoaiNoiDung.includes(updateData.loaiNoiDung)) {
                    throw new ValidationError('Loại nội dung không hợp lệ');
                }
            }

            if (updateData.trangThai) {
                const validTrangThai = ['an', 'daNop', 'treHan'];
                if (!validTrangThai.includes(updateData.trangThai)) {
                    throw new ValidationError('Trạng thái không hợp lệ');
                }
            }

            // Process new files if provided
            let newFileDetails = [];
            if (files && files.length > 0) {
                newFileDetails = await this.processFiles(files, topicId);
            }

            // Update topic with new files
            const result = await this.topicRepository.updateTopicWithFiles(
                topicId, 
                updateData, 
                newFileDetails
            );

            return result;
        } catch (error) {
            // Clean up uploaded files if error occurs
            if (files && files.length > 0) {
                await this.cleanupFiles(files);
            }
            throw error;
        }
    }

    // Delete topic và tất cả files liên quan
    async deleteTopic(topicId) {
        const topic = await this.topicRepository.findByIdWithFiles(topicId);
        
        if (!topic) {
            throw new NotFoundError('Không tìm thấy nội dung');
        }

        // Delete files from filesystem
        if (topic.chiTiets && topic.chiTiets.length > 0) {
            for (const file of topic.chiTiets) {
                if (file.filePath) {
                    try {
                        await fs.unlink(file.filePath);
                    } catch (error) {
                        console.error(`Failed to delete file: ${file.filePath}`, error);
                    }
                }
            }
        }

        // Delete topic và cascade delete files trong database
        await this.topicRepository.delete(topicId);
    }

    // Change topic status
    async changeTopicStatus(topicId, newStatus) {
        const validTrangThai = ['an', 'daNop', 'treHan'];
        if (!validTrangThai.includes(newStatus)) {
            throw new ValidationError('Trạng thái không hợp lệ');
        }

        const topic = await this.topicRepository.findById(topicId);
        if (!topic) {
            throw new NotFoundError('Không tìm thấy nội dung');
        }

        const updateData = { 
            trangThai: newStatus,
            ...(newStatus === 'daNop' && { ngayNop: new Date() })
        };

        return await this.topicRepository.update(topicId, updateData);
    }

    // Search topics
    async searchTopics(searchParams) {
        return await this.topicRepository.searchTopics(searchParams);
    }

    // Download file by file ID
    async downloadFile(fileId) {
        const fileInfo = await this.topicRepository.findFileById(fileId);
        
        if (!fileInfo) {
            throw new NotFoundError('Không tìm thấy file');
        }

        // Check if file exists in filesystem
        try {
            await fs.access(fileInfo.filePath);
        } catch (error) {
            throw new NotFoundError('File không tồn tại trên hệ thống');
        }

        return fileInfo;
    }

    // Delete specific file
    async deleteFile(fileId) {
        const fileInfo = await this.topicRepository.findFileById(fileId);
        
        if (!fileInfo) {
            throw new NotFoundError('Không tìm thấy file');
        }

        // Delete file from filesystem
        try {
            await fs.unlink(fileInfo.filePath);
        } catch (error) {
            console.error(`Failed to delete file: ${fileInfo.filePath}`, error);
        }

        // Delete file record from database
        await this.topicRepository.deleteFile(fileId);
    }

    // Get child topics
    async getChildTopics(parentId) {
        return await this.topicRepository.findByParentId(parentId);
    }

    // Get root topics of a subject
    async getRootTopics(chudeId) {
        return await this.topicRepository.findRootTopics(chudeId);
    }

    // Get topic statistics
    async getTopicStats(chudeId) {
        const rawStats = await this.topicRepository.getTopicStats(chudeId);
        
        // Format stats for frontend
        const formattedStats = {
            byType: {},
            byStatus: {},
            total: 0
        };

        rawStats.forEach(stat => {
            const count = parseInt(stat.count);
            
            // By type
            if (!formattedStats.byType[stat.loaiNoiDung]) {
                formattedStats.byType[stat.loaiNoiDung] = 0;
            }
            formattedStats.byType[stat.loaiNoiDung] += count;
            
            // By status
            if (!formattedStats.byStatus[stat.trangThai]) {
                formattedStats.byStatus[stat.trangThai] = 0;
            }
            formattedStats.byStatus[stat.trangThai] += count;
            
            // Total
            formattedStats.total += count;
        });

        return formattedStats;
    }

    // Helper methods
    async generateTopicId() {
        const prefix = 'ND';
        const year = new Date().getFullYear().toString().slice(-2);
        
        const maxId = await this.topicRepository.findMaxIdByPrefix(`${prefix}${year}`);
        
        if (!maxId) {
            return `${prefix}${year}001`;
        }

        const currentNumber = parseInt(maxId.slice(-3));
        const newNumber = String(currentNumber + 1).padStart(3, '0');
        
        return `${prefix}${year}${newNumber}`;
    }

    async processFiles(files, topicId) {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const fileDetails = [];

        for (const file of files) {
            // Generate unique file ID
            const fileId = await this.generateFileId();
            
            // Generate safe filename
            const fileExtension = path.extname(file.originalname);
            const safeFileName = `${fileId}${fileExtension}`;
            const filePath = path.join(uploadDir, safeFileName);

            // Move file to upload directory
            await fs.rename(file.path, filePath);

            // Determine file type
            const loaiChiTiet = this.determineFileType(file.mimetype);

            fileDetails.push({
                id: fileId,
                idNoiDung: topicId,
                loaiChiTiet: loaiChiTiet,
                filePath: filePath,
                fileName: file.originalname,
                fileType: file.mimetype
            });
        }

        return fileDetails;
    }

    async generateFileId() {
        const prefix = 'NDT';
        const year = new Date().getFullYear().toString().slice(-2);
        
        const maxId = await this.topicRepository.findMaxFileIdByPrefix(`${prefix}${year}`);
        
        if (!maxId) {
            return `${prefix}${year}001`;
        }

        const currentNumber = parseInt(maxId.slice(-3));
        const newNumber = String(currentNumber + 1).padStart(3, '0');
        
        return `${prefix}${year}${newNumber}`;
    }

    determineFileType(mimetype) {
        if (mimetype.startsWith('video/')) {
            return 'video';
        } else if (mimetype.startsWith('application/') || mimetype.startsWith('text/')) {
            return 'file';
        } else {
            return 'file'; // Default
        }
    }

    async cleanupFiles(files) {
        for (const file of files) {
            try {
                if (file.path) {
                    await fs.unlink(file.path);
                }
            } catch (error) {
                console.error(`Failed to cleanup file: ${file.path}`, error);
            }
        }
    }
}

export default new TopicService();