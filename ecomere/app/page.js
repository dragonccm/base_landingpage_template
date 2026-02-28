"use client";

import { useEffect, useMemo, useState } from "react";

const defaults = {
  theme: {
    fontFamily: "Inter, Arial, sans-serif",
    bgColor: "#eef2f7",
    surfaceColor: "#ffffff",
    textColor: "#0d1425",
    mutedColor: "#637085",
    primaryColor: "#2f9ae0",
    secondaryColor: "#56c8ff",
    sectionRadius: "12",
  },
  content: {
    navBrand: "TrustXLabs",
    nav1: "Home",
    nav2: "About Us",
    nav3: "Expertise",
    nav4: "Research",
    nav5: "Team",
    nav6: "News",
    navCta: "Contact Us",

    heroTag: "FINTECH RESEARCH CENTER",
    heroTitle1: "Welcome to",
    heroTitle2: "TrustXLabs!",
    heroDesc:
      "TrustXLabs – a research center for fintech under TRUSTpay Group. The center is invested in focusing on research and development of financial technology solutions based on AI, IoT, Big Data and Blockchain to assist users in optimizing the efficiency of financial investment transactions and related services.",
    heroBtn1: "Learn More",
    heroBtn2: "Our Research",

    aboutTag: "ABOUT US",
    goalsTitle: "Goals & Mission",
    goalsDesc: "TrustXLabs aims to become the leading fintech research company in Vietnam.",

    focusTag: "OUR IDENTITY",
    focusTitle: "Key Focus Areas",
    focusDesc: "We focus on four key areas to deliver advanced financial technology solutions.",

    rdTag: "RESEARCH DEVELOPMENT",
    rdTitle: "Main Research Directions",
    rdDesc: "The main research directions of TrustXLabs focus on building a strong fintech technology foundation for the future.",

    contactTag: "CONTACT",
    contactTitle1: "Connect With",
    contactTitle2: "TrustXLabs",
    contactDesc: "Contact us for consultation on fintech solutions",

    footerDesc: "Vietnam leading financial technology research center under TRUSTpay Group",
    footerCopy: "© 2025 TrustXLabs. All Rights Reserved.",
  },
};

const goalCards = [
  ["Goals", "Become a leading fintech technology research organization in Vietnam, delivering high-quality financial solutions."],
  ["Mission", "Focus customer-centered innovation with the most modern and practical financial technology products."],
  ["Commitment", "Enhance financial management capacity and smart investment for all customers through innovative and useful financial tools."],
  ["Vision", "Meet the increasing worldwide needs for secure and advanced fintech solutions."]
];

const focusCards = [
  ["Safety & Convenience", "Safe And Convenient Online Payment System"],
  ["Innovation & Creativity", "New Financial Products"],
  ["AI • Big Data • IoT", "New Technology"],
  ["Transparency & Security", "Blockchain In Finance"]
];

const timeline = [
  ["Identity Verification", "Integrated identity verification solutions for secure digital finance."],
  ["Core Banking", "Core banking technology and digital infrastructure."],
  ["New Financial Products", "Digital asset, voucher, and modern online financial products."],
  ["E-Wallet", "Secure and convenient e-wallet and online payment systems."],
  ["Advanced Technology", "Integrating Blockchain, AI and Big Data in finance."]
];

export default function LandingPage() {
  const [data, setData] = useState(defaults);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetch("/api/landing")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.data) return;
        setData({
          theme: { ...defaults.theme, ...(d.data.theme || {}) },
          content: { ...defaults.content, ...(d.data.content || {}) },
        });
      });
  }, []);

  const { theme, content } = data;
  const navItems = useMemo(() => [content.nav1, content.nav2, content.nav3, content.nav4, content.nav5, content.nav6], [content]);

  return (
    <main
      className="tx"
      style={{
        "--bg": theme.bgColor,
        "--surface": theme.surfaceColor,
        "--text": theme.textColor,
        "--muted": theme.mutedColor,
        "--primary": theme.primaryColor,
        "--secondary": theme.secondaryColor,
        "--radius": `${theme.sectionRadius}px`,
        fontFamily: theme.fontFamily,
      }}
    >
      <header className="nav container">
        <div className="brand">{content.navBrand}</div>
        <button className="menuBtn" onClick={() => setMobileMenu((v) => !v)}>☰</button>
        <nav className={`menu ${mobileMenu ? "open" : ""}`}>
          {navItems.map((item) => <a key={item} href="#">{item}</a>)}
        </nav>
        <a className="cta" href="#contact">{content.navCta}</a>
      </header>

      <section className="hero container section">
        <span className="chip">{content.heroTag}</span>
        <h1>{content.heroTitle1} <em>{content.heroTitle2}</em></h1>
        <p>{content.heroDesc}</p>
        <div className="heroBtns">
          <button>{content.heroBtn1}</button>
          <button className="ghost">{content.heroBtn2}</button>
        </div>
        <div className="heroTags">
          {['AI', 'IoT', 'Big Data', 'Blockchain'].map((x) => <span key={x}>{x}</span>)}
        </div>
      </section>

      <section className="container section center">
        <span className="chip">{content.aboutTag}</span>
        <h2>{content.goalsTitle}</h2>
        <p className="muted centerText">{content.goalsDesc}</p>
        <div className="grid4">
          {goalCards.map(([t, d]) => (
            <article key={t} className="card"><h3>{t}</h3><p>{d}</p></article>
          ))}
        </div>
      </section>

      <section className="container section split">
        <div>
          <h2>Functions And Missions</h2>
          <ul>
            <li>Research and develop fintech technology solutions.</li>
            <li>Provide customers with advanced products and services.</li>
            <li>Focus on secure payment and digital finance innovation.</li>
            <li>Research and develop blockchain applications in finance.</li>
            <li>Collaborate with international partners and organizations.</li>
          </ul>
        </div>
        <div className="illustration" />
      </section>

      <section className="container section center">
        <span className="chip">{content.focusTag}</span>
        <h2>{content.focusTitle}</h2>
        <p className="muted centerText">{content.focusDesc}</p>
        <div className="grid2">
          {focusCards.map(([k, v]) => <article key={k} className="card"><small>{k}</small><h3>{v}</h3></article>)}
        </div>
      </section>

      <section className="container section center">
        <span className="chip">{content.rdTag}</span>
        <h2>{content.rdTitle}</h2>
        <p className="muted centerText">{content.rdDesc}</p>
        <div className="timeline">
          {timeline.map(([t, d]) => <article key={t} className="lineItem"><h3>{t}</h3><p>{d}</p></article>)}
        </div>
        <div className="stats">
          <div><strong>5+</strong><span>Years of experience</span></div>
          <div><strong>20+</strong><span>Research projects</span></div>
          <div><strong>50+</strong><span>Experts</span></div>
          <div><strong>100+</strong><span>International partners</span></div>
        </div>
      </section>

      <section className="container section center" id="contact">
        <span className="chip">{content.contactTag}</span>
        <h2>{content.contactTitle1} <em>{content.contactTitle2}</em></h2>
        <p className="muted centerText">{content.contactDesc}</p>
        <div className="contactGrid">
          <form className="card form">
            <h3>Get In Touch With Us</h3>
            <div className="f2"><input placeholder="First Name" /><input placeholder="Last Name" /></div>
            <input placeholder="Email" />
            <textarea rows={5} placeholder="Comment or message" />
            <button type="button">Submit</button>
          </form>
          <div className="contactRight">
            <div className="card">Address<br />81 Ky Vong Vien, Ninh Kieu, Can Tho</div>
            <div className="card">Phone<br />+84 76 875 6969</div>
            <div className="card">Email<br />contact@trustxlabs.com</div>
            <div className="card map" />
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footGrid">
          <div><h3>{content.navBrand}</h3><p>{content.footerDesc}</p></div>
          <div><h4>Important Links</h4><p>Customer Support<br />Newsletter<br />FAQ</p></div>
          <div><h4>Company</h4><p>About Us<br />Research<br />Services</p></div>
          <div><h4>Contact</h4><p>contact@trustxlabs.com<br />+84 76 875 6969</p></div>
        </div>
        <p className="copy">{content.footerCopy}</p>
      </footer>
    </main>
  );
}
