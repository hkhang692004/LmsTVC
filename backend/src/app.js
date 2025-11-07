import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
dotenv.config();


const app = express();

//middlewares
app.use(cors())
app.use(express.json());
module.exports = app;