import { Lop, HocKy, MonHoc, Nganh, NguoiDung, NamHoc, Lop_SinhVien, BaiKiemTra } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

class ClassRepository {
    async findWithFilters(filters) {
        const { hocKyId, giangVienId, search, page = 1, limit = 20 } = filters;
        
        // Build WHERE conditions
        const whereConditions = {};
        if (hocKyId) whereConditions.idHocKy = hocKyId;
        if (giangVienId) whereConditions.idGiangVien = giangVienId;

        // Build search condition
        let searchCondition = {};
        if (search) {
            searchCondition = {
                [Op.or]: [
                    { tenLop: { [Op.like]: `%${search}%` } },
                    { '$monHoc.tenMon$': { [Op.like]: `%${search}%` } },
                    { '$giangVien.ten$': { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Calculate pagination
        const offset = (page - 1) * limit;

        try {
            // Execute optimized query with relationships and counts
            const { count, rows } = await Lop.findAndCountAll({
                where: {
                    ...whereConditions,
                    ...searchCondition
                },
                attributes: [
                    'id', 
                    'tenLop',
                    // Subqueries for counts to avoid N+1 problems
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Lop_SinhVien ls 
                            WHERE ls.idLop = Lop.id
                        )`),
                        'studentCount'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM BaiKiemTra bkt 
                            WHERE bkt.idLop = Lop.id
                        )`),
                        'examCount'
                    ]
                ],
                include: [
                    {
                        model: HocKy,
                        as: 'hocKy',
                        attributes: ['id', 'ten', 'ngayBatDau', 'ngayKetThuc'],
                        include: [{
                            model: NamHoc,
                            as: 'namHoc',
                            attributes: ['id', 'nam']
                        }],
                        required: true // INNER JOIN for better performance
                    },
                    {
                        model: NguoiDung,
                        as: 'giangVien',
                        attributes: ['id', 'ten', 'email'],
                        where: { role: 'giangVien' }, // Ensure only teachers
                        required: true
                    },
                    {
                        model: MonHoc,
                        as: 'monHoc',
                        attributes: ['id', 'tenMon'],
                        include: [{
                            model: Nganh,
                            as: 'nganh',
                            attributes: ['id', 'tenNganh']
                        }],
                        required: true
                    }
                ],
                limit: limit,
                offset: offset,
                order: [['tenLop', 'ASC']],
                distinct: true, // Important for accurate count with JOINs
                logging: false // Disable SQL logging in production
            });

            // Map to clean DTO format
            const mappedClasses = rows.map(this.mapToDTO.bind(this));

            return {
                classes: mappedClasses,
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

    // Map Sequelize model to clean DTO
    mapToDTO(lopRecord) {
        return {
            id: lopRecord.id,
            tenLop: lopRecord.tenLop,
            studentCount: parseInt(lopRecord.dataValues.studentCount) || 0,
            examCount: parseInt(lopRecord.dataValues.examCount) || 0,
            hocKy: {
                id: lopRecord.hocKy.id,
                ten: lopRecord.hocKy.ten,
                ngayBatDau: lopRecord.hocKy.ngayBatDau,
                ngayKetThuc: lopRecord.hocKy.ngayKetThuc,
                namHoc: lopRecord.hocKy.namHoc.nam
            },
            giangVien: {
                id: lopRecord.giangVien.id,
                ten: lopRecord.giangVien.ten,
                email: lopRecord.giangVien.email
            },
            monHoc: {
                id: lopRecord.monHoc.id,
                tenMon: lopRecord.monHoc.tenMon,
                nganh: {
                    id: lopRecord.monHoc.nganh.id,
                    tenNganh: lopRecord.monHoc.nganh.tenNganh
                }
            }
        };
    }

    // Additional helper methods
    async findById(classId) {
        try {
            const lop = await Lop.findByPk(classId, {
                include: [
                    {
                        model: HocKy,
                        as: 'hocKy',
                        include: [{ model: NamHoc, as: 'namHoc' }]
                    },
                    { model: NguoiDung, as: 'giangVien' },
                    {
                        model: MonHoc,
                        as: 'monHoc',
                        include: [{ model: Nganh, as: 'nganh' }]
                    }
                ]
            });

            return lop ? this.mapToDTO(lop) : null;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new Error('Lỗi khi tìm lớp');
        }
    }

    async getStudentCount(classId) {
        try {
            return await Lop_SinhVien.count({
                where: { idLop: classId }
            });
        } catch (error) {
            console.error('Database error in getStudentCount:', error);
            return 0;
        }
    }

    async getExamCount(classId) {
        try {
            return await BaiKiemTra.count({
                where: { idLop: classId }
            });
        } catch (error) {
            console.error('Database error in getExamCount:', error);
            return 0;
        }
    }

    /**
     * Lấy danh sách lớp cho người dùng hiện tại
     * @param {Object} user - User object từ middleware auth {id, role, ...}
     * @param {Object} filters - Filters và pagination
     */
    async findClassesForUser(user, filters = {}) {
        const { id: userId, role: userRole } = user;
        const { hocKyId, search, page = 1, limit = 20 } = filters;
        const offset = (page - 1) * limit;

        try {
            let whereConditions = {};
            let includeConditions = [];

            // Build search condition
            let searchCondition = {};
            if (search) {
                searchCondition = {
                    [Op.or]: [
                        { tenLop: { [Op.like]: `%${search}%` } },
                        { '$monHoc.tenMon$': { [Op.like]: `%${search}%` } }
                    ]
                };
            }

            if (userRole === 'giangVien') {
                // Giảng viên: Lấy lớp mà họ dạy
                whereConditions.idGiangVien = userId;
                
                // Nếu có filter học kỳ
                if (hocKyId) {
                    whereConditions.idHocKy = hocKyId;
                }

                const { count, rows } = await Lop.findAndCountAll({
                    where: {
                        ...whereConditions,
                        ...searchCondition
                    },
                    attributes: [
                        'id', 
                        'tenLop',
                        [Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Lop_SinhVien ls 
                            WHERE ls.idLop = Lop.id
                        )`), 'studentCount'],
                        [Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM BaiKiemTra bkt 
                            WHERE bkt.idLop = Lop.id
                        )`), 'examCount']
                    ],
                    include: [
                        {
                            model: HocKy,
                            as: 'hocKy',
                            attributes: ['id', 'ten', 'ngayBatDau', 'ngayKetThuc'],
                            include: [{
                                model: NamHoc,
                                as: 'namHoc',
                                attributes: ['id', 'nam']
                            }],
                            required: true
                        },
                        {
                            model: MonHoc,
                            as: 'monHoc',
                            attributes: ['id', 'tenMon'],
                            include: [{
                                model: Nganh,
                                as: 'nganh',
                                attributes: ['id', 'tenNganh']
                            }],
                            required: true
                        }
                    ],
                    limit: limit,
                    offset: offset,
                    order: [['tenLop', 'ASC']],
                    distinct: true
                });

                const mappedClasses = rows.map(lopRecord => ({
                    ...this.mapToDTO(lopRecord),
                    // Thêm thông tin giảng viên cho response
                    isTeacher: true
                }));

                return {
                    classes: mappedClasses,
                    total: count,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(count / limit)
                };

            } else if (userRole === 'sinhVien') {
                // Sinh viên: Lấy lớp mà họ đăng ký
                // Sử dụng subquery để filter lớp sinh viên đã đăng ký
                
                const studentClassIds = await Lop_SinhVien.findAll({
                    where: { idSinhVien: userId },
                    attributes: ['idLop'],
                    raw: true
                });
                
                const classIds = studentClassIds.map(item => item.idLop);
                
                if (classIds.length === 0) {
                    return {
                        classes: [],
                        total: 0,
                        page: page,
                        limit: limit,
                        totalPages: 0
                    };
                }

                let whereConditions = {
                    id: { [Op.in]: classIds },
                    ...searchCondition
                };
                
                if (hocKyId) {
                    whereConditions.idHocKy = hocKyId;
                }

                const { count, rows } = await Lop.findAndCountAll({
                    where: whereConditions,
                    attributes: [
                        'id', 
                        'tenLop',
                        [Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Lop_SinhVien ls 
                            WHERE ls.idLop = Lop.id
                        )`), 'studentCount'],
                        [Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM BaiKiemTra bkt 
                            WHERE bkt.idLop = Lop.id
                        )`), 'examCount']
                    ],
                    include: [
                        {
                            model: HocKy,
                            as: 'hocKy',
                            attributes: ['id', 'ten', 'ngayBatDau', 'ngayKetThuc'],
                            include: [{
                                model: NamHoc,
                                as: 'namHoc',
                                attributes: ['id', 'nam']
                            }],
                            required: true
                        },
                        {
                            model: NguoiDung,
                            as: 'giangVien',
                            attributes: ['id', 'ten', 'email'],
                            required: true
                        },
                        {
                            model: MonHoc,
                            as: 'monHoc',
                            attributes: ['id', 'tenMon'],
                            include: [{
                                model: Nganh,
                                as: 'nganh',
                                attributes: ['id', 'tenNganh']
                            }],
                            required: true
                        }
                    ],
                    limit: limit,
                    offset: offset,
                    order: [['tenLop', 'ASC']],
                    distinct: true
                });

                const mappedClasses = rows.map(lopRecord => ({
                    ...this.mapToDTO(lopRecord),
                    // Thêm thông tin sinh viên cho response
                    isStudent: true
                }));

                return {
                    classes: mappedClasses,
                    total: count,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(count / limit)
                };

            } else {
                throw new Error('Role không hợp lệ');
            }

        } catch (error) {
            console.error('Database error in findClassesForUser:', error);
            throw new Error('Lỗi khi truy vấn lớp học của người dùng');
        }
    }
}

export default new ClassRepository();