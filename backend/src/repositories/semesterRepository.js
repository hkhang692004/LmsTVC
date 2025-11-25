import { HocKy, NamHoc } from '../models/index.js';
import { Op } from 'sequelize';
import { DatabaseError } from '../utils/errors.js';

class SemesterRepository {
    async findWithFilters(filters) {
        const { namHocId, active, page = 1, limit = 20 } = filters;
        
        // Build WHERE conditions
        let whereConditions = {};
        if (namHocId) whereConditions.idNam = namHocId;

        // Calculate pagination
        const offset = (page - 1) * limit;

        try {
            const { count, rows } = await HocKy.findAndCountAll({
                where: whereConditions,
                attributes: ['id', 'ten', 'ngayBatDau', 'ngayKetThuc'],
                include: [{
                    model: NamHoc,
                    as: 'namHoc',
                    attributes: ['id', 'nam'],
                    required: true
                }],
                limit: limit,
                offset: offset,
                order: [['ngayBatDau', 'DESC']]
            });

            let mappedSemesters = rows.map(this.mapToDTO.bind(this));

            // Filter by active status if specified
            if (active !== null) {
                const currentDate = new Date();
                mappedSemesters = mappedSemesters.filter(semester => {
                    const startDate = new Date(semester.ngayBatDau);
                    const endDate = new Date(semester.ngayKetThuc);
                    const isActive = currentDate >= startDate && currentDate <= endDate;
                    return active ? isActive : !isActive;
                });
            }

            return {
                semesters: mappedSemesters,
                total: active !== null ? mappedSemesters.length : count,
                page: page,
                limit: limit,
                totalPages: Math.ceil((active !== null ? mappedSemesters.length : count) / limit)
            };

        } catch (error) {
            console.error('Database error in findWithFilters:', error);
            throw new DatabaseError('Lỗi khi truy vấn học kỳ từ cơ sở dữ liệu');
        }
    }

    async findCurrent() {
        try {
            const currentDate = new Date();
            
            const hocKy = await HocKy.findOne({
                where: {
                    ngayBatDau: { [Op.lte]: currentDate },
                    ngayKetThuc: { [Op.gte]: currentDate }
                },
                attributes: ['id', 'ten', 'ngayBatDau', 'ngayKetThuc'],
                include: [{
                    model: NamHoc,
                    as: 'namHoc',
                    attributes: ['id', 'nam']
                }],
                order: [['ngayBatDau', 'DESC']]
            });

            return hocKy ? this.mapToDTO(hocKy) : null;
        } catch (error) {
            console.error('Database error in findCurrent:', error);
            throw new DatabaseError('Lỗi khi tìm học kỳ hiện tại từ cơ sở dữ liệu');
        }
    }

    async findById(id) {
        try {
            const hocKy = await HocKy.findByPk(id, {
                attributes: ['id', 'ten', 'ngayBatDau', 'ngayKetThuc'],
                include: [{
                    model: NamHoc,
                    as: 'namHoc',
                    attributes: ['id', 'nam']
                }]
            });

            return hocKy ? this.mapToDTO(hocKy) : null;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new DatabaseError('Lỗi khi tìm học kỳ từ cơ sở dữ liệu');
        }
    }

    mapToDTO(hocKyRecord) {
        const currentDate = new Date();
        const startDate = new Date(hocKyRecord.ngayBatDau);
        const endDate = new Date(hocKyRecord.ngayKetThuc);
        const isActive = currentDate >= startDate && currentDate <= endDate;

        return {
            id: hocKyRecord.id,
            ten: hocKyRecord.ten,
            ngayBatDau: hocKyRecord.ngayBatDau,
            ngayKetThuc: hocKyRecord.ngayKetThuc,
            isActive: isActive,
            namHoc: {
                id: hocKyRecord.namHoc.id,
                nam: hocKyRecord.namHoc.nam
            }
        };
    }
}

export default new SemesterRepository();