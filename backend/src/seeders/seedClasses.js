import db from "../config/db.js";
import { idGenerator } from "../utils/idGenerator.js";

const seedClasses = async () => {
    try {
        const { Lop, MonHoc, HocKy, NguoiDung } = db.sequelize.models;

        // Kiểm tra xem đã có data chưa
        const existingClasses = await Lop.count();
        if (existingClasses > 0) {
            console.log('✅ Classes already exist, skipping seed...');
            return;
        }

        // Lấy data tham chiếu
        const subjects = await MonHoc.findAll({ limit: 3 });
        const semesters = await HocKy.findAll({ limit: 2 });
        const teachers = await NguoiDung.findAll({ where: { role: 'giangVien' }, limit: 3 });

        if (subjects.length === 0 || semesters.length === 0 || teachers.length === 0) {
            console.log('⚠️ Required data (subjects, semesters, teachers) not found. Please seed those first.');
            return;
        }

        // Tạo test classes
        const testClasses = [
            {
                id: 'LP001',
                tenLop: 'Toán 10A - Buổi Sáng',
                idMonHoc: subjects[0].id,
                idHocKy: semesters[0].id,
                idGiangVien: teachers[0].id
            },
            {
                id: 'LP002',
                tenLop: 'Toán 10B - Buổi Chiều',
                idMonHoc: subjects[0].id,
                idHocKy: semesters[0].id,
                idGiangVien: teachers[1].id
            },
            {
                id: 'LP003',
                tenLop: 'Vật Lý 10A',
                idMonHoc: subjects[1].id,
                idHocKy: semesters[0].id,
                idGiangVien: teachers[0].id
            },
            {
                id: 'LP004',
                tenLop: 'Hóa Học 10A',
                idMonHoc: subjects[2].id,
                idHocKy: semesters[1].id,
                idGiangVien: teachers[2].id
            },
            {
                id: 'LP005',
                tenLop: 'Tiếng Anh 10A',
                idMonHoc: subjects[0].id,
                idHocKy: semesters[1].id,
                idGiangVien: teachers[1].id
            }
        ];

        // Insert vào database
        await Lop.bulkCreate(testClasses);
        console.log(`✅ Successfully seeded ${testClasses.length} classes`);

    } catch (error) {
        console.error('❌ Error seeding classes:', error.message);
    }
};

export default seedClasses;
