import db from "../config/db.js";

const seedFolderFiles = async () => {
    try {
        const { NoiDung, NoiDungChiTiet, ChuDe } = db.sequelize.models;

        console.log('🌱 Starting to seed folder files...');

        // Tìm một topic để gán cho folder
        const topic = await ChuDe.findOne();
        if (!topic) {
            console.log('⚠️ No topic found. Please seed topics first.');
            return;
        }

        // Tìm hoặc tạo folder
        let folder = await NoiDung.findOne({
            where: {
                loaiNoiDung: 'folder'
            }
        });

        if (!folder) {
            // Tạo folder mới nếu chưa có
            folder = await NoiDung.create({
                id: 'ND999',
                idChuDe: topic.id,
                idNguoiDung: 'GV001', // Giả sử có giảng viên GV001
                tieuDe: 'Tài liệu tham khảo',
                noiDung: '<p>Thư mục chứa các tài liệu tham khảo cho môn học</p>',
                loaiNoiDung: 'folder',
                status: 'an'
            });
            console.log('✅ Created folder:', folder.tieuDe);
        } else {
            console.log('✅ Found existing folder:', folder.tieuDe);
        }

        // Kiểm tra xem đã có file con chưa
        const existingFiles = await NoiDung.count({
            where: {
                idNoiDungCha: folder.id,
                loaiNoiDung: 'taiLieu'
            }
        });

        if (existingFiles > 0) {
            console.log('✅ Folder files already exist, skipping seed...');
            return;
        }

        // Tạo 2 file con (taiLieu) trong folder
        const file1 = await NoiDung.create({
            id: 'ND800',
            idChuDe: topic.id,
            idNguoiDung: 'GV001',
            idNoiDungCha: folder.id, // Parent là folder
            tieuDe: 'Bài giảng tuần 1',
            noiDung: '<p>Tài liệu bài giảng tuần đầu tiên</p>',
            loaiNoiDung: 'taiLieu',
            status: 'an'
        });

        const file2 = await NoiDung.create({
            id: 'ND801',
            idChuDe: topic.id,
            idNguoiDung: 'GV001',
            idNoiDungCha: folder.id, // Parent là folder
            tieuDe: 'Bài tập thực hành',
            noiDung: '<p>Tài liệu bài tập thực hành</p>',
            loaiNoiDung: 'taiLieu',
            status: 'an'
        });

        console.log('✅ Created documents:', file1.tieuDe, ',', file2.tieuDe);

        // Tạo file details cho mỗi tài liệu
        const fileDetails = [
            {
                id: 'CT800',
                idNoiDung: file1.id,
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/raw/upload/v1765552267/lms-uploads/cv6dni048hi7ch2e9zum',
                fileName: 'bai-giang-tuan-1.pdf',
                fileType: 'application/pdf',
                fileSize: 2048576 // ~2MB (example)
            },
            {
                id: 'CT801',
                idNoiDung: file2.id,
                loaiChiTiet: 'file',
                filePath: 'https://res.cloudinary.com/dblzpkokm/raw/upload/v1765552192/lms-uploads/jnn59bxpykwc1x1gibkg',
                fileName: 'bai-tap-thuc-hanh.pdf',
                fileType: 'application/pdf',
                fileSize: 1536000 // ~1.5MB (example)
            }
        ];

        await NoiDungChiTiet.bulkCreate(fileDetails);
        console.log('✅ Created file details for documents');

        console.log('🎉 Folder files seeded successfully!');
        console.log('📁 Folder:', folder.tieuDe);
        console.log('📄 File 1:', file1.tieuDe);
        console.log('📄 File 2:', file2.tieuDe);

    } catch (error) {
        console.error('❌ Error seeding folder files:', error);
        throw error;
    }
};

export default seedFolderFiles;
