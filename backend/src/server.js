import express from 'express'
import dotenv from 'dotenv'

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5001;

//middlewares
app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server khởi động ở cổng ${PORT}`);
})