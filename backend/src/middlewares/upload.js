import multer from 'multer';
import path from 'path';

// Memory storage - files sẽ được lưu trong RAM
const storage = multer.memoryStorage();

// File filter - chỉ cho phép file types nhất định
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        
        // Text files
        'text/plain',
        'text/csv',
        'text/xml',
        'text/html',
        'text/javascript',
        'text/x-java-source',
        
        // Source code files (generic octet-stream for unknown code files)
        'application/octet-stream',
        
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        
        // Video/Audio
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'audio/mp3',
        
        // Archives
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/gzip',
        
        // Source code
        'application/x-java-archive',
        'application/json'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        console.log('[upload.fileFilter] File accepted:', file.originalname, '(' + file.mimetype + ')');
        cb(null, true);
    } else {
        console.error('[upload.fileFilter] File rejected:', file.originalname, '(' + file.mimetype + ')');
        cb(new Error(`File type not allowed: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
};

// Multer config
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
        files: 10 // Maximum 10 files per request
    }
});

// Export middleware functions
export const uploadSingle = (fieldName) => (req, res, next) => {
    console.log('[upload.uploadSingle] Middleware called, fieldName:', fieldName);
    return upload.single(fieldName)(req, res, (err) => {
        if (err) {
            console.error('[upload.uploadSingle] Error:', err.message);
        } else {
            console.log('[upload.uploadSingle] File uploaded:', req.file?.originalname);
        }
        next(err);
    });
};

export const uploadMultiple = (fieldName, maxCount = 10) => (req, res, next) => {
    console.log('[upload.uploadMultiple] Middleware called, fieldName:', fieldName, 'maxCount:', maxCount);
    return upload.array(fieldName, maxCount)(req, res, (err) => {
        if (err) {
            console.error('[upload.uploadMultiple] Error:', err.message);
        } else {
            console.log('[upload.uploadMultiple] Files uploaded count:', req.files?.length);
        }
        next(err);
    });
};

export const uploadFields = (fields) => upload.fields(fields);
export const uploadAny = upload.any();

export default upload;