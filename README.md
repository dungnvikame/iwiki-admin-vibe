# iWiki Knowledge Dashboard

Prototype frontend cho trang quản trị kho tri thức nội bộ iWiki. Toàn bộ dữ liệu là mock data, được thiết kế để stakeholder trải nghiệm luồng quản trị và để đội dev có cơ sở tích hợp API sau này.

## Có gì trong prototype

- Bộ lọc toàn cục theo đơn vị, thời gian và phân loại.
- Bốn tab: Tổng quan, Bài viết, Thành viên & PIC, Health metrics.
- KPI, cảnh báo, bảng, phân loại, heatmap và biểu đồ xu hướng.
- Mock interaction: đổi filter cập nhật số liệu; tìm kiếm trạng thái rỗng; mở rộng danh sách bài cần review; lọc trạng thái thành viên; menu responsive.
- Hoàn toàn client-side, không cần backend hoặc đăng nhập thật.

## Chạy dự án

```bash
npm install
npm run dev
```

Nếu cổng mặc định đang được sử dụng, có thể chạy bản production preview trên một cổng riêng:

```bash
npm run build
npm run start -- --port 5174
```

## Quy ước dữ liệu để tích hợp backend

Khi thay mock data bằng API, các màn hình cần tối thiểu các nhóm dữ liệu sau:

- `articles`: tiêu đề, phân loại, đơn vị/team, tác giả, trạng thái, ngày publish/update, views, saves và review state.
- `members`: đơn vị/team, vai trò, hoạt động gần nhất, số lần truy cập và số liệu đóng góp.
- `reviews`: thời điểm submit/approve, reviewer/PIC và trạng thái review.
- `searchMetrics`: keyword, số lần tìm, số lượt có/không có kết quả.

Các KPI phải được tính từ cùng nguồn dữ liệu với chart và table để tránh số liệu lệch nhau.

## Kiểm tra

```bash
npm run build
npm test
```
