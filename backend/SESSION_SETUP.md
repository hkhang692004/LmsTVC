# Session-based Authentication Dependencies

## Required packages:
```bash
npm install express-session
```

## Optional session stores (chọn 1):

### MongoDB Store:
```bash
npm install connect-mongo
```

### MySQL/Sequelize Store:
```bash
npm install connect-session-sequelize
```

### Redis Store:
```bash
npm install connect-redis redis
```

## Environment Variables (.env):
```
# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production
SESSION_STORE=memory  # options: memory, mongodb, mysql, redis
MONGODB_URI=mongodb://localhost:27017/lms-sessions  # if using mongodb store

# App Configuration
NODE_ENV=development  # or production
```

## Security Notes:

1. **Session Secret**: Phải là random string mạnh trong production
2. **HTTPS**: Cookie secure phải true trong production
3. **Session Store**: Không dùng memory store trong production
4. **Cookie Settings**: httpOnly và sameSite cho security

## Session Store Recommendations:

- **Development**: Memory store (default)
- **Production**: Redis (tốt nhất) hoặc MongoDB
- **Small apps**: MySQL với Sequelize store