"use client";

export default function Header({ i, navs, c, menuOpen, setMenuOpen }) {
  return (
    <header className="stickyHeader">
      <div className="l-header container">
        <div className="l-logoWrap">{i.logoUrl ? <img src={i.logoUrl} alt="logo" className="l-logo" /> : <div className="logoFallback">N</div>}</div>
        <button className="menuToggle" onClick={() => setMenuOpen((v) => !v)}>☰</button>
        <nav className={`l-nav ${menuOpen ? "open" : ""}`}>{navs.map((x) => <a key={x.label} href={x.href}>{x.label}</a>)}</nav>
        <button className="l-btn hideMobile" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>{c.navCta}</button>
      </div>
    </header>
  );
}
