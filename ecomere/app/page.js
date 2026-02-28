"use client";

import { useEffect, useState } from "react";

const defaultData = {
  theme: {
    fontFamily: "Inter, Arial, sans-serif",
    bgColor: "#070b1a",
    surfaceColor: "#0f1733",
    textColor: "#e8ecff",
    mutedColor: "#a5afcc",
    primaryColor: "#6f86ff",
    secondaryColor: "#2bd1a3",
    sectionRadius: "20",
  },
  content: {
    navBrand: "TrustXLabs",
    navCta: "Contact Us",
    heroBadge: "Leading FinTech, AI & Blockchain Solutions",
    heroTitle: "Welcome to TrustXLabs!",
    heroDesc: "TrustXLabs – a research center for fintech under TRUSTpay Group.",
    missionTitle: "Goals & Mission",
    missionText: "TrustXLabs aims to become the leading fintech research company in Vietnam.",
    focusTitle: "Key Focus Areas",
    contactTitle: "Connect with TrustXLabs!",
    contactText: "Contact us for consultation on fintech solutions.",
  },
};

const focus = [
  ["Safety & Convenience", "Safe and convenient online payment system"],
  ["Innovation & Creativity", "New financial products"],
  ["AI • Big Data • IoT", "New technology"],
  ["Transparency & Security", "Blockchain in finance"],
];

export default function LandingPage() {
  const [data, setData] = useState(defaultData);

  useEffect(() => {
    fetch("/api/landing")
      .then((r) => r.json())
      .then((d) => d?.data && setData(d.data));
  }, []);

  const { theme, content } = data;

  return (
    <main
      className="trustx"
      style={{
        "--bg": theme.bgColor,
        "--surface": theme.surfaceColor,
        "--text": theme.textColor,
        "--muted": theme.mutedColor,
        "--primary": theme.primaryColor,
        "--secondary": theme.secondaryColor,
        "--radius": `${theme.sectionRadius || 20}px`,
        fontFamily: theme.fontFamily,
      }}
    >
      <header className="tx-nav container">
        <div className="brand">{content.navBrand}</div>
        <a href="#contact" className="cta">{content.navCta}</a>
      </header>

      <section className="container tx-hero">
        <span>{content.heroBadge}</span>
        <h1>{content.heroTitle}</h1>
        <p>{content.heroDesc}</p>
      </section>

      <section className="container tx-section">
        <h2>{content.missionTitle}</h2>
        <p>{content.missionText}</p>
      </section>

      <section className="container tx-section">
        <h2>{content.focusTitle}</h2>
        <div className="focus-grid">
          {focus.map(([title, desc]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container tx-contact" id="contact">
        <h2>{content.contactTitle}</h2>
        <p>{content.contactText}</p>
      </section>
    </main>
  );
}
