import { Star } from "lucide-react";

export default function HeroSection({ c, companyName, heroPrefix, heroHighlight, subtitleHtml, heroVideoUrl, chips }) {
  return (
    <section id="hero" className="l-hero reveal">
      <video className="heroVideo" autoPlay muted loop playsInline preload="metadata"><source src={heroVideoUrl} type="video/mp4" /></video>
      <div className="heroOverlay" />
      <div className="heroNet" />
      <div className="container heroInner">
        <span className="l-badge"><Star size={14} /> {c.heroBadge}</span>
        <h1>{heroPrefix} <span className="titleGradient">{heroHighlight.replaceAll("TrustXLabs", companyName)}</span></h1>
        <p dangerouslySetInnerHTML={{ __html: subtitleHtml }} />
        <div className="l-rowCenter"><button className="l-btn">{c.cta}</button><button className="l-btn ghost">{c.cta2}</button></div>
        <div className="chipRow">{chips.map((x) => <span key={x}>{x}</span>)}</div>
      </div>
    </section>
  );
}
