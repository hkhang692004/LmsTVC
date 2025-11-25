import express from 'express'
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import { setupSession } from './config/session.js';

const app = express();

//middlewares
app.use(cors())
app.use(express.json());

// Setup session middleware
setupSession(app);

// Routes
app.use('/api', routes);

// 404 handler
app.all('*', (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
});

// Global error handler (phải đặt cuối cùng)
app.use(errorHandler);

export default app;