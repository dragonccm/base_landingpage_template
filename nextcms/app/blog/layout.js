import { getLanding, getSettings } from "@/lib/db";
import HeaderClient from "@/components/sections/HeaderClient";
import FooterSection from "@/components/sections/FooterSection";

export const dynamic = "force-dynamic";

export default async function BlogLayout({ children }) {
  const [landing, settings] = await Promise.all([getLanding(), getSettings()]);
  const t = landing.theme;
  const c = landing.contentI18n?.en || landing.content;
  const i = settings.identity;

  const navs = [
    { label: c.nav1, href: "/#hero" },
    { label: c.nav2, href: "/#goals" },
    { label: c.nav3, href: "/#focus" },
    { label: c.nav4, href: "/blog/search" },
    { label: c.nav5, href: "/#contact" },
    { label: c.nav6, href: "/blog" },
  ].filter((x) => x.label);

  return (
    <main
      className="landing"
      style={{
        "--primary": t.primaryColor,
        "--secondary": t.secondaryColor,
        "--txt": t.textColor,
        "--muted": t.mutedColor,
        "--bg": t.bgColor,
        "--badgeFrom": t.badgeBorderFrom,
        "--badgeTo": t.badgeBorderTo,
        "--iconFrom": t.iconGradFrom,
        "--iconTo": t.iconGradTo,
        "--titleGradFrom": t.titleGradFrom,
        "--titleGradTo": t.titleGradTo,
        "--navText": t.navTextColor,
        "--focusBg": t.focusBg,
        "--sectionBg": t.sectionBg,
        "--cardBorder": t.cardBorder,
        "--cardHoverShadow": t.cardHoverShadow,
        "--statsBg": t.statsBg,
        "--footerBg": t.footerBg,
        "--footerText": t.footerText,
        fontFamily: t.fontFamily,
      }}
    >
      <HeaderClient i={i} navs={navs} c={c} />
      {children}
      <FooterSection c={c} i={i} />
    </main>
  );
}
