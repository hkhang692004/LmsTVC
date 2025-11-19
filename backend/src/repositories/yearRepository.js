    import { NamHoc } from '../models/index.js';
import { Op } from 'sequelize';

class YearRepository {
    async findWithFilters(filters) {
        const { search, page = 1, limit = 20 } = filters;
        
        // Build WHERE conditions
        let whereConditions = {};
        if (search) {
            whereConditions = {
                nam: { [Op.like]: `%${search}%` }
            };
        }

        // Calculate pagination
        const offset = (page - 1) * limit;

        try {
            const { count, rows } = await NamHoc.findAndCountAll({
                where: whereConditions,
                attributes: ['id', 'nam'],
                limit: limit,
                offset: offset,
                order: [['nam', 'DESC']]
            });

            const mappedYears = rows.map(this.mapToDTO.bind(this));

            return {
                years: mappedYears,
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            };

        } catch (error) {
            console.error('Database error in findWithFilters:', error);
            throw new Error('Lỗi khi truy vấn cơ sở dữ liệu');
        }
    }

    async findCurrent() {
        try {
            const currentYear = new Date().getFullYear();
            
            // Tìm năm học hiện tại (có thể là 2024-2025 nếu hiện tại là 2024 hoặc 2025)
            const namHoc = await NamHoc.findOne({
                where: {
                    [Op.or]: [
                        { nam: currentYear.toString() },
                        { nam: `${currentYear}-${currentYear + 1}` },
                        { nam: `${currentYear - 1}-${currentYear}` }
                    ]
                },
                attributes: ['id', 'nam'],
                order: [['nam', 'DESC']]
            });

            return namHoc ? this.mapToDTO(namHoc) : null;
        } catch (error) {
            console.error('Database error in findCurrent:', error);
            throw new Error('Lỗi khi tìm năm học hiện tại');
        }
    }

    async findById(id) {
        try {
            const namHoc = await NamHoc.findByPk(id, {
                attributes: ['id', 'nam']
            });

            return namHoc ? this.mapToDTO(namHoc) : null;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new Error('Lỗi khi tìm năm học');
        }
    }

    mapToDTO(namHocRecord) {
        const currentYear = new Date().getFullYear();
        const yearStr = namHocRecord.nam;
        let isCurrent = false;

        // Check if this is current year
        if (yearStr.includes('-')) {
            const [startYear, endYear] = yearStr.split('-').map(Number);
            isCurrent = currentYear >= startYear && currentYear <= endYear;
        } else {
            isCurrent = currentYear === parseInt(yearStr);
        }

        return {
            id: namHocRecord.id,
            nam: namHocRecord.nam,
            isCurrent: isCurrent
        };
    }
}

export default new YearRepository();