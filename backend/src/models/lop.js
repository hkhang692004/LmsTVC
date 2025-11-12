import { sequelize, Sequelize } from "../config/db.js";

const Lop = sequelize.define('Lop', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    tenLop: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idMonHoc: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idHocKy: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idGiangVien: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'Lop',
    timestamps: false
});

export default Lop;