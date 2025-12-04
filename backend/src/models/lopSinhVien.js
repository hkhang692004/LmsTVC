import { sequelize, Sequelize } from "../config/db.js";

const Lop_SinhVien = sequelize.define('Lop_SinhVien', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    idLop: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idSinhVien: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'Lop_SinhVien',
    timestamps: false
});

export default Lop_SinhVien;