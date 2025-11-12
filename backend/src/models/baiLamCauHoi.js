import { sequelize, Sequelize } from "../config/db.js";

const BaiLamCauHoi = sequelize.define('BaiLamCauHoi', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    idBaiLam: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idCauHoi: {
        type: Sequelize.STRING,
        allowNull: false
    },
    diemDatDuoc: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
    },
    thoiGianTraLoi: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    tableName: 'BaiLamCauHoi',
    timestamps: false
});

export default BaiLamCauHoi;