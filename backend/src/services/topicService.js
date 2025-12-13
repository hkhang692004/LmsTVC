import TopicRepository from '../repositories/topicRepository.js';
import {
    ValidationError,
    NotFoundError
} from '../utils/errors.js';

class TopicService {
    
    // Generate unique ID for topic (CD001, CD002, etc.)
    async generateTopicId() {
        const lastTopic = await TopicRepository.findLastTopic();
        if (!lastTopic || !lastTopic.id) {
            return 'CD001';
        }
        const lastNumber = parseInt(lastTopic.id.replace('CD', ''));
        const newNumber = String(lastNumber + 1).padStart(3, '0');
        return `CD${newNumber}`;
    }

    // Get topic by ID with root level contents
    async getTopicById(topicId) {
        if (!topicId) {
            throw new ValidationError('ID chủ đề là bắt buộc');
        }

        const topic = await TopicRepository.findByIdWithContents(topicId);
        
        if (!topic) {
            throw new NotFoundError('Không tìm thấy chủ đề');
        }

        return topic;
    }

    // Create new topic
    async createTopic(topicData) {
        // Validate required fields
        if (!topicData.tenChuDe) {
            throw new ValidationError('Tên chủ đề là bắt buộc');
        }

        if (!topicData.idLop) {
            throw new ValidationError('ID lớp học là bắt buộc');
        }

        // Generate unique ID
        const newId = await this.generateTopicId();

        const newTopicData = {
            id: newId,
            tenChuDe: topicData.tenChuDe,
            idLop: topicData.idLop,
            moTa: topicData.moTa || null
        };

        const result = await TopicRepository.create(newTopicData);
        return result;
    }

    // Update topic information
    async updateTopic(topicId, updateData) {
        if (!topicId) {
            throw new ValidationError('ID chủ đề là bắt buộc');
        }

        // Check if topic exists
        const existingTopic = await TopicRepository.findById(topicId);
        if (!existingTopic) {
            throw new NotFoundError('Không tìm thấy chủ đề để cập nhật');
        }

        // Validate tenChuDe if provided
        if (updateData.tenChuDe && updateData.tenChuDe.trim() === '') {
            throw new ValidationError('Tên chủ đề không được để trống');
        }

        const result = await TopicRepository.update(topicId, updateData);
        return result;
    }

    // Delete topic (cascade delete contents)
    async deleteTopic(topicId) {
        if (!topicId) {
            throw new ValidationError('ID chủ đề là bắt buộc');
        }

        const existingTopic = await TopicRepository.findById(topicId);
        if (!existingTopic) {
            throw new NotFoundError('Không tìm thấy chủ đề để xóa');
        }

        // Validate deletion conditions
        await this.validateTopicDeletion(topicId);

        await TopicRepository.delete(topicId);
        return { message: 'Xóa chủ đề thành công' };
    }

    // Validate if topic can be deleted
    async validateTopicDeletion(topicId) {
        // Check if topic has any contents
        const contentsCount = await TopicRepository.countContents(topicId);
        if (contentsCount > 0) {
            throw new ValidationError(`Không thể xóa vì chủ đề có ${contentsCount} nội dung`);
        }

        // Additional check: count submissions and exam submissions for all contents in this topic
        const { hasSubmissions, submissionsCount } = await TopicRepository.checkTopicSubmissions(topicId);
        if (hasSubmissions) {
            throw new ValidationError(`Không thể xóa vì đã có ${submissionsCount} bài nộp/làm kiểm tra`);
        }
    }


}

export default new TopicService();