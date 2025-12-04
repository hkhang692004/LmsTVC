import { sequelize, Sequelize } from "../config/db.js";

const HocKy = sequelize.define('HocKy', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    idNam: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ten: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ngayBatDau: {
        type: Sequelize.DATE,
        allowNull: false
    },
    ngayKetThuc: {
        type: Sequelize.DATE,
        allowNull: false
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'HocKy',
    timestamps: false
});

export default HocKy;