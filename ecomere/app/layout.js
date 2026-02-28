import "./globals.css";

export const metadata = {
  title: "TrustXLabs Style Landing + Admin CMS",
  description: "Landing page with full admin text/theme editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
