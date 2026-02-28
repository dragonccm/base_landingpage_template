const socialLinks = [
  {
    label: "Fanpage Facebook",
    href: "https://www.facebook.com/profile.php?id=61587278428982",
    description: "Cập nhật game mới nhanh nhất",
  },
  {
    label: "Group Facebook",
    href: "https://www.facebook.com/groups/1186605343460035/",
    description: "Thảo luận, hỏi đáp về game",
  },
  {
    label: "Kênh YouTube",
    href: "https://www.youtube.com/channel/UCVuUgUNNyrROkm-z4fRdblQ",
    description: "Video hướng dẫn cài đặt chi tiết",
  },
];

const menuItems = ["Home", "DMCA", "Chính sách bảo mật", "Điều khoản sử dụng"];

export default function HomePage() {
  return (
    <main className="page">
      <header className="header">
        <div className="container navWrap">
          <a className="logo" href="#">TamHonGame.com</a>
          <nav>
            <ul className="menu">
              {menuItems.map((item) => (
                <li key={item}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <section className="hero container">
        <p className="badge">Website tải game PC Việt Hoá miễn phí tốc độ cao</p>
        <h1>Tải game PC Việt Hoá mới nhất, nhanh và miễn phí</h1>
        <p className="subtitle">
          TamHonGame.com là nơi chia sẻ các tựa game PC Việt Hoá chất lượng, dễ tải,
          dễ cài đặt và luôn được cập nhật liên tục.
        </p>
      </section>

      <section className="container linksSection">
        <h2>Kết nối cộng đồng TamHonGame</h2>
        <div className="cardGrid">
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="card">
              <h3>{link.label}</h3>
              <p>{link.description}</p>
              <span>Xem ngay →</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="container footerInner">Copyright © 2024 Tamhongame.com</div>
      </footer>
    </main>
  );
}
