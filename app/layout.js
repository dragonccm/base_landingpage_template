import "./globals.css";

export const metadata = {
  title: "TamHonGame | Tải game PC Việt Hoá miễn phí",
  description:
    "TamHonGame chia sẻ game PC Việt Hoá mới nhất với link tải tốc độ cao, hoàn toàn miễn phí.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
