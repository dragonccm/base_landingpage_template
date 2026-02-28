"use client";

import { useEffect, useState } from "react";

const blank = { name: "", category: "", image: "", price: "", oldPrice: "", stock: "" };

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(blank);

  async function load() {
    const p = await fetch("/api/admin/products").then((r) => r.json());
    const o = await fetch("/api/admin/orders").then((r) => r.json());
    setProducts(p.products || []);
    setOrders(o.orders || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addProduct(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice),
      stock: Number(form.stock),
    };
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Lỗi thêm sản phẩm");
    setForm(blank);
    load();
  }

  async function deleteProduct(id) {
    if (!confirm("Xoá sản phẩm này?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    load();
  }

  async function updateStatus(id, status) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/";
  }

  return (
    <main className="container page">
      <header className="top">
        <h1>Admin Dashboard</h1>
        <div className="actions">
          <a href="/">Về trang chủ</a>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      <section className="adminGrid">
        <div className="panel">
          <h2>Thêm sản phẩm</h2>
          <form className="form" onSubmit={addProduct}>
            {Object.keys(blank).map((k) => (
              <input
                key={k}
                placeholder={k}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                required
              />
            ))}
            <button type="submit">Thêm</button>
          </form>
        </div>

        <div className="panel">
          <h2>Quản lý đơn hàng</h2>
          {orders.map((o) => (
            <div key={o.id} className="itemRow">
              <div>
                <b>{o.id}</b> - {o.customerName} - {o.total?.toLocaleString("vi-VN")}₫
                <p className="muted">{o.status}</p>
              </div>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Danh sách sản phẩm</h2>
        {products.map((p) => (
          <div key={p.id} className="itemRow">
            <div>
              <b>{p.name}</b>
              <p className="muted">{p.category} • {p.price.toLocaleString("vi-VN")}₫ • kho {p.stock}</p>
            </div>
            <button onClick={() => deleteProduct(p.id)}>Xoá</button>
          </div>
        ))}
      </section>
    </main>
  );
}
