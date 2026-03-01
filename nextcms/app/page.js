"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLanding, fetchSettings } from "@/store/siteSlice";
import { Flag, UserRound, Handshake, Globe, CreditCard, ChartNoAxesCombined, Cpu, Link2, IdCard, Building2, TrendingUp, Wallet, FlaskConical } from "lucide-react";
import { toast } from "@/lib/toast";
import Header from "@/components/sections/Header";
import HeroSection from "@/components/sections/HeroSection";
import GoalsSection from "@/components/sections/GoalsSection";
import FocusSection from "@/components/sections/FocusSection";
import ContactSection from "@/components/sections/ContactSection";
import FooterSection from "@/components/sections/FooterSection";

const goalIcons = [Flag, UserRound, Handshake, Globe];
const focusIcons = [CreditCard, ChartNoAxesCombined, Cpu, Link2];
const timelineIcons = [IdCard, Building2, TrendingUp, Wallet, FlaskConical];

export default function Home() {
  const dispatch = useDispatch();
  const { landing, settings, loading } = useSelector((s) => s.site);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });

  useEffect(() => { dispatch(fetchLanding()); dispatch(fetchSettings()); }, [dispatch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("inview")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [landing]);

  async function submitContact() {
    setSending(true);
    const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) return toast.error(data.error || "Gửi liên hệ thất bại");
    setForm({ firstName: "", lastName: "", email: "", message: "" });
    toast.success("Đã ghi nhận liên hệ thành công");
  }

  if (loading || !landing || !settings) return <main className="landing"><div className="container"><div className="skeleton lg" /><div className="skeleton" /><div className="skeleton" /></div></main>;

  const t = landing.theme, c = (landing.contentI18n?.en || landing.content), i = settings.identity;
  const companyName = i.siteTitle || "TrustXLabs";
  const heroPrefix = c.titlePrefix || "Welcome to";
  const heroHighlight = c.titleHighlight || `${companyName}!`;
  const subtitleHtml = (c.subtitle || "").replaceAll("TrustXLabs", companyName);
  const heroVideoUrl = c.heroVideoUrl || "/videos/GettyImages-1308346105.mp4";
  const footerBgImageUrl = c.footerBgImageUrl || "/images/Background-footer.png";

  const navs = [
    { label: c.nav1, href: "#hero" },
    { label: c.nav2, href: "#goals" },
    { label: c.nav3, href: "#focus" },
    { label: c.nav4, href: "#research" },
    { label: c.nav5, href: "#contact" },
    { label: c.nav6, href: "/blog" },
  ].filter((x) => x.label);
  const chips = [c.chip1, c.chip2, c.chip3, c.chip4].filter(Boolean);
  const goals = [[c.goal1Title, c.goal1Desc], [c.goal2Title, c.goal2Desc], [c.goal3Title, c.goal3Desc], [c.goal4Title, c.goal4Desc]];
  const focuses = [[c.focus1Label, c.focus1Title, c.focus1Desc], [c.focus2Label, c.focus2Title, c.focus2Desc], [c.focus3Label, c.focus3Title, c.focus3Desc], [c.focus4Label, c.focus4Title, c.focus4Desc]];
  const timeline = [[c.timeline1Title, c.timeline1Desc], [c.timeline2Title, c.timeline2Desc], [c.timeline3Title, c.timeline3Desc], [c.timeline4Title, c.timeline4Desc], [c.timeline5Title, c.timeline5Desc]];
  const stats = [[c.stat1Value, c.stat1Label], [c.stat2Value, c.stat2Label], [c.stat3Value, c.stat3Label], [c.stat4Value, c.stat4Label]];

  return (
    <main className="landing" style={{ "--primary": t.primaryColor, "--secondary": t.secondaryColor, "--txt": t.textColor, "--muted": t.mutedColor, "--bg": t.bgColor, "--badgeFrom": t.badgeBorderFrom, "--badgeTo": t.badgeBorderTo, "--iconFrom": t.iconGradFrom, "--iconTo": t.iconGradTo, "--titleGradFrom": t.titleGradFrom, "--titleGradTo": t.titleGradTo, "--navText": t.navTextColor, "--focusBg": t.focusBg, "--sectionBg": t.sectionBg, "--cardBorder": t.cardBorder, "--cardHoverShadow": t.cardHoverShadow, "--statsBg": t.statsBg, "--footerBg": t.footerBg, "--footerText": t.footerText, "--footerBgImage": `url('${footerBgImageUrl}')`, "--heroOverlayFrom": t.heroOverlayFrom, "--heroOverlayTo": t.heroOverlayTo, fontFamily: t.fontFamily }}>
      <Header i={i} navs={navs} c={c} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <HeroSection c={c} companyName={companyName} heroPrefix={heroPrefix} heroHighlight={heroHighlight} subtitleHtml={subtitleHtml} heroVideoUrl={heroVideoUrl} chips={chips} />
      <GoalsSection c={c} goals={goals} goalIcons={goalIcons} />

      <section className="container l-section split reveal"><div><h2>{c.functionsTitle}</h2><ul>{[c.function1, c.function2, c.function3, c.function4, c.function5, c.function6].filter(Boolean).map((x) => <li key={x}>{x}</li>)}</ul></div><div className="artBox"><div className="diamond" /></div></section>

      <FocusSection c={c} focuses={focuses} focusIcons={focusIcons} />

      <section id="research" className="container l-section center reveal"><h2>{c.researchTitle}</h2><div className="timelineWrap"><div className="timelineLine" />{timeline.map(([title, desc], idx) => { const Icon = timelineIcons[idx]; return <article key={title} className={`timelineCard ${idx % 2 ? "right" : "left"}`}><div className="timelineDot" /><div className="l-card"><div className="iconBox"><Icon size={18} /></div><h3>{title}</h3><p>{desc}</p></div></article>; })}</div><div className="stats">{stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>

      <ContactSection c={c} companyName={companyName} form={form} setForm={setForm} submitContact={submitContact} sending={sending} />
      <FooterSection c={c} i={i} />

    </main>
  );
}
