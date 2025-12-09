import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
// Debug environment variables
console.log('Database config:', {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS ? '***' : 'undefined',
  DB_HOST: process.env.DB_HOST
});

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false,
});

export default {sequelize, Sequelize};
