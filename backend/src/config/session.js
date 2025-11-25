import session from 'express-session';
import MongoStore from 'connect-mongo'; // Nếu dùng MongoDB
// import SequelizeStore from 'connect-session-sequelize'; // Nếu dùng MySQL với Sequelize

/**
 * Session configuration cho Express
 */
export const sessionConfig = {
    // Session secret key (nên đặt trong environment variables)
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    
    // Session name (cookie name)
    name: 'sessionId',
    
    // Cookie settings
    cookie: {
        // Cookie lifetime (ms) - 24 hours
        maxAge: 1000 * 60 * 60 * 24,
        
        // HTTPS only in production
        secure: process.env.NODE_ENV === 'production',
        
        // Prevent XSS attacks
        httpOnly: true,
        
        // CSRF protection
        sameSite: 'strict'
    },
    
    // Session settings
    resave: false,           // Không save session nếu không thay đổi
    saveUninitialized: false, // Không save session rỗng
    rolling: true,           // Reset expiry on each request
    
    // Store configuration
    store: getSessionStore()
};

/**
 * Get session store based on database type
 */
function getSessionStore() {
    const dbType = process.env.SESSION_STORE || 'memory';
    
    switch (dbType) {
        case 'mongodb':
            return MongoStore.create({
                mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms-sessions'
            });
            
        case 'mysql':
            // Cần import Sequelize instance
            // const SequelizeStore = require('connect-session-sequelize')(session.Store);
            // return new SequelizeStore({
            //     db: sequelize, // Your sequelize instance
            //     tableName: 'Sessions'
            // });
            return undefined; // Fallback to memory
            
        case 'redis':
            // Cần Redis client
            // const RedisStore = require('connect-redis')(session);
            // return new RedisStore({
            //     client: redisClient
            // });
            return undefined; // Fallback to memory
            
        default:
            // Memory store (chỉ dùng cho development)
            console.warn('⚠️  Using memory store for sessions - not recommended for production');
            return undefined;
    }
}

/**
 * Session middleware setup function
 */
export const setupSession = (app) => {
    app.use(session(sessionConfig));
    
    // Session debugging in development
    if (process.env.NODE_ENV === 'development') {
        app.use((req, res, next) => {
            // Chỉ log API requests, bỏ static files
            if (req.url.startsWith('/api/')) {
                console.log('📋 Session Info:', {
                    method: req.method,
                    url: req.url,
                    sessionID: req.sessionID,
                    hasUser: !!req.session?.user,
                    userRole: req.session?.user?.role
                });
            }
            next();
        });
    }
};