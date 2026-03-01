import Link from "next/link";
import { Star } from "lucide-react";
import { getLanding } from "@/lib/db";

export default async function BlogHero({ title, crumbs = [] }) {
  const landing = await getLanding();
  const videoUrl = landing?.content?.heroVideoUrl || "/videos/GettyImages-1308346105.mp4";

  return (
    <section className="l-hero reveal blogHeroVideo" id="hero">
      <video className="heroVideo" autoPlay muted loop playsInline preload="metadata"><source src={videoUrl} type="video/mp4" /></video>
      <div className="heroOverlay" />
      <div className="heroNet" />
      <div className="container heroInner blogHeroInner">
        <div className="blogHeroCard">
          <span className="l-badge"><Star size={14} /> BLOG CENTER</span>
          <small className="blogCrumbs">
            <Link href="/">Home</Link>
            {crumbs.map((x, idx) => (
              <span key={`${x.label}-${idx}`}> / {x.href ? <Link href={x.href}>{x.label}</Link> : x.label}</span>
            ))}
          </small>
          <h1>{title}</h1>
        </div>
      </div>
    </section>
  );
}
