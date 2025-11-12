import db from "../config/db.js";
import NguoiDung from "./nguoiDung.js";
import NamHoc from "./namHoc.js";
import HocKy from "./hocKy.js";
import Nganh from "./nganh.js";
import MonHoc from "./monHoc.js";
import Lop from "./lop.js";
import Lop_SinhVien from "./lopSinhVien.js";
import NoiDung from "./noiDung.js";
import NoiDungChiTiet from "./noiDungChiTiet.js";
import BaiKiemTra from "./baiKiemTra.js";
import CauHoi from "./cauHoi.js";
import LuaChon from "./luaChon.js";
import BaiLam from "./baiLam.js";
import BaiLamCauHoi from "./baiLamCauHoi.js";
import LuaChonDaChon from "./luaChonDaChon.js";
import Chat from "./chat.js";
import ChatFile from "./chatFile.js";
import LichHoatDong from "./lichHoatDong.js";
import ThongBao from "./thongBao.js";

// === LIÊN KẾT GIỮA CÁC MODEL ===

// NguoiDung
NguoiDung.hasMany(Lop, { foreignKey: 'idGiangVien', as: 'lopGiangDay' });
NguoiDung.belongsToMany(Lop, { 
    through: Lop_SinhVien, 
    foreignKey: 'idSinhVien', 
    otherKey: 'idLop',
    as: 'lopThamGia'
});
NguoiDung.hasMany(NoiDung, { foreignKey: 'idNguoiDung', as: 'noiDungs' });
NguoiDung.hasMany(BaiLam, { foreignKey: 'idSinhVien', as: 'baiLams' });
NguoiDung.hasMany(Chat, { foreignKey: 'idNguoiGui', as: 'tinNhanDaGui' });
NguoiDung.hasMany(Chat, { foreignKey: 'idNguoiNhan', as: 'tinNhanDaNhan' });
NguoiDung.hasMany(LichHoatDong, { foreignKey: 'idGiangVien', as: 'lichHoatDongs' });
NguoiDung.hasMany(ThongBao, { foreignKey: 'idNguoiGui', as: 'thongBaoDaGui' });

// NamHoc
NamHoc.hasMany(HocKy, { foreignKey: 'idNam', as: 'hocKys' });

// HocKy
HocKy.belongsTo(NamHoc, { foreignKey: 'idNam', as: 'namHoc' });
HocKy.hasMany(Lop, { foreignKey: 'idHocKy', as: 'lops' });

// Nganh
Nganh.hasMany(MonHoc, { foreignKey: 'idNganh', as: 'monHocs' });

// MonHoc
MonHoc.belongsTo(Nganh, { foreignKey: 'idNganh', as: 'nganh' });
MonHoc.hasMany(Lop, { foreignKey: 'idMonHoc', as: 'lops' });

// Lop
Lop.belongsTo(MonHoc, { foreignKey: 'idMonHoc', as: 'monHoc' });
Lop.belongsTo(HocKy, { foreignKey: 'idHocKy', as: 'hocKy' });
Lop.belongsTo(NguoiDung, { foreignKey: 'idGiangVien', as: 'giangVien' });
Lop.belongsToMany(NguoiDung, { 
    through: Lop_SinhVien, 
    foreignKey: 'idLop', 
    otherKey: 'idSinhVien',
    as: 'sinhViens' 
});
Lop.hasMany(BaiKiemTra, { foreignKey: 'idLop', as: 'baiKiemTras' });
Lop.hasMany(LichHoatDong, { foreignKey: 'idLop', as: 'lichHoatDongs' });
Lop.hasMany(ThongBao, { foreignKey: 'idLop', as: 'thongBaos' });

// Lop_SinhVien
Lop_SinhVien.belongsTo(Lop, { foreignKey: 'idLop', as: 'lop' });
Lop_SinhVien.belongsTo(NguoiDung, { foreignKey: 'idSinhVien', as: 'sinhVien' });

// NoiDung
NoiDung.belongsTo(NguoiDung, { foreignKey: 'idNguoiDung', as: 'nguoiTao' });
NoiDung.hasMany(NoiDung, { foreignKey: 'idNoiDungCha', as: 'noiDungCon' });
NoiDung.belongsTo(NoiDung, { foreignKey: 'idNoiDungCha', as: 'noiDungCha' });
NoiDung.hasMany(NoiDungChiTiet, { foreignKey: 'idNoiDung', as: 'chiTiets' });

// NoiDungChiTiet
NoiDungChiTiet.belongsTo(NoiDung, { foreignKey: 'idNoiDung', as: 'noiDung' });

// BaiKiemTra
BaiKiemTra.belongsTo(Lop, { foreignKey: 'idLop', as: 'lop' });
BaiKiemTra.hasMany(CauHoi, { foreignKey: 'idBaiKiemTra', as: 'cauHois' });
BaiKiemTra.hasMany(BaiLam, { foreignKey: 'idBaiKiemTra', as: 'baiLams' });

// CauHoi
CauHoi.belongsTo(BaiKiemTra, { foreignKey: 'idBaiKiemTra', as: 'baiKiemTra' });
CauHoi.hasMany(LuaChon, { foreignKey: 'idCauHoi', as: 'luaChons' });
CauHoi.hasMany(BaiLamCauHoi, { foreignKey: 'idCauHoi', as: 'baiLamCauHois' });

// LuaChon
LuaChon.belongsTo(CauHoi, { foreignKey: 'idCauHoi', as: 'cauHoi' });
LuaChon.belongsToMany(BaiLamCauHoi, { 
    through: LuaChonDaChon, 
    foreignKey: 'idLuaChon', 
    otherKey: 'idBaiLamCauHoi',
    as: 'baiLamCauHois' 
});

// BaiLam
BaiLam.belongsTo(NguoiDung, { foreignKey: 'idSinhVien', as: 'sinhVien' });
BaiLam.belongsTo(BaiKiemTra, { foreignKey: 'idBaiKiemTra', as: 'baiKiemTra' });
BaiLam.hasMany(BaiLamCauHoi, { foreignKey: 'idBaiLam', as: 'cauHoiDaLam' });

// BaiLamCauHoi
BaiLamCauHoi.belongsTo(BaiLam, { foreignKey: 'idBaiLam', as: 'baiLam' });
BaiLamCauHoi.belongsTo(CauHoi, { foreignKey: 'idCauHoi', as: 'cauHoi' });
BaiLamCauHoi.belongsToMany(LuaChon, { 
    through: LuaChonDaChon, 
    foreignKey: 'idBaiLamCauHoi', 
    otherKey: 'idLuaChon',
    as: 'luaChonDaChons' 
});

// LuaChonDaChon
LuaChonDaChon.belongsTo(BaiLamCauHoi, { foreignKey: 'idBaiLamCauHoi', as: 'baiLamCauHoi' });
LuaChonDaChon.belongsTo(LuaChon, { foreignKey: 'idLuaChon', as: 'luaChon' });

// Chat
Chat.belongsTo(NguoiDung, { foreignKey: 'idNguoiGui', as: 'nguoiGuiInfo' });
Chat.belongsTo(NguoiDung, { foreignKey: 'idNguoiNhan', as: 'nguoiNhanInfo' });
Chat.hasMany(ChatFile, { foreignKey: 'idChat', as: 'files' });

// ChatFile
ChatFile.belongsTo(Chat, { foreignKey: 'idChat', as: 'chat' });

// LichHoatDong
LichHoatDong.belongsTo(NguoiDung, { foreignKey: 'idGiangVien', as: 'giangVien' });
LichHoatDong.belongsTo(Lop, { foreignKey: 'idLop', as: 'lop' });

// ThongBao
ThongBao.belongsTo(NguoiDung, { foreignKey: 'idNguoiGui', as: 'nguoiGui' });
ThongBao.belongsTo(Lop, { foreignKey: 'idLop', as: 'lop' });

export {
    NguoiDung,
    NamHoc,
    HocKy,
    Nganh,
    MonHoc,
    Lop,
    Lop_SinhVien,
    NoiDung,
    NoiDungChiTiet,
    BaiKiemTra,
    CauHoi,
    LuaChon,
    BaiLam,
    BaiLamCauHoi,
    LuaChonDaChon,
    Chat,
    ChatFile,
    LichHoatDong,
    ThongBao
};
