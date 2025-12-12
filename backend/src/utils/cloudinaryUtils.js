import cloudinary from '../config/cloudinary.js';

// Upload multiple files - Bulk (handles 1 or many files)
export const uploadFiles = async (files) => {
    // Ensure files is array
    const fileArray = Array.isArray(files) ? files : [files];
    console.log('[cloudinaryUtils] uploadFiles called with count:', fileArray.length);
    
    const results = [];
    const errors = [];

    for (const file of fileArray) {
        try {
            console.log('[cloudinaryUtils] Uploading file:', file.originalname);
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'auto',
                        folder: 'lms-uploads'
                    },
                    (error, result) => {
                        if (error) {
                            console.error('[cloudinaryUtils] Stream error for', file.originalname, ':', error);
                            reject(error);
                        }
                        else {
                            console.log('[cloudinaryUtils] File uploaded successfully:', file.originalname, '→', result.public_id);
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(file.buffer);
            });

            results.push({
                fileName: file.originalname,
                public_id: result.public_id,
                secure_url: result.secure_url,
                bytes: result.bytes
            });
        } catch (error) {
            console.error('[cloudinaryUtils] Upload error for', file.originalname, ':', error.message);
            errors.push({
                fileName: file.originalname,
                error: error.message
            });
        }
    }

    // Nếu có lỗi, cleanup các file đã upload thành công
    if (errors.length > 0) {
        console.log('[cloudinaryUtils] Errors occurred, cleaning up successful uploads...');
        for (const result of results) {
            try {
                await cloudinary.uploader.destroy(result.public_id);
                console.log('[cloudinaryUtils] Cleaned up:', result.public_id);
            } catch (cleanupError) {
                console.error('[cloudinaryUtils] Failed to cleanup:', cleanupError);
            }
        }
        throw new Error(`Some uploads failed: ${errors.map(e => e.fileName).join(', ')}`);
    }

    console.log('[cloudinaryUtils] All files uploaded successfully, count:', results.length);
    return results;
};

// Delete multiple files - Bulk (handles 1 or many IDs)
export const deleteFiles = async (publicIds) => {
    // Ensure publicIds is array
    const idsArray = Array.isArray(publicIds) ? publicIds : [publicIds];
    
    const results = [];
    const errors = [];

    for (const publicId of idsArray) {
        try {
            await cloudinary.uploader.destroy(publicId);
            results.push(publicId);
        } catch (error) {
            errors.push({
                publicId,
                error: error.message
            });
        }
    }

    return {
        success: results,
        failed: errors,
        total: idsArray.length,
        successCount: results.length,
        failedCount: errors.length
    };
};