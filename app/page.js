const topLinks = [
  { label: "Home", href: "#" },
  { label: "DMCA", href: "#" },
  { label: "Chính sách bảo mật", href: "#" },
  { label: "Điều khoản sử dụng", href: "#" },
];

const socialLinks = [
  {
    prefix: "👉 Like và theo dõi",
    label: "Fanpage",
    href: "https://www.facebook.com/profile.php?id=61587278428982",
    suffix: "để cập nhật những thông tin mới nhất",
  },
  {
    prefix: "👉 Tham gia",
    label: "Group",
    href: "https://www.facebook.com/groups/1186605343460035/",
    suffix: "để thảo luận các vấn đề liên quan đến game",
  },
  {
    prefix: "👉 Đăng ký kênh",
    label: "Youtube",
    href: "https://www.youtube.com/channel/UCVuUgUNNyrROkm-z4fRdblQ",
    suffix: "để theo dõi các video hướng dẫn chi tiết",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="topBar">
        <nav className="container nav">
          {topLinks.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero container">
        <h1>Website tải game PC Việt Hoá miễn phí tốc độ cao</h1>
        <p>
          TamHonGame.com là nơi chia sẻ các tựa Game PC Việt Hoá mới nhất kèm link tải tốc độ cao và
          hoàn toàn miễn phí
        </p>
      </section>

      <section className="container community">
        {socialLinks.map((item) => (
          <p key={item.label}>
            {item.prefix} <a href={item.href}>{item.label}</a> {item.suffix}
          </p>
        ))}
      </section>

      <footer className="footer">Copyright © 2024 Tamhongame.com</footer>
    </main>
  );
}
