import db from "../config/db.js";
const { sequelize, Sequelize } = db;

const CauHoi = sequelize.define('CauHoi', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    noiDung: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    diemToiDa: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    idBaiKiemTra: {
        type: Sequelize.STRING,
        allowNull: false
    },
    loaiCauHoi: {
        type: Sequelize.ENUM('motDapAn', 'nhieuDapAn'),
        allowNull: false
    },
    thuTu: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'CauHoi',
    timestamps: false
});

export default CauHoi;