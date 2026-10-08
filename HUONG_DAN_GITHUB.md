# HƯỚNG DẪN ĐƯA WEBSITE LÊN GITHUB PAGES (HOÀN TOÀN MIỄN PHÍ)

Hướng dẫn này giúp bạn xuất bản website **Thi & Ôn Tập Trắc Nghiệm CNTT Nâng Cao** lên mạng Internet thông qua **GitHub Pages** chỉ trong 3 - 5 phút.

Sau khi đưa lên, website có tên miền riêng miễn phí (ví dụ: `https://ten-ban.github.io/WebsiteNangCao/`), chịu tải **150 - 500 sinh viên truy cập thi đồng thời** mà hoàn toàn ổn định và không tốn bất kỳ chi phí duy trì máy chủ nào.

---

## 📌 Cách 1: Tải Lên Bằng Giao Diện Web GitHub (Dễ nhất, không cần cài phần mềm)

### Bước 1: Tạo tài khoản & Kho lưu trữ (Repository)
1. Truy cập [github.com](https://github.com/) và đăng nhập (hoặc đăng ký tài khoản miễn phí).
2. Nhấn vào dấu **"+"** ở góc trên bên phải -> chọn **New repository**.
3. Điền các thông tin:
   - **Repository name**: `WebsiteNangCao` (hoặc tên tùy thích).
   - **Public**: Chọn **Public** (bắt buộc để dùng GitHub Pages miễn phí).
   - Không cần tích thêm các ô README, .gitignore.
4. Bấm **Create repository**.

### Bước 2: Tải các tệp trong thư mục lên
1. Trong trang repository vừa tạo, bấm vào dòng chữ **"uploading an existing file"**.
2. Kéo thả toàn bộ các thư mục và tệp sau từ thư mục `d:\WebsiteNangCao` vào khung upload:
   - `index.html`
   - `practice.html`
   - `admin.html`
   - Thư mục `css/` (chứa `style.css`)
   - Thư mục `js/` (chứa `app.js`, `practice.js`, `questions.js`)
   - Thư mục `assets/` (chứa `logo-bk.png` và thư mục `images/`)
3. Chờ trình duyệt tải lên xong, cuộn xuống dưới cùng và bấm **Commit changes**.

### Bước 3: Kích hoạt GitHub Pages
1. Tại trang Repository, bấm vào thẻ **Settings** (ở thanh menu trên cùng).
2. Ở cột bên trái, tìm và bấm vào mục **Pages** (hoặc cuộn xuống phần GitHub Pages).
3. Tại mục **Build and deployment**:
   - **Source**: Chọn `Deploy from a branch`.
   - **Branch**: Chọn nhánh `main` (hoặc `master`), thư mục giữ nguyên `/ (root)`.
   - Bấm nút **Save**.
4. Chờ khoảng 1 - 2 phút, tải lại trang Settings -> Pages. Bạn sẽ thấy dòng thông báo màu xanh:
   > **Your site is live at https://ten-ban.github.io/WebsiteNangCao/**

---

## 💻 Cách 2: Sử Dụng Lệnh Git (Dành cho người đã cài Git trên máy)

Mở PowerShell tại thư mục `d:\WebsiteNangCao` và chạy lần lượt các lệnh:

```bash
git init
git add .
git commit -m "Khoi tao he thong thi trac nghiem CNTT Nang Cao Bach Khoa"
git branch -M main
git remote add origin https://github.com/<ten-github-cua-ban>/WebsiteNangCao.git
git push -u origin main
```

Sau khi đẩy code lên, bạn vào **Settings -> Pages -> Branch: main -> Save** như Bước 3 ở trên.

---

## 🔗 Các Đường Dẫn Sau Khi Triển Khai Thành Công

Sau khi trang web hoạt động:
1. **Phòng thi trắc nghiệm (30 câu / 30 phút)**:
   `https://ten-ban.github.io/WebsiteNangCao/`
2. **Phòng tự ôn tập (300 câu hỏi / 3 phần / xem giải thích tức thì)**:
   `https://ten-ban.github.io/WebsiteNangCao/practice.html`
3. **Trang quản trị câu hỏi dành cho Giảng viên**:
   `https://ten-ban.github.io/WebsiteNangCao/admin.html`
   - *Tài khoản:* `admin`
   - *Mật khẩu:* `admin123`

---

## 💡 Lưu Ý Quan Trọng
- Toàn bộ 30 hình ảnh đề thi (bảng tính Excel, sơ đồ PowerPoint...) đã được tải về cục bộ trong thư mục `assets/images/`, sinh viên sẽ không bao giờ gặp lỗi mất ảnh hay ảnh không tải được.
- Sinh viên có thể thi trên máy tính để bàn, laptop, iPad, hoặc điện thoại di động vì giao diện được tối ưu hóa responsive đầy đủ.
- Nếu sinh viên vô tình tải lại trang (F5), bài thi vẫn được giữ nguyên trạng thái nhờ tính năng tự động sao lưu LocalStorage.
