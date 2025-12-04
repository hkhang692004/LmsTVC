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
    async existsById(classId) {
        const lop = await Lop.findByPk(classId);
        return !!lop;
    }
    async findById(classId) {
        if (!classId) {
            return null;
        }

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
                        }],
                        required: false // LEFT JOIN to handle missing data
                    },
                    {
                        model: NguoiDung,
                        as: 'giangVien',
                        attributes: ['id', 'ten', 'email'],
                        required: false // LEFT JOIN to handle missing data
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
                        required: false // LEFT JOIN to handle missing data
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
                                    'hanNop', 'ngayNop', 'status', 'ngayTao'
                                ],
                                where: {
                                    idNoiDungCha: null // Chỉ lấy nội dung gốc (không có parent)
                                },
                                include: [
                                    {
                                        model: NoiDungChiTiet,
                                        as: 'chiTiets',
                                        attributes: ['id', 'loaiChiTiet', 'filePath', 'fileName', 'fileType', 'ngayTao'],
                                        required: false // LEFT JOIN để vẫn hiển thị nội dung dù không có file
                                    }
                                ],
                                required: false, // LEFT JOIN để vẫn hiển thị chủ đề dù không có nội dung
                                order: [['ngayTao', 'DESC']] // Nội dung mới nhất trước
                            }
                        ],
                        required: false, // LEFT JOIN to handle missing topics
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
                    noiDung: noiDung.noiDung,
                    loaiNoiDung: noiDung.loaiNoiDung,
                    hanNop: noiDung.hanNop,
                    ngayNop: noiDung.ngayNop,
                    status: noiDung.status,
                    ngayTao: noiDung.ngayTao,
                    // Thêm thông tin file nếu có
                    files: noiDung.chiTiets?.map(chiTiet => ({
                        id: chiTiet.id,
                        loaiChiTiet: chiTiet.loaiChiTiet,
                        filePath: chiTiet.filePath,
                        fileName: chiTiet.fileName,
                        fileType: chiTiet.fileType,
                        ngayTao: chiTiet.ngayTao
                    })) || []
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


    async findStudentsInClass(classId, filters = {}) {
        const { page = 1, limit = 20, search = null } = filters;
        const offset = (page - 1) * limit;

        let searchCondition = {};
        if (search) {
            searchCondition = {
                '$sinhVien.ten$': { [Op.like]: `%${search}%` }
            };
        }

        try {
            const { count, rows } = await Lop_SinhVien.findAndCountAll({
                where: {
                    idLop: classId,
                    ...searchCondition
                },
                include: [{
                    model: NguoiDung,
                    as: 'sinhVien',
                    attributes: ['id', 'ten', 'email', 'avatar'],
                    required: true
                }],
                limit: limit,
                offset: offset,
                order: [[{ model: NguoiDung, as: 'sinhVien' }, 'ten', 'ASC']],
                distinct: true
            });

            const students = rows.map(record => ({
                id: record.sinhVien.id,
                ten: record.sinhVien.ten,
                email: record.sinhVien.email,
                avatar: record.sinhVien.avatar,
            }));

            return {
                students,
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            };

        } catch (error) {
            console.error('Database lỗi ở findStudentsInClass:', error);
            throw new DatabaseError('Lỗi khi truy vấn danh sách sinh viên trong lớp');
        }
    }

    async addStudentToClass(classId, studentId) {
        try {
            const enrollment = await Lop_SinhVien.create({
                idLop: classId,
                idSinhVien: studentId,
            });
            
            return enrollment;
        } catch (error) {
            // Handle duplicate key error (if student already in class)
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new DatabaseError('Sinh viên đã đăng ký lớp này');
            }
            
            console.error('Database error in addStudentToClass:', error);
            throw new DatabaseError('Lỗi khi thêm sinh viên vào lớp');
        }
    }
    
    // Helper method to check if student is already in class
    async findStudentInClass(classId, studentId) {
        try {
            return await Lop_SinhVien.findOne({
                where: {
                    idLop: classId,
                    idSinhVien: studentId
                }
            });
        } catch (error) {
            console.error('Database error in findStudentInClass:', error);
            return null;
        }
    }
    

    async removeStudentFromClass(classId, studentId) {
        try {
            const deletedRows = await Lop_SinhVien.destroy({
                where: {
                    idLop: classId,
                    idSinhVien: studentId
                }
            });
            
            if (deletedRows === 0) {
                throw new DatabaseError('Không tìm thấy bản ghi để xóa');
            }
            
            return deletedRows;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            console.error('Database error in removeStudentFromClass:', error);
            throw new DatabaseError('Lỗi khi xóa sinh viên khỏi lớp');
        }
    }

    async addStudentsBulk(classId, students) {
        try {
            // 1. Tìm các sinh viên đã có trong lớp
            const existingEnrollments = await Lop_SinhVien.findAll({
                where: {
                    idLop: classId,
                    idSinhVien: { [Op.in]: students.map(s => s.idSinhVien) }
                },
                attributes: ['idSinhVien']
            });

            const existingStudentIds = new Set(existingEnrollments.map(e => e.idSinhVien));

            // 2. Phân loại sinh viên: new vs existing
            const newStudents = students.filter(s => !existingStudentIds.has(s.idSinhVien));
            const skippedStudents = students.filter(s => existingStudentIds.has(s.idSinhVien));

            // 3. Bulk insert chỉ sinh viên mới
            let createdRecords = [];
            if (newStudents.length > 0) {
                const enrollmentData = newStudents.map(student => ({
                    idLop: classId,
                    idSinhVien: student.idSinhVien
                }));

                createdRecords = await Lop_SinhVien.bulkCreate(enrollmentData, {
                    returning: true
                });
            }

            return {
                created: createdRecords.length,
                skipped: skippedStudents.length,
                total: students.length,
                details: {
                    createdStudents: newStudents.map(s => s.idSinhVien),
                    skippedStudents: skippedStudents.map(s => s.idSinhVien),
                    records: createdRecords
                }
            };

        } catch (error) {
            console.error('Database error in addStudentsBulk:', error);
            throw new DatabaseError('Lỗi khi thêm danh sách sinh viên vào lớp');
        }
    }

    async removeStudentsBulk(classId, studentIds) {
        try {
            // 1. Tìm các sinh viên hiện có trong lớp (để biết ai sẽ bị xóa)
            const existingEnrollments = await Lop_SinhVien.findAll({
                where: {
                    idLop: classId,
                    idSinhVien: { [Op.in]: studentIds }
                },
                attributes: ['idSinhVien']
            });

            const existingStudentIds = existingEnrollments.map(e => e.idSinhVien);

            // 2. Phân loại: found vs not found
            const foundStudents = studentIds.filter(id => existingStudentIds.includes(id));
            const notFoundStudents = studentIds.filter(id => !existingStudentIds.includes(id));

            // 3. Bulk delete chỉ những sinh viên có trong lớp
            let deletedRows = 0;
            if (foundStudents.length > 0) {
                deletedRows = await Lop_SinhVien.destroy({
                    where: {
                        idLop: classId,
                        idSinhVien: { [Op.in]: foundStudents }
                    }
                });
            }

            return {
                deleted: deletedRows,
                requested: studentIds.length,
                notFound: notFoundStudents.length,
                details: {
                    deletedStudents: foundStudents,
                    notFoundStudents: notFoundStudents
                }
            };

        } catch (error) {
            console.error('Database error in removeStudentsBulk:', error);
            throw new DatabaseError('Lỗi khi xóa danh sách sinh viên khỏi lớp');
        }
    }
}

export default new ClassRepository();