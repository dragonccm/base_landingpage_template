"use client";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminData, setActiveTab, setLandingState, setSettingsState } from "@/store/adminSlice";
import ImageField from "@/components/ImageField";
import RichPostEditor from "@/components/RichPostEditor";
import { toast } from "@/lib/toast";
import { Trash2 } from "lucide-react";

const tabs = ["dashboard", "landing", "seo", "identity", "smtp", "security", "media", "contacts", "posts", "users", "backup", "audit"];
const editorTabs = ["posts"];

export default function Admin() {
  const dispatch = useDispatch();
  const { landing, settings, media, contacts, users, posts, active, loading } = useSelector((s) => s.admin);
  const [upload, setUpload] = useState({ url: "", name: "", alt: "" });
  const [saving, setSaving] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [backups, setBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", slug: "", excerpt: "", contentHtml: "", status: "draft", categoryId: "", tagIds: [], coverImage: "" });
  const [postFilters, setPostFilters] = useState({ q: "", status: "", sort: "newest" });
  const [postList, setPostList] = useState([]);
  const [taxonomy, setTaxonomy] = useState({ categories: [], tags: [] });
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxType, setNewTaxType] = useState("category");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [revisions, setRevisions] = useState([]);
  const [busyKey, setBusyKey] = useState("");
  const [confirmState, setConfirmState] = useState({ open: false, message: "", onConfirm: null });
  const [currentRole, setCurrentRole] = useState("admin");

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json().catch(() => ({}));
      const role = meData?.user?.role || "admin";
      setCurrentRole(role);

      if (role === "editor") {
        dispatch(setActiveTab("posts"));
        await loadPosts();
        await loadTaxonomy();
        return;
      }

      dispatch(fetchAdminData());
    })();
  }, [dispatch]);

  useEffect(() => {
    if (active === "backup") loadBackups();
    if (active === "audit") loadAuditLogs();
    if (active === "posts") {
      loadPosts();
      loadTaxonomy();
      try {
        const raw = localStorage.getItem("draft_post_form");
        if (raw) setPostForm(JSON.parse(raw));
      } catch {}
    }
  }, [active]);

  useEffect(() => {
    if (active !== "posts") return;
    const t = setTimeout(() => {
      try { localStorage.setItem("draft_post_form", JSON.stringify(postForm)); } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [postForm, active]);

  const setLandingField = (group, key, value) => dispatch(setLandingState({ ...landing, [group]: { ...landing[group], [key]: value } }));
  const setSettingsField = (group, key, value) => dispatch(setSettingsState({ ...settings, [group]: { ...settings[group], [key]: value } }));

  async function withLoading(key, fn) {
    setBusyKey(key);
    try { return await fn(); }
    finally { setBusyKey(""); }
  }

  function askConfirm(message, onConfirm) {
    setConfirmState({ open: true, message, onConfirm });
  }

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

  async function loadBackups() {
    setBackupLoading(true);
    const res = await fetch("/api/admin/backup");
    const data = await res.json().catch(() => ({}));
    setBackups(data.items || []);
    setBackupLoading(false);
  }

  async function createBackup() {
    await withLoading("create-backup", async () => {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(data.error || "Backup thất bại");
      toast.success(`Backup xong: ${data.backupPath}`);
      await loadBackups();
    });
  }

  async function deleteBackup(id) {
    askConfirm(`Xoá backup ${id}?`, async () => {
      await withLoading(`delete-backup-${id}`, async () => {
        const res = await fetch(`/api/admin/backup?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return toast.error(data.error || "Xoá backup thất bại");
        toast.info("Đã xoá backup");
        await loadBackups();
      });
    });
  }

  async function loadAuditLogs() {
    setAuditLoading(true);
    const res = await fetch("/api/admin/audit-logs?limit=500");
    const data = await res.json().catch(() => ({}));
    setAuditLogs(data.items || []);
    setAuditLoading(false);
  }

  async function loadPosts(override = null) {
    const f = override || postFilters;
    const params = new URLSearchParams();
    if (f.q) params.set("q", f.q);
    if (f.status) params.set("status", f.status);
    if (f.sort) params.set("sort", f.sort);
    params.set("limit", "50");
    const res = await fetch(`/api/admin/posts?${params.toString()}`);
    const data = await res.json().catch(() => ({}));
    setPostList(data.items || []);
  }

  async function loadTaxonomy() {
    const res = await fetch("/api/admin/post-taxonomy");
    const data = await res.json().catch(() => ({}));
    setTaxonomy({ categories: data.categories || [], tags: data.tags || [] });
  }

  async function createTaxonomyItem(e) {
    e.preventDefault();
    if (!newTaxName.trim()) return;
    const res = await fetch("/api/admin/post-taxonomy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: newTaxType, name: newTaxName.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || "Không tạo được taxonomy");
    setNewTaxName("");
    await loadTaxonomy();
    toast.success("Đã tạo taxonomy");
  }

  async function deleteTaxonomyItem(type, id) {
    askConfirm(`Xoá ${type} này?`, async () => {
      await withLoading(`delete-tax-${type}-${id}`, async () => {
        const res = await fetch(`/api/admin/post-taxonomy?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return toast.error(data.error || "Xoá taxonomy thất bại");
        await loadTaxonomy();
        toast.info("Đã xoá taxonomy");
      });
    });
  }

  async function loadRevisions(postId) {
    setSelectedPostId(postId);
    const res = await fetch(`/api/admin/post-revisions?postId=${encodeURIComponent(postId)}`);
    const data = await res.json().catch(() => ({}));
    setRevisions(data.items || []);
  }

  async function restoreRevision(revisionId) {
    const res = await fetch("/api/admin/post-revisions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ revisionId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || "Khôi phục revision thất bại");
    toast.success("Đã khôi phục revision");
    if (selectedPostId) await loadRevisions(selectedPostId);
    await loadPosts();
  }

  async function createPostItem(e) {
    e.preventDefault();
    if (!postForm.title) return toast.error("Thiếu tiêu đề");
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(postForm),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || "Không tạo được bài viết");
    toast.success("Đã tạo bài viết");
    setPostForm({ title: "", slug: "", excerpt: "", contentHtml: "", status: "draft", categoryId: "", tagIds: [], coverImage: "" });
    await loadPosts();
    if (currentRole !== "editor") dispatch(fetchAdminData());
  }

  async function postAction(id, action) {
    if (action === "delete") {
      askConfirm("Xoá bài viết này?", async () => {
        await withLoading(`post-delete-${id}`, async () => {
          const res = await fetch(`/api/admin/posts?id=${id}`, { method: "DELETE" });
          if (!res.ok) return toast.error("Xoá bài viết thất bại");
          toast.info("Đã xoá bài viết");
          await loadPosts();
          if (currentRole !== "editor") dispatch(fetchAdminData());
        });
      });
      return;
    }

    const status = action === "publish" ? "published" : action === "draft" ? "draft" : null;
    if (!status) return;
    await withLoading(`post-${action}-${id}`, async () => {
      const payload = { id, status, publishedAt: status === "published" ? new Date().toISOString() : null };
      const res = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(data.error || "Cập nhật bài viết thất bại");
      toast.success("Đã cập nhật bài viết");
      await loadPosts();
      if (currentRole !== "editor") dispatch(fetchAdminData());
    });
  }

  const visibleTabs = currentRole === "editor" ? editorTabs : tabs;

  const stats = useMemo(() => ({
    media: media?.length || 0,
    contacts: contacts?.length || 0,
    users: users?.length || 0,
    posts: posts?.length || 0,
  }), [media, contacts, users, posts]);

  if ((currentRole !== "editor" && (loading || !landing || !settings)) || (currentRole === "editor" && loading)) {
    return <main className="adminShell"><aside className="sidebar" /><section className="mainPanel"><div className="skeleton lg" /><div className="skeleton" /></section></main>;
  }

  return (
    <main className="adminShell">
      <aside className="sidebar">
        <h2>NextCMS</h2>
        {visibleTabs.map((x) => <button key={x} className={`navBtn ${active === x ? "active" : ""}`} onClick={() => dispatch(setActiveTab(x))}>{x.toUpperCase()}</button>)}
      </aside>

      <section className="mainPanel">
        <header className="panelHeader"><div><h1>Admin Dashboard</h1></div><div className="row"><a href="/" target="_blank">Open Site</a></div></header>

        {active === "dashboard" && <div className="grid3"><article className="card kpi"><h3>Media</h3><strong>{stats.media}</strong></article><article className="card kpi"><h3>Contacts</h3><strong>{stats.contacts}</strong></article><article className="card kpi"><h3>Users</h3><strong>{stats.users}</strong></article><article className="card kpi"><h3>Posts</h3><strong>{stats.posts}</strong></article></div>}

        {active === "landing" && <div className="card"><h3>Theme + Content</h3><div className="grid2">{Object.entries(landing.theme).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} /></label>)}</div><h4>Content</h4><div className="grid2">{Object.entries(landing.content || {}).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><textarea rows={3} value={v} onChange={(e) => setLandingField("content", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveLanding} disabled={saving}>Save Landing</button></div>}

        {active === "seo" && <div className="card"><h3>SEO Metadata</h3><div className="grid2">{Object.entries(settings.seo).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><textarea rows={2} value={v} onChange={(e) => setSettingsField("seo", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save SEO</button></div>}

        {active === "identity" && <div className="card"><h3>Identity</h3><div className="grid2">{Object.entries(settings.identity).map(([k, v]) => k.toLowerCase().includes("logo") || k.toLowerCase().includes("favicon") ? <ImageField key={k} label={k} value={v || ""} onChange={(nv) => setSettingsField("identity", k, nv)} /> : <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input value={v} onChange={(e) => setSettingsField("identity", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save Identity</button></div>}

        {active === "smtp" && <div className="card"><h3>SMTP</h3><div className="grid2">{Object.entries(settings.smtp || {}).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input type={k.toLowerCase().includes("pass") ? "password" : "text"} value={v || ""} onChange={(e) => setSettingsField("smtp", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save SMTP</button></div>}

        {active === "security" && <div className="card"><h3>Security</h3><div className="grid2">{Object.entries(settings.security || {}).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input value={v || ""} onChange={(e) => setSettingsField("security", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save Security</button></div>}

        {active === "media" && <><form className="card" onSubmit={addMedia}><h3>Media Manager</h3><ImageField label="Media File" value={upload.url} mediaType="any" onChange={(v, type) => setUpload({ ...upload, url: v, type: type || upload.type })} /><div className="grid2"><label className="fieldWrap"><span className="fieldLabel">name</span><input value={upload.name} onChange={(e) => setUpload({ ...upload, name: e.target.value })} /></label><label className="fieldWrap"><span className="fieldLabel">alt</span><input value={upload.alt} onChange={(e) => setUpload({ ...upload, alt: e.target.value })} /></label></div><button className="btn">Add Media</button></form><div className="mediaGrid">{(media || []).map((m) => <article key={m.id} className="card mediaCard">{(m.type === "video" || /\.(mp4|webm|mov)$/i.test(m.url)) ? <video src={m.url} controls className="mediaThumb" /> : <img src={m.url} alt={m.alt || m.name} className="mediaThumb" />}<div className="row"><button className="deleteBtn" onClick={() => removeMedia(m.id)}><Trash2 size={16} /> Xoá</button></div></article>)}</div></>}

        {active === "contacts" && <div className="card"><h3>Contact submissions</h3><div style={{ display: "grid", gap: 12 }}>{(contacts || []).map((c) => <article key={c.id} className="card"><strong>{c.first_name} {c.last_name} - {c.email}</strong><p>{c.message}</p><small>{new Date(c.created_at).toLocaleString()}</small><div className="row"><button className="btn ghostBtn" onClick={() => setContactStatus(c.id, "reviewed")}>Mark Reviewed</button><button className="btn" onClick={() => setContactStatus(c.id, "resolved")}>Mark Resolved</button></div></article>)}</div></div>}

        {active === "posts" && <><form className="card postEditorCard" onSubmit={createPostItem}><h3>Post Editor</h3><p className="editorHint">Tối ưu trải nghiệm viết bài: điền thông tin nhanh bên trên, nội dung tập trung bên dưới.</p><div className="grid2 postEditorMeta"><input placeholder="title" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} /><input placeholder="slug (optional)" value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} /><input placeholder="excerpt" value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} /><select value={postForm.status} onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}><option value="draft">draft</option><option value="review">review</option><option value="published">published</option><option value="scheduled">scheduled</option></select><select value={postForm.categoryId} onChange={(e) => setPostForm({ ...postForm, categoryId: e.target.value })}><option value="">No category</option>{taxonomy.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input placeholder="tag ids comma-separated" value={(postForm.tagIds || []).join(",")} onChange={(e) => setPostForm({ ...postForm, tagIds: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></div><ImageField label="Cover Image" value={postForm.coverImage || ""} mediaType="image" onChange={(v) => setPostForm({ ...postForm, coverImage: v })} onUploaded={() => dispatch(fetchAdminData())} /><div className="coverPicker"><div className="coverPickerHead"><strong>Chọn cover từ Media Library</strong>{postForm.coverImage ? <small>Đang chọn: {postForm.coverImage}</small> : <small>Chưa chọn cover</small>}</div><div className="coverPickerGrid">{(media || []).filter((m) => m.type !== "video").map((m) => <button key={m.id} type="button" className={`coverOption ${postForm.coverImage === m.url ? "active" : ""}`} onClick={() => setPostForm({ ...postForm, coverImage: m.url })}><img src={m.url} alt={m.alt || m.name || "cover"} /><span>{m.name || m.url}</span></button>)}</div></div><RichPostEditor mediaItems={(media || []).filter((m) => m.type !== "video")} value={postForm.contentHtml} onChange={(v) => setPostForm({ ...postForm, contentHtml: v })} /><button className="btn">Create post</button></form><div className="card"><h3>Posts (Advanced search/filter)</h3><div className="row" style={{ gap: 8, flexWrap: "wrap" }}><input placeholder="Search full-text" value={postFilters.q} onChange={(e) => setPostFilters({ ...postFilters, q: e.target.value })} /><select value={postFilters.status} onChange={(e) => setPostFilters({ ...postFilters, status: e.target.value })}><option value="">All status</option><option value="draft">draft</option><option value="review">review</option><option value="published">published</option><option value="scheduled">scheduled</option><option value="archived">archived</option></select><select value={postFilters.sort} onChange={(e) => setPostFilters({ ...postFilters, sort: e.target.value })}><option value="newest">newest</option><option value="oldest">oldest</option><option value="popular">popular</option><option value="relevance">relevance</option></select><button className="btn ghostBtn" onClick={() => loadPosts()}>Apply</button></div>{(postList || []).map((p) => <div key={p.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #ddd", padding: "8px 0", alignItems: "start" }}><span><strong>{p.title}</strong><br /><small>/{p.slug} - {p.status}</small></span><div className="row"><button className={`btn ghostBtn ${busyKey === `post-publish-${p.id}` ? "loading" : ""}`} disabled={busyKey === `post-publish-${p.id}`} onClick={() => postAction(p.id, "publish")}>Publish</button><button className={`btn ghostBtn ${busyKey === `post-draft-${p.id}` ? "loading" : ""}`} disabled={busyKey === `post-draft-${p.id}`} onClick={() => postAction(p.id, "draft")}>Draft</button><button className="btn ghostBtn" onClick={() => loadRevisions(p.id)}>Revisions</button><button className={`deleteBtn ${busyKey === `post-delete-${p.id}` ? "loading" : ""}`} disabled={busyKey === `post-delete-${p.id}`} style={{ marginTop: 0 }} onClick={() => postAction(p.id, "delete")}>Delete</button></div></div>)}{postList.length === 0 && <small>Không có bài viết.</small>}</div><form className="card" onSubmit={createTaxonomyItem}><h3>Taxonomy</h3><div className="row" style={{ gap: 8 }}><select value={newTaxType} onChange={(e) => setNewTaxType(e.target.value)}><option value="category">category</option><option value="tag">tag</option></select><input placeholder="name" value={newTaxName} onChange={(e) => setNewTaxName(e.target.value)} /><button className="btn">Create</button></div><small>Categories: {taxonomy.categories.length} | Tags: {taxonomy.tags.length}</small><div className="grid2" style={{ marginTop: 10 }}><div><strong>Categories</strong>{taxonomy.categories.map((c) => <div key={c.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "4px 0" }}><small>{c.name} ({c.slug})</small><button type="button" className="deleteBtn" style={{ marginTop: 0, maxWidth: 90, padding: "6px 8px" }} onClick={() => deleteTaxonomyItem("category", c.id)}>Delete</button></div>)}</div><div><strong>Tags</strong>{taxonomy.tags.map((t) => <div key={t.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "4px 0" }}><small>{t.name} ({t.slug})</small><button type="button" className="deleteBtn" style={{ marginTop: 0, maxWidth: 90, padding: "6px 8px" }} onClick={() => deleteTaxonomyItem("tag", t.id)}>Delete</button></div>)}</div></div></form>{selectedPostId && <div className="card"><h3>Revisions for {selectedPostId}</h3>{revisions.map((r) => <div key={r.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "6px 0" }}><span><strong>{r.title || "(untitled)"}</strong><br /><small>{new Date(r.created_at).toLocaleString()} - {r.created_by_name || r.created_by || "unknown"}</small></span><button className="btn ghostBtn" onClick={() => restoreRevision(r.id)}>Restore</button></div>)}{revisions.length === 0 && <small>No revisions.</small>}</div>}</>}

        {active === "users" && <><form className="card" onSubmit={createAdminUser}><h3>User Management (super admin)</h3><div className="grid2"><input placeholder="name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /><input placeholder="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /><input placeholder="password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option value="editor">editor (đăng bài)</option><option value="admin">admin</option><option value="super_admin">super_admin</option></select></div><button className="btn">Create user</button></form><div className="card"><h3>Users</h3>{(users || []).map((u) => <div key={u.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #ddd", padding: "8px 0" }}><span>{u.name} ({u.email}) - {u.role} - {u.status}</span><div className="row"><button className="btn ghostBtn" onClick={() => userAction(u.id, "activate")}>Activate</button><button className="btn ghostBtn" onClick={() => userAction(u.id, "block")}>Block</button><button className="deleteBtn" onClick={() => userAction(u.id, "delete")}>Delete</button></div></div>)}</div></>}

        {active === "backup" && <div className="card"><h3>Backup toàn diện</h3><p>Tạo snapshot dữ liệu DB + bản sao thư mục uploads vào /backups/timestamp</p><div className="row"><button className={`btn ${busyKey === "create-backup" ? "loading" : ""}`} disabled={busyKey === "create-backup"} onClick={createBackup}>Create Backup</button><button className="btn ghostBtn" onClick={loadBackups}>Refresh</button></div><div style={{ marginTop: 12, display: "grid", gap: 8 }}>{backupLoading && <small>Đang tải danh sách backup...</small>}{!backupLoading && backups.length === 0 && <small>Chưa có backup nào.</small>}{backups.map((b) => <div key={b.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: 8 }}><div><strong>{b.id}</strong><div><small>{new Date(b.createdAt).toLocaleString()}</small></div><div><small>{b.path}</small></div></div><button className={`deleteBtn ${busyKey === `delete-backup-${b.id}` ? "loading" : ""}`} disabled={busyKey === `delete-backup-${b.id}`} style={{ marginTop: 0, maxWidth: 140 }} onClick={() => deleteBackup(b.id)}>Xoá backup</button></div>)}</div></div>}

        {active === "audit" && <div className="card"><h3>Audit log quản trị</h3><p>Ghi nhận mọi thao tác admin/super admin gần đây.</p><div className="row"><button className="btn ghostBtn" onClick={loadAuditLogs}>Refresh</button></div><div style={{ marginTop: 12, overflowX: "auto" }}>{auditLoading && <small>Đang tải audit log...</small>}{!auditLoading && auditLogs.length === 0 && <small>Chưa có log.</small>}{!auditLoading && auditLogs.length > 0 && <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr><th align="left">Time</th><th align="left">Actor</th><th align="left">Action</th><th align="left">Target</th><th align="left">Status</th><th align="left">IP</th></tr></thead><tbody>{auditLogs.map((x) => <tr key={x.id} style={{ borderTop: "1px solid #eee" }}><td>{new Date(x.created_at).toLocaleString()}</td><td>{x.actor_email || x.actor_id || "-"}</td><td>{x.action}</td><td>{x.target || "-"}</td><td>{x.status}</td><td>{x.ip || "-"}</td></tr>)}</tbody></table>}</div></div>}

        {confirmState.open && (
          <div className="editorModal">
            <div className="editorModalCard">
              <h4>Xác nhận thao tác</h4>
              <p>{confirmState.message}</p>
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button
                  className="btn ghostBtn"
                  onClick={() => setConfirmState({ open: false, message: "", onConfirm: null })}
                >
                  Huỷ
                </button>
                <button
                  className={`btn ${busyKey ? "loading" : ""}`}
                  disabled={!!busyKey}
                  onClick={async () => {
                    const fn = confirmState.onConfirm;
                    setConfirmState({ open: false, message: "", onConfirm: null });
                    if (fn) await fn();
                  }}
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
