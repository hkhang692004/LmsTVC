import { sequelize, Sequelize } from "../config/db.js";

const NoiDung = sequelize.define('NoiDung', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    idChuDe: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idNguoiDung: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idNoiDungCha: {
        type: Sequelize.STRING,
        allowNull: true
    },
    tieuDe: {
        type: Sequelize.STRING,
        allowNull: false
    },
    noiDung: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    loaiNoiDung: {
        type: Sequelize.ENUM('taiLieu', 'phucDap', 'baiTap', 'baiNop'),
        allowNull: false
    },
    hanNop: {
        type: Sequelize.DATE,
        allowNull: true
    },
    ngayNop: {
        type: Sequelize.DATE,
        allowNull: true
    },
    status: {
        type: Sequelize.ENUM('an', 'daNop', 'treHan'),
        allowNull: false,
        defaultValue: 'an'
    },
    ngayTao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'NoiDung',
    timestamps: false
});

export default NoiDung;