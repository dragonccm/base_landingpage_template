import { Facebook, Linkedin, Twitter, Youtube } from "lucide-react";

export default function FooterSection({ c, i }) {
  return (
    <footer id="footer" className="l-footer reveal">
      <div className="container footCols">
        <div>
          <h3>{i.siteTitle}</h3>
          <p>{c.footerText}</p>
          <div className="socialRow">
            <a className="socialIcon" href="#" aria-label="Facebook"><Facebook size={16} /></a>
            <a className="socialIcon" href="#" aria-label="LinkedIn"><Linkedin size={16} /></a>
            <a className="socialIcon" href="#" aria-label="Twitter"><Twitter size={16} /></a>
            <a className="socialIcon" href="#" aria-label="YouTube"><Youtube size={16} /></a>
          </div>
        </div>

        <div><h4>{c.footerCol2Title}</h4><p>{(c.footerCol2Text || "").split("\n").map((x, idx) => <span key={`${x}-${idx}`}>{x}<br /></span>)}</p></div>
        <div><h4>{c.footerCol3Title}</h4><p>{[c.nav1, c.nav2, c.nav3, c.nav4, c.nav5, c.nav6].filter(Boolean).map((x) => <span key={x}>{x}<br /></span>)}</p></div>
        <div><h4>{c.footerCol4Title}</h4><p>{(c.footerCol4Text || "").split("\n").map((x) => <span key={x}>{x}<br /></span>)}</p></div>
      </div>
      <div className="copy">© 2025 TrustXLabs. All Rights Reserved.</div>
    </footer>
  );
}
