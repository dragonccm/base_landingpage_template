"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const raw = await res.text();
    let d = {};
    try { d = raw ? JSON.parse(raw) : {}; } catch { d = { error: raw || "Server error" }; }
    setLoading(false);
    if (!res.ok) return toast.error(d.error || "Login failed");
    toast.success("Đăng nhập thành công");
    router.push("/admin");
  }

  return (
    <main className="pageWrap" style={{ display: "grid", placeItems: "center" }}>
      <form className="card" onSubmit={submit} style={{ width: "min(450px, 100%)" }}>
        <h2 style={{ marginTop: 0 }}>Admin Login</h2>
        <p style={{ color: "#666" }}>JWT secure session • dashboard access</p>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div style={{ height: 8 }} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div style={{ height: 12 }} />
        <button className="btn" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
        <p style={{ color: "#777" }}>Default: nguyenngoclong5511@gmail.com / long20%long</p>
      </form>
    </main>
  );
}
