import db from "./config/db.js";
import bcrypt from "bcrypt";
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
import "./models/index.js"; // Initialize associations

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting full database seeding...');
        
        const { sequelize } = db;

        // Sync database
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced');

        // 0. Clear old data
        console.log('🗑️  Clearing old data...');
        await Lop_SinhVien.destroy({ where: {} });
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

        // 7. Link sinh viên vào lớp
        console.log('📚 Linking students to classes...');
        const studentId = 'SV25003'; // ID của sinh viên hiện có của bạn
        await Promise.all([
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP001', idSinhVien: studentId },
                defaults: { idLop: 'LP001', idSinhVien: studentId }
            }),
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP002', idSinhVien: studentId },
                defaults: { idLop: 'LP002', idSinhVien: studentId }
            }),
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP003', idSinhVien: studentId },
                defaults: { idLop: 'LP003', idSinhVien: studentId }
            }),
            Lop_SinhVien.findOrCreate({
                where: { idLop: 'LP004', idSinhVien: studentId },
                defaults: { idLop: 'LP004', idSinhVien: studentId }
            })
        ]);
        console.log('✅ Students linked to classes');

        // 8. Seed ChuDe (Topics)
        console.log('📚 Seeding ChuDe...');
        const chuDeData = [
            { id: 'CD001', tenChuDe: 'Chung', idLop: 'LP001', moTa: 'Thông tin chung về lớp OOP' },
            { id: 'CD002', tenChuDe: 'Thông báo', idLop: 'LP001', moTa: 'Các thông báo quan trọng' },
            { id: 'CD003', tenChuDe: 'Bài giảng', idLop: 'LP001', moTa: 'Tài liệu bài giảng' },
            { id: 'CD004', tenChuDe: 'Bài tập', idLop: 'LP001', moTa: 'Danh sách bài tập cần làm' },
            { id: 'CD005', tenChuDe: 'Thi kiểm tra', idLop: 'LP001', moTa: 'Bài kiểm tra và thi cử' },
            { id: 'CD006', tenChuDe: 'Giới thiệu', idLop: 'LP002', moTa: 'Giới thiệu môn Web Development' },
            { id: 'CD007', tenChuDe: 'Tài liệu học tập', idLop: 'LP002', moTa: 'Các tài liệu tham khảo' },
            { id: 'CD008', tenChuDe: 'Bài tập về nhà', idLop: 'LP002', moTa: 'Bài tập cần nộp' },
            { id: 'CD009', tenChuDe: 'Chương 1', idLop: 'LP003', moTa: 'Database Basics' },
            { id: 'CD010', tenChuDe: 'Chương 2', idLop: 'LP003', moTa: 'SQL Fundamentals' },
        ];
        await ChuDe.bulkCreate(chuDeData, { ignoreDuplicates: true });
        console.log('✅ ChuDe seeded');

        // 9. Seed NoiDung (Content)
        console.log('📚 Seeding NoiDung...');
        const noiDungData = [
            // LP001 - CD001 (Chung)
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
            // LP001 - CD002 (Thông báo)
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
            // LP001 - CD003 (Bài giảng)
            {
                id: 'ND006',
                tieuDe: 'Slide bài 1 - Giới thiệu OOP',
                noiDung: 'Slide bài giảng về khái niệm OOP cơ bản',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD003',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-11-20')
            },
            {
                id: 'ND007',
                tieuDe: 'Tài liệu Word - Hướng dẫn OOP',
                noiDung: 'Tài liệu chi tiết về hướng đối tượng trong Java',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD003',
                idNguoiDung: 'GV001',
                status: 'an',
                ngayTao: new Date('2025-11-20')
            },
            // LP001 - CD004 (Bài tập)
            {
                id: 'ND008',
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
                id: 'ND009',
                tieuDe: 'Bài tập 2 - Kế thừa',
                noiDung: 'Tạo hệ thống phân cấp lớp với kế thừa',
                loaiNoiDung: 'baiTap',
                idChuDe: 'CD004',
                idNguoiDung: 'GV001',
                hanNop: new Date('2026-01-01'),
                status: 'an',
                ngayTao: new Date('2025-12-15')
            },
            {
                id: 'ND010',
                tieuDe: 'Bài tập 3 - Đa hình',
                noiDung: 'Áp dụng đa hình trong một ứng dụng thực tế',
                loaiNoiDung: 'baiTap',
                idChuDe: 'CD004',
                idNguoiDung: 'GV001',
                hanNop: new Date('2026-01-08'),
                status: 'an',
                ngayTao: new Date('2025-12-22')
            },
            // LP001 - CD005 (Thi kiểm tra)
            {
                id: 'ND011',
                tieuDe: 'Bài kiểm tra giữa kỳ',
                noiDung: 'Kiểm tra giữa kỳ môn OOP',
                loaiNoiDung: 'baiNop',
                idChuDe: 'CD005',
                idNguoiDung: 'GV001',
                hanNop: new Date('2025-12-26'),
                status: 'an',
                ngayTao: new Date('2025-12-10')
            },
            {
                id: 'ND012',
                tieuDe: 'Bài kiểm tra cuối kỳ',
                noiDung: 'Kiểm tra cuối kỳ môn OOP',
                loaiNoiDung: 'baiNop',
                idChuDe: 'CD005',
                idNguoiDung: 'GV001',
                hanNop: new Date('2026-01-15'),
                status: 'an',
                ngayTao: new Date('2026-01-01')
            },
            // LP002 - CD006 (Giới thiệu)
            {
                id: 'ND013',
                tieuDe: 'Chào mừng đến lớp Web Development',
                noiDung: `Chào cả lớp!

Đây là lớp Web Development. Chúng ta sẽ học về:
- HTML5, CSS3
- JavaScript
- React.js
- Node.js
- Database (MongoDB, MySQL)

Lịch học: Thứ 2, 3, 4 từ 18h00 - 20h00
Phòng học: D1-205`,
                loaiNoiDung: 'phucDap',
                idChuDe: 'CD006',
                idNguoiDung: 'GV002',
                status: 'an',
                ngayTao: new Date('2025-11-01')
            },
            // LP002 - CD007 (Tài liệu)
            {
                id: 'ND014',
                tieuDe: 'HTML5 Tutorial PDF',
                noiDung: 'Tài liệu hướng dẫn HTML5 chi tiết',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD007',
                idNguoiDung: 'GV002',
                status: 'an',
                ngayTao: new Date('2025-11-05')
            },
            {
                id: 'ND015',
                tieuDe: 'CSS3 Guide Document',
                noiDung: 'Hướng dẫn CSS3 cho web design',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD007',
                idNguoiDung: 'GV002',
                status: 'an',
                ngayTao: new Date('2025-11-05')
            },
            {
                id: 'ND016',
                tieuDe: 'JavaScript Cheat Sheet',
                noiDung: 'Bảng công thức nhanh JavaScript',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD007',
                idNguoiDung: 'GV002',
                status: 'an',
                ngayTao: new Date('2025-11-10')
            },
            // LP002 - CD008 (Bài tập về nhà)
            {
                id: 'ND017',
                tieuDe: 'Bài tập: Tạo trang web cá nhân',
                noiDung: 'Tạo một trang web giới thiệu bản thân sử dụng HTML5 và CSS3',
                loaiNoiDung: 'baiTap',
                idChuDe: 'CD008',
                idNguoiDung: 'GV002',
                hanNop: new Date('2025-12-20'),
                status: 'an',
                ngayTao: new Date('2025-12-10')
            },
            {
                id: 'ND018',
                tieuDe: 'Bài tập: Responsive Design',
                noiDung: 'Thiết kế trang web responsive với CSS3 Media Queries',
                loaiNoiDung: 'baiTap',
                idChuDe: 'CD008',
                idNguoiDung: 'GV002',
                hanNop: new Date('2025-12-27'),
                status: 'an',
                ngayTao: new Date('2025-12-17')
            },
            // LP003 - CD009 (Chương 1)
            {
                id: 'ND019',
                tieuDe: 'Giới thiệu Database',
                noiDung: `Chương 1: Database Basics

Nội dung chính:
1. Khái niệm về Database
2. Database vs File System
3. Các loại Database (SQL, NoSQL)
4. RDBMS Architecture
5. Data Model

Yêu cầu: Hiểu rõ khái niệm cơ bản`,
                loaiNoiDung: 'phucDap',
                idChuDe: 'CD009',
                idNguoiDung: 'GV003',
                status: 'an',
                ngayTao: new Date('2025-11-15')
            },
            {
                id: 'ND020',
                tieuDe: 'Slide Chương 1',
                noiDung: 'Slide bài giảng chương 1 về cơ sở dữ liệu',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD009',
                idNguoiDung: 'GV003',
                status: 'an',
                ngayTao: new Date('2025-11-15')
            },
            // LP003 - CD010 (Chương 2)
            {
                id: 'ND021',
                tieuDe: 'SQL Basics & Query',
                noiDung: `Chương 2: SQL Fundamentals

1. SQL Query Language
2. SELECT Statement
3. WHERE Clause
4. JOIN Operations
5. Aggregate Functions

Bài tập thực hành được cung cấp trong tài liệu`,
                loaiNoiDung: 'phucDap',
                idChuDe: 'CD010',
                idNguoiDung: 'GV003',
                status: 'an',
                ngayTao: new Date('2025-11-20')
            },
            {
                id: 'ND022',
                tieuDe: 'SQL Query Examples',
                noiDung: 'Các ví dụ query SQL thực tế',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD010',
                idNguoiDung: 'GV003',
                status: 'an',
                ngayTao: new Date('2025-11-20')
            },
            {
                id: 'ND023',
                tieuDe: 'Slide Chương 2',
                noiDung: 'Slide bài giảng chương 2 về SQL',
                loaiNoiDung: 'taiLieu',
                idChuDe: 'CD010',
                idNguoiDung: 'GV003',
                status: 'an',
                ngayTao: new Date('2025-11-25')
            },
        ];
        await NoiDung.bulkCreate(noiDungData, { ignoreDuplicates: true });
        console.log('✅ NoiDung seeded');

        // 10. Seed NoiDungChiTiet (Content Details)
        console.log('📚 Seeding NoiDungChiTiet...');
        const noiDungChiTietData = [
            // Cho ND001
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
            // Cho ND002
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
            // Cho ND003
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
            // Cho ND006
            {
                id: 'NDCT004',
                idNoiDung: 'ND006',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf',
                fileName: 'slide-bai-1-oop.pdf',
                fileType: 'pdf',
                fileSize: 3048576,
                ngayTao: new Date('2025-11-20')
            },
            // Cho ND007
            {
                id: 'NDCT005',
                idNoiDung: 'ND007',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1745441086/attachments/huong-dan-oop.docx',
                fileName: 'huong-dan-oop.docx',
                fileType: 'docx',
                fileSize: 4096576,
                ngayTao: new Date('2025-11-20')
            },
            // Cho ND014
            {
                id: 'NDCT006',
                idNoiDung: 'ND014',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf',
                fileName: 'html5-tutorial.pdf',
                fileType: 'pdf',
                fileSize: 5120576,
                ngayTao: new Date('2025-11-05')
            },
            // Cho ND015
            {
                id: 'NDCT007',
                idNoiDung: 'ND015',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1745441086/attachments/css3-guide.docx',
                fileName: 'css3-guide.docx',
                fileType: 'docx',
                fileSize: 2560576,
                ngayTao: new Date('2025-11-05')
            },
            // Cho ND016
            {
                id: 'NDCT008',
                idNoiDung: 'ND016',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf',
                fileName: 'js-cheatsheet.pdf',
                fileType: 'pdf',
                fileSize: 1536576,
                ngayTao: new Date('2025-11-10')
            },
            // Cho ND020
            {
                id: 'NDCT009',
                idNoiDung: 'ND020',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf',
                fileName: 'slide-chuong-1-database.pdf',
                fileType: 'pdf',
                fileSize: 3584576,
                ngayTao: new Date('2025-11-15')
            },
            // Cho ND022
            {
                id: 'NDCT010',
                idNoiDung: 'ND022',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1745441086/attachments/sql-examples.docx',
                fileName: 'sql-examples.docx',
                fileType: 'docx',
                fileSize: 2048576,
                ngayTao: new Date('2025-11-20')
            },
            // Cho ND023
            {
                id: 'NDCT011',
                idNoiDung: 'ND023',
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf',
                fileName: 'slide-chuong-2-sql.pdf',
                fileType: 'pdf',
                fileSize: 4608576,
                ngayTao: new Date('2025-11-25')
            },
        ];
        await NoiDungChiTiet.bulkCreate(noiDungChiTietData, { ignoreDuplicates: true });
        console.log('✅ NoiDungChiTiet seeded');

        console.log('🎉 All seeds completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
