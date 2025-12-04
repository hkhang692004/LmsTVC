import ContentRepository from '../repositories/contentRepository.js';
import { uploadFiles, deleteFiles } from '../utils/cloudinaryUtils.js';
import {
    ValidationError,
    NotFoundError
} from '../utils/errors.js';


class ContentService {

    // Upload files to Cloudinary
    async uploadFilesToCloudinary(files) {
        if (!files || files.length === 0) {
            return [];
        }

        try {
            // Use bulk upload for better performance
            const uploadResults = await uploadFiles(files);
            
            return uploadResults.map(result => ({
                id: result.public_id,
                loaiChiTiet: 'file',
                filePath: result.secure_url,
                fileName: result.fileName,
                fileType: files.find(f => f.originalname === result.fileName)?.mimetype || 'unknown',
                fileSize: result.bytes
            }));
        } catch (error) {
            console.error('Bulk upload failed:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    // Tạo Content mới với optional files
    async createContent(contentData, files = []) {
        try {
            // Validate required fields
            if (!contentData.tieuDe || !contentData.noiDung || !contentData.loaiNoiDung) {
                throw new ValidationError('Thiếu thông tin bắt buộc: tiêu đề, nội dung hoặc loại nội dung');
            }

            if (!contentData.idChuDe) {
                throw new ValidationError('ID chủ đề là bắt buộc');
            }

            if (!contentData.idNguoiDung) {
                throw new ValidationError('ID người dùng là bắt buộc');
            }

            const newContentData = {
                idChuDe: contentData.idChuDe,
                idNguoiDung: contentData.idNguoiDung,
                idNoiDungCha: contentData.idNoiDungCha || null,
                tieuDe: contentData.tieuDe,
                noiDung: contentData.noiDung,
                loaiNoiDung: contentData.loaiNoiDung,
                hanNop: contentData.hanNop || null,
                status: contentData.status || 'an'
            };

            // Validate enum values
            const validLoaiNoiDung = ['taiLieu', 'phucDap', 'baiTap', 'baiNop'];
            if (!validLoaiNoiDung.includes(newContentData.loaiNoiDung)) {
                throw new ValidationError('Loại nội dung không hợp lệ. Chỉ chấp nhận: taiLieu, phucDap, baiTap, baiNop');
            }

            if (newContentData.status) {
                const validStatus = ['an', 'daNop', 'treHan'];
                if (!validStatus.includes(newContentData.status)) {
                    throw new ValidationError('Trạng thái không hợp lệ');
                }
            }

            // Upload files to Cloudinary first
            let fileDetails = [];
            if (files && files.length > 0) {
                try {
                    const uploadedFiles = await this.uploadFilesToCloudinary(files);
                    // Add idNoiDung will be set by Repository after content creation
                    fileDetails = uploadedFiles;
                } catch (uploadError) {
                    throw new ValidationError(`File upload failed: ${uploadError.message}`);
                }
            }

            // Create content with files in transaction
            const result = await ContentRepository.createContentWithFiles(newContentData, fileDetails);

            return result;
        } catch (error) {
            // Repository handles Cloudinary upload/cleanup
            throw error;
        }
    }



    // Get content by ID với files
    async getContentById(contentId) {
        const content = await ContentRepository.findByIdWithFiles(contentId);

        if (!content) {
            throw new NotFoundError('Không tìm thấy nội dung');
        }

        return content;
    }

    // Update content và files
    async updateContent(contentId, updateData, files = [], remainFiles = []) {
        try {
            // Check if content exists
            const existingContent = await ContentRepository.findById(contentId);
            if (!existingContent) {
                throw new NotFoundError('Không tìm thấy nội dung');
            }

            // Validate enum values if provided
            if (updateData.loaiNoiDung) {
                const validLoaiNoiDung = ['taiLieu', 'phucDap', 'baiTap', 'baiNop'];
                if (!validLoaiNoiDung.includes(updateData.loaiNoiDung)) {
                    throw new ValidationError('Loại nội dung không hợp lệ');
                }
            }

            if (updateData.status) {
                const validStatus = ['an', 'daNop', 'treHan'];
                if (!validStatus.includes(updateData.status)) {
                    throw new ValidationError('Trạng thái không hợp lệ');
                }
            }

            // Upload new files to Cloudinary if any
            let fileDetails = [];
            if (files && files.length > 0) {
                try {
                    fileDetails = await this.uploadFilesToCloudinary(files);
                } catch (uploadError) {
                    throw new ValidationError(`File upload failed: ${uploadError.message}`);
                }
            }

            // Extract remain file IDs from remainFiles array (if remainFiles contains objects)
            const remainFileIds = remainFiles.map(file => 
                typeof file === 'string' ? file : file.id
            );

            // Update content with file management: keep remainFiles + add new files
            const result = await ContentRepository.updateContentWithFiles(
                contentId,
                updateData,
                fileDetails,    // New uploaded files
                remainFileIds   // Existing files to keep (fileIds)
            );

            return result;
        } catch (error) {
            // Repository handles Cloudinary upload/cleanup
            throw error;
        }
    }

    // Delete content và tất cả files liên quan với bulk delete
    async deleteContent(contentId) {
        const content = await ContentRepository.findByIdWithFiles(contentId);

        if (!content) {
            throw new NotFoundError('Không tìm thấy nội dung');
        }

        // Use bulk delete method with Cloudinary cleanup
        await ContentRepository.deleteWithFiles(contentId);
    }

    // Delete content (without Cloudinary cleanup)
    async deleteContentSimple(contentId) {
        const content = await ContentRepository.findByIdWithFiles(contentId);

        if (!content) {
            throw new NotFoundError('Không tìm thấy nội dung');
        }

        // Delete files from Cloudinary manually first
        if (content.chiTiets && content.chiTiets.length > 0) {
            const fileIds = content.chiTiets.map(file => file.id);
            try {
                const deleteResult = await deleteFiles(fileIds);
                console.log(`✅ Bulk deleted ${deleteResult.successCount}/${deleteResult.total} files from Cloudinary`);
            } catch (error) {
                console.error(`❌ Failed to bulk delete files from Cloudinary:`, error);
                // Continue with database deletion even if Cloudinary delete fails
            }
        }

        // Delete content và cascade delete files trong database
        await ContentRepository.delete(contentId);
    }

    // Change content status
    async changeContentStatus(contentId, newStatus) {
        const validStatus = ['an', 'daNop', 'treHan'];
        if (!validStatus.includes(newStatus)) {
            throw new ValidationError('Trạng thái không hợp lệ');
        }

        const content = await ContentRepository.findById(contentId);
        if (!content) {
            throw new NotFoundError('Không tìm thấy nội dung');
        }

        const updateData = {
            status: newStatus,
            ...(newStatus === 'daNop' && { ngayNop: new Date() })
        };

        return await ContentRepository.update(contentId, updateData);
    }



    // Delete specific file
    async deleteFile(fileId) {
        const fileInfo = await ContentRepository.findFileById(fileId);

        if (!fileInfo) {
            throw new NotFoundError('Không tìm thấy file');
        }

        // Delete file from Cloudinary
        try {
            const deleteResult = await deleteFiles([fileId]); // Use bulk for single file
            console.log(`✅ Deleted file from Cloudinary: ${fileId}`);
        } catch (error) {
            console.error(`❌ Failed to delete file from Cloudinary: ${fileId}`, error);
            // Continue with database deletion even if Cloudinary delete fails
        }

        // Delete file record from database
        await ContentRepository.deleteFile(fileId);
    }

    // Get assignment view for student (bài tập + bài nộp của tôi nếu có)
    async getAssignmentView(assignmentId, userId) {
        try {
            // Validate assignment exists and is actually a baiTap
            const assignment = await ContentRepository.findByIdWithFiles(assignmentId);
            if (!assignment) {
                throw new NotFoundError('Không tìm thấy bài tập');
            }

            if (assignment.loaiNoiDung !== 'baiTap') {
                throw new ValidationError('Nội dung này không phải là bài tập');
            }

            // Get student's submission for this assignment
            const mySubmission = await ContentRepository.findSubmissionByUser(assignmentId, userId);

            // Calculate submission status
            const now = new Date();
            const deadline = assignment.hanNop ? new Date(assignment.hanNop) : null;
            const hasDeadline = deadline !== null;
            const isExpired = hasDeadline && now > deadline;
            const hasSubmitted = mySubmission !== null;
            const isLate = hasSubmitted && mySubmission.ngayNop && deadline && new Date(mySubmission.ngayNop) > deadline;
            
            // Calculate time remaining
            let timeRemaining = null;
            if (hasDeadline && !isExpired) {
                const diff = deadline - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                
                if (days > 0) {
                    timeRemaining = `${days} ngày ${hours} giờ`;
                } else if (hours > 0) {
                    timeRemaining = `${hours} giờ ${minutes} phút`;
                } else {
                    timeRemaining = `${minutes} phút`;
                }
            }

            // Build response based on NoiDung and NoiDungChiTiet models
            const result = {
                // Assignment info (bài tập) - based on NoiDung model
                assignment: {
                    id: assignment.id,
                    idChuDe: assignment.idChuDe,
                    idNguoiDung: assignment.idNguoiDung,
                    tieuDe: assignment.tieuDe,
                    noiDung: assignment.noiDung,
                    loaiNoiDung: assignment.loaiNoiDung, // 'baiTap'
                    hanNop: assignment.hanNop,
                    status: assignment.status,
                    ngayTao: assignment.ngayTao,
                    // Assignment files - based on NoiDungChiTiet model
                    files: assignment.NoiDungChiTiets?.map(file => ({
                        id: file.id,
                        idNoiDung: file.idNoiDung,
                        loaiChiTiet: file.loaiChiTiet,
                        filePath: file.filePath,
                        fileName: file.fileName,
                        fileType: file.fileType,
                        fileSize: file.fileSize,
                        ngayTao: file.ngayTao
                    })) || []
                },
                
                // Student's submission - based on NoiDung model with loaiNoiDung = 'baiNop'
                mySubmission: mySubmission ? {
                    id: mySubmission.id,
                    idChuDe: mySubmission.idChuDe,
                    idNguoiDung: mySubmission.idNguoiDung,
                    idNoiDungCha: mySubmission.idNoiDungCha, // Should equal assignmentId
                    tieuDe: mySubmission.tieuDe,
                    noiDung: mySubmission.noiDung,
                    loaiNoiDung: mySubmission.loaiNoiDung, // 'baiNop'
                    hanNop: mySubmission.hanNop,
                    ngayNop: mySubmission.ngayNop,
                    status: mySubmission.status, // 'an', 'daNop', 'treHan'
                    ngayTao: mySubmission.ngayTao,
                    // Submission files - based on NoiDungChiTiet model
                    files: mySubmission.NoiDungChiTiets?.map(file => ({
                        id: file.id,
                        idNoiDung: file.idNoiDung,
                        loaiChiTiet: file.loaiChiTiet,
                        filePath: file.filePath,
                        fileName: file.fileName,
                        fileType: file.fileType,
                        fileSize: file.fileSize,
                        ngayTao: file.ngayTao
                    })) || []
                } : null,

                // Submission status (computed from model data)
                submissionStatus: {
                    hasSubmitted: hasSubmitted,
                    isLate: isLate,
                    submittedAt: hasSubmitted ? mySubmission.ngayNop : null,
                    canResubmit: true, // Business logic - có thể config
                    timeRemaining: timeRemaining,
                    isExpired: isExpired
                },

                // Assignment constraints (from model fields)
                constraints: {
                    deadline: assignment.hanNop,
                    hasDeadline: hasDeadline
                }
            };

            return result;
        } catch (error) {
            throw error;
        }
    }

}

export default new ContentService();
