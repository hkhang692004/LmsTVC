import { sequelize, Sequelize } from "../config/db.js";

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