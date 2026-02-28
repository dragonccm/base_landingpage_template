"use client";

import { useEffect, useState } from "react";

const quickMenu = [
  "Laptop",
  "Laptop Gaming",
  "PC GVN",
  "Main, CPU, VGA",
  "Màn hình",
  "Bàn phím",
  "Chuột",
  "Tai nghe",
  "Ghế - Bàn",
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || []));
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  return (
    <main>
      <div className="topSale">FREESHIP đơn từ 500K • Trả góp 0% • Bảo hành chính hãng</div>

      <header className="headerMain">
        <div className="container headRow">
          <a className="logo" href="/">GEARVN</a>
          <div className="searchWrap">
            <input placeholder="Bạn cần tìm gì hôm nay..." />
            <button>Tìm kiếm</button>
          </div>
          <div className="rightActions">
            <a href="#">1900.5301</a>
            {!user && <a href="/login">Đăng nhập</a>}
            {!user && <a href="/register">Đăng ký</a>}
            {user?.role === "admin" && <a href="/admin">Admin</a>}
          </div>
        </div>
      </header>

      <nav className="quickNav">
        <div className="container quickRow">
          {quickMenu.map((item) => (
            <a key={item} href="#">{item}</a>
          ))}
        </div>
      </nav>

      <section className="container heroGrid">
        <aside className="leftMenu">
          <h3>Danh mục sản phẩm</h3>
          <ul>
            <li>Laptop</li><li>Laptop Gaming</li><li>PC GVN</li><li>Main, CPU, VGA</li>
            <li>Màn hình</li><li>Bàn phím</li><li>Chuột + Lót chuột</li><li>Tai nghe</li>
          </ul>
        </aside>

        <div className="heroBanner">
          <p className="badge">GEARVN DEAL</p>
          <h1>Build PC - Săn Gear xịn giá tốt mỗi ngày</h1>
          <p>Ưu đãi lên đến 40% cho gaming gear, laptop và linh kiện.</p>
          <a href="#">Mua ngay</a>
        </div>

        <div className="sideCol">
          <article><h4>Laptop RTX Series</h4><p>Trả góp 0% • Quà tặng độc quyền</p></article>
          <article><h4>Màn hình 180Hz</h4><p>Giảm thêm đến 1.000.000₫</p></article>
        </div>
      </section>

      <section className="container sectionProducts">
        <div className="titleRow">
          <h2>Sản phẩm nổi bật</h2>
        </div>

        <div className="productGrid">
          {products.map((p) => (
            <article key={p.id} className="productCard">
              <img src={p.image} alt={p.name} />
              <h3>{p.name}</h3>
              <p className="price">{p.price.toLocaleString("vi-VN")}₫</p>
              <p className="oldPrice">{p.oldPrice.toLocaleString("vi-VN")}₫</p>
              <p className="stock">Kho: {p.stock}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
