import { sequelize, Sequelize } from "../config/db.js";

const Chat = sequelize.define('Chat', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    nguoiGui: {
        type: Sequelize.STRING,
        allowNull: false
    },
    nguoiNhan: {
        type: Sequelize.STRING,
        allowNull: false
    },
    loaiTinNhan: {
        type: Sequelize.ENUM('text', 'file', 'image', 'video', 'link'),
        allowNull: false
    },
    noiDung: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    thoiGian: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'Chat',
    timestamps: false
});

export default Chat;