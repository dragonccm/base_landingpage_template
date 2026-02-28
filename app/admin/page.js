"use client";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminData, setActiveTab, setLandingState, setSettingsState } from "@/store/adminSlice";
import ImageField from "@/components/ImageField";
import { toast } from "@/lib/toast";

const tabs = ["dashboard", "landing", "seo", "identity", "media"];

const contentGroups = [
  { id: "hero", label: "Hero Section", titleKey: "title", children: ["heroBadge", "subtitle", "cta", "cta2", "chip1", "chip2", "chip3", "chip4"] },
  { id: "nav", label: "Navigation", titleKey: "nav1", children: ["nav2", "nav3", "nav4", "nav5", "nav6", "navCta"] },
  { id: "goals", label: "Goals & Mission", titleKey: "goalsTitle", children: ["goalsSubtitle", "goal1Title", "goal1Desc", "goal2Title", "goal2Desc", "goal3Title", "goal3Desc", "goal4Title", "goal4Desc"] },
  { id: "functions", label: "Functions", titleKey: "functionsTitle", children: ["function1", "function2", "function3", "function4", "function5", "function6"] },
  { id: "focus", label: "Focus Areas", titleKey: "focusTitle", children: ["focus1Label", "focus1Title", "focus1Desc", "focus2Label", "focus2Title", "focus2Desc", "focus3Label", "focus3Title", "focus3Desc", "focus4Label", "focus4Title", "focus4Desc"] },
  { id: "research", label: "Research", titleKey: "researchTitle", children: ["timeline1Title", "timeline1Desc", "timeline2Title", "timeline2Desc", "timeline3Title", "timeline3Desc", "timeline4Title", "timeline4Desc", "timeline5Title", "timeline5Desc", "stat1Value", "stat1Label", "stat2Value", "stat2Label", "stat3Value", "stat3Label", "stat4Value", "stat4Label"] },
  { id: "contact", label: "Contact", titleKey: "contactTitle", children: ["formTitle", "firstNamePlaceholder", "lastNamePlaceholder", "emailPlaceholder", "messagePlaceholder", "submitText", "addressTitle", "addressText", "phoneTitle", "phoneText", "supportEmailTitle", "supportEmailText", "workTimeTitle", "workTimeText"] },
  { id: "footer", label: "Footer", titleKey: "footerText", children: ["footerCol2Title", "footerCol2Text", "footerCol3Title", "footerCol3Text", "footerCol4Title", "footerCol4Text"] },
];

export default function Admin() {
  const dispatch = useDispatch();
  const { landing, settings, media, active, loading } = useSelector((s) => s.admin);
  const [upload, setUpload] = useState({ url: "", name: "", alt: "" });
  const [saving, setSaving] = useState(false);
  const [addingMedia, setAddingMedia] = useState(false);
  const [expanded, setExpanded] = useState({ hero: true });

  useEffect(() => { dispatch(fetchAdminData()); }, [dispatch]);

  const setLandingField = (group, key, value) => dispatch(setLandingState({ ...landing, [group]: { ...landing[group], [key]: value } }));
  const setSettingsField = (group, key, value) => dispatch(setSettingsState({ ...settings, [group]: { ...settings[group], [key]: value } }));
  const toggleGroup = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

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
    setAddingMedia(true);
    const res = await fetch("/api/admin/media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(upload) });
    setAddingMedia(false);
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

  const stats = useMemo(() => ({ media: media?.length || 0, contentFields: landing ? Object.keys(landing.content || {}).length : 0, seoFields: settings ? Object.keys(settings.seo || {}).length : 0 }), [media, landing, settings]);

  if (loading || !landing || !settings) return <main className="adminShell"><aside className="sidebar" /><section className="mainPanel"><div className="skeleton lg" /><div className="skeleton" /><div className="skeleton" /></section></main>;

  const t = landing.theme;

  return (
    <main className="adminShell">
      <aside className="sidebar">
        <h2>NextCMS</h2>
        {tabs.map((x) => <button key={x} className={`navBtn ${active === x ? "active" : ""}`} onClick={() => dispatch(setActiveTab(x))}>{x.toUpperCase()}</button>)}
      </aside>

      <section className="mainPanel">
        <header className="panelHeader">
          <div><h1>Admin Dashboard</h1><p>White UI + Black sidebar + accents #75323c / #dab772</p></div>
          <div className="row"><a href="/" target="_blank">Open Site</a><button className={`btn ${saving ? "loading" : ""}`} disabled={saving}>{saving ? "Saving..." : "Ready"}</button></div>
        </header>

        {active === "dashboard" && <div className="grid3"><article className="card kpi"><h3>Media</h3><strong>{stats.media}</strong></article><article className="card kpi"><h3>Content Fields</h3><strong>{stats.contentFields}</strong></article><article className="card kpi"><h3>SEO Fields</h3><strong>{stats.seoFields}</strong></article></div>}

        {active === "landing" && <>
          <div className="card">
            <h3>Theme</h3>
            <div className="grid2">
              {Object.entries(landing.theme).map(([k, v]) => (
                <label key={k} className="fieldWrap">
                  <span className="fieldLabel">{k}</span>
                  {k.toLowerCase().includes("color") ? (
                    <div className="colorPickWrap"><span className="colorSwatch" style={{ background: v }} /><input type="color" value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} /><input value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} /></div>
                  ) : <input value={v} onChange={(e) => setLandingField("theme", k, e.target.value)} />}
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Content Editor (Level-based)</h3>
            {contentGroups.map((g) => (
              <div key={g.id} className="groupCard">
                <div className="groupHead">
                  <strong>{g.label}</strong>
                  <button type="button" className="btn ghostBtn" onClick={() => toggleGroup(g.id)}>{expanded[g.id] ? "Ẩn nội dung con" : "Show thêm"}</button>
                </div>
                <label className="fieldWrap">
                  <span className="fieldLabel">{g.titleKey} (cấp cao)</span>
                  <textarea rows={2} value={landing.content[g.titleKey] || ""} onChange={(e) => setLandingField("content", g.titleKey, e.target.value)} />
                </label>
                {expanded[g.id] && (
                  <div className="grid2">
                    {g.children.map((k) => (
                      <label key={k} className="fieldWrap">
                        <span className="fieldLabel">{k}</span>
                        <textarea rows={3} value={landing.content[k] || ""} onChange={(e) => setLandingField("content", k, e.target.value)} />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button className={`btn ${saving ? "loading" : ""}`} onClick={saveLanding} disabled={saving}>Save Landing</button>
          </div>

          <div className="card" style={{ borderColor: t.primaryColor }}><h3>Live Preview</h3><div className="previewBox" style={{ fontFamily: t.fontFamily, color: t.textColor, background: t.bgColor }}><h2>{landing.content.title}</h2><p>{landing.content.subtitle}</p><button className="btn" style={{ background: t.primaryColor }}>{landing.content.cta}</button></div></div>
        </>}

        {active === "seo" && <div className="card"><h3>SEO Metadata</h3><div className="grid2">{Object.entries(settings.seo).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><textarea rows={3} value={v} onChange={(e) => setSettingsField("seo", k, e.target.value)} /></label>)}</div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save SEO</button></div>}

        {active === "identity" && <div className="card"><h3>Identity</h3><div className="grid2">{Object.entries(settings.identity).filter(([k]) => !k.toLowerCase().includes("logo") && !k.toLowerCase().includes("favicon")).map(([k, v]) => <label key={k} className="fieldWrap"><span className="fieldLabel">{k}</span><input value={v} onChange={(e) => setSettingsField("identity", k, e.target.value)} /></label>)}</div><div className="grid2"><ImageField label="logoUrl" value={settings.identity.logoUrl} onChange={(v) => setSettingsField("identity", "logoUrl", v)} /><ImageField label="faviconUrl" value={settings.identity.faviconUrl} onChange={(v) => setSettingsField("identity", "faviconUrl", v)} /></div><button className={`btn ${saving ? "loading" : ""}`} onClick={saveSettings} disabled={saving}>Save Identity</button></div>}

        {active === "media" && <>
          <form className="card" onSubmit={addMedia}>
            <h3>Media Manager</h3>
            <ImageField label="Media Image" value={upload.url} onChange={(v) => setUpload({ ...upload, url: v })} />
            <div className="grid2"><label className="fieldWrap"><span className="fieldLabel">name</span><input value={upload.name} onChange={(e) => setUpload({ ...upload, name: e.target.value })} /></label><label className="fieldWrap"><span className="fieldLabel">alt</span><input value={upload.alt} onChange={(e) => setUpload({ ...upload, alt: e.target.value })} /></label></div>
            <button className={`btn ${addingMedia ? "loading" : ""}`} disabled={addingMedia}>{addingMedia ? "Adding..." : "Add Media"}</button>
          </form>
          <div className="mediaGrid">{media.map((m) => <article key={m.id} className="card"><img src={m.url} alt={m.alt || m.name} /><h4>{m.name}</h4><p>{m.alt}</p><button className="btn danger" onClick={() => removeMedia(m.id)}>Delete</button></article>)}</div>
        </>}
      </section>
    </main>
  );
}
