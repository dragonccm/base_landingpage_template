"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLanding, fetchSettings } from "@/store/siteSlice";

export default function Home() {
  const dispatch = useDispatch();
  const { landing, settings, loading } = useSelector((s) => s.site);

  useEffect(() => {
    dispatch(fetchLanding());
    dispatch(fetchSettings());
  }, [dispatch]);

  if (loading || !landing || !settings) return <main className="landing"><div className="container"><div className="skeleton lg" /><div className="skeleton" /><div className="skeleton" /></div></main>;

  const t = landing.theme;
  const c = landing.content;
  const i = settings.identity;
  const navs = [c.nav1, c.nav2, c.nav3, c.nav4, c.nav5, c.nav6].filter(Boolean);
  const chips = [c.chip1, c.chip2, c.chip3, c.chip4].filter(Boolean);

  const goals = [
    [c.goal1Title, c.goal1Desc],
    [c.goal2Title, c.goal2Desc],
    [c.goal3Title, c.goal3Desc],
    [c.goal4Title, c.goal4Desc],
  ];
  const focuses = [
    [c.focus1Title, c.focus1Desc],
    [c.focus2Title, c.focus2Desc],
    [c.focus3Title, c.focus3Desc],
    [c.focus4Title, c.focus4Desc],
  ];
  const timeline = [
    [c.timeline1Title, c.timeline1Desc],
    [c.timeline2Title, c.timeline2Desc],
    [c.timeline3Title, c.timeline3Desc],
    [c.timeline4Title, c.timeline4Desc],
    [c.timeline5Title, c.timeline5Desc],
  ];
  const stats = [
    [c.stat1Value, c.stat1Label],
    [c.stat2Value, c.stat2Label],
    [c.stat3Value, c.stat3Label],
    [c.stat4Value, c.stat4Label],
  ];

  return (
    <main className="landing" style={{ "--primary": t.primaryColor, "--secondary": t.secondaryColor, "--txt": t.textColor, "--bg": t.bgColor, fontFamily: t.fontFamily }}>
      <header className="l-header container">
        <div className="l-logoWrap">{i.logoUrl ? <img src={i.logoUrl} alt="logo" className="l-logo" /> : <div className="logoFallback">N</div>}</div>
        <nav className="l-nav">{navs.map((x) => <a key={x} href="#">{x}</a>)}</nav>
        <button className="l-btn">{c.navCta}</button>
      </header>

      <section className="container l-hero">
        <span className="l-badge">{c.heroBadge}</span>
        <h1>{c.title}</h1>
        <p>{c.subtitle}</p>
        <div className="l-rowCenter"><button className="l-btn">{c.cta}</button><button className="l-btn ghost">{c.cta2}</button></div>
        <div className="chipRow">{chips.map((x) => <span key={x}>{x}</span>)}</div>
      </section>

      <section className="container l-section center">
        <h2>{c.goalsTitle}</h2><p>{c.goalsSubtitle}</p>
        <div className="l-grid4">{goals.map(([title, desc]) => <article key={title} className="l-card"><h3>{title}</h3><p>{desc}</p></article>)}</div>
      </section>

      <section className="container l-section split">
        <div>
          <h2>{c.functionsTitle}</h2>
          <ul>{[c.function1, c.function2, c.function3, c.function4, c.function5].filter(Boolean).map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="artBox" />
      </section>

      <section className="container l-section center">
        <h2>{c.focusTitle}</h2>
        <div className="l-grid2">{focuses.map(([title, desc]) => <article key={title} className="l-card"><h3>{title}</h3><p>{desc}</p></article>)}</div>
      </section>

      <section className="container l-section center">
        <h2>{c.researchTitle}</h2>
        <div className="timeline">{timeline.map(([title, desc]) => <article key={title} className="l-card"><h3>{title}</h3><p>{desc}</p></article>)}</div>
        <div className="stats">{stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      </section>

      <section className="container l-section">
        <h2 className="center">{c.contactTitle}</h2>
        <div className="contactGrid">
          <form className="l-card">
            <h3>{c.formTitle}</h3>
            <div className="l-grid2"><input placeholder={c.firstNamePlaceholder} /><input placeholder={c.lastNamePlaceholder} /></div>
            <input placeholder={c.emailPlaceholder} />
            <textarea rows={5} placeholder={c.messagePlaceholder} />
            <button className="l-btn" type="button">{c.submitText}</button>
          </form>
          <div className="rightInfo">
            <div className="l-card"><strong>{c.addressTitle}:</strong> {c.addressText}</div>
            <div className="l-card"><strong>{c.phoneTitle}:</strong> {c.phoneText}</div>
            <div className="l-card"><strong>{c.supportEmailTitle}:</strong> {c.supportEmailText}</div>
            <div className="l-card map" />
          </div>
        </div>
      </section>

      <footer className="l-footer">
        <div className="container footCols">
          <div><h3>{i.siteTitle}</h3><p>{c.footerText}</p></div>
          <div><h4>{c.footerCol2Title}</h4><p>{(c.footerCol2Text || "").split("\n").map((x) => <span key={x}>{x}<br/></span>)}</p></div>
          <div><h4>{c.footerCol3Title}</h4><p>{(c.footerCol3Text || "").split("\n").map((x) => <span key={x}>{x}<br/></span>)}</p></div>
          <div><h4>{c.footerCol4Title}</h4><p>{(c.footerCol4Text || "").split("\n").map((x) => <span key={x}>{x}<br/></span>)}</p></div>
        </div>
      </footer>
    </main>
  );
}
