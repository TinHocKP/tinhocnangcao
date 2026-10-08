# Website Thi & Ôn Tập Trắc Nghiệm CNTT Nâng Cao (Đại Học Bách Khoa)

Hệ thống thi và ôn tập trắc nghiệm trực tuyến chuẩn Đại học Bách Khoa (Trung tâm Kỹ thuật Điện toán Bách Khoa - BK-CCE) dành cho kỳ thi **Ứng dụng CNTT Nâng Cao** (3 Phần lớn / 6 Chuyên đề).

---

## 🌟 Tính Năng Nổi Bật

- **Ngân hàng 300 câu hỏi chính thức**: Tích hợp 100% chuẩn xác từ 6 Google Forms của giảng viên:
  - **Phần 1: Xử lý văn bản nâng cao (MS Word Nâng Cao) - 100 câu**
    1. *Chuyên đề 1:* 50 câu đầu Word NC ([Google Form](https://forms.gle/NXMzCeNcHAVGSMXb9))
    2. *Chuyên đề 2:* 50 câu sau Word NC ([Google Form](https://forms.gle/2DpCJiMVkVYWeo5F7))
  - **Phần 2: Sử dụng bảng tính nâng cao (MS Excel Nâng Cao) - 100 câu**
    3. *Chuyên đề 3:* Excel Câu 1 - 50 đầu ([Google Form](https://forms.gle/tU94d2DcTXu78pnb6))
    4. *Chuyên đề 4:* Excel Câu 51 - 100 tiếp theo ([Google Form](https://forms.gle/3ztse8bKg1msUtby5))
  - **Phần 3: Sử dụng trình chiếu nâng cao (MS PowerPoint Nâng Cao) - 100 câu**
    5. *Chuyên đề 5:* Câu 1 - 50 đầu ([Google Form](https://forms.gle/jx8PucfUfdy8jt7m8))
    6. *Chuyên đề 6:* Câu 51 - 100 tiếp theo ([Google Form](https://forms.gle/pNiAMH48UEwbWm2VA))

- **Hình ảnh minh họa lưu trữ cục bộ**: 30 hình ảnh câu hỏi (bảng tính Excel, công thức, Animation Pane, Slide Master, giao diện Word) được tải về lưu trực tiếp trong thư mục `assets/images/`, đảm bảo hiển thị tức thì, sắc nét và không bao giờ bị lỗi link.

- **Chế độ Thi Thử 30 câu / 30 phút (`index.html`)**:
  - Giao diện chuẩn phần mềm thi Bách Khoa.
  - Đồng hồ đếm ngược `00:30:00`, tự động cảnh báo và nộp bài khi hết giờ.
  - Bốc ngẫu nhiên 5 câu từ mỗi chuyên đề trong 6 chuyên đề (tổng 30 câu bao phủ toàn bộ kiến thức).
  - Có thể chọn thi riêng từng phần (Word 30 câu, Excel 30 câu, PowerPoint 30 câu).
  - Sau khi nộp bài: **Câu đúng hiển thị màu XANH LÁ**, **Câu sai hiển thị màu ĐỎ NHẠT**.
  - Xem lại chi tiết từng câu kèm đáp án đúng và lời giải thích rõ ràng.

- **Chế độ Tự Ôn Tập Từng Phần (`practice.html`)**:
  - Màn hình tổng quan 3 Phần / 6 Chuyên đề.
  - Luyện tập 50 câu theo từng chuyên đề HOẶC luyện tập gộp 100 câu toàn bộ Phần đó.
  - Chế độ **Xem đáp án & giải thích tức thì (Instant Mode)** giúp vừa làm vừa học rất hiệu quả.
  - Không giới hạn thời gian, có thể làm đi làm lại nhiều lần.

- **Trang Quản Trị Giảng Viên (`admin.html`)**:
  - Đăng nhập: `admin` / `admin123`
  - Tìm kiếm câu hỏi theo từ khóa, lọc theo từng chuyên đề.
  - Thêm mới, chỉnh sửa nội dung, sửa đáp án đúng, sửa giải thích, cập nhật ảnh.
  - Xuất (Export) & Nhập (Import) file JSON để chia sẻ ngân hàng câu hỏi.
  - Nút khôi phục 300 câu hỏi chuẩn ban đầu.

- **Kiến trúc Web tĩnh siêu nhẹ**:
  - Hoàn toàn bằng HTML5, CSS3, Vanilla ES6 JavaScript.
  - Chạy trực tiếp trên GitHub Pages, miễn phí 100%, chịu tải 150+ sinh viên cùng lúc mượt mà.
  - Tự động lưu tiến trình làm bài vào LocalStorage chống mất bài khi tải lại trang (F5).

---

## 📁 Cấu Trúc Thư Mục

```
WebsiteNangCao/
├── index.html                 # Giao diện thi trắc nghiệm (30 câu / 30 phút đếm ngược)
├── practice.html              # Giao diện ÔN TẬP TỪNG PHẦN (50 hoặc 100 câu / tự do)
├── admin.html                 # Trang quản lý câu hỏi dành cho Giảng viên (admin / admin123)
├── css/
│   └── style.css              # Giao diện chuẩn Bách Khoa (Responsive PC, iPad, Phone)
├── js/
│   ├── app.js                 # Bộ máy thi thử, bốc ngẫu nhiên đề thi & chấm điểm
│   ├── practice.js            # Bộ máy tự ôn tập, xem giải thích tức thì
│   └── questions.js           # Ngân hàng 300 câu hỏi chính thức từ 6 Google Forms
├── assets/
│   ├── logo-bk.png            # Logo Đại học Bách Khoa BK-CCE
│   └── images/                # 30 hình minh họa bài thi tải về cục bộ
├── tools/                     # Các công cụ trích xuất và kiểm thử dữ liệu
└── HUONG_DAN_GITHUB.md        # Hướng dẫn chi tiết cách đưa lên GitHub Pages
```

---

## 🚀 Hướng Dẫn Nhanh

Xem chi tiết từng bước tại tệp [HUONG_DAN_GITHUB.md](HUONG_DAN_GITHUB.md).
1. Khởi tạo kho lưu trữ trên GitHub.
2. Đẩy toàn bộ thư mục `WebsiteNangCao` lên nhánh `main`.
3. Bật **Settings -> Pages -> Branch: main -> Save**.
4. Lấy link và chia sẻ cho sinh viên truy cập làm bài ngay lập tức!
