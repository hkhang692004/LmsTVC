import { sequelize, Sequelize } from "../config/db.js";

const NguoiDung = sequelize.define('NguoiDung', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    ten: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    avatar: {
        type: Sequelize.STRING,
        allowNull: true
    },
    role: {
        type: Sequelize.ENUM('admin', 'giangVien', 'sinhVien'),
        allowNull: false,
        defaultValue: 'sinhVien'
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createAt:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updateAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    tableName: 'NguoiDung',
    timestamps: false
});
export default NguoiDung;