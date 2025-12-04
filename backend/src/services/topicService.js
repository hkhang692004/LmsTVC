import TopicRepository from '../repositories/topicRepository.js';
import {
    ValidationError,
    NotFoundError
} from '../utils/errors.js';

class TopicService {
    
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

        const newTopicData = {
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

        await TopicRepository.delete(topicId);
        return { message: 'Xóa chủ đề thành công' };
    }


}

export default new TopicService();