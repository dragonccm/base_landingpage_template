"use client";
import { useEffect, useMemo, useState } from "react";

const tabs = ["dashboard", "landing", "seo", "identity", "media"];

export default function Admin() {
  const [active, setActive] = useState("dashboard");
  const [landing, setLanding] = useState(null);
  const [settings, setSettings] = useState(null);
  const [media, setMedia] = useState([]);
  const [upload, setUpload] = useState({ url: "", name: "", alt: "" });
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    const [a, b, c] = await Promise.all([
      fetch("/api/admin/landing").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/media").then((r) => r.json()),
    ]);
    setLanding(a.data);
    setSettings(b.data);
    setMedia(c.items || []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const isLoading = !landing || !settings;
  const setLandingField = (group, key, value) => setLanding((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
  const setSettingsField = (group, key, value) => setSettings((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));

  async function saveLanding() {
    setSaving(true);
    await fetch("/api/admin/landing", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(landing) });
    setSaving(false);
    alert("Lưu landing thành công");
  }

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
    alert("Lưu cài đặt thành công");
  }

  async function addMedia(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(upload) });
    if (!res.ok) return alert("Thêm media lỗi");
    setUpload({ url: "", name: "", alt: "" });
    loadAll();
  }

  async function removeMedia(id) {
    await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
    loadAll();
  }

  const stats = useMemo(() => ({
    media: media.length,
    contentFields: landing ? Object.keys(landing.content || {}).length : 0,
    seoFields: settings ? Object.keys(settings.seo || {}).length : 0,
  }), [media, landing, settings]);

  if (isLoading) {
    return <main className="adminShell"><aside className="sidebar" /><section className="mainPanel"><div className="skeleton lg" /><div className="skeleton" /><div className="skeleton" /></section></main>;
  }

  const t = landing.theme;

  return (
    <main className="adminShell">
      <aside className="sidebar">
        <h2>NextCMS</h2>
        {tabs.map((x) => (
          <button key={x} className={`navBtn ${active === x ? "active" : ""}`} onClick={() => setActive(x)}>{x.toUpperCase()}</button>
        ))}
      </aside>

      <section className="mainPanel">
        <header className="panelHeader">
          <div>
            <h1>Admin Dashboard</h1>
            <p>White UI + Black sidebar + accents #75323c / #dab772</p>
          </div>
          <div className="row"><a href="/" target="_blank">Open Site</a><button className="btn" disabled={saving}>{saving ? "Saving..." : "Ready"}</button></div>
        </header>

        {active === "dashboard" && (
          <div className="grid3">
            <article className="card kpi"><h3>Media</h3><strong>{stats.media}</strong></article>
            <article className="card kpi"><h3>Content Fields</h3><strong>{stats.contentFields}</strong></article>
            <article className="card kpi"><h3>SEO Fields</h3><strong>{stats.seoFields}</strong></article>
          </div>
        )}

        {active === "landing" && (
          <>
            <div className="card"><h3>Theme</h3><div className="grid2">{Object.entries(landing.theme).map(([k, v]) => <label key={k}>{k}{k.toLowerCase().includes("color") ? <div className="row"><input type="color" value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} /><input value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} /></div> : <input value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} />}</label>)}</div></div>
            <div className="card"><h3>Content (Professional Editor)</h3><div className="editorToolbar"><button type="button" onClick={() => setLandingField("content", "section1", `<strong>${landing.content.section1}</strong>`)}>B</button><button type="button" onClick={() => setLandingField("content", "section1", `<em>${landing.content.section1}</em>`)}>I</button><button type="button" onClick={() => setLandingField("content", "section1", `<p>${landing.content.section1}</p><ul><li>Item</li></ul>`)}>List</button></div><div className="grid2">{Object.entries(landing.content).map(([k, v]) => <label key={k}>{k}<textarea rows={4} value={v} onChange={(e) => setLandingField("content", k, e.target.value)} /></label>)}</div><button className="btn" onClick={saveLanding}>Save Landing</button></div>
            <div className="card" style={{ borderColor: t.primaryColor }}><h3>Live Preview</h3><div className="previewBox" style={{ fontFamily: t.fontFamily, color: t.textColor, background: t.bgColor }}><h2>{landing.content.title}</h2><p>{landing.content.subtitle}</p><button className="btn" style={{ background: t.primaryColor }}>{landing.content.cta}</button></div></div>
          </>
        )}

        {active === "seo" && (
          <div className="card"><h3>SEO Metadata</h3><div className="grid2">{Object.entries(settings.seo).map(([k, v]) => <label key={k}>{k}<textarea rows={3} value={v} onChange={(e) => setSettingsField("seo", k, e.target.value)} /></label>)}</div><button className="btn" onClick={saveSettings}>Save SEO</button></div>
        )}

        {active === "identity" && (
          <div className="card"><h3>Identity</h3><div className="grid2">{Object.entries(settings.identity).map(([k, v]) => <label key={k}>{k}<input value={v} onChange={(e) => setSettingsField("identity", k, e.target.value)} /></label>)}</div><button className="btn" onClick={saveSettings}>Save Identity</button></div>
        )}

        {active === "media" && (
          <>
            <form className="card" onSubmit={addMedia}><h3>Media Manager</h3><div className="grid3"><input placeholder="Media URL" value={upload.url} onChange={(e) => setUpload({ ...upload, url: e.target.value })} required /><input placeholder="Name" value={upload.name} onChange={(e) => setUpload({ ...upload, name: e.target.value })} /><input placeholder="Alt" value={upload.alt} onChange={(e) => setUpload({ ...upload, alt: e.target.value })} /></div><button className="btn">Add Media</button></form>
            <div className="mediaGrid">{media.map((m) => <article key={m.id} className="card"><img src={m.url} alt={m.alt || m.name} /><h4>{m.name}</h4><p>{m.alt}</p><button className="btn danger" onClick={() => removeMedia(m.id)}>Delete</button></article>)}</div>
          </>
        )}
      </section>
    </main>
  );
}
