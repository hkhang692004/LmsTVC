import db from "../config/db.js";
const { sequelize, Sequelize } = db;

const NoiDungChiTiet = sequelize.define('NoiDungChiTiet', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    idNoiDung: {
        type: Sequelize.STRING,
        allowNull: false
    },
    loaiChiTiet: {
        type: Sequelize.ENUM('file', 'duongDan', 'video', 'thuMuc'),
        allowNull: false
    },
    filePath: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fileName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fileType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    ngayTao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'NoiDungChiTiet',
    timestamps: false
});

export default NoiDungChiTiet;