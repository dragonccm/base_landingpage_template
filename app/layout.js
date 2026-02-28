import "./globals.css";

export const metadata = {
  title: "GearVN Clone | Demo",
  description: "Trang chủ tham khảo giao diện GearVN bằng Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
