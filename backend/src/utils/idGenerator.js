// ID Generator Utility
// Generates unique IDs with pattern: PREFIX + YEAR + INCREMENT (e.g., ND24001, NDT24001)

export const generateId = async (prefix, repository, findMaxIdMethod = 'findMaxIdByPrefix') => {
    const year = new Date().getFullYear().toString().slice(-2);
    const fullPrefix = `${prefix}${year}`;
    
    const maxId = await repository[findMaxIdMethod](fullPrefix);
    
    if (!maxId) {
        return `${fullPrefix}001`;
    }

    const currentNumber = parseInt(maxId.slice(-3));
    const newNumber = String(currentNumber + 1).padStart(3, '0');
    
    return `${fullPrefix}${newNumber}`;
};

// ID Prefixes Constants
export const ID_PREFIXES = {
    USER: 'ND',           // NguoiDung
    TOPIC: 'ND',          // NoiDung  
    CONTENT: 'NDT',       // NoiDungChiTiet
    SUBJECT: 'CD',        // ChuDe
    EXAM: 'BKT',          // BaiKiemTra
    SUBMISSION: 'BN',     // BaiNop
    NOTIFICATION: 'TB',   // ThongBao
    CHAT: 'TN',          // TinNhan
    CLASS: 'LH'          // LopHoc
};

export default { generateId, ID_PREFIXES };