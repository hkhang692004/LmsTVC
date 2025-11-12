import { sequelize, Sequelize } from "../config/db.js";

const LuaChon = sequelize.define('LuaChon', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    noiDung: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    idCauHoi: {
        type: Sequelize.STRING,
        allowNull: false
    },
    laDapAnDung: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    thuTu: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'LuaChon',
    timestamps: false
});

export default LuaChon;