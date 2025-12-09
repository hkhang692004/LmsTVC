import app from './app.js';
import dotenv from 'dotenv';
import db from './config/db.js';
import './models/index.js'; // Load all models and relationships

dotenv.config();
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connected successfully!');
    
    // Sync models to database (create tables)
    await db.sequelize.sync({ force: false });
    console.log('✅ Database synced successfully!');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server khởi động ở cổng ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

startServer();