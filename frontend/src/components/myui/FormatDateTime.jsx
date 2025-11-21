function formatDateTime(dateString) {
  const date = new Date(dateString);

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