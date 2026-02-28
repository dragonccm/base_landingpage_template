"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLanding, fetchSettings } from "@/store/siteSlice";

const goalCards = ["Goals", "Mission", "Commitment", "Vision"];
const focusCards = ["Safe And Convenient Online Payment System", "New Financial Products", "New Technology", "Blockchain In Finance"];
const timeline = ["Identity Verification", "Core Banking", "New Financial Products", "E-Wallet", "Advanced Technology"];

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
        <div className="l-rowCenter">
          <button className="l-btn">{c.cta}</button>
          <button className="l-btn ghost">{c.cta2}</button>
        </div>
        <div className="chipRow">{["AI", "IoT", "Big Data", "Blockchain"].map((x) => <span key={x}>{x}</span>)}</div>
      </section>

      <section className="container l-section center">
        <h2>{c.goalsTitle}</h2><p>{c.goalsSubtitle}</p>
        <div className="l-grid4">{goalCards.map((x) => <article key={x} className="l-card"><h3>{x}</h3><p>Editable fintech mission text for {x.toLowerCase()}.</p></article>)}</div>
      </section>

      <section className="container l-section split">
        <div>
          <h2>{c.functionsTitle}</h2>
          <ul>
            <li>Research and develop fintech solutions for practical use.</li>
            <li>Provide advanced tools for secure online finance.</li>
            <li>Integrate AI, IoT, Big Data and Blockchain.</li>
            <li>Collaborate with partners and experts globally.</li>
          </ul>
        </div>
        <div className="artBox" />
      </section>

      <section className="container l-section center">
        <h2>{c.focusTitle}</h2>
        <div className="l-grid2">{focusCards.map((x) => <article key={x} className="l-card"><h3>{x}</h3><p>TrustXLabs focus area description text.</p></article>)}</div>
      </section>

      <section className="container l-section center">
        <h2>{c.researchTitle}</h2>
        <div className="timeline">{timeline.map((x) => <article key={x} className="l-card"><h3>{x}</h3><p>Research direction detail for {x.toLowerCase()}.</p></article>)}</div>
        <div className="stats"><div><strong>5+</strong><span>Years of experience</span></div><div><strong>20+</strong><span>Research projects</span></div><div><strong>50+</strong><span>Experts</span></div><div><strong>100+</strong><span>International partners</span></div></div>
      </section>

      <section className="container l-section">
        <h2 className="center">{c.contactTitle}</h2>
        <div className="contactGrid">
          <form className="l-card">
            <h3>Get In Touch With Us</h3>
            <div className="l-grid2"><input placeholder="First Name" /><input placeholder="Last Name" /></div>
            <input placeholder="Email" /><textarea rows={5} placeholder="Comment Or Message" /><button className="l-btn" type="button">Submit</button>
          </form>
          <div className="rightInfo"><div className="l-card">Address: 81 Ky Vong Vien, An Khanh, Ninh Kieu, Can Tho</div><div className="l-card">Phone: +84 76 875 6969</div><div className="l-card">Email: contact@trustxlabs.com</div><div className="l-card map" /></div>
        </div>
      </section>

      <footer className="l-footer">
        <div className="container footCols">
          <div><h3>{i.siteTitle}</h3><p>{c.footerText}</p></div>
          <div><h4>Important Links</h4><p>Customer Support<br/>Newsletter<br/>FAQ</p></div>
          <div><h4>Company</h4><p>About Us<br/>Research<br/>Team Members</p></div>
          <div><h4>Contact</h4><p>contact@trustxlabs.com<br/>81 Ky Vong Vien, An Khanh, Can Tho</p></div>
        </div>
      </footer>
    </main>
  );
}
