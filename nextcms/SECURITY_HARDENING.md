# SECURITY_HARDENING.md

## ✅ Đã áp dụng trong source
- [x] Auth cookie `httpOnly`, `sameSite=lax`, `secure` ở production
- [x] Role-based access: `admin`, `super_admin`
- [x] Chặn account `status=blocked`
- [x] Rate limit login theo số lần fail trong thời gian cấu hình
- [x] Rate limit contact theo giờ
- [x] Contact form lưu DB trước khi gửi mail
- [x] Admin inbox xem contact submissions
- [x] User lifecycle (super_admin): create/block/delete
- [x] Backup dữ liệu + uploads

## 🔒 Cần cấu hình khi deploy
1. Đổi `JWT_SECRET` mạnh (>= 32 ký tự random)
2. Bật HTTPS + HSTS ở reverse proxy
3. Giới hạn truy cập `/admin` theo IP nếu có thể
4. Thiết lập backup định kỳ (`npm run backup` qua cron/task scheduler)
5. Bật logging và alert khi login fail tăng đột biến
6. Đặt database user quyền tối thiểu
7. Cấu hình firewall chỉ mở cổng cần thiết
8. Theo dõi cập nhật Next.js/node dependencies định kỳ

## Gợi ý Nâng cao
- 2FA cho admin
- CSRF token cho form nhạy cảm
- Captcha cho contact/login
- Audit log cho hành động admin
