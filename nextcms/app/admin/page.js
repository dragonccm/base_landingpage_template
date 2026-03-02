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

const themeKeywords = ["color", "font", "bg", "icon", "title", "shadow"];

export default function Admin() {
  const dispatch = useDispatch();
  const { landing, settings, media, contacts, users, posts, active, loading } = useSelector((s) => s.admin);
  const [saving, setSaving] = useState(false);
  const [busyKey, setBusyKey] = useState("");
  const [currentRole, setCurrentRole] = useState("admin");

  const [landingSearch, setLandingSearch] = useState("");
  const [smtpTestEmail, setSmtpTestEmail] = useState("");
  const [smtpStatus, setSmtpStatus] = useState("");

  const [upload, setUpload] = useState({ url: "", name: "", alt: "" });
  const [postForm, setPostForm] = useState({ title: "", slug: "", excerpt: "", contentHtml: "", status: "draft", categoryId: "", tagIds: [], coverImage: "" });
  const [postFilters, setPostFilters] = useState({ q: "", status: "", sort: "newest" });
  const [postList, setPostList] = useState([]);
  const [taxonomy, setTaxonomy] = useState({ categories: [], tags: [] });
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxType, setNewTaxType] = useState("category");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [revisions, setRevisions] = useState([]);

  const [userForm, setUserForm] = useState({
    name: "", email: "", password: "", role: "admin", bio: "", avatarUrl: "", title: "", company: "", website: "", linkedinUrl: "", twitterUrl: ""
  });
  const [backups, setBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const setLandingField = (group, key, value) => dispatch(setLandingState({ ...landing, [group]: { ...landing[group], [key]: value } }));
  const setSettingsField = (group, key, value) => dispatch(setSettingsState({ ...settings, [group]: { ...settings[group], [key]: value } }));

  async function withLoading(key, fn) {
    setBusyKey(key);
    try { return await fn(); } finally { setBusyKey(""); }
  }

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
    if (active === "posts") {
      loadPosts();
      loadTaxonomy();
    }
    if (active === "backup") loadBackups();
    if (active === "audit") loadAuditLogs();
  }, [active]);

  const stats = useMemo(() => ({
    media: media?.length || 0,
    contacts: contacts?.length || 0,
    users: users?.length || 0,
    posts: posts?.length || 0,
    drafts: (posts || []).filter((p) => p.status === "draft").length,
    published: (posts || []).filter((p) => p.status === "published").length,
  }), [media, contacts, users, posts]);

  const dashboardProgress = useMemo(() => {
    const items = [
      { name: "Landing cấu hình", done: !!landing },
      { name: "SMTP cấu hình", done: !!settings?.smtp?.host },
      { name: "Security baseline", done: !!settings?.security?.maxLoginAttempts },
      { name: "Posts workflow", done: postList.length >= 0 },
    ];
    const doneCount = items.filter((x) => x.done).length;
    return { items, pct: Math.round((doneCount / items.length) * 100) };
  }, [landing, settings, postList]);

  const groupedLanding = useMemo(() => {
    if (!landing) return { design: [], content: [] };
    const q = landingSearch.trim().toLowerCase();
    const match = (k, v) => !q || `${k} ${String(v || "")}`.toLowerCase().includes(q);
    const design = Object.entries(landing.theme || {}).filter(([k, v]) => match(k, v));
    const content = Object.entries(landing.content || {}).filter(([k, v]) => match(k, v));
    return { design, content };
  }, [landing, landingSearch]);

  async function saveLanding() {
    setSaving(true);
    const res = await fetch("/api/admin/landing", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(landing) });
    setSaving(false);
    if (!res.ok) return toast.error("Lưu landing thất bại");
    toast.success("Lưu landing thành công");
  }

  async function saveSettings(options = { testSmtp: false }) {
    setSaving(true);
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(settings) });
    if (!res.ok) {
      setSaving(false);
      return toast.error("Lưu cài đặt thất bại");
    }

    if (options.testSmtp) {
      const t = await fetch("/api/admin/settings/smtp-test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ smtp: settings.smtp }) });
      const td = await t.json().catch(() => ({}));
      setSmtpStatus(td?.message || td?.error || "");
      if (!t.ok) toast.error(td.error || "Test SMTP lỗi");
      else toast.success(td.message || "SMTP OK");
    } else {
      toast.success("Lưu cài đặt thành công");
    }

    setSaving(false);
  }

  async function sendSmtpTest() {
    await withLoading("smtp-send-test", async () => {
      const res = await fetch("/api/admin/settings/smtp-send-test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ smtp: settings.smtp, toEmail: smtpTestEmail || settings.smtp.toEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(data.error || "Gửi mail test thất bại");
      toast.success(data.message || "Đã gửi mail test");
    });
  }

  async function addMedia(e) {
    e.preventDefault();
    await withLoading("add-media", async () => {
      if (!upload.url) return toast.error("Vui lòng chọn/upload ảnh trước");
      const res = await fetch("/api/admin/media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(upload) });
      if (!res.ok) return toast.error("Thêm media lỗi");
      setUpload({ url: "", name: "", alt: "" });
      toast.success("Thêm media thành công");
      dispatch(fetchAdminData());
    });
  }

  async function removeMedia(id) {
    await withLoading(`remove-media-${id}`, async () => {
      await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      toast.info("Đã xoá media");
      dispatch(fetchAdminData());
    });
  }

  async function setContactStatus(id, status) {
    const res = await fetch("/api/admin/contacts", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!res.ok) return toast.error("Cập nhật trạng thái thất bại");
    dispatch(fetchAdminData());
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

  async function createPostItem(e) {
    e.preventDefault();
    await withLoading("create-post", async () => {
      if (!postForm.title) return toast.error("Thiếu tiêu đề");
      const res = await fetch("/api/admin/posts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(postForm) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(data.error || "Không tạo được bài viết");
      toast.success("Đã tạo bài viết");
      setPostForm({ title: "", slug: "", excerpt: "", contentHtml: "", status: "draft", categoryId: "", tagIds: [], coverImage: "" });
      await loadPosts();
      if (currentRole !== "editor") dispatch(fetchAdminData());
    });
  }

  async function postAction(id, action) {
    if (action === "delete") {
      return withLoading(`post-delete-${id}`, async () => {
        const res = await fetch(`/api/admin/posts?id=${id}`, { method: "DELETE" });
        if (!res.ok) return toast.error("Xoá bài viết thất bại");
        toast.info("Đã xoá bài viết");
        await loadPosts();
      });
    }

    const status = action === "publish" ? "published" : "draft";
    await withLoading(`post-${action}-${id}`, async () => {
      const payload = { id, status, publishedAt: status === "published" ? new Date().toISOString() : null };
      const res = await fetch("/api/admin/posts", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(data.error || "Cập nhật bài viết thất bại");
      toast.success("Đã cập nhật bài viết");
      await loadPosts();
    });
  }

  async function createTaxonomyItem(e) {
    e.preventDefault();
    if (!newTaxName.trim()) return;
    const res = await fetch("/api/admin/post-taxonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: newTaxType, name: newTaxName.trim() }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || "Không tạo được taxonomy");
    setNewTaxName("");
    await loadTaxonomy();
    toast.success("Đã tạo taxonomy");
  }

  async function loadRevisions(postId) {
    setSelectedPostId(postId);
    const res = await fetch(`/api/admin/post-revisions?postId=${encodeURIComponent(postId)}`);
    const data = await res.json().catch(() => ({}));
    setRevisions(data.items || []);
  }

  async function restoreRevision(revisionId) {
    const res = await fetch("/api/admin/post-revisions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ revisionId }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error || "Khôi phục revision thất bại");
    toast.success("Đã khôi phục revision");
    if (selectedPostId) await loadRevisions(selectedPostId);
    await loadPosts();
  }

  async function createAdminUser(e) {
    e.preventDefault();
    await withLoading("create-user", async () => {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(userForm) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(data.error || "Không tạo được tài khoản");
      toast.success("Đã tạo tài khoản");
      setUserForm({ name: "", email: "", password: "", role: "admin", bio: "", avatarUrl: "", title: "", company: "", website: "", linkedinUrl: "", twitterUrl: "" });
      dispatch(fetchAdminData());
    });
  }

  async function userAction(id, action) {
    const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action }) });
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

  async function loadAuditLogs() {
    const res = await fetch("/api/admin/audit-logs?limit=100");
    const data = await res.json().catch(() => ({}));
    setAuditLogs(data.items || []);
  }

  const visibleTabs = currentRole === "editor" ? editorTabs : tabs;
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
        <header className="panelHeader"><h1>Admin Dashboard</h1><a href="/" target="_blank">Open Site</a></header>

        {active === "dashboard" && (
          <>
            <div className="grid3">
              <article className="card kpi"><h3>Media</h3><strong>{stats.media}</strong></article>
              <article className="card kpi"><h3>Contacts</h3><strong>{stats.contacts}</strong></article>
              <article className="card kpi"><h3>Users</h3><strong>{stats.users}</strong></article>
              <article className="card kpi"><h3>Posts</h3><strong>{stats.posts}</strong></article>
              <article className="card kpi"><h3>Drafts</h3><strong>{stats.drafts}</strong></article>
              <article className="card kpi"><h3>Published</h3><strong>{stats.published}</strong></article>
            </div>
            <div className="card">
              <h3>Audit + Progress</h3>
              <p>Tiến độ nâng cấp hiện tại: <strong>{dashboardProgress.pct}%</strong></p>
              <ul>{dashboardProgress.items.map((it) => <li key={it.name}>{it.done ? "✅" : "🟡"} {it.name}</li>)}</ul>
              <small>Gợi ý: dùng tab Audit để xem log thao tác chi tiết.</small>
            </div>
          </>
        )}

        {active === "landing" && (
          <div className="card">
            <h3>Landing Config</h3>
            <input placeholder="Tìm trường cấu hình..." value={landingSearch} onChange={(e) => setLandingSearch(e.target.value)} />

            <div className="groupCard">
              <h4>Design Tokens (màu/font/theme)</h4>
              <div className="grid2">
                {groupedLanding.design.map(([k, v]) => (
                  <label key={k} className="fieldWrap">
                    <span className="fieldLabel">{k}</span>
                    {themeKeywords.some((w) => k.toLowerCase().includes(w)) ? (
                      <input value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} />
                    ) : (
                      <input value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="groupCard">
              <h4>Content by Sections</h4>
              <div className="grid2">
                {groupedLanding.content.map(([k, v]) => (
                  <label key={k} className="fieldWrap">
                    <span className="fieldLabel">{k}</span>
                    <textarea rows={3} value={v} onChange={(e) => setLandingField("content", k, e.target.value)} />
                  </label>
                ))}
              </div>
            </div>

            <button className={`btn ${saving ? "loading" : ""}`} onClick={saveLanding} disabled={saving}>Save Landing</button>
          </div>
        )}

        {active === "seo" && (
          <div className="card">
            <h3>SEO Metadata</h3>
            <div className="grid2">
              {Object.entries(settings.seo || {}).map(([k, v]) => (
                k.toLowerCase().includes("image")
                  ? <ImageField key={k} label={k} value={v || ""} onChange={(nv) => setSettingsField("seo", k, nv)} />
                  : <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><textarea rows={2} value={v || ""} onChange={(e) => setSettingsField("seo", k, e.target.value)} /></label>
              ))}
            </div>
            <button className={`btn ${saving ? "loading" : ""}`} onClick={() => saveSettings()} disabled={saving}>Save SEO</button>
          </div>
        )}

        {active === "identity" && <div className="card"><h3>Identity</h3><div className="grid2">{Object.entries(settings.identity || {}).map(([k, v]) => k.toLowerCase().includes("logo") || k.toLowerCase().includes("favicon") ? <ImageField key={k} label={k} value={v || ""} onChange={(nv) => setSettingsField("identity", k, nv)} /> : <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input value={v || ""} onChange={(e) => setSettingsField("identity", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={() => saveSettings()} disabled={saving}>Save Identity</button></div>}

        {active === "smtp" && (
          <div className="card">
            <h3>SMTP</h3>
            <div className="grid2">{Object.entries(settings.smtp || {}).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input type={k.toLowerCase().includes("pass") ? "password" : "text"} value={v || ""} onChange={(e) => setSettingsField("smtp", k, e.target.value)} /></label>)}</div>
            {smtpStatus && <small>{smtpStatus}</small>}
            <div className="row">
              <button className={`btn ${saving ? "loading" : ""}`} onClick={() => saveSettings({ testSmtp: true })} disabled={saving}>Save + Test SMTP</button>
              <input placeholder="email nhận mail test" value={smtpTestEmail} onChange={(e) => setSmtpTestEmail(e.target.value)} />
              <button className={`btn ghostBtn ${busyKey === "smtp-send-test" ? "loading" : ""}`} disabled={busyKey === "smtp-send-test"} onClick={sendSmtpTest}>Send test email</button>
            </div>
          </div>
        )}

        {active === "security" && (
          <div className="card">
            <h3>Security Baseline</h3>
            <p>Đây là baseline cho staging/internal. Chưa phải full production hardening.</p>
            <div className="grid2">{Object.entries(settings.security || {}).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input value={v || ""} onChange={(e) => setSettingsField("security", k, e.target.value)} /></label>)}</div>
            <button className={`btn ${saving ? "loading" : ""}`} onClick={() => saveSettings()} disabled={saving}>Save Security</button>
          </div>
        )}

        {active === "media" && <><form className="card" onSubmit={addMedia}><h3>Media Manager</h3><ImageField label="Media File" value={upload.url} mediaType="any" onChange={(v, type) => setUpload({ ...upload, url: v, type: type || upload.type })} /><div className="grid2"><label className="fieldWrap"><span className="fieldLabel">name</span><input value={upload.name} onChange={(e) => setUpload({ ...upload, name: e.target.value })} /></label><label className="fieldWrap"><span className="fieldLabel">alt</span><input value={upload.alt} onChange={(e) => setUpload({ ...upload, alt: e.target.value })} /></label></div><button className={`btn ${busyKey === "add-media" ? "loading" : ""}`} disabled={busyKey === "add-media"}>Add Media</button></form><div className="mediaGrid">{(media || []).map((m) => <article key={m.id} className="card mediaCard">{(m.type === "video" || /\.(mp4|webm|mov)$/i.test(m.url)) ? <video src={m.url} controls className="mediaThumb" /> : <img src={m.url} alt={m.alt || m.name} className="mediaThumb" />}<div className="row"><button className={`deleteBtn ${busyKey === `remove-media-${m.id}` ? "loading" : ""}`} onClick={() => removeMedia(m.id)}><Trash2 size={16} /> Xoá</button></div></article>)}</div></>}

        {active === "contacts" && <div className="card"><h3>Contact submissions</h3><div style={{ display: "grid", gap: 20 }}>{(contacts || []).map((c) => <article key={c.id} className="card"><strong>{c.first_name} {c.last_name} - {c.email}</strong><p>{c.message}</p><small>{new Date(c.created_at).toLocaleString()}</small><div className="row"><button className="btn ghostBtn" onClick={() => setContactStatus(c.id, "reviewed")}>Mark Reviewed</button><button className="btn" onClick={() => setContactStatus(c.id, "resolved")}>Mark Resolved</button></div></article>)}</div></div>}

        {active === "posts" && (
          <>
            <form className="card postEditorShell" onSubmit={createPostItem}>
              <div className="postMainCol">
                <h3>Post Editor</h3>
                <input placeholder="title" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
                <input placeholder="slug (optional)" value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} />
                <RichPostEditor mediaItems={(media || []).filter((m) => m.type !== "video")} value={postForm.contentHtml} onChange={(v) => setPostForm({ ...postForm, contentHtml: v })} />
                <button className={`btn ${busyKey === "create-post" ? "loading" : ""}`} disabled={busyKey === "create-post"}>Create post</button>
              </div>

              <aside className="postSideCol">
                <h4>Post Meta</h4>
                <label className="fieldWrap"><span className="fieldLabel">Excerpt</span><textarea rows={4} value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} /></label>
                <label className="fieldWrap"><span className="fieldLabel">Status</span><select value={postForm.status} onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}><option value="draft">draft</option><option value="review">review</option><option value="published">published</option><option value="scheduled">scheduled</option></select></label>
                <label className="fieldWrap"><span className="fieldLabel">Category</span><select value={postForm.categoryId} onChange={(e) => setPostForm({ ...postForm, categoryId: e.target.value })}><option value="">No category</option>{taxonomy.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                <label className="fieldWrap"><span className="fieldLabel">Tags (comma id)</span><input value={(postForm.tagIds || []).join(",")} onChange={(e) => setPostForm({ ...postForm, tagIds: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></label>
                <ImageField label="Review/Cover image" value={postForm.coverImage || ""} mediaType="image" onChange={(v) => setPostForm({ ...postForm, coverImage: v })} onUploaded={() => dispatch(fetchAdminData())} />
              </aside>
            </form>

            <div className="card"><h3>Posts</h3><div className="row"><input placeholder="Search full-text" value={postFilters.q} onChange={(e) => setPostFilters({ ...postFilters, q: e.target.value })} /><select value={postFilters.status} onChange={(e) => setPostFilters({ ...postFilters, status: e.target.value })}><option value="">All status</option><option value="draft">draft</option><option value="review">review</option><option value="published">published</option><option value="scheduled">scheduled</option><option value="archived">archived</option></select><select value={postFilters.sort} onChange={(e) => setPostFilters({ ...postFilters, sort: e.target.value })}><option value="newest">newest</option><option value="oldest">oldest</option></select><button className="btn ghostBtn" onClick={() => loadPosts()}>Apply</button></div>{(postList || []).map((p) => <div key={p.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #ddd", padding: "8px 0" }}><span><strong>{p.title}</strong><br /><small>/{p.slug} - {p.status}</small></span><div className="row"><button className={`btn ghostBtn ${busyKey === `post-publish-${p.id}` ? "loading" : ""}`} disabled={busyKey === `post-publish-${p.id}`} onClick={() => postAction(p.id, "publish")}>Publish</button><button className={`btn ghostBtn ${busyKey === `post-draft-${p.id}` ? "loading" : ""}`} disabled={busyKey === `post-draft-${p.id}`} onClick={() => postAction(p.id, "draft")}>Draft</button><button className="btn ghostBtn" onClick={() => loadRevisions(p.id)}>Revisions</button><button className={`deleteBtn ${busyKey === `post-delete-${p.id}` ? "loading" : ""}`} disabled={busyKey === `post-delete-${p.id}`} style={{ marginTop: 0 }} onClick={() => postAction(p.id, "delete")}>Delete</button></div></div>)}</div>
            <form className="card" onSubmit={createTaxonomyItem}><h3>Taxonomy</h3><div className="row"><select value={newTaxType} onChange={(e) => setNewTaxType(e.target.value)}><option value="category">category</option><option value="tag">tag</option></select><input placeholder="name" value={newTaxName} onChange={(e) => setNewTaxName(e.target.value)} /><button className="btn">Create</button></div></form>
            {selectedPostId && <div className="card"><h3>Revisions for {selectedPostId}</h3>{revisions.map((r) => <div key={r.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "6px 0" }}><span><strong>{r.title || "(untitled)"}</strong><br /><small>{new Date(r.created_at).toLocaleString()}</small></span><button className="btn ghostBtn" onClick={() => restoreRevision(r.id)}>Restore</button></div>)}</div>}
          </>
        )}

        {active === "users" && <><form className="card" onSubmit={createAdminUser}><h3>User Management</h3><div className="grid2"><input placeholder="name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /><input placeholder="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /><input placeholder="password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option value="editor">editor</option><option value="admin">admin</option><option value="super_admin">super_admin</option></select><input placeholder="author title" value={userForm.title} onChange={(e) => setUserForm({ ...userForm, title: e.target.value })} /><input placeholder="company" value={userForm.company} onChange={(e) => setUserForm({ ...userForm, company: e.target.value })} /><input placeholder="website" value={userForm.website} onChange={(e) => setUserForm({ ...userForm, website: e.target.value })} /><input placeholder="avatar url" value={userForm.avatarUrl} onChange={(e) => setUserForm({ ...userForm, avatarUrl: e.target.value })} /><input placeholder="linkedin url" value={userForm.linkedinUrl} onChange={(e) => setUserForm({ ...userForm, linkedinUrl: e.target.value })} /><input placeholder="twitter/x url" value={userForm.twitterUrl} onChange={(e) => setUserForm({ ...userForm, twitterUrl: e.target.value })} /></div><label className="fieldWrap"><span className="fieldLabel">Bio tác giả</span><textarea rows={4} value={userForm.bio} onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })} /></label><button className={`btn ${busyKey === "create-user" ? "loading" : ""}`} disabled={busyKey === "create-user"}>Create user</button></form><div className="card"><h3>Users</h3>{(users || []).map((u) => <div key={u.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid #ddd", padding: "8px 0", alignItems: "start" }}><span><strong>{u.name}</strong> ({u.email}) - {u.role} - {u.status}<br /><small>{u.title || ""} {u.company ? `@ ${u.company}` : ""}</small></span><div className="row"><button className="btn ghostBtn" onClick={() => userAction(u.id, "activate")}>Activate</button><button className="btn ghostBtn" onClick={() => userAction(u.id, "block")}>Block</button><button className="deleteBtn" onClick={() => userAction(u.id, "delete")}>Delete</button></div></div>)}</div></>}

        {active === "backup" && <div className="card"><h3>Backup</h3><div className="row"><button className={`btn ${busyKey === "create-backup" ? "loading" : ""}`} disabled={busyKey === "create-backup"} onClick={createBackup}>Create Backup</button><button className="btn ghostBtn" onClick={loadBackups}>Refresh</button></div><div style={{ marginTop: 12, display: "grid", gap: 20 }}>{backupLoading && <small>Đang tải...</small>}{backups.map((b) => <div key={b.id}><strong>{b.id}</strong><div><small>{b.path}</small></div></div>)}</div></div>}

        {active === "audit" && <div className="card"><h3>Audit log</h3><button className="btn ghostBtn" onClick={loadAuditLogs}>Refresh</button><div style={{ marginTop: 12, overflowX: "auto" }}>{auditLogs.length > 0 && <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr><th align="left">Time</th><th align="left">Actor</th><th align="left">Action</th><th align="left">Target</th><th align="left">Status</th></tr></thead><tbody>{auditLogs.map((x) => <tr key={x.id} style={{ borderTop: "1px solid #eee" }}><td>{new Date(x.created_at).toLocaleString()}</td><td>{x.actor_email || x.actor_id || "-"}</td><td>{x.action}</td><td>{x.target || "-"}</td><td>{x.status}</td></tr>)}</tbody></table>}</div></div>}
      </section>
    </main>
  );
}
