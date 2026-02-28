"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/landing").then((r) => r.json()).then((d) => setData(d.data));
  }, []);

  if (!data) return <main className="container page"><p>Loading...</p></main>;

  function setField(group, key, value) {
    setData((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/landing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setSaving(false);
    alert(res.ok ? "Đã lưu landing page" : json.error || "Lỗi lưu");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/";
  }

  return (
    <main className="container page adminEditor">
      <header className="top">
        <h1>Landing Editor (Admin)</h1>
        <div className="actions">
          <a href="/" target="_blank">Mở landing</a>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      <section className="panel">
        <h2>Nội dung Landing</h2>
        <div className="formGrid">
          {Object.entries(data.content).map(([key, value]) => (
            <label key={key}>
              <span>{key}</span>
              <textarea value={value} onChange={(e) => setField("content", key, e.target.value)} rows={key.includes("Desc") || key.includes("Text") ? 3 : 2} />
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Theme (font / color / radius)</h2>
        <div className="formGrid">
          {Object.entries(data.theme).map(([key, value]) => (
            <label key={key}>
              <span>{key}</span>
              {key.toLowerCase().includes("color") ? (
                <div className="colorRow">
                  <input type="color" value={value} onChange={(e) => setField("theme", key, e.target.value)} />
                  <input value={value} onChange={(e) => setField("theme", key, e.target.value)} />
                </div>
              ) : (
                <input value={value} onChange={(e) => setField("theme", key, e.target.value)} />
              )}
            </label>
          ))}
        </div>
      </section>

      <section className="panel previewPanel">
        <h2>Live Preview</h2>
        <div
          className="miniPreview"
          style={{
            background: data.theme.bgColor,
            color: data.theme.textColor,
            fontFamily: data.theme.fontFamily,
          }}
        >
          <span style={{ color: data.theme.secondaryColor }}>{data.content.heroBadge}</span>
          <h3>{data.content.heroTitle}</h3>
          <p style={{ color: data.theme.mutedColor }}>{data.content.heroDesc}</p>
          <button style={{ background: data.theme.primaryColor }}>CTA</button>
        </div>
      </section>

      <div className="saveBar">
        <button className="primaryBtn" onClick={save} disabled={saving}>{saving ? "Đang lưu..." : "Lưu toàn bộ thay đổi"}</button>
      </div>
    </main>
  );
}
