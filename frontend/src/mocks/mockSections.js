const mockSections = [
  {
    id: 1,
    title: "Chung",
    items: [
      { 
        id: 101, 
        ten: "DANH SÁCH CẤM THI MÔN HỌC - Ngày đăng 15/11/2025", 
        loai: "pdf",
        url: "https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf" 
      },
      { 
        id: 102, 
        ten: "Thông tin điểm danh môn học", 
        loai: "pdf",
        url: "https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf" // 
      },
      { 
        id: 104, 
        ten: "Lịch học Lý Thuyết dự kiến môn OOP", 
        loai: "pdf",
        url: "https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf" // 
      }
    ]
  },
  {
    id: 2,
    title: "Thông báo",
    items: [
      { id: 105, ten: "Lịch học Lý Thuyết dự kiến môn OOP", loai: "text",text:`Chào cả lớp,

Thầy nhắc lại một chút lịch học thực hành buổi 6 và lịch thi giữa kỳ, như sau:

Ngày 19/08/2025: cả 2 nhóm thực hành buổi 6 (Nhóm 1 từ 13h00, Nhóm 2 từ 15h00)
Ngày 26/08/2025: THI GIỮA KỲ
Nhóm 1: Từ 13h00
Nhóm 2: Từ 15h00
Nội dung: từ chương đầu đến cây nhị phân tìm kiếm (bao gồm lý thuyết cây AVL)
Lưu ý: SV có mặt tại phòng thi trước 15 phút và KHÔNG được sử dụng tài liệu
`,url:"" },
      { id: 106, ten: "Nộp bài OOP", loai: "nopbai" ,url:""},
      { id: 103, ten: "Điểm danh buổi trực tuyến", loai: "folder" ,url:""},
      { id: 107, ten: "Đường dẫn tải VS Code", loai: "duongdan" ,url:"https://code.visualstudio.com/download"}
    ]
  },
  {
    id: 3,
    title: "Diễn đàn môn học",
    items: [
      { 
        id: 108, 
        ten: "Diễn đàn môn học ", 
        loai: "diendan", 
        text: `
Sinh viên sử dụng diễn đàn để trao đổi bài tập nhóm, thảo luận, liên hệ với giảng viên.

Lưu ý:

Giảng viên không trả lời các thắc mắc qua email cá nhân! 

... (giữ nguyên nội dung)

        `
    ,url:""
      }
    ]
  },
  {
    id: 4,
    title: "Bài kiểm tra",
    items: [
      { id: 109, ten: "Kiểm tra ", loai: "kiemtra" ,url:""}
    ]
  },
  {
    id: 5,
    title: "Mẫu báo cáo",
    items: [
      { 
        id: 110, 
        ten: "File word báo cáo", 
        loai: "word",
        url: "https://res.cloudinary.com/dblzpkokm/raw/upload/v1764058654/ThucHanh9-GiamSatHeThong_usxryd.docx"
      },
      { 
        id: 111, 
        ten: "File word báo cáo", 
        loai: "word",
        url: "https://res.cloudinary.com/dblzpkokm/raw/upload/v1764058654/ThucHanh9-GiamSatHeThong_usxryd.docx"
      },
      { 
        id: 112, 
        ten: "File word báo cáo", 
        loai: "word",
        url: "https://res.cloudinary.com/dblzpkokm/raw/upload/v1764058654/ThucHanh9-GiamSatHeThong_usxryd.docx"
      }
    ]
  }
];

export default mockSections;
