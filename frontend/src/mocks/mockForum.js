const mockForumPosts = [
  {
    id: 1,
    title: 'Lưu Ý',
    author: 'Nguyen Tien Dat',
    authorAvatar: '👤',
    date: '18 tháng 12 2025',
    replies: 2,
    likes: 0,
    isPinned: true,
    isRead: false,
    repliesList: [
      {
        id: 101,
        author: "Tran Van A",
        content: "Thầy ơi phần lưu ý này có áp dụng cho bài tập nhóm không ạ?",
        date: "18 tháng 12 2025 - 10:12"
      },
      {
        id: 102,
        author: "Nguyen Tien Dat",
        content: "Áp dụng cho cả bài tập nhóm và cá nhân em nhé.",
        date: "18 tháng 12 2025 - 11:30"
      }
    ]
  },

  {
    id: 2,
    title: 'Câu hỏi về bài tập lớn',
    author: 'Tran Van A',
    authorAvatar: '👤',
    date: '20 tháng 12 2025',
    replies: 5,
    likes: 3,
    isPinned: false,
    isRead: true,
    repliesList: [
      {
        id: 201,
        author: "Le Thi B",
        content: "Bạn ơi bài này có cần dùng API không?",
        date: "20 tháng 12 2025 - 09:00"
      },
      {
        id: 202,
        author: "Tran Van A",
        content: "Theo mình biết là có nha!",
        date: "20 tháng 12 2025 - 09:30"
      },
      {
        id: 203,
        author: "Nguyen Tien Dat",
        content: "Bài tập lớn yêu cầu sử dụng API RESTful.",
        date: "20 tháng 12 2025 - 10:15"
      },
      {
        id: 204,
        author: "Pham Minh C",
        content: "Bạn xem kỹ file yêu cầu, có ghi rõ phần đó.",
        date: "20 tháng 12 2025 - 11:00"
      },
      {
        id: 205,
        author: "Tran Van A",
        content: "Cảm ơn mọi người!",
        date: "20 tháng 12 2025 - 11:32"
      }
    ]
  },

  {
    id: 3,
    title: 'Thắc mắc về deadline nộp bài',
    author: 'Le Thi B',
    authorAvatar: '👤',
    date: '19 tháng 12 2025',
    replies: 2,
    likes: 1,
    isPinned: false,
    isRead: false,
    repliesList: [
      {
        id: 301,
        author: "Tran Van A",
        content: "Deadline tuần này hay tuần sau vậy bạn?",
        date: "19 tháng 12 2025 - 13:20"
      },
      {
        id: 302,
        author: "Nguyen Tien Dat",
        content: "Deadline là Chủ Nhật tuần này 23:59.",
        date: "19 tháng 12 2025 - 14:05"
      }
    ]
  }
];

export default mockForumPosts;
