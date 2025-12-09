import db from "../config/db.js";
const { sequelize, Sequelize } = db;

const LichHoatDong = sequelize.define('LichHoatDong', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    tenHoatDong: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idGiangVien: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ngayBatDau: {
        type: Sequelize.DATE,
        allowNull: false
    },
    ngayKetThuc: {
        type: Sequelize.DATE,
        allowNull: false
    },
    idLop: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'LichHoatDong',
    timestamps: false
});

export default LichHoatDong;