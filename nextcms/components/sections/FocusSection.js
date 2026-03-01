export default function FocusSection({ c, focuses, focusIcons }) {
  return (
    <section id="focus" className="focusBand reveal">
      <div className="container l-section center focusInner">
        <h2>{c.focusTitle}</h2><p>We focus on four key areas to deliver advanced financial technology solutions.</p>
        <div className="l-grid2">{focuses.map(([label, title, desc], idx) => { const Icon = focusIcons[idx]; return <article key={title} className="l-card"><small>{label}</small><div className="iconBox"><Icon size={22} /></div><h3>{title}</h3><p>{desc}</p></article>; })}</div>
      </div>
    </section>
  );
}
