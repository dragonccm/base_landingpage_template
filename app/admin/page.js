"use client";

import { useEffect, useMemo, useState } from "react";

const blank = { name: "", category: "", image: "", price: "", oldPrice: "", stock: "" };

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(blank);
  const [keyword, setKeyword] = useState("");

  async function load() {
    const [p, o] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
    ]);
    setProducts(p.products || []);
    setOrders(o.orders || []);
  }

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const revenue = orders.filter((o) => o.status === "completed").reduce((s, o) => s + (o.total || 0), 0);
    return {
      products: products.length,
      orders: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      revenue,
    };
  }, [products, orders]);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(keyword.toLowerCase()) || p.category.toLowerCase().includes(keyword.toLowerCase())),
    [products, keyword]
  );

  async function addProduct(e) {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), oldPrice: Number(form.oldPrice), stock: Number(form.stock) };
    const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/";
  }

  return (
    <main className="container page adminPage">
      <header className="top">
        <h1>Admin Dashboard</h1>
        <div className="actions"><a href="/">Về trang chủ</a><button onClick={logout}>Đăng xuất</button></div>
      </header>

      <section className="statsGrid">
        <article className="statCard"><p>Sản phẩm</p><h3>{stats.products}</h3></article>
        <article className="statCard"><p>Đơn hàng</p><h3>{stats.orders}</h3></article>
        <article className="statCard"><p>Chờ xử lý</p><h3>{stats.pending}</h3></article>
        <article className="statCard"><p>Doanh thu hoàn tất</p><h3>{stats.revenue.toLocaleString("vi-VN")}₫</h3></article>
      </section>

      <section className="adminGrid">
        <div className="panel">
          <h2>Thêm sản phẩm mới</h2>
          <form className="form" onSubmit={addProduct}>
            {Object.keys(blank).map((k) => <input key={k} placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required />)}
            <button type="submit">Thêm sản phẩm</button>
          </form>
        </div>

        <div className="panel">
          <h2>Quản lý đơn hàng</h2>
          <div className="tableWrap">
            {orders.map((o) => (
              <div key={o.id} className="itemRow">
                <div>
                  <b>{o.customerName}</b>
                  <p className="muted">{o.id} • {o.total?.toLocaleString("vi-VN")}₫</p>
                </div>
                <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                  <option value="pending">pending</option><option value="processing">processing</option><option value="completed">completed</option><option value="cancelled">cancelled</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="titleBar">
          <h2>Danh sách sản phẩm</h2>
          <input placeholder="Tìm theo tên / danh mục" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        {filteredProducts.map((p) => (
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
