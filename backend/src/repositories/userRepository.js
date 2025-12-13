
import { NguoiDung } from '../models/index.js';
import { DatabaseError } from '../utils/errors.js';
import { Op } from 'sequelize';

class UserRepository {
    async findByEmail(email) {
        try {
            const user = await NguoiDung.findOne({
                where: { email: email },
                attributes: ['id', 'email', 'ten', 'role', 'password', 'status', 'avatar']
            });
            return user;
        } catch (error) {
            console.error('Database error in findByEmail:', error);
            throw new DatabaseError('Lỗi khi tìm người dùng từ cơ sở dữ liệu');
        }
    }

    async findById(id) {
        try {
            const user = await NguoiDung.findByPk(id, {
                attributes: ['id', 'email', 'ten', 'role', 'status', 'avatar', 'createAt']
            });
            return user;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new DatabaseError('Lỗi khi tìm người dùng từ cơ sở dữ liệu');
        }
    }

    // Batch find users by multiple IDs (fix N+1 query)
    async findByIds(ids, filters = {}) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                return [];
            }

            const whereClause = {
                id: { [Op.in]: ids }
            };

            // Apply filters if provided
            if (filters.role) {
                whereClause.role = filters.role;
            }

            if (filters.status !== undefined) {
                whereClause.status = filters.status;
            }

            const users = await NguoiDung.findAll({
                where: whereClause,
                attributes: ['id', 'email', 'ten', 'role', 'status', 'avatar', 'createAt']
            });

            return users;
        } catch (error) {
            console.error('Database error in findByIds:', error);
            throw new DatabaseError('Lỗi khi tìm danh sách người dùng từ cơ sở dữ liệu');
        }
    }

    async findByIdWithPassword(id) {
        try {
            const user = await NguoiDung.findByPk(id, {
                attributes: ['id', 'email', 'ten', 'role', 'password', 'status']
            });
            return user;
        } catch (error) {
            console.error('Database error in findByIdWithPassword:', error);
            throw new DatabaseError('Lỗi khi tìm người dùng từ cơ sở dữ liệu');
        }
    }

    async create(userData) {
        try {
            const user = await NguoiDung.create(userData);
            // Return user without password
            const userResponse = await this.findById(user.id);
            return userResponse;
        } catch (error) {
            console.error('Database error in create:', error);
            
            // Handle unique constraint violations
            if (error.name === 'SequelizeUniqueConstraintError') {
                if (error.fields?.email) {
                    throw new DatabaseError('Email đã được sử dụng');
                }
                if (error.fields?.id) {
                    throw new DatabaseError('ID người dùng đã tồn tại');
                }
            }
            
            throw new DatabaseError('Lỗi khi tạo người dùng trong cơ sở dữ liệu');
        }
    }

    async update(id, updateData) {
        try {
            console.log('[UserRepository] update called for ID:', id);
            console.log('[UserRepository] updateData:', updateData);
            
            const [updatedRowsCount] = await NguoiDung.update(updateData, {
                where: { id: id }
            });

            console.log('[UserRepository] Rows updated:', updatedRowsCount);

            if (updatedRowsCount === 0) {
                throw new DatabaseError('Không tìm thấy người dùng để cập nhật');
            }

            // Return updated user
            const updatedUser = await this.findById(id);
            console.log('[UserRepository] User after update:', {
                id: updatedUser?.id,
                email: updatedUser?.email,
                avatar: updatedUser?.avatar
            });
            
            return updatedUser;
        } catch (error) {
            console.error('Database error in update:', error);
            
            // Handle unique constraint violations
            if (error.name === 'SequelizeUniqueConstraintError') {
                if (error.fields?.email) {
                    throw new DatabaseError('Email đã được sử dụng');
                }
            }
            
            throw new DatabaseError('Lỗi khi cập nhật người dùng trong cơ sở dữ liệu');
        }
    }

    async findWithFilters(filters) {
        try {
            const { role, status, search, page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;

            // Build where clause
            const whereClause = {};

            if (role) {
                whereClause.role = role;
            }

            if (status !== null && status !== undefined) {
                whereClause.status = status;
            }

            if (search) {
                whereClause[Op.or] = [
                    { ten: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { id: { [Op.like]: `%${search}%` } }
                ];
            }

            // Execute query with pagination
            const { count, rows } = await NguoiDung.findAndCountAll({
                where: whereClause,
                attributes: ['id', 'email', 'ten', 'role', 'status', 'avatar', 'createAt'],
                order: [['createAt', 'DESC']],
                limit: limit,
                offset: offset
            });

            return {
                users: rows.map(user => this.mapToDTO(user)),
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            };

        } catch (error) {
            console.error('Database error in findWithFilters:', error);
            throw new DatabaseError('Lỗi khi truy vấn người dùng từ cơ sở dữ liệu');
        }
    }

    async delete(id) {
        try {
            const deletedRowsCount = await NguoiDung.destroy({
                where: { id: id }
            });

            if (deletedRowsCount === 0) {
                throw new DatabaseError('Không tìm thấy người dùng để xóa');
            }

            return true;
        } catch (error) {
            console.error('Database error in delete:', error);
            throw new DatabaseError('Lỗi khi xóa người dùng từ cơ sở dữ liệu');
        }
    }

    async findMaxIdByPrefix(prefix) {
        try {
            const user = await NguoiDung.findOne({
                where: {
                    id: {
                        [Op.like]: `${prefix}%`
                    }
                },
                order: [['id', 'DESC']],
                attributes: ['id']
            });
            
            return user ? user.id : null;
        } catch (error) {
            console.error('Database error in findMaxIdByPrefix:', error);
            throw new DatabaseError('Lỗi khi tìm ID tối đa từ cơ sở dữ liệu');
        }
    }

    // Map Sequelize model to clean DTO
    mapToDTO(userRecord) {
        return {
            id: userRecord.id,
            ten: userRecord.ten,
            email: userRecord.email,
            role: userRecord.role,
            status: userRecord.status,
            avatar: userRecord.avatar,
            createAt: userRecord.createAt
        };
    }
}
export default new UserRepository();