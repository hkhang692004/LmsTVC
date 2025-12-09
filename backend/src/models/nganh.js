import db from "../config/db.js";
const { sequelize, Sequelize } = db;
const Nganh = sequelize.define('Nganh', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    tenNganh: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'Nganh',
    timestamps: false
});

export default Nganh;