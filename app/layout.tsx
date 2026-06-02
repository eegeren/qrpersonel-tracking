import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Personel Takip",
  description: "QR kod ile personel giriş çıkış ve puantaj takibi"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
