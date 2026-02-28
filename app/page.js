const navItems = ["Home", "About", "Services", "Portfolio", "Pages", "Blog", "Contact"];

const metrics = [
  { value: "$2.5B+", label: "Assets Under Management" },
  { value: "120+", label: "Startup Investments" },
  { value: "38", label: "Global Partners" },
];

const services = [
  {
    title: "Venture Capital",
    desc: "Funding ambitious founders from seed to growth stages.",
  },
  {
    title: "Growth Advisory",
    desc: "Strategic support to scale operations, hiring and go-to-market.",
  },
  {
    title: "M&A Strategy",
    desc: "Deal sourcing, due diligence and value creation planning.",
  },
];

export default function HomePage() {
  return (
    <main className="invested">
      <header className="siteHeader">
        <div className="container navWrap">
          <a href="#" className="logo">Invested</a>
          <nav>
            <ul className="navList">
              {navItems.map((item) => (
                <li key={item}><a href="#">{item}</a></li>
              ))}
            </ul>
          </nav>
          <a href="#" className="ctaBtn">Get Consultation</a>
        </div>
      </header>

      <section className="hero container">
        <div className="heroText">
          <p className="kicker">Smart Capital For Bold Founders</p>
          <h1>Investing in Visionary Teams Building The Future</h1>
          <p className="lead">
            We are a venture capital and private equity firm helping high-potential
            businesses unlock growth with strategic investment and hands-on guidance.
          </p>
          <div className="heroActions">
            <a href="#" className="primary">Start a Project</a>
            <a href="#" className="ghost">Watch Video</a>
          </div>
        </div>

        <div className="heroVisual">
          <div className="chartCard">
            <p>Portfolio Growth</p>
            <strong>+48.2%</strong>
            <span>Year over year performance</span>
          </div>
          <div className="dot dot1" />
          <div className="dot dot2" />
        </div>
      </section>

      <section className="metrics container">
        {metrics.map((item) => (
          <article key={item.label}>
            <h3>{item.value}</h3>
            <p>{item.label}</p>
          </article>
        ))}
      </section>

      <section className="services container">
        <div className="sectionHead">
          <p>What We Do</p>
          <h2>Financial Expertise Backed By Real Operator Experience</h2>
        </div>
        <div className="serviceGrid">
          {services.map((service) => (
            <article key={service.title} className="serviceCard">
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <a href="#">Learn more →</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
