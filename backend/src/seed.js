import db from "./config/db.js";
import bcrypt from "bcrypt";
const { sequelize, Sequelize } = db;
import NguoiDung from "./models/nguoiDung.js";
import MonHoc from "./models/monHoc.js";
import HocKy from "./models/hocKy.js";
import NamHoc from "./models/namHoc.js";
import Nganh from "./models/nganh.js";
import Lop from "./models/lop.js";
import Lop_SinhVien from "./models/lopSinhVien.js";
import ChuDe from "./models/chuDe.js";
import NoiDung from "./models/noiDung.js";
import NoiDungChiTiet from "./models/noiDungChiTiet.js";
import BaiKiemTra from "./models/baiKiemTra.js";
import CauHoi from "./models/cauHoi.js";
import LuaChon from "./models/luaChon.js";
import "./models/index.js"; // Initialize associations

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting full database seeding...');
        
        const { sequelize } = db;

        // Disable FK checks, drop and recreate tables, re-enable FK checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS=0');
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS=1');
        console.log('✅ Database synced');

        // 0. Clear old data
        console.log('🗑️  Clearing old data...');
        await Lop_SinhVien.destroy({ where: {} });
        await LuaChon.destroy({ where: {} });
        await CauHoi.destroy({ where: {} });
        await BaiKiemTra.destroy({ where: {} });
        await NoiDungChiTiet.destroy({ where: {} });
        await NoiDung.destroy({ where: {} });
        await ChuDe.destroy({ where: {} });
        await Lop.destroy({ where: {} });
        await MonHoc.destroy({ where: {} });
        await HocKy.destroy({ where: {} });
        await Nganh.destroy({ where: {} });
        console.log('✅ Old data cleared');

        // 1. Seed NamHoc (Year)
        console.log('📚 Seeding NamHoc...');
        await NamHoc.findOrCreate({
            where: { id: 'NH001' },
            defaults: { id: 'NH001', nam: '2024' }
        });
        console.log('✅ NamHoc seeded');

        // 2. Seed Nganh (Department)
        console.log('📚 Seeding Nganh...');
        await Nganh.findOrCreate({
            where: { id: 'NG001' },
            defaults: { id: 'NG001', tenNganh: 'Công Nghệ Thông Tin' }
        });
        console.log('✅ Nganh seeded');

        // 3. Seed HocKy (Semester)
        console.log('📚 Seeding HocKy...');
        await Promise.all([
            HocKy.findOrCreate({
                where: { id: 'HK001' },
                defaults: { 
                    id: 'HK001', 
                    ten: 'Học Kỳ 1', 
                    idNam: 'NH001',
                    ngayBatDau: new Date('2024-09-01'),
                    ngayKetThuc: new Date('2024-12-31'),
                    status: true
                }
            }),
            HocKy.findOrCreate({
                where: { id: 'HK002' },
                defaults: { 
                    id: 'HK002', 
                    ten: 'Học Kỳ 2',
                    idNam: 'NH001',
                    ngayBatDau: new Date('2025-01-01'),
                    ngayKetThuc: new Date('2025-04-30'),
                    status: true
                }
            })
        ]);
        console.log('✅ HocKy seeded');

        // 4. Seed MonHoc (Subjects)
        console.log('📚 Seeding MonHoc...');
        await Promise.all([
            MonHoc.findOrCreate({
                where: { id: 'MH001' },
                defaults: { 
                    id: 'MH001', 
                    tenMon: 'Toán Cao Cấp', 
                    idNganh: 'NG001'
                }
            }),
            MonHoc.findOrCreate({
                where: { id: 'MH002' },
                defaults: { 
                    id: 'MH002', 
                    tenMon: 'Lập Trình C++', 
                    idNganh: 'NG001'
                }
            }),
            MonHoc.findOrCreate({
                where: { id: 'MH003' },
                defaults: { 
                    id: 'MH003', 
                    tenMon: 'Cơ Sở Dữ Liệu', 
                    idNganh: 'NG001'
                }
            })
        ]);
        console.log('✅ MonHoc seeded');

        // 5. Seed NguoiDung (Giáo viên)
        console.log('📚 Seeding NguoiDung (Teachers)...');
        const hashedPassword = await bcrypt.hash('123456', 10);
        await Promise.all([
            NguoiDung.findOrCreate({
                where: { email: 'teacher1@example.com' },
                defaults: {
                    id: 'GV001',
                    ten: 'Thầy Nguyễn Văn A',
                    email: 'teacher1@example.com',
                    password: hashedPassword,
                    role: 'giangVien',
                    status: true
                }
            }),
            NguoiDung.findOrCreate({
                where: { email: 'teacher2@example.com' },
                defaults: {
                    id: 'GV002',
                    ten: 'Thầy Trần Văn B',
                    email: 'teacher2@example.com',
                    password: hashedPassword,
                    role: 'giangVien',
                    status: true
                }
            }),
            NguoiDung.findOrCreate({
                where: { email: 'teacher3@example.com' },
                defaults: {
                    id: 'GV003',
                    ten: 'Thầy Lê Văn C',
                    email: 'teacher3@example.com',
                    password: hashedPassword,
                    role: 'giangVien',
                    status: true
                }
            })
        ]);
        console.log('✅ NguoiDung (Teachers) seeded');

        // 6. Seed Lop (Classes)
        console.log('📚 Seeding Lop...');
        await Promise.all([
            Lop.findOrCreate({
                where: { id: 'LP001' },
                defaults: {
                    id: 'LP001',
                    tenLop: 'A01',
                    idMonHoc: 'MH001',
                    idHocKy: 'HK001',
                    idGiangVien: 'GV001'
                }
            }),
            Lop.findOrCreate({
                where: { id: 'LP002' },
                defaults: {
                    id: 'LP002',
                    tenLop: 'B02',
                    idMonHoc: 'MH001',
                    idHocKy: 'HK001',
                    idGiangVien: 'GV002'
                }
            }),
            Lop.findOrCreate({
                where: { id: 'LP003' },
                defaults: {
                    id: 'LP003',
                    tenLop: 'C01',
                    idMonHoc: 'MH002',
                    idHocKy: 'HK001',
                    idGiangVien: 'GV001'
                }
            }),
            Lop.findOrCreate({
                where: { id: 'LP004' },
                defaults: {
                    id: 'LP004',
                    tenLop: 'D01',
                    idMonHoc: 'MH003',
                    idHocKy: 'HK002',
                    idGiangVien: 'GV003'
                }
            }),
            Lop.findOrCreate({
                where: { id: 'LP005' },
                defaults: {
                    id: 'LP005',
                    tenLop: 'LTB02',
                    idMonHoc: 'MH002',
                    idHocKy: 'HK002',
                    idGiangVien: 'GV002'
                }
            })
        ]);
        console.log('✅ Lop seeded');

        // 7. Seed NguoiDung (Students)
        console.log('📚 Seeding NguoiDung (Students)...');
        await Promise.all([
            NguoiDung.findOrCreate({
                where: { email: 'student1@example.com' },
                defaults: {
                    id: 'SV25001',
                    ten: 'Nguyễn Thanh Hải',
                    email: 'student1@example.com',
                    password: hashedPassword,
                    role: 'sinhVien',
                    status: true
                }
            }),
            NguoiDung.findOrCreate({
                where: { email: 'student2@example.com' },
                defaults: {
                    id: 'SV25002',
                    ten: 'Trần Minh Tuấn',
                    email: 'student2@example.com',
                    password: hashedPassword,
                    role: 'sinhVien',
                    status: true
                }
            }),
            NguoiDung.findOrCreate({
                where: { email: 'student3@example.com' },
                defaults: {
                    id: 'SV25003',
                    ten: 'Phạm Quốc Anh',
                    email: 'student3@example.com',
                    password: hashedPassword,
                    role: 'sinhVien',
                    status: true
                }
            }),
            NguoiDung.findOrCreate({
                where: { email: 'student4@example.com' },
                defaults: {
                    id: 'SV25004',
                    ten: 'Hoàng Thị Bình',
                    email: 'student4@example.com',
                    password: hashedPassword,
                    role: 'sinhVien',
                    status: true
                }
            }),
            NguoiDung.findOrCreate({
                where: { email: 'student5@example.com' },
                defaults: {
                    id: 'SV25005',
                    ten: 'Đỗ Văn Chiến',
                    email: 'student5@example.com',
                    password: hashedPassword,
                    role: 'sinhVien',
                    status: true
                }
            })
        ]);
        console.log('✅ NguoiDung (Students) seeded');

        // 8. Link sinh viên vào lớp
        console.log('📚 Linking students to classes...');
        const studentIds = ['SV25001', 'SV25002', 'SV25003', 'SV25004', 'SV25005'];
        await Promise.all([
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP001', idSinhVien: 'SV25001' },
                defaults: { idLop: 'LP001', idSinhVien: 'SV25001' }
            }),
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP001', idSinhVien: 'SV25002' },
                defaults: { idLop: 'LP001', idSinhVien: 'SV25002' }
            }),
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP002', idSinhVien: 'SV25003' },
                defaults: { idLop: 'LP002', idSinhVien: 'SV25003' }
            }),
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP002', idSinhVien: 'SV25004' },
                defaults: { idLop: 'LP002', idSinhVien: 'SV25004' }
            }),
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP003', idSinhVien: 'SV25003' },
                defaults: { idLop: 'LP003', idSinhVien: 'SV25003' }
            }),
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP003', idSinhVien: 'SV25005' },
                defaults: { idLop: 'LP003', idSinhVien: 'SV25005' }
            }),
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP004', idSinhVien: 'SV25001' },
                defaults: { idLop: 'LP004', idSinhVien: 'SV25001' }
            })
        ]);
        console.log('✅ Students linked to classes');

        // 9. Seed ChuDe (Topics)
        console.log('📚 Seeding ChuDe...');
        const chuDeData = [
            { id: 'CD001', tenChuDe: 'Chung', idLop: 'LP001', moTa: 'Thông tin chung về lớp OOP' },
            { id: 'CD002', tenChuDe: 'Thông báo', idLop: 'LP001', moTa: 'Các thông báo quan trọng' },
            { id: 'CD003', tenChuDe: 'Bài giảng', idLop: 'LP001', moTa: 'Tài liệu bài giảng' },
            { id: 'CD004', tenChuDe: 'Bài tập', idLop: 'LP001', moTa: 'Danh sách bài tập cần làm' },
            { id: 'CD006', tenChuDe: 'Giới thiệu', idLop: 'LP002', moTa: 'Giới thiệu môn Web Development' },
            { id: 'CD007', tenChuDe: 'Tài liệu học tập', idLop: 'LP002', moTa: 'Các tài liệu tham khảo' },
            { id: 'CD008', tenChuDe: 'Bài tập về nhà', idLop: 'LP002', moTa: 'Bài tập cần nộp' },
            { id: 'CD009', tenChuDe: 'Chương 1', idLop: 'LP003', moTa: 'Database Basics' },
            { id: 'CD010', tenChuDe: 'Chương 2', idLop: 'LP003', moTa: 'SQL Fundamentals' },
        ];
        await ChuDe.bulkCreate(chuDeData, { ignoreDuplicates: true });
        console.log('✅ ChuDe seeded');

        // 10. Seed NoiDung (Content)
        console.log('📚 Seeding NoiDung...');
        const noiDungData = [
            // LP001 - CD001 (Chung) - PDF
            {
                id: 'ND001',
                tieuDe: 'DANH SÁCH CẤM THI MÔN HỌC',
                noiDung: 'Danh sách sinh viên cấm thi học kỳ này',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD001',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-12-01')
            },
            {
                id: 'ND002',
                tieuDe: 'Thông tin điểm danh môn học',
                noiDung: 'Lịch điểm danh và yêu cầu tối thiểu',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD001',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-12-01')
            },
            {
                id: 'ND003',
                tieuDe: 'Lịch học Lý Thuyết dự kiến',
                noiDung: 'Thời khóa biểu học lý thuyết OOP',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD001',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-12-01')
            },
            // LP001 - CD002 (Thông báo) - Text
            {
                id: 'ND004',
                tieuDe: 'Lịch học Lý Thuyết dự kiến môn OOP',
                noiDung: `Chào cả lớp,

Thầy nhắc lại lịch học thực hành buổi 6 và lịch thi giữa kỳ:

Ngày 19/08/2025: cả 2 nhóm thực hành buổi 6 (Nhóm 1 từ 13h00, Nhóm 2 từ 15h00)
Ngày 26/08/2025: THI GIỮA KỲ
Nội dung: từ chương đầu đến cây nhị phân tìm kiếm
Lưu ý: SV có mặt tại phòng thi trước 15 phút`,
                loaiNoiDung: 'phucDap',
                idChuDe: 'CD002',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-12-05')
            },
            {
                id: 'ND005',
                tieuDe: 'Thông báo điều chỉnh lịch học',
                noiDung: `Sinh viên thân mến,

Do lịch công tác của giảng viên, buổi học thực hành ngày 22/08 được dịch sang ngày 23/08.
Thời gian vẫn giữ như cũ: 13h00 - 15h00.
Địa điểm: Phòng máy tính D1-101.

Mong các em lưu ý và sắp xếp thời gian hợp lý.`,
                loaiNoiDung: 'phucDap',
                idChuDe: 'CD002',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-12-05')
            },
            // LP001 - CD002 (Thông báo) - Folder
            {
                id: 'ND006',
                tieuDe: 'Điểm danh buổi trực tuyến',
                noiDung: 'Thư mục chứa danh sách điểm danh',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD002',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-12-05')
            },
            // LP001 - CD002 (Thông báo) - Link
            {
                id: 'ND007',
                tieuDe: 'Đường dẫn tải VS Code',
                noiDung: 'Link tải Visual Studio Code',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD002',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-12-05')
            },
            // LP001 - CD003 (Bài giảng) - PDF
            {
                id: 'ND008',
                tieuDe: 'Slide bài 1 - Giới thiệu OOP',
                noiDung: 'Slide bài giảng về khái niệm OOP cơ bản',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD003',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-11-20')
            },
            // LP001 - CD003 (Bài giảng) - Word
            {
                id: 'ND009',
                tieuDe: 'Tài liệu Word - Hướng dẫn OOP',
                noiDung: 'Tài liệu chi tiết về hướng đối tượng trong Java',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD003',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-11-20')
            },
            // LP001 - CD003 (Bài giảng) - Video
            {
                id: 'ND010',
                tieuDe: 'Video bài giảng - Class vs Object',
                noiDung: 'Video hướng dẫn chi tiết về class và object',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD003',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-11-20')
            },
            // LP001 - CD003 (Bài giảng) - YouTube
            {
                id: 'ND011',
                tieuDe: 'Video YouTube - Lập trình OOP cơ bản',
                noiDung: 'Video hướng dẫn về lập trình hướng đối tượng',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD003',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-11-25')
            },
            // LP001 - CD002 (Thông báo) - Phúc đáp con (reply)
            {
                id: 'ND012',
                tieuDe: 'Trả lời: Lịch học Lý Thuyết dự kiến',
                noiDung: `Cảm ơn các em đã lưu ý. \nCác em vui lòng chuẩn bị kiến thức từ chương 1 đến chương 3 trước khi đến thi.`,
                loaiNoiDung: 'phucDap',
                idChuDe: 'CD002',
                idNoiDungCha: 'ND004',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-12-06')
            },
            // LP001 - CD002 (Thông báo) - Phúc đáp con (reply 2)
            {
                id: 'ND013',
                tieuDe: 'Trả lời: Điều chỉnh lịch học',
                noiDung: 'Đã cập nhật lịch học mới. Các em hãy chuẩn bị sẵn sàng.',
                loaiNoiDung: 'phucDap',
                idChuDe: 'CD002',
                idNoiDungCha: 'ND005',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-12-06')
            },
            // LP001 - CD004 (Bài tập) - Nộp bài
            {
                id: 'ND014',
                tieuDe: 'Bài tập 1 - Lớp và Đối tượng',
                noiDung: 'Viết một chương trình quản lý sinh viên sử dụng lớp và đối tượng',
                loaiNoiDung: 'baiTap',
                idChuDe: 'CD004',
                idNguoiDung: 'GV001',
                hanNop: new Date('2025-12-25'),
                status: 'an',
                ngayTao: new Date('2025-12-10')
            },
            {
                id: 'ND016',
                tieuDe: 'Bài tập 2 - Kế thừa',
                noiDung: 'Tạo hệ thống phân cấp lớp với kế thừa',
                loaiNoiDung: 'baiTap',
                idChuDe: 'CD004',
                idNguoiDung: 'GV001',
                hanNop: new Date('2025-12-12'),
                status: 'an',
                ngayTao: new Date('2025-12-15')
            },
            {
                id: 'ND015',
                tieuDe: 'Bài tập 3 - Đa hình',
                noiDung: 'Áp dụng đa hình trong một ứng dụng thực tế',
                loaiNoiDung: 'baiTap',
                idChuDe: 'CD004',
                idNguoiDung: 'GV001',
                hanNop: new Date('2026-01-08'),
                status: 'an',
                ngayTao: new Date('2025-12-22')
            }
        ];
        await NoiDung.bulkCreate(noiDungData, { ignoreDuplicates: true });
        console.log('✅ NoiDung seeded');

        // 11.1 Seed Folder with Files
        console.log('📚 Seeding Folder and Files...');
        const folderFilesData = [
            // Parent folder (loaiNoiDung='taiLieu' với loaiChiTiet='thuMuc')
            {
                id: 'ND016',
                tieuDe: 'Thư mục Java OOP',
                noiDung: 'Thư mục chứa các file Java về OOP',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD004',
                idNguoiDung: 'GV001',
                status: 'hien',
                ngayTao: new Date('2025-12-01')
            },
            // Child Java file 1
            {
                id: 'ND017',
                tieuDe: 'Main.java',
                noiDung: 'File Java chính của bài giảng',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD004',
                idNguoiDung: 'GV001',
                idNoiDungCha: 'ND006',
                status: 'hien',
                ngayTao: new Date('2025-12-01')
            },
            // Child Java file 2
            {
                id: 'ND018',
                tieuDe: 'Student.java',
                noiDung: 'File Java class Student',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD004',
                idNguoiDung: 'GV001',
                idNoiDungCha: 'ND006',
                status: 'hien',
                ngayTao: new Date('2025-12-01')
            }
        ];
        await NoiDung.bulkCreate(folderFilesData, { ignoreDuplicates: true });
        console.log('✅ Folder and Files seeded');

        // 11. Seed NoiDungChiTiet (Content Details) - sử dụng URLs thực từ Cloudinary
        console.log('📚 Seeding NoiDungChiTiet...');
        const noiDungChiTietData = [
            // ND001 - PDF: Danh sách cấm thi
            {
                id: 'NDCT001',
                idNoiDung: 'ND001',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf',
                fileName: 'danh-sach-cam-thi.pdf',
                fileType: 'pdf',
                fileSize: 2048576,
                ngayTao: new Date('2025-12-01')
            },
            // ND002 - PDF: Thông tin điểm danh
            {
                id: 'NDCT002',
                idNoiDung: 'ND002',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf',
                fileName: 'diem-danh.pdf',
                fileType: 'pdf',
                fileSize: 1024576,
                ngayTao: new Date('2025-12-01')
            },
            // ND003 - PDF: Lịch học
            {
                id: 'NDCT003',
                idNoiDung: 'ND003',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf',
                fileName: 'lich-hoc-ly-thuyet.pdf',
                fileType: 'pdf',
                fileSize: 512576,
                ngayTao: new Date('2025-12-01')
            },
            // ND008 - PDF: Slide bài 1 OOP
            {
                id: 'NDCT004',
                idNoiDung: 'ND008',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf',
                fileName: 'slide-bai-1-oop.pdf',
                fileType: 'pdf',
                fileSize: 3048576,
                ngayTao: new Date('2025-11-20')
            },
            // ND009 - Word: Hướng dẫn OOP
            {
                id: 'NDCT005',
                idNoiDung: 'ND009',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/raw/upload/v1764058654/ThucHanh9-GiamSatHeThong_usxryd.docx',
                fileName: 'huong-dan-oop.docx',
                fileType: 'docx',
                fileSize: 4096576,
                ngayTao: new Date('2025-11-20')
            },
            // ND010 - Video: Bài giảng video Cloudinary
            {
                id: 'NDCT006',
                idNoiDung: 'ND010',
                loaiChiTiet: 'video',
                filePath: 'https://res.cloudinary.com/dblzpkokm/video/upload/v1765433522/SNAPSHOT_cvzkcg.mp4',
                fileName: 'video-class-vs-object.mp4',
                fileType: 'video',
                fileSize: 125000000,
                ngayTao: new Date('2025-11-20')
            },
            // ND007 - Link: Đường dẫn tải VS Code
            {
                id: 'NDCT007',
                idNoiDung: 'ND007',
                loaiChiTiet: 'duongDan',
                filePath: 'https://code.visualstudio.com/download',
                fileName: 'VS Code Download',
                fileType: 'link',
                ngayTao: new Date('2025-12-05')
            },
            // ND011 - YouTube: Video hướng dẫn OOP từ YouTube
            {
                id: 'NDCT008',
                idNoiDung: 'ND011',
                loaiChiTiet: 'video',
                filePath: 'https://www.youtube.com/watch?v=xo4rkcC7kFc',
                fileName: 'OOP-Basics-YouTube',
                fileType: 'youtube',
                ngayTao: new Date('2025-11-25')
            },
            // ND006 - Folder: Điểm danh buổi trực tuyến
            {
                id: 'NDCT009',
                idNoiDung: 'ND006',
                loaiChiTiet: 'thuMuc',
                filePath: '/folders/attendance',
                fileName: 'Điểm danh',
                fileType: 'folder',
                ngayTao: new Date('2025-12-05')
            },
           
            // ND017 - Java file: Main.java
            {
                id: 'NDCT010',
                idNoiDung: 'ND017',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/raw/upload/v1765552267/lms-uploads/cv6dni048hi7ch2e9zum',
                fileName: 'Main.java',
                fileType: 'java',
                fileSize: 1548,
                ngayTao: new Date('2025-12-01')
            },
            // ND018 - Java file: Student.java
            {
                id: 'NDCT011',
                idNoiDung: 'ND018',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/raw/upload/v1765552192/lms-uploads/jnn59bxpykwc1x1gibkg',
                fileName: 'Student.java',
                fileType: 'java',
                fileSize: 2048,
                ngayTao: new Date('2025-12-01')
            }
        ];
        await NoiDungChiTiet.bulkCreate(noiDungChiTietData, { ignoreDuplicates: true });
        console.log('✅ NoiDungChiTiet seeded');

        // 12. Seed BaiKiemTra (Exams)
        console.log('📚 Seeding BaiKiemTra...');
        await BaiKiemTra.findOrCreate({
            where: { id: 'BKT001' },
            defaults: {
                id: 'BKT001',
                tieuDe: 'Kiểm tra giữa kỳ - OOP',
                moTa: 'Bài kiểm tra giữa kỳ môn Toán Cao Cấp (OOP)',
                idLop: 'LP001',
                thoiGianBatDau: new Date('2025-12-10'),
                thoiGianKetThuc: new Date('2025-12-15'),
                thoiLuong: 60,
                tongDiem: 10,
                status: 'dangMo',
                choPhepXemDiem: false
            }
        });
        await BaiKiemTra.findOrCreate({
            where: { id: 'BKT002' },
            defaults: {
                id: 'BKT002',
                tieuDe: 'Kiểm tra cuối kỳ - OOP',
                moTa: 'Bài kiểm tra cuối kỳ môn Toán Cao Cấp (OOP)',
                idLop: 'LP001',
                thoiGianBatDau: new Date('2025-12-12'),
                thoiGianKetThuc: new Date('2025-12-13'),
                thoiLuong: 90,
                tongDiem: 10,
                status: 'dangMo',
                choPhepXemDiem: true
            }
        });
        console.log('✅ BaiKiemTra seeded');

        // 13. Seed CauHoi (Questions)
        console.log('📚 Seeding CauHoi...');
        const cauHoiData = [
            // BKT001 - Kiểm tra giữa kỳ
            {
                id: 'CH001',
                noiDung: 'Lớp (Class) trong OOP là gì?',
                loaiCauHoi: 'motDapAn',
                idBaiKiemTra: 'BKT001',
                diemToiDa: 2,
                thuTu: 1,
            },
            {
                id: 'CH002',
                noiDung: 'Đối tượng (Object) được tạo từ đâu?',
                loaiCauHoi: 'motDapAn',
                idBaiKiemTra: 'BKT001',
                diemToiDa: 2,
               
                 thuTu: 2,
            },
            {
                id: 'CH003',
                noiDung: 'Kế thừa (Inheritance) có ý nghĩa gì?',
                loaiCauHoi: 'nhieuDapAn',
                idBaiKiemTra: 'BKT001',
                diemToiDa: 2,
                 thuTu: 3,
            },
            {
                id: 'CH004',
                noiDung: 'Đa hình (Polymorphism) là khái niệm nào?',
                loaiCauHoi: 'motDapAn',
                idBaiKiemTra: 'BKT001',
                diemToiDa: 2,
                 thuTu: 4,
            },
            {
                id: 'CH005',
                noiDung: 'Encapsulation có liên quan đến gì?',
                loaiCauHoi: 'motDapAn',
                idBaiKiemTra: 'BKT001',
                diemToiDa: 2,
                 thuTu: 5,
            },
            // BKT002 - Kiểm tra cuối kỳ
            {
                id: 'CH006',
                noiDung: 'Constructor trong Java được gọi khi nào?',
                loaiCauHoi: 'motDapAn',
                idBaiKiemTra: 'BKT002',
                diemToiDa: 2,
                 thuTu: 1,
            },
            {
                id: 'CH007',
                noiDung: 'Phương thức static có tính chất gì?',
                loaiCauHoi: 'motDapAn',
                idBaiKiemTra: 'BKT002',
                diemToiDa: 2,
                 thuTu: 2,
            },
            {
                id: 'CH008',
                noiDung: 'Interface khác với Abstract Class như thế nào?',
                loaiCauHoi: 'motDapAn',
                idBaiKiemTra: 'BKT002',
                diemToiDa: 2,
                 thuTu: 3,
            },
            {
                id: 'CH009',
                noiDung: 'Từ khóa "this" dùng để làm gì?',
                loaiCauHoi: 'motDapAn',
                idBaiKiemTra: 'BKT002',
                diemToiDa: 2,
                thuTu: 4,
            },
            {
                id: 'CH010',
                noiDung: 'Exception Handling dùng để xử lý cái gì?',
                loaiCauHoi: 'motDapAn',
                idBaiKiemTra: 'BKT002',
                diemToiDa: 2,
                 thuTu: 5,
            }
        ];
        await CauHoi.bulkCreate(cauHoiData, { ignoreDuplicates: true });
        console.log('✅ CauHoi seeded');

        // 14. Seed LuaChon (Answer Choices)
        console.log('📚 Seeding LuaChon...');
        const luaChonData = [
            // CH001 - Lớp là gì?
            { id: 'LC001', noiDung: 'Mẫu thiết kế để tạo đối tượng', idCauHoi: 'CH001', thuTu: 1, laDapAnDung: true, ngayTao: new Date('2025-12-10') },
            { id: 'LC002', noiDung: 'Một tập hợp dữ liệu', idCauHoi: 'CH001', thuTu: 2, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            { id: 'LC003', noiDung: 'Một hàm trong chương trình', idCauHoi: 'CH001', laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            { id: 'LC004', noiDung: 'Một loại biến toàn cục', idCauHoi: 'CH001', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            
            // CH002 - Đối tượng được tạo từ đâu?
            { id: 'LC005', noiDung: 'Từ lớp (Class)', idCauHoi: 'CH002', thuTu: 1, laDapAnDung: true, ngayTao: new Date('2025-12-10') },
            { id: 'LC006', noiDung: 'Từ hàm', idCauHoi: 'CH002', thuTu: 2, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            { id: 'LC007', noiDung: 'Từ module', idCauHoi: 'CH002', thuTu: 3, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            { id: 'LC008', noiDung: 'Từ file', idCauHoi: 'CH002', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            
            // CH003 - Kế thừa là gì?
            { id: 'LC009', noiDung: 'Sự thừa hưởng tính chất từ lớp cha',idCauHoi: 'CH003', laDapAnDung: true, ngayTao: new Date('2025-12-10') },
            { id: 'LC010', noiDung: 'Sao chép một lớp', idCauHoi: 'CH003', thuTu: 2, laDapAnDung: true, ngayTao: new Date('2025-12-10') },
            { id: 'LC011', noiDung: 'Xóa một lớp', idCauHoi: 'CH003', thuTu: 3,laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            { id: 'LC012', noiDung: 'Kết hợp nhiều lớp', idCauHoi: 'CH003', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            
            // CH004 - Đa hình là gì?
            { id: 'LC013', noiDung: 'Cùng tên nhưng hành vi khác nhau', idCauHoi: 'CH004', thuTu: 1, laDapAnDung: true, ngayTao: new Date('2025-12-10') },
            { id: 'LC014', noiDung: 'Nhiều lớp con', idCauHoi: 'CH004', thuTu: 2, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            { id: 'LC015', noiDung: 'Nhiều biến', idCauHoi: 'CH004', thuTu: 3, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            { id: 'LC016', noiDung: 'Nhiều hàm', idCauHoi: 'CH004', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            
            // CH005 - Encapsulation
            { id: 'LC017', noiDung: 'Che giấu dữ liệu bên trong lớp', idCauHoi: 'CH005', thuTu: 1, laDapAnDung: true, ngayTao: new Date('2025-12-10') },
            { id: 'LC018', noiDung: 'Kết hợp các lớp lại', idCauHoi: 'CH005', thuTu: 2, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            { id: 'LC019', noiDung: 'Sắp xếp code đẹp hơn', idCauHoi: 'CH005', thuTu: 3, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            { id: 'LC020', noiDung: 'Xóa các phương thức', idCauHoi: 'CH005', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2025-12-10') },
            
            // CH006 - Constructor
            { id: 'LC021', noiDung: 'Khi tạo đối tượng mới', idCauHoi: 'CH006', thuTu: 1, laDapAnDung: true, ngayTao: new Date('2026-01-01') },
            { id: 'LC022', noiDung: 'Khi xóa đối tượng', idCauHoi: 'CH006', thuTu: 2, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC023', noiDung: 'Khi chạy chương trình', idCauHoi: 'CH006', thuTu: 3, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC024', noiDung: 'Khi gọi phương thức', idCauHoi: 'CH006', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            
            // CH007 - Phương thức static
            { id: 'LC025', noiDung: 'Không cần khởi tạo đối tượng để gọi', idCauHoi: 'CH007', thuTu: 1, laDapAnDung: true, ngayTao: new Date('2026-01-01') },
            { id: 'LC026', noiDung: 'Chỉ dùng được một lần', idCauHoi: 'CH007', thuTu: 2, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC027', noiDung: 'Không thể thay đổi', idCauHoi: 'CH007', thuTu: 3, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC028', noiDung: 'Phải là public', idCauHoi: 'CH007', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            
            // CH008 - Interface vs Abstract Class
            { id: 'LC029', noiDung: 'Interface không có implementation, Abstract Class có thể có', idCauHoi: 'CH008', thuTu: 1, laDapAnDung: true, ngayTao: new Date('2026-01-01') },
            { id: 'LC030', noiDung: 'Giống hệt nhau', idCauHoi: 'CH008', thuTu: 2, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC031', noiDung: 'Interface có state, Abstract Class không', idCauHoi: 'CH008', thuTu: 3, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC032', noiDung: 'Abstract Class dùng cho số', idCauHoi: 'CH008', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            
            // CH009 - Từ khóa this
            { id: 'LC033', noiDung: 'Tham chiếu đến đối tượng hiện tại', idCauHoi: 'CH009', thuTu: 1, laDapAnDung: true, ngayTao: new Date('2026-01-01') },
            { id: 'LC034', noiDung: 'Tham chiếu đến lớp cha', idCauHoi: 'CH009', thuTu: 2, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC035', noiDung: 'Tham chiếu đến biến toàn cục', idCauHoi: 'CH009', thuTu: 3, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC036', noiDung: 'Không dùng để tham chiếu gì cả', idCauHoi: 'CH009', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            
            // CH010 - Exception Handling
            { id: 'LC037', noiDung: 'Xử lý lỗi tại thời gian chạy', idCauHoi: 'CH010', thuTu: 1, laDapAnDung: true, ngayTao: new Date('2026-01-01') },
            { id: 'LC038', noiDung: 'Xóa file', idCauHoi: 'CH010', thuTu: 2, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC039', noiDung: 'Tạo biến mới', idCauHoi: 'CH010', thuTu: 3, laDapAnDung: false, ngayTao: new Date('2026-01-01') },
            { id: 'LC040', noiDung: 'Gọi hàm', idCauHoi: 'CH010', thuTu: 4, laDapAnDung: false, ngayTao: new Date('2026-01-01') }
        ];
        await LuaChon.bulkCreate(luaChonData, { ignoreDuplicates: true });
        console.log('✅ LuaChon seeded');

        console.log('🎉 All seeds completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.error('📋 Full error details:', error);
        if (error.sql) {
            console.error('📝 SQL Query:', error.sql);
            console.error('🔍 SQL Parameters:', error.parameters);
        }
        process.exit(1);
    }
};

seedDatabase();
