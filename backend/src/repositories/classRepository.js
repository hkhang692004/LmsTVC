import { Lop, HocKy, MonHoc, Nganh, NguoiDung, NamHoc, Lop_SinhVien, BaiKiemTra, ChuDe, NoiDung, NoiDungChiTiet } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';
import { DatabaseError } from '../utils/errors.js';

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
            throw new DatabaseError('Lỗi khi truy vấn lớp học từ cơ sở dữ liệu');
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
                        attributes: ['id', 'ten', 'ngayBatDau', 'ngayKetThuc'],
                        include: [{ 
                            model: NamHoc, 
                            as: 'namHoc',
                            attributes: ['id', 'nam']
                        }]
                    },
                    { 
                        model: NguoiDung, 
                        as: 'giangVien',
                        attributes: ['id', 'ten', 'email']
                    },
                    {
                        model: MonHoc,
                        as: 'monHoc',
                        attributes: ['id', 'tenMon'],
                        include: [{ 
                            model: Nganh, 
                            as: 'nganh',
                            attributes: ['id', 'tenNganh']
                        }]
                    },
                    // Thêm các chủ đề của lớp
                    {
                        model: ChuDe,
                        as: 'chuDes',
                        attributes: ['id', 'tenChuDe', 'moTa'],
                        // Lấy các nội dung gốc của mỗi chủ đề
                        include: [
                            {
                                model: NoiDung,
                                as: 'noiDungs',
                                attributes: [
                                    'id', 'tieuDe', 'noiDung', 'loaiNoiDung', 
                                    'hanNop', 'ngayNop', 'trangThai', 'ngayTao'
                                ],
                                where: {
                                    idNoiDungCha: null // Chỉ lấy nội dung gốc (không có parent)
                                },
                                required: false, // LEFT JOIN để vẫn hiển thị chủ đề dù không có nội dung

                                order: [['ngayTao', 'DESC']] // Nội dung mới nhất trước
                            }
                        ],
                        order: [['tenChuDe', 'ASC']] // Sắp xếp chủ đề theo tên
                    }
                ],
                // Add statistics as computed fields
                attributes: [
                    'id', 'tenLop',
                    // Đếm số sinh viên
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Lop_SinhVien ls 
                            WHERE ls.idLop = Lop.id
                        )`),
                        'studentCount'
                    ],
                    // Đếm số bài kiểm tra
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM BaiKiemTra bkt 
                            WHERE bkt.idLop = Lop.id
                        )`),
                        'examCount'
                    ],
                    // Đếm tổng số chủ đề
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM ChuDe cd 
                            WHERE cd.idLop = Lop.id
                        )`),
                        'topicCount'
                    ]
                ]
            });

            if (!lop) {
                return null;
            }

            // Map to detailed DTO with topics and content
            return this.mapToDetailDTO(lop);

        } catch (error) {
            console.error('Database error in findById:', error);
            throw new DatabaseError('Lỗi khi tìm chi tiết lớp học từ cơ sở dữ liệu');
        }
    }

    // Map to detailed DTO for class detail page
    mapToDetailDTO(lopRecord) {
        return {
            id: lopRecord.id,
            tenLop: lopRecord.tenLop,
            // Statistics
            statistics: {
                studentCount: parseInt(lopRecord.dataValues.studentCount) || 0,
                examCount: parseInt(lopRecord.dataValues.examCount) || 0,
                topicCount: parseInt(lopRecord.dataValues.topicCount) || 0
            },
            // Basic info
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
            },
            // Topics with root content
            chuDes: lopRecord.chuDes?.map(chuDe => ({
                id: chuDe.id,
                tenChuDe: chuDe.tenChuDe,
                moTa: chuDe.moTa,
                contentCount: chuDe.noiDungs?.length || 0,
                noiDungs: chuDe.noiDungs?.map(noiDung => ({
                    id: noiDung.id,
                    tieuDe: noiDung.tieuDe,
                    noiDung: noiDung.noiDung.length > 200 
                        ? noiDung.noiDung.substring(0, 200) + '...' 
                        : noiDung.noiDung, // Truncate long content for overview
                    loaiNoiDung: noiDung.loaiNoiDung,
                    hanNop: noiDung.hanNop,
                    ngayNop: noiDung.ngayNop,
                    trangThai: noiDung.trangThai,
                    ngayTao: noiDung.ngayTao,

                })) || []
            })) || []
        };
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
            // If it's a role validation error, re-throw as-is
            if (error.message === 'Role không hợp lệ') {
                throw error;
            }
            // Otherwise it's a database error
            throw new DatabaseError('Lỗi khi truy vấn lớp học của người dùng từ cơ sở dữ liệu');
        }
    }
}

export default new ClassRepository();