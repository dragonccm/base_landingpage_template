import "./globals.css";
import { getSettings } from "@/lib/db";

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: settings.seo.metaTitle || settings.identity.siteTitle,
    description: settings.seo.metaDescription,
    keywords: settings.seo.metaKeywords,
    icons: settings.identity.faviconUrl ? { icon: settings.identity.faviconUrl } : undefined,
    openGraph: {
      title: settings.seo.metaTitle || settings.identity.siteTitle,
      description: settings.seo.metaDescription,
      images: settings.seo.ogImage ? [settings.seo.ogImage] : [],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
