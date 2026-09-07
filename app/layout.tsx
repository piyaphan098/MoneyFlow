import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sarabun = localFont({
  src: [
    { path: "../fonts/Sarabun-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Sarabun-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Sarabun-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/Sarabun-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-sarabun",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "../fonts/JetBrainsMono-Variable.ttf",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoneyFlow",
  description: "Know your money. Know your next payment.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoneyFlow",
  },
};

export const viewport: Viewport = {
  themeColor: "#5B4FE0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sarabun.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-mf-bg text-mf-text font-sans">{children}</body>
    </html>
  );
}
