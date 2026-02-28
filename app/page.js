"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLanding, fetchSettings } from "@/store/siteSlice";
import { Flag, UserRound, Handshake, Globe, CreditCard, ChartNoAxesCombined, Cpu, Link2, IdCard, Building2, TrendingUp, Wallet, FlaskConical, MapPin, Phone, Mail, Clock3, Star, ArrowUp } from "lucide-react";
import { toast } from "@/lib/toast";

const goalIcons = [Flag, UserRound, Handshake, Globe];
const focusIcons = [CreditCard, ChartNoAxesCombined, Cpu, Link2];
const timelineIcons = [IdCard, Building2, TrendingUp, Wallet, FlaskConical];

export default function Home() {
  const dispatch = useDispatch();
  const { landing, settings, loading } = useSelector((s) => s.site);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });

  useEffect(() => { dispatch(fetchLanding()); dispatch(fetchSettings()); }, [dispatch]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 420);
    window.addEventListener("scroll", onScroll);
    onScroll();

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("inview")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [landing]);

  async function submitContact() {
    setSending(true);
    const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) return toast.error(data.error || "Gửi mail thất bại");
    setForm({ firstName: "", lastName: "", email: "", message: "" });
    toast.success("Đã gửi liên hệ thành công");
  }

  if (loading || !landing || !settings) return <main className="landing"><div className="container"><div className="skeleton lg" /><div className="skeleton" /><div className="skeleton" /></div></main>;

  const t = landing.theme, c = landing.content, i = settings.identity;
  const navs = [c.nav1, c.nav2, c.nav3, c.nav4, c.nav5, c.nav6].filter(Boolean);
  const chips = [c.chip1, c.chip2, c.chip3, c.chip4].filter(Boolean);
  const goals = [[c.goal1Title, c.goal1Desc], [c.goal2Title, c.goal2Desc], [c.goal3Title, c.goal3Desc], [c.goal4Title, c.goal4Desc]];
  const focuses = [[c.focus1Label, c.focus1Title, c.focus1Desc], [c.focus2Label, c.focus2Title, c.focus2Desc], [c.focus3Label, c.focus3Title, c.focus3Desc], [c.focus4Label, c.focus4Title, c.focus4Desc]];
  const timeline = [[c.timeline1Title, c.timeline1Desc], [c.timeline2Title, c.timeline2Desc], [c.timeline3Title, c.timeline3Desc], [c.timeline4Title, c.timeline4Desc], [c.timeline5Title, c.timeline5Desc]];
  const stats = [[c.stat1Value, c.stat1Label], [c.stat2Value, c.stat2Label], [c.stat3Value, c.stat3Label], [c.stat4Value, c.stat4Label]];

  return (
    <main className="landing" style={{ "--primary": t.primaryColor, "--secondary": t.secondaryColor, "--txt": t.textColor, "--muted": t.mutedColor, "--bg": t.bgColor, "--badgeFrom": t.badgeBorderFrom, "--badgeTo": t.badgeBorderTo, "--iconFrom": t.iconGradFrom, "--iconTo": t.iconGradTo, "--focusBg": t.focusBg, "--sectionBg": t.sectionBg, "--cardBorder": t.cardBorder, "--cardHoverShadow": t.cardHoverShadow, "--statsBg": t.statsBg, "--footerBg": t.footerBg, "--footerText": t.footerText, "--heroOverlayFrom": t.heroOverlayFrom, "--heroOverlayTo": t.heroOverlayTo, fontFamily: t.fontFamily }}>
      <header className="l-header container stickyHeader">
        <div className="l-logoWrap">{i.logoUrl ? <img src={i.logoUrl} alt="logo" className="l-logo" /> : <div className="logoFallback">N</div>}</div>
        <button className="menuToggle" onClick={() => setMenuOpen((v) => !v)}>☰</button>
        <nav className={`l-nav ${menuOpen ? "open" : ""}`}>{navs.map((x) => <a key={x} href="#">{x}</a>)}</nav>
        <button className="l-btn hideMobile">{c.navCta}</button>
      </header>

      <section className="l-hero reveal">
        <video className="heroVideo" autoPlay muted loop playsInline preload="metadata"><source src="/videos/GettyImages-1308346105.mp4" type="video/mp4" /></video>
        <div className="heroOverlay" />
        <div className="heroNet" />
        <div className="container heroInner">
          <span className="l-badge"><Star size={14} /> {c.heroBadge}</span>
          <h1>{c.title.replace("TrustXLabs!", "")}<span>TrustXLabs!</span></h1>
          <p dangerouslySetInnerHTML={{ __html: c.subtitle }} />
          <div className="l-rowCenter"><button className="l-btn">{c.cta}</button><button className="l-btn ghost">{c.cta2}</button></div>
          <div className="chipRow">{chips.map((x) => <span key={x}>{x}</span>)}</div>
        </div>
      </section>

      <section className="container l-section center reveal">
        <h2>{c.goalsTitle}</h2><p>{c.goalsSubtitle}</p>
        <div className="l-grid4">{goals.map(([title, desc], idx) => { const Icon = goalIcons[idx]; return <article key={title} className="l-card"><div className="iconBox"><Icon size={18} /></div><h3>{title}</h3><p>{desc}</p></article>; })}</div>
      </section>

      <section className="container l-section split reveal">
        <div><h2>{c.functionsTitle}</h2><ul>{[c.function1, c.function2, c.function3, c.function4, c.function5, c.function6].filter(Boolean).map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div className="artBox"><div className="diamond" /></div>
      </section>

      <section className="focusBand reveal">
        <div className="container l-section center focusInner">
          <h2>{c.focusTitle}</h2><p>We focus on four key areas to deliver advanced financial technology solutions.</p>
          <div className="l-grid2">{focuses.map(([label, title, desc], idx) => { const Icon = focusIcons[idx]; return <article key={title} className="l-card"><small>{label}</small><div className="iconBox"><Icon size={22} /></div><h3>{title}</h3><p>{desc}</p></article>; })}</div>
        </div>
      </section>

      <section className="container l-section center reveal">
        <h2>{c.researchTitle}</h2>
        <div className="timelineWrap"><div className="timelineLine" />{timeline.map(([title, desc], idx) => { const Icon = timelineIcons[idx]; return <article key={title} className={`timelineCard ${idx % 2 ? "right" : "left"}`}><div className="timelineDot" /><div className="l-card"><div className="iconBox"><Icon size={18} /></div><h3>{title}</h3><p>{desc}</p></div></article>; })}</div>
        <div className="stats">{stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      </section>

      <section className="container l-section reveal">
        <h2 className="center">Connect With <span>{i.siteTitle}</span></h2>
        <div className="contactGrid">
          <form className="l-card contactForm" onSubmit={(e) => { e.preventDefault(); submitContact(); }}>
            <h3>{c.formTitle}</h3>
            <div className="l-grid2"><input placeholder={c.firstNamePlaceholder} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /><input placeholder={c.lastNamePlaceholder} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            <input placeholder={c.emailPlaceholder} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <textarea rows={5} placeholder={c.messagePlaceholder} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button className={`l-btn ${sending ? "loading" : ""}`} type="submit" disabled={sending}>{sending ? "Sending..." : c.submitText}</button>
          </form>
          <div className="rightInfo">
            <div className="l-card"><strong><MapPin size={16}/> {c.addressTitle}:</strong> {c.addressText}</div>
            <div className="l-card"><strong><Phone size={16}/> {c.phoneTitle}:</strong> {c.phoneText}</div>
            <div className="l-card"><strong><Mail size={16}/> {c.supportEmailTitle}:</strong> {c.supportEmailText}</div>
            <div className="l-card"><strong><Clock3 size={16}/> {c.workTimeTitle}:</strong> {c.workTimeText}</div>
            <iframe className="map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=10.0302408,105.7689046&z=15&output=embed" />
          </div>
        </div>
      </section>

      <footer className="l-footer reveal"><div className="container footCols"><div><h3>{i.siteTitle}</h3><p>{c.footerText}</p><p>● Facebook  ● LinkedIn  ● X  ● YouTube</p></div><div><h4>{c.footerCol2Title}</h4><p>{(c.footerCol2Text || "").split("\n").map((x) => <span key={x}>{x}<br /></span>)}</p></div><div><h4>{c.footerCol3Title}</h4><p>{(c.footerCol3Text || "").split("\n").map((x) => <span key={x}>{x}<br /></span>)}</p></div><div><h4>{c.footerCol4Title}</h4><p>{(c.footerCol4Text || "").split("\n").map((x) => <span key={x}>{x}<br /></span>)}</p></div></div><div className="copy">© 2025 TrustXLabs, All Rights Reserved.</div></footer>

      {showTop && <button className="backTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp size={18} /></button>}
    </main>
  );
}
