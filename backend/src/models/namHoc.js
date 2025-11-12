import { sequelize, Sequelize } from "../config/db.js";

const NamHoc = sequelize.define('NamHoc', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    nam: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'NamHoc',
    timestamps: false
});

export default NamHoc;