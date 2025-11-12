import { sequelize, Sequelize } from "../config/db.js";

const MonHoc = sequelize.define('MonHoc', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    tenMon: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idNganh: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'MonHoc',
    timestamps: false
});

export default MonHoc;