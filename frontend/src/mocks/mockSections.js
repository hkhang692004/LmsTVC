const mockSections = [
    {
        id: 1,
        title: "Chung",
        items: [
            { id: 101, ten: "DANH SÁCH CẤM THI MÔN HỌC - Ngày đăng 15/11/2025", loai: "pdf" ,text:""},
            { id: 102, ten: "Thông tin điểm danh môn học", loai: "pdf" ,text:""},
            
            { id: 104, ten: "Lịch học Lý Thuyết dự kiến môn OOP", loai: "pdf",text:"" }
        ]
    },
    {
        id: 2,
        title: "Thông báo",
        items: [
            
            { id: 105, ten: "Lịch học Lý Thuyết dự kiến môn OOP", loai: "text" , text:""},
            { id: 106, ten: "Nộp bài OOP", loai: "nopbai", text:"" },
            { id: 103, ten: "Điểm danh buổi trực tuyến", loai: "folder", text:"" },
            { id: 107, ten: "Đường dẫn tải VS Code", loai: "duongdan", text:"" }
        ]
    },
    {
        id: 3,
        title: "Diễn đàn môn học",
        items: [

            { id: 108, ten: "Diễn đàn môn học ", loai: "diendan", text:`
    Sinh viên sử dụng diễn đàn để trao đổi bài tập nhóm, thảo luận, liên hệ với giảng viên.

Lưu ý:

Giảng viên không trả lời các thắc mắc qua email cá nhân! 

Để đặt câu hỏi, thắc mắc về môn học,.. với giảng viên:  Sinh viên cần đặt câu hỏi trong diễn đàn (tự tạo 1 chủ đề với tiêu đề ngắn gọn nhưng khá rõ nghĩa) sau đó ghi nội dung câu hỏi, đính kèm hình ảnh, ... Sau đó gửi GV 1 email thông báo cho biết có câu hỏi trên diễn đàn. Gv sẽ vào trả lời trong diễn đàn. Việc làm này sẽ giúp cho các sinh viên khác có thể tham khảo, hiểu thêm các vấn đề mà họ cũng gặp phải!!

Sinh viên có toàn quyền tạo chủ đề và upload/post các thông tin/câu hỏi/hình ảnh (file upload<50MB) để thảo luận, trao đổi, thắc mắc với GV/SV.

Trong trường hợp GV yêu cầu sử dụng diển đàn để nộp bài: Sinh viên/Nhóm SV cần  vào đúng  thread/topic/chủ đề qui định để nộp bài 

Email giảng viên:  dat.nt@ou.edu.vn` }
        ]
    },
    {
        id: 4,
        title: "Bài kiểm tra",
        items: [

            { id: 109, ten: "Kiểm tra ", loai: "kiemtra" , text:""}
        ]
    },
    {
        id: 5,
        title: "Mẫu báo cáo",
        items: [

            { id: 110, ten: "File word báo cáo ", loai: "word", text:"" },
            { id: 111, ten: "File word báo cáo ", loai: "word" , text:""},
            { id: 112, ten: "File word báo cáo ", loai: "word", text:"" }
        ]
    }
];
export default mockSections;