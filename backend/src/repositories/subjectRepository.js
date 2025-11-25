import { MonHoc, Nganh } from '../models/index.js';
import { Op } from 'sequelize';
import { DatabaseError } from '../utils/errors.js';

class SubjectRepository {
    async findWithFilters(filters) {
        const { nganhId, search, page = 1, limit = 20 } = filters;
        
        // Build WHERE conditions
        let whereConditions = {};
        if (nganhId) whereConditions.idNganh = nganhId;

        // Build search condition
        let searchCondition = {};
        if (search) {
            searchCondition = {
                [Op.or]: [
                    { tenMon: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Calculate pagination
        const offset = (page - 1) * limit;

        try {
            const { count, rows } = await MonHoc.findAndCountAll({
                where: {
                    ...whereConditions,
                    ...searchCondition
                },
                attributes: ['id', 'tenMon'],
                include: [{
                    model: Nganh,
                    as: 'nganh',
                    attributes: ['id', 'tenNganh'],
                    required: true
                }],
                limit: limit,
                offset: offset,
                order: [['tenMon', 'ASC']]
            });

            const mappedSubjects = rows.map(this.mapToDTO.bind(this));

            return {
                subjects: mappedSubjects,
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            };

        } catch (error) {
            console.error('Database error in findWithFilters:', error);
            throw new DatabaseError('Lỗi khi truy vấn môn học từ cơ sở dữ liệu');
        }
    }

    async findById(id) {
        try {
            const monHoc = await MonHoc.findByPk(id, {
                attributes: ['id', 'tenMon'],
                include: [{
                    model: Nganh,
                    as: 'nganh',
                    attributes: ['id', 'tenNganh']
                }]
            });

            return monHoc ? this.mapToDTO(monHoc) : null;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new DatabaseError('Lỗi khi tìm môn học từ cơ sở dữ liệu');
        }
    }

    mapToDTO(monHocRecord) {
        return {
            id: monHocRecord.id,
            tenMon: monHocRecord.tenMon,
            nganh: {
                id: monHocRecord.nganh.id,
                tenNganh: monHocRecord.nganh.tenNganh
            }
        };
    }
}

export default new SubjectRepository();