"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [landing, setLanding] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/api/landing").then((r) => r.json()).then((d) => setLanding(d.data));
    fetch("/api/settings").then((r) => r.json()).then((d) => setSettings(d.data));
  }, []);

  if (!landing || !settings) return <main className="pageWrap"><div className="skeleton lg" /><div className="skeleton" /><div className="skeleton" /></main>;

  const t = landing.theme;
  const c = landing.content;
  const i = settings.identity;

  return (
    <main className="pageWrap" style={{ fontFamily: t.fontFamily, background: t.bgColor, color: t.textColor }}>
      <header className="publicHeader card" style={{ borderColor: t.primaryColor }}>
        <div className="row">
          {i.logoUrl ? <img src={i.logoUrl} alt="logo" className="logoPreview" /> : <div className="logoFallback">N</div>}
          <div>
            <h2>{i.siteTitle}</h2>
            <p>{i.siteTagline}</p>
          </div>
        </div>
        <div className="row"><a href="/login">Login</a><a href="/admin">Admin</a></div>
      </header>

      <section className="card" style={{ borderColor: t.secondaryColor }}>
        <h1>{c.title}</h1>
        <p>{c.subtitle}</p>
        <button className="btn" style={{ background: t.primaryColor }}>{c.cta}</button>
      </section>
      <section className="card"><h3>Section 1</h3><div className="richOut" dangerouslySetInnerHTML={{ __html: c.section1 }} /></section>
      <section className="card"><h3>Section 2</h3><div className="richOut" dangerouslySetInnerHTML={{ __html: c.section2 }} /></section>
    </main>
  );
}
