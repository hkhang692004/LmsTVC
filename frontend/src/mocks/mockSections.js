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
        url: "https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf"
      },
      {
        id: 104,
        ten: "Lịch học Lý Thuyết dự kiến môn OOP",
        loai: "pdf",
        url: "https://res.cloudinary.com/dblzpkokm/image/upload/v1764059709/03-Lop-va-doi-tuong_a4lskm.pdf"
      }
    ]
  },
  {
    id: 2,
    title: "Thông báo",
    items: [
      {
        id: 105,
        ten: "Lịch học Lý Thuyết dự kiến môn OOP",
        loai: "text",
        text: `Chào cả lớp,

Thầy nhắc lại một chút lịch học thực hành buổi 6 và lịch thi giữa kỳ, như sau:

Ngày 19/08/2025: cả 2 nhóm thực hành buổi 6 (Nhóm 1 từ 13h00, Nhóm 2 từ 15h00)
Ngày 26/08/2025: THI GIỮA KỲ
Nhóm 1: Từ 13h00
Nhóm 2: Từ 15h00
Nội dung: từ chương đầu đến cây nhị phân tìm kiếm (bao gồm lý thuyết cây AVL)
Lưu ý: SV có mặt tại phòng thi trước 15 phút và KHÔNG được sử dụng tài liệu
`,
        url: ""
      },

      // NỘP BÀI — đã thêm hạn nộp + trạng thái
      {
        id: 106,
        ten: "Nộp bài OOP",
        loai: "nopbai",
        hanNop: "2025-11-30T23:59:00",
        ngayDang: "2025-11-28T08:00:00",
        trangThai: "chua-nop", // hoặc: "da-nop"
        url: "",
        text: `Xây dựng lớp SanPham để lưu trữ thông tin của sản phẩm, bao gồm các thuộc tính là mã sản phẩm (String), tên sản phẩm (String), ngày nhập kho (Date), đơn giá (double), và đánh giá (int). Thực hiện các yêu cầu sau:

Viết phương thức khởi tạo có tham số cho các thuộc tính của SanPham.

Viết các phương thức getter và setter cho từng thuộc tính.

Ghi đè phương thức toString() để hiển thị các thuộc tính của sản phẩm.

Mỗi sản phẩm có thuộc tính đánh giá từ 1 đến 5. Nếu người dùng tạo một sản phẩm có độ đánh giá nằm ngoài khoảng này thì đưa ra thông báo lỗi. Gợi ý: kiểm tra điều kiện và dùng lệnh throw nếu có lỗi.

Dựa vào đánh giá sản phẩm, viết hàm trả về phân loại đánh giá. Biết rằng nếu đánh giá 5 sao là xuất sắc, 4 sao là tốt, 3 sao là trung bình, 2 sao là tệ, và 1 sao là rất tệ.

Xây dựng lớp HoaDon để lưu trữ thông tin chi tiết của một hoá đơn, bao gồm các thuộc tính: mã hóa đơn (String), sản phẩm (SanPham), số lượng (int). Thực hiện các yêu cầu sau:

Viết phương thức khởi tạo có tham số cho các thuộc tính của HoaDon.

Viết các phương thức getter và setter cho từng thuộc tính.

Viết phương thức tính tiền hoá đơn (tổng tiền = số lượng * đơn giá của sản phẩm).

Ghi đè phương thức toString() để hiển thị các thuộc tính của hoá đơn bao gồm: mã hoá đơn, mã sản phẩm, tên sản phẩm, tổng tiền.

Lưu ý: Sinh viên chỉ nộp file .java của 2 lớp trên. Mỗi lớp làm đúng sẽ tương ứng 1 điểm cộng.`
      },

      {
        id: 103,
        ten: "Điểm danh buổi trực tuyến",
        loai: "folder",
        url: ""
      },

      {
        id: 107,
        ten: "Đường dẫn tải VS Code",
        loai: "duongdan",
        url: "https://code.visualstudio.com/download"
      }
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

Để đặt câu hỏi, thắc mắc về môn học,.. với giảng viên:  Sinh viên cần đặt câu hỏi trong diễn đàn (tự tạo 1 chủ đề với tiêu đề ngắn gọn nhưng khá rõ nghĩa) sau đó ghi nội dung câu hỏi, đính kèm hình ảnh, ... Sau đó gửi GV 1 email thông báo cho biết có câu hỏi trên diễn đàn. Gv sẽ vào trả lời trong diễn đàn. Việc làm này sẽ giúp cho các sinh viên khác có thể tham khảo, hiểu thêm các vấn đề mà họ cũng gặp phải!!

Sinh viên có toàn quyền tạo chủ đề và upload/post các thông tin/câu hỏi/hình ảnh (file upload<50MB) để thảo luận, trao đổi, thắc mắc với GV/SV.

Trong trường hợp GV yêu cầu sử dụng diển đàn để nộp bài: Sinh viên/Nhóm SV cần  vào đúng  thread/topic/chủ đề qui định để nộp bài 

Email giảng viên:  dat.nt@ou.edu.vn
        `,
        url: ""
      }
    ]
  },
    {
    id: 4,
    title: "Bài kiểm tra",
    items: [
      {
        id: 109,
        ten: "Kiểm tra giữa kỳ",
        loai: "kiemtra",
        text: "Bài kiểm tra này để lấy điểm cộng cho giữa kỳ.",
        thoiGianMo: "2025-11-27T08:00:00",       // thời gian bắt đầu mở
        thoiGianDong: "2025-11-27T17:00:00",     // thời gian kết thúc
        trangThai: "chua-mo",                     // trạng thái: chua-mo, dang-mo, da-dong
        tongDiem: "",
        url: "",
        thoiluong:"",
        cauHoi: [  // mock luôn câu hỏi kèm đáp án (nếu muốn)
          {
            id: 1001,
            noiDung: "Câu hỏi 1: React là gì?",
            diemDatDuoc: 5,
            loaiCauHoi: "motDapAn",
            thuTu: 1,
            luaChon: [
              { id: 1, noiDung: "Thư viện JS", laDapAnDung: true, thuTu: 1 },
              { id: 2, noiDung: "Ngôn ngữ lập trình", laDapAnDung: false, thuTu: 2 }
            ]
          },
          {
            id: 1002,
            noiDung: "Câu hỏi 2: CSS dùng để làm gì?",
            diemDatDuoc: 5,
            loaiCauHoi: "motDapAn",
            thuTu: 2,
            luaChon: [
              { id: 3, noiDung: "Định dạng giao diện", laDapAnDung: true, thuTu: 1 },
              { id: 4, noiDung: "Xử lý backend", laDapAnDung: false, thuTu: 2 }
            ]
          }
        ]
      }
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
