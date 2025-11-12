import { sequelize, Sequelize } from "../config/db.js";

const BaiLam = sequelize.define('BaiLam', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    idSinhVien: {
        type: Sequelize.STRING,
        allowNull: false
    },
    idBaiKiemTra: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tongDiem: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
    },
    thoiGianBatDau: {
        type: Sequelize.DATE,
        allowNull: false
    },
    thoiGianNop: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    tableName: 'BaiLam',
    timestamps: false
});

export default BaiLam;