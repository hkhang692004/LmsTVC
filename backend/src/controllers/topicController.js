import TopicService from '../services/topicService.js';
import  asyncHandler  from '../utils/asyncHandler.js';
import  ResponseUtil  from '../utils/response.js';

class TopicController {
    // GET /api/topics/:id
    getTopicById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const topic = await TopicService.getTopicById(id);
        
        ResponseUtil.success(res, topic, 'Lấy thông tin chủ đề thành công');
    });

    // POST /api/topics
    createTopic = asyncHandler(async (req, res) => {
        const topicData = {
            idLop: req.body.idLop,
            tenChuDe: req.body.tenChuDe,
            moTa: req.body.moTa
        };

        const result = await TopicService.createTopic(topicData);

        ResponseUtil.success(res, result, 'Tạo chủ đề thành công', 201);
    });

    // PUT /api/topics/:id
    updateTopic = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const updateData = {};
        const allowedFields = ['tenChuDe', 'moTa'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const result = await TopicService.updateTopic(id, updateData);

        ResponseUtil.success(res, result, 'Cập nhật chủ đề thành công');
    });

    // DELETE /api/topics/:id
    deleteTopic = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        await TopicService.deleteTopic(id);
        
        ResponseUtil.success(res, null, 'Xóa chủ đề thành công');
    });


}

export default new TopicController();