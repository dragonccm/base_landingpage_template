"use client";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminData, setActiveTab, setLandingState, setSettingsState } from "@/store/adminSlice";
import ImageField from "@/components/ImageField";
import { toast } from "@/lib/toast";
import { Trash2 } from "lucide-react";

const tabs = ["dashboard", "landing", "seo", "identity", "smtp", "security", "media", "contacts", "users", "backup"];

export default function Admin() {
  const dispatch = useDispatch();
  const { landing, settings, media, contacts, users, active, loading } = useSelector((s) => s.admin);
  const [upload, setUpload] = useState({ url: "", name: "", alt: "" });
  const [saving, setSaving] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "admin" });

  useEffect(() => { dispatch(fetchAdminData()); }, [dispatch]);

  const setLandingField = (group, key, value) => dispatch(setLandingState({ ...landing, [group]: { ...landing[group], [key]: value } }));
  const setSettingsField = (group, key, value) => dispatch(setSettingsState({ ...settings, [group]: { ...settings[group], [key]: value } }));

  async function saveLanding() {
    setSaving(true);
    await fetch("/api/admin/landing", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(landing) });
    setSaving(false);
    toast.success("Lưu landing thành công");
  }

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
    toast.success("Lưu cài đặt thành công");
  }

  async function addMedia(e) {
    e.preventDefault();
    if (!upload.url) return toast.error("Vui lòng chọn/upload ảnh trước");
    const res = await fetch("/api/admin/media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(upload) });
    if (!res.ok) return toast.error("Thêm media lỗi");
    setUpload({ url: "", name: "", alt: "" });
    toast.success("Thêm media thành công");
    dispatch(fetchAdminData());
  }

  async function removeMedia(id) {
    await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
    toast.info("Đã xoá media");
    dispatch(fetchAdminData());
  }

  async function setContactStatus(id, status) {
    const res = await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) return toast.error("Cập nhật trạng thái thất bại");
    dispatch(fetchAdminData());
  }

  async function createAdminUser(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userForm),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || "Không tạo được tài khoản");
    toast.success("Đã tạo tài khoản");
    setUserForm({ name: "", email: "", password: "", role: "admin" });
    dispatch(fetchAdminData());
  }

  async function userAction(id, action) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || "Thao tác thất bại");
    toast.success("Đã cập nhật tài khoản");
    dispatch(fetchAdminData());
  }

  async function createBackup() {
    const res = await fetch("/api/admin/backup", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || "Backup thất bại");
    toast.success(`Backup xong: ${data.backupPath}`);
  }

  const stats = useMemo(() => ({
    media: media?.length || 0,
    contacts: contacts?.length || 0,
    users: users?.length || 0,
  }), [media, contacts, users]);

  if (loading || !landing || !settings) return <main className="adminShell"><aside className="sidebar" /><section className="mainPanel"><div className="skeleton lg" /><div className="skeleton" /></section></main>;

  return (
    <main className="adminShell">
      <aside className="sidebar">
        <h2>NextCMS</h2>
        {tabs.map((x) => <button key={x} className={`navBtn ${active === x ? "active" : ""}`} onClick={() => dispatch(setActiveTab(x))}>{x.toUpperCase()}</button>)}
      </aside>

      <section className="mainPanel">
        <header className="panelHeader"><div><h1>Admin Dashboard</h1></div><div className="row"><a href="/" target="_blank">Open Site</a></div></header>

        {active === "dashboard" && <div className="grid3"><article className="card kpi"><h3>Media</h3><strong>{stats.media}</strong></article><article className="card kpi"><h3>Contacts</h3><strong>{stats.contacts}</strong></article><article className="card kpi"><h3>Users</h3><strong>{stats.users}</strong></article></div>}

        {active === "landing" && <div className="card"><h3>Theme + Content</h3><div className="grid2">{Object.entries(landing.theme).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} /></label>)}</div><h4>Content</h4><div className="grid2">{Object.entries(landing.content || {}).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><textarea rows={3} value={v} onChange={(e) => setLandingField("content", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveLanding} disabled={saving}>Save Landing</button></div>}

        {active === "seo" && <div className="card"><h3>SEO Metadata</h3><div className="grid2">{Object.entries(settings.seo).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><textarea rows={2} value={v} onChange={(e) => setSettingsField("seo", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save SEO</button></div>}

        {active === "identity" && <div className="card"><h3>Identity</h3><div className="grid2">{Object.entries(settings.identity).map(([k, v]) => k.toLowerCase().includes("logo") || k.toLowerCase().includes("favicon") ? <ImageField key={k} label={k} value={v || ""} onChange={(nv) => setSettingsField("identity", k, nv)} /> : <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input value={v} onChange={(e) => setSettingsField("identity", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save Identity</button></div>}

        {active === "smtp" && <div className="card"><h3>SMTP</h3><div className="grid2">{Object.entries(settings.smtp || {}).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input type={k.toLowerCase().includes("pass") ? "password" : "text"} value={v || ""} onChange={(e) => setSettingsField("smtp", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save SMTP</button></div>}

        {active === "security" && <div className="card"><h3>Security</h3><div className="grid2">{Object.entries(settings.security || {}).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input value={v || ""} onChange={(e) => setSettingsField("security", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save Security</button></div>}

        {active === "media" && <><form className="card" onSubmit={addMedia}><h3>Media Manager</h3><ImageField label="Media File" value={upload.url} mediaType="any" onChange={(v, type) => setUpload({ ...upload, url: v, type: type || upload.type })} /><div className="grid2"><label className="fieldWrap"><span className="fieldLabel">name</span><input value={upload.name} onChange={(e) => setUpload({ ...upload, name: e.target.value })} /></label><label className="fieldWrap"><span className="fieldLabel">alt</span><input value={upload.alt} onChange={(e) => setUpload({ ...upload, alt: e.target.value })} /></label></div><button className="btn">Add Media</button></form><div className="mediaGrid">{(media || []).map((m) => <article key={m.id} className="card mediaCard">{(m.type === "video" || /\.(mp4|webm|mov)$/i.test(m.url)) ? <video src={m.url} controls className="mediaThumb" /> : <img src={m.url} alt={m.alt || m.name} className="mediaThumb" />}<div className="row"><button className="deleteBtn" onClick={() => removeMedia(m.id)}><Trash2 size={16} /> Xoá</button></div></article>)}</div></>}

        {active === "contacts" && <div className="card"><h3>Contact submissions</h3><div style={{ display: "grid", gap: 12 }}>{(contacts || []).map((c) => <article key={c.id} className="card"><strong>{c.first_name} {c.last_name} - {c.email}</strong><p>{c.message}</p><small>{new Date(c.created_at).toLocaleString()}</small><div className="row"><button className="btn ghostBtn" onClick={() => setContactStatus(c.id, "reviewed")}>Mark Reviewed</button><button className="btn" onClick={() => setContactStatus(c.id, "resolved")}>Mark Resolved</button></div></article>)}</div></div>}

        {active === "users" && <><form className="card" onSubmit={createAdminUser}><h3>User Management (super admin)</h3><div className="grid2"><input placeholder="name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /><input placeholder="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /><input placeholder="password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option value="admin">admin</option><option value="super_admin">super_admin</option></select></div><button className="btn">Create user</button></form><div className="card"><h3>Users</h3>{(users || []).map((u) => <div key={u.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #ddd", padding: "8px 0" }}><span>{u.name} ({u.email}) - {u.role} - {u.status}</span><div className="row"><button className="btn ghostBtn" onClick={() => userAction(u.id, "activate")}>Activate</button><button className="btn ghostBtn" onClick={() => userAction(u.id, "block")}>Block</button><button className="deleteBtn" onClick={() => userAction(u.id, "delete")}>Delete</button></div></div>)}</div></>}

        {active === "backup" && <div className="card"><h3>Backup toàn diện</h3><p>Tạo snapshot dữ liệu DB + bản sao thư mục uploads vào /backups/timestamp</p><button className="btn" onClick={createBackup}>Create Backup</button></div>}
      </section>
    </main>
  );
}
