import { sequelize, Sequelize } from "../config/db.js";

const ThongBao = sequelize.define('ThongBao', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    tieuDe: {
        type: Sequelize.STRING,
        allowNull: false
    },
    noiDung: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    phamVi: {
        type: Sequelize.ENUM('toanTruong', 'lop', 'nguoiDung'),
        allowNull: false
    },
    ngayGui: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    idNguoiGui: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idLop: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    tableName: 'ThongBao',
    timestamps: false
});

export default ThongBao;