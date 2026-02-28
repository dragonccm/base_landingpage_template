"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch('/api/landing').then(r=>r.json()).then(d=>setData(d.data)); }, []);
  if (!data) return <main>Loading...</main>;
  const t = data.theme; const c = data.content;
  return <main style={{ fontFamily: t.fontFamily, background: t.bgColor, color: t.textColor, minHeight:'100vh' }}>
    <div className="card" style={{ borderColor: t.primaryColor }}>
      <h1>{c.title}</h1><p>{c.subtitle}</p><button className="btn" style={{ background: t.primaryColor }}>{c.cta}</button>
    </div>
    <div className="card"><h3>Section 1</h3><p>{c.section1}</p></div>
    <div className="card"><h3>Section 2</h3><p>{c.section2}</p></div>
    <div className="row"><a href="/login">Login</a><a href="/admin">Admin</a></div>
  </main>;
}
