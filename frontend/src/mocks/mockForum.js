const mockForumPosts = [
  {
    id: 1,
    title: "Lưu Ý",
    author: "Nguyen Tien Dat",
    authorAvatar: "👤",
    date: "2025-12-18T00:00:00",
    content: `
Sinh viên tránh gửi thắc mắc bằng email gửi đến GV!!

Không có câu hỏi nào là dở — thắc mắc của bạn cũng là thắc mắc của người khác.

Khi gửi câu hỏi cần:
- Tiêu đề ngắn gọn, rõ ràng
- Nội dung chi tiết (có thể kèm code, hình ảnh)

GV sẽ phản hồi sớm nhất có thể.
`,
    replies: 2,
    likes: 0,
    isPinned: true,
    isRead: false,
    repliesList: [
      {
        id: 101,
        author: "Tran Van A",
        content: "Thầy ơi phần lưu ý này có áp dụng cho bài tập nhóm không ạ?",
        date: "2025-12-18T10:12:00",
      },
      {
        id: 102,
        author: "Nguyen Tien Dat",
        content: "Áp dụng cho cả bài tập nhóm và cá nhân em nhé.",
        date: "2025-12-18T11:30:00",
      },
    ],
  },

  {
    id: 2,
    title: "Câu hỏi về bài tập lớn",
    author: "Tran Van A",
    authorAvatar: "👤",
    date: "2025-12-20T00:00:00",
    content: "Bài này làm như thế nào vậy?",
    replies: 5,
    likes: 3,
    isPinned: false,
    isRead: true,
    repliesList: [
      {
        id: 201,
        author: "Le Thi B",
        content: "Bạn ơi bài này có cần dùng API không?",
        date: "2025-12-20T09:00:00",
      },
      {
        id: 202,
        author: "Tran Van A",
        content: "Theo mình biết là có nha!",
        date: "2025-12-20T09:30:00",
      },
      {
        id: 203,
        author: "Nguyen Tien Dat",
        content: "Bài tập lớn yêu cầu sử dụng API RESTful.",
        date: "2025-12-20T10:15:00",
      },
      {
        id: 204,
        author: "Pham Minh C",
        content: "Bạn xem kỹ file yêu cầu, có ghi rõ phần đó.",
        date: "2025-12-20T11:00:00",
      },
      {
        id: 205,
        author: "Tran Van A",
        content: "Cảm ơn mọi người!",
        date: "2025-12-20T11:32:00",
      },
    ],
  },

  {
    id: 3,
    title: "Thắc mắc về deadline nộp bài",
    author: "Le Thi B",
    authorAvatar: "👤",
    date: "2025-12-19T00:00:00",
    content: "Deadline nộp bài ngày mấy vậy mọi người?",
    replies: 2,
    likes: 1,
    isPinned: false,
    isRead: false,
    repliesList: [
      {
        id: 301,
        author: "Tran Van A",
        content: "Deadline tuần này hay tuần sau vậy bạn?",
        date: "2025-12-19T13:20:00",
      },
      {
        id: 302,
        author: "Nguyen Tien Dat",
        content: "Deadline là Chủ Nhật tuần này 23:59.",
        date: "2025-12-19T14:05:00",
      },
    ],
  },
];

export default mockForumPosts;
