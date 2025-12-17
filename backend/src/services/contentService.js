import ContentRepository from '../repositories/contentRepository.js';
import { uploadFiles, deleteFiles } from '../utils/cloudinaryUtils.js';
import {
    ValidationError,
    NotFoundError
} from '../utils/errors.js';


class ContentService {

    // Generate unique ID for content (ND001, ND002, etc.)
    async generateContentId() {
        const lastContent = await ContentRepository.findLastContent();
        if (!lastContent || !lastContent.id) {
            return 'ND001';
        }
        const lastNumber = parseInt(lastContent.id.replace('ND', ''));
        const newNumber = String(lastNumber + 1).padStart(3, '0');
        return `ND${newNumber}`;
    }

    // Generate unique ID for content detail (NDCT001, NDCT002, etc.)
    async generateContentDetailId() {
        const lastDetail = await ContentRepository.findLastContentDetail();
        if (!lastDetail || !lastDetail.id) {
            return 'NDCT001';
        }
        const lastNumber = parseInt(lastDetail.id.replace('NDCT', ''));
        if (isNaN(lastNumber)) {
            console.error('[ContentService] Invalid last content detail ID:', lastDetail.id);
            return 'NDCT001';
        }
        const newNumber = String(lastNumber + 1).padStart(3, '0');
        return `NDCT${newNumber}`;
    }

    // Extract file extension from filename
    getFileExtension(filename) {
        if (!filename) return 'unknown';
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : 'unknown';
    }

    // Check if file is video based on extension
    isVideoFile(filename) {
        if (!filename) return false;
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', 'mpeg', 'mpg'];
        const extension = this.getFileExtension(filename);
        return videoExtensions.includes(extension);
    }

    // Upload files to Cloudinary
    async uploadFilesToCloudinary(files) {
        if (!files || files.length === 0) {
            return [];
        }

        try {
            // Use bulk upload for better performance
            const uploadResults = await uploadFiles(files);
            
            // Generate IDs for each file detail
            const fileDetailsWithIds = [];
            for (const result of uploadResults) {
                const newId = await this.generateContentDetailId();
                const isVideo = this.isVideoFile(result.fileName);
                
                fileDetailsWithIds.push({
                    id: newId,
                    loaiChiTiet: isVideo ? 'video' : 'file',
                    filePath: result.secure_url,
                    fileName: result.fileName,
                    fileType: isVideo ? 'video' : this.getFileExtension(result.fileName),
                    fileSize: result.bytes
                });
            }
            
            return fileDetailsWithIds;
        } catch (error) {
            console.error('Bulk upload failed:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    // Tạo Content mới với optional files
    async createContent(contentData, files = []) {
        try {
            console.log('[ContentService] createContent started with files count:', files.length);
            
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

            // Generate ID for new content
            const newId = await this.generateContentId();
            console.log('[ContentService] Generated content ID:', newId);

            const newContentData = {
                id: newId, // Add generated ID
                idChuDe: contentData.idChuDe,
                idNguoiDung: contentData.idNguoiDung,
                idNoiDungCha: contentData.idNoiDungCha || null,
                tieuDe: contentData.tieuDe,
                noiDung: contentData.noiDung,
                loaiNoiDung: contentData.loaiNoiDung,
                hanNop: contentData.hanNop || null,
                status: contentData.status || 'an'
            };
            console.log('[ContentService] Prepared newContentData with id:', newId);

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
                    console.log('[ContentService] Starting file upload to Cloudinary, file count:', files.length);
                    const uploadedFiles = await this.uploadFilesToCloudinary(files);
                    console.log('[ContentService] Uploaded files count:', uploadedFiles.length);
                    // Add idNoiDung will be set by Repository after content creation
                    fileDetails = uploadedFiles;
                } catch (uploadError) {
                    console.error('[ContentService] File upload error:', uploadError);
                    throw new ValidationError(`File upload failed: ${uploadError.message}`);
                }
            } else {
                console.log('[ContentService] No files to upload');
            }

            // Handle Youtube URL
            if (contentData.videoUrl) {
                console.log('[ContentService] Youtube URL detected:', contentData.videoUrl);
                const youtubeId = await this.generateContentDetailId();
                fileDetails.push({
                    id: youtubeId,
                    loaiChiTiet: 'video',
                    filePath: contentData.videoUrl,
                    fileName: 'Youtube Video',
                    fileType: 'youtube',
                    fileSize: 0
                });
            }

            // Handle external link URL
            if (contentData.linkUrl) {
                console.log('[ContentService] Link URL detected:', contentData.linkUrl);
                const linkId = await this.generateContentDetailId();
                fileDetails.push({
                    id: linkId,
                    loaiChiTiet: 'duongDan',
                    filePath: contentData.linkUrl,
                    fileName: 'External Link',
                    fileType: 'link',
                    fileSize: 0
                });
            }

            // Handle folder creation
            if (contentData.fileType === 'folder') {
                console.log('[ContentService] Folder detected, creating folder detail');
                const folderId = await this.generateContentDetailId();
                fileDetails.push({
                    id: folderId,
                    loaiChiTiet: 'thuMuc',
                    filePath: null,
                    fileName: contentData.tieuDe,
                    fileType: 'folder',
                    fileSize: 0
                });
            }

            // Create content with files in transaction
            console.log('[ContentService] Creating content with repository...');
            const result = await ContentRepository.createContentWithFiles(newContentData, fileDetails);
            console.log('[ContentService] Content created successfully, id:', result?.id);

            return result;
        } catch (error) {
            console.error('[ContentService] Error in createContent:', error.message);
            console.error('[ContentService] Error stack:', error.stack);
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

    // Get comments (forum discussions) for a content
    // Get direct comments only (for Forum page listing)
    async getCommentsByContentId(contentId) {
        const comments = await ContentRepository.findCommentsByParentId(contentId);
        return comments;
    }

    // Get forum with direct children only (for Forum page)
    async getForumWithDirectPosts(forumId) {
        try {
            console.log('[ContentService] getForumWithDirectPosts for:', forumId);
            
            // Fetch the forum content
            const forum = await ContentRepository.findByIdWithFiles(forumId);
            if (!forum) {
                throw new NotFoundError('Không tìm thấy diễn đàn');
            }
            console.log('[ContentService] Forum found:', forum.id);
            
            // Fetch ONLY direct children posts (no nested)
            const replies = await ContentRepository.findCommentsByParentId(forumId);
            console.log('[ContentService] Direct posts count:', replies.length);
            
            // Add reply count for each post (count all nested replies)
            const repliesWithCount = await Promise.all(replies.map(async (post) => {
                const allReplies = await ContentRepository.findAllCommentsByParentIdRecursive(post.id);
                return {
                    ...post.toJSON(),
                    replyCount: allReplies.length
                };
            }));
            
            return {
                post: forum,
                replies: repliesWithCount
            };
        } catch (error) {
            console.error('[ContentService] getForumWithDirectPosts error:', error);
            throw error;
        }
    }

    // Get post with all its comments/replies (including nested, flat list for ForumContent page)
    async getPostWithComments(contentId) {
        try {
            console.log('[ContentService] getPostWithComments for:', contentId);
            
            // Fetch the parent post
            const post = await ContentRepository.findByIdWithFiles(contentId);
            if (!post) {
                throw new NotFoundError('Không tìm thấy bài viết');
            }
            console.log('[ContentService] Post found:', post.id);
            
            // Fetch ALL replies to this post (including nested, recursive)
            const replies = await ContentRepository.findAllCommentsByParentIdRecursive(contentId);
            console.log('[ContentService] Replies count (with nested):', replies.length);
            
            return {
                post: post,
                replies: replies
            };
        } catch (error) {
            console.error('[ContentService] getPostWithComments error:', error);
            throw error;
        }
    }

    // Get folder files (children documents with loaiNoiDung = 'taiLieu')
    async getFolderFiles(folderId) {
        try {
            console.log('[ContentService] getFolderFiles for:', folderId);
            
            // Fetch direct children with loaiNoiDung = 'taiLieu'
            const files = await ContentRepository.findDocumentsByParentId(folderId);
            console.log('[ContentService] Files count:', files.length);
            
            return files;
        } catch (error) {
            console.error('[ContentService] getFolderFiles error:', error);
            throw error;
        }
    }

    // Get my submissions for assignment
    async getMySubmissions(assignmentId, userId) {
        try {
            console.log('[ContentService] getMySubmissions for assignment:', assignmentId, 'user:', userId);
            
            // Fetch submissions with loaiNoiDung = 'baiNop'
            const submissions = await ContentRepository.findSubmissionsByAssignment(assignmentId, userId);
            console.log('[ContentService] Submissions count:', submissions.length);
            
            return submissions;
        } catch (error) {
            console.error('[ContentService] getMySubmissions error:', error);
            throw error;
        }
    }

    async getAllSubmissions(assignmentId, page = 1, limit = 10) {
        try {
            console.log('[ContentService] getAllSubmissions for assignment:', assignmentId, 'page:', page, 'limit:', limit);
            
            // Fetch all submissions for assignment with pagination
            const result = await ContentRepository.findAllSubmissionsByAssignment(assignmentId, page, limit);
            console.log('[ContentService] Total submissions count:', result.total);
            
            return result;
        } catch (error) {
            console.error('[ContentService] getAllSubmissions error:', error);
            throw error;
        }
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
            // Only manage files if files are being uploaded or remainFiles is explicitly provided
            let remainFileIds = null;
            if (files.length > 0 || remainFiles.length > 0) {
                remainFileIds = remainFiles.map(file => 
                    typeof file === 'string' ? file : file.id
                );
            }

            // Update content with file management: keep remainFiles + add new files
            const result = await ContentRepository.updateContentWithFiles(
                contentId,
                updateData,
                fileDetails,    // New uploaded files
                remainFileIds   // Existing files to keep (fileIds) - null means don't touch files
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

        // Validate deletion conditions
        await this.validateDeletion(contentId, content);

        // Use bulk delete method with Cloudinary cleanup
        await ContentRepository.deleteWithFiles(contentId);
    }

    // Validate if content can be deleted
    async validateDeletion(contentId, content) {
        const { ValidationError } = await import('../utils/errors.js');
        
        // Check if content has children
        const childrenCount = await ContentRepository.countChildren(contentId);
        if (childrenCount > 0) {
            throw new ValidationError(`Không thể xóa vì có ${childrenCount} nội dung con`);
        }

        // Check if assignment has submissions (for baiTap type)
        if (content.loaiNoiDung === 'baiTap') {
            const submissionsCount = await ContentRepository.countSubmissions(contentId);
            if (submissionsCount > 0) {
                throw new ValidationError(`Không thể xóa vì đã có ${submissionsCount} học viên nộp bài`);
            }
        }

        // Check if exam has student submissions (for baiNop type)
        if (content.loaiNoiDung === 'baiNop') {
            const examSubmissionsCount = await ContentRepository.countExamSubmissions(contentId);
            if (examSubmissionsCount > 0) {
                throw new ValidationError(`Không thể xóa vì đã có ${examSubmissionsCount} học viên làm kiểm tra`);
            }
        }
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

    // Get file by ID for download
    async getFileById(fileId) {
        const file = await ContentRepository.findFileById(fileId);
        
        if (!file) {
            throw new NotFoundError('Không tìm thấy file');
        }

        return file;
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
