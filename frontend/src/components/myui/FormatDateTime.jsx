function formatDateTime(dateString) {
  if (!dateString) return 'Chưa có thông tin';
  
  const date = new Date(dateString);
  
  // Kiểm tra nếu date không hợp lệ
  if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

  const options = {
    weekday: 'long',      // Thứ trong tuần
    day: '2-digit',       // Ngày
    month: '2-digit',     // Tháng
    year: 'numeric',      // Năm
    hour: '2-digit',      // Giờ
    minute: '2-digit',    // Phút
    hour12: false,        // 24h format
  };

  return new Intl.DateTimeFormat('vi-VN', options).format(date);
}
export default formatDateTime;