import { sequelize, Sequelize } from "../config/db.js";

const BaiKiemTra = sequelize.define('BaiKiemTra', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    tieuDe: {
        type: Sequelize.STRING,
        allowNull: false
    },
    moTa: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    thoiGianBatDau: {
        type: Sequelize.DATE,
        allowNull: false
    },
    thoiGianKetThuc: {
        type: Sequelize.DATE,
        allowNull: false
    },
    thoiLuong: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    tongDiem: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    idLop: {
        type: Sequelize.STRING,
        allowNull: false
    },
    trangThai: {
        type: Sequelize.ENUM('chuaMo', 'dangMo', 'daDong'),
        allowNull: false,
        defaultValue: 'chuaMo'
    },
    choPhepXemDiem: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'BaiKiemTra',
    timestamps: false
});

export default BaiKiemTra;