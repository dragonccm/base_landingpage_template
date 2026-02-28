"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Đăng ký thất bại");
    alert("Đăng ký thành công, mời đăng nhập");
    router.push("/login");
  }

  return (
    <main className="authWrap">
      <form className="authCard" onSubmit={onSubmit}>
        <h1>Đăng ký</h1>
        <input placeholder="Họ tên" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Mật khẩu (>=8 ký tự)" type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Tạo tài khoản</button>
      </form>
    </main>
  );
}
