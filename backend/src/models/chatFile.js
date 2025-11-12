import { sequelize, Sequelize } from "../config/db.js";

const ChatFile = sequelize.define('ChatFile', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    idChat: {
        type: Sequelize.STRING,
        allowNull: false
    },
    filePath: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fileName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fileType: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'ChatFile',
    timestamps: false
});

export default ChatFile;