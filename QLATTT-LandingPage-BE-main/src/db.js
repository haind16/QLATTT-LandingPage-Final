require('dotenv').config();
const mysql = require('mysql2'); // hoặc 'mysql' tùy thư viện bạn dùng

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Bắt buộc phải có dòng này để qua mặt lỗi chứng chỉ SSL
  }
});


db.connect(err => {
  if (err) {
    console.log('Lỗi kết nối database:', err.message);
    return;
  }
  console.log('Kết nối MySQL thành công');
});

module.exports = db;