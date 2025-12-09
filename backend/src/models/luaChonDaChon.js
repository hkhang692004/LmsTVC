import db from "../config/db.js";
const { sequelize, Sequelize } = db;

const LuaChonDaChon = sequelize.define('LuaChonDaChon', {
    idBaiLamCauHoi: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    idLuaChon: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    }
}, {
    tableName: 'LuaChonDaChon',
    timestamps: false
});

export default LuaChonDaChon;