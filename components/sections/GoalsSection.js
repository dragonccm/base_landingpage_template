export default function GoalsSection({ c, goals, goalIcons }) {
  return (
    <section id="goals" className="container l-section center reveal">
      <h2>{c.goalsTitle}</h2><p>{c.goalsSubtitle}</p>
      <div className="l-grid4">{goals.map(([title, desc], idx) => { const Icon = goalIcons[idx]; return <article key={title} className="l-card"><div className="iconBox"><Icon size={18} /></div><h3>{title}</h3><p>{desc}</p></article>; })}</div>
    </section>
  );
}
