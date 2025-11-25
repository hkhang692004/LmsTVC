import { Nganh } from '../models/index.js';
import { Op } from 'sequelize';
import { DatabaseError } from '../utils/errors.js';

class DepartmentRepository {
    async findWithFilters(filters) {
        const { search, page = 1, limit = 20 } = filters;
        
        // Build WHERE conditions
        let whereConditions = {};
        if (search) {
            whereConditions = {
                tenNganh: { [Op.like]: `%${search}%` }
            };
        }

        // Calculate pagination
        const offset = (page - 1) * limit;

        try {
            const { count, rows } = await Nganh.findAndCountAll({
                where: whereConditions,
                attributes: ['id', 'tenNganh'],
                limit: limit,
                offset: offset,
                order: [['tenNganh', 'ASC']]
            });

            const mappedDepartments = rows.map(this.mapToDTO.bind(this));

            return {
                departments: mappedDepartments,
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            };

        } catch (error) {
            console.error('Database error in findWithFilters:', error);
            throw new DatabaseError('Lỗi khi truy vấn ngành học từ cơ sở dữ liệu');
        }
    }

    async findById(id) {
        try {
            const nganh = await Nganh.findByPk(id, {
                attributes: ['id', 'tenNganh']
            });

            return nganh ? this.mapToDTO(nganh) : null;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new DatabaseError('Lỗi khi tìm ngành học từ cơ sở dữ liệu');
        }
    }

    mapToDTO(nganhRecord) {
        return {
            id: nganhRecord.id,
            tenNganh: nganhRecord.tenNganh
        };
    }
}

export default new DepartmentRepository();