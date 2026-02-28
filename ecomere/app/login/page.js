"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Đăng nhập thất bại");
    router.push(data.role === "admin" ? "/admin" : "/");
    router.refresh();
  }

  return (
    <main className="authWrap">
      <form className="authCard" onSubmit={onSubmit}>
        <h1>Đăng nhập</h1>
        <input placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Mật khẩu" type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Đăng nhập</button>
        <p>Tài khoản admin mẫu: admin@gearvn.local / Admin@123</p>
      </form>
    </main>
  );
}
