"use client";

import { useEffect, useMemo, useState } from "react";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || []));
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  const total = useMemo(() => products.reduce((s, p) => s + p.price, 0), [products]);

  async function quickOrder() {
    if (!products.length) return;
    const items = products.slice(0, 1).map((p) => ({ id: p.id, name: p.name, qty: 1, price: p.price }));
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, total: items[0].price }),
    });
    const data = await res.json();
    alert(data.message || data.error);
  }

  return (
    <main className="container page">
      <header className="top">
        <h1>GEARVN Clone - Fullstack Demo</h1>
        <div className="actions">
          {!user && <a href="/login">Đăng nhập</a>}
          {!user && <a href="/register">Đăng ký</a>}
          {user?.role === "admin" && <a href="/admin">Admin</a>}
        </div>
      </header>

      <section className="hero">
        <p>Chào {user?.name || "bạn"} • Tổng giá trị danh mục mẫu: {total.toLocaleString("vi-VN")}₫</p>
        <button onClick={quickOrder}>Đặt nhanh sản phẩm đầu tiên</button>
      </section>

      <section className="grid">
        {products.map((p) => (
          <article key={p.id} className="card">
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="price">{p.price.toLocaleString("vi-VN")}₫</p>
            <p className="muted">Kho: {p.stock}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
