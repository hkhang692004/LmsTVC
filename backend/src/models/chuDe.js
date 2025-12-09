import db from "../config/db.js";
const { sequelize, Sequelize } = db;

const ChuDe = sequelize.define('ChuDe', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    tenChuDe: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idLop: {
        type: Sequelize.STRING,
        allowNull: false
    },
    moTa: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ChuDe',
    timestamps: false
});

export default ChuDe;