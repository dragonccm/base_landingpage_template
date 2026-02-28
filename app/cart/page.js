"use client";

import { useEffect, useMemo, useState } from "react";

function loadCart() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setCart(loadCart());
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  function sync(next) {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function changeQty(id, delta) {
    const next = cart.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
    sync(next);
  }

  function removeItem(id) {
    sync(cart.filter((i) => i.id !== id));
  }

  async function checkout() {
    if (!user) return alert("Vui lòng đăng nhập trước khi thanh toán");
    if (!cart.length) return;
    const items = cart.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price }));
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, total }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Thanh toán thất bại");
    sync([]);
    alert("Đặt hàng thành công");
  }

  return (
    <main className="container page">
      <header className="top"><h1>Giỏ hàng</h1><div className="actions"><a href="/">Tiếp tục mua</a></div></header>
      <section className="panel">
        {!cart.length && <p>Giỏ hàng trống.</p>}
        {cart.map((i) => (
          <div className="itemRow" key={i.id}>
            <div>
              <b>{i.name}</b>
              <p className="muted">{i.price.toLocaleString("vi-VN")}₫ x {i.qty}</p>
            </div>
            <div className="actions">
              <button onClick={() => changeQty(i.id, -1)}>-</button>
              <button onClick={() => changeQty(i.id, 1)}>+</button>
              <button onClick={() => removeItem(i.id)}>Xoá</button>
            </div>
          </div>
        ))}
      </section>

      <section className="checkoutBar panel">
        <h3>Tổng cộng: {total.toLocaleString("vi-VN")}₫</h3>
        <button className="primaryBtn" onClick={checkout}>Thanh toán</button>
      </section>
    </main>
  );
}
