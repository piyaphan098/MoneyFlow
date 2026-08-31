import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoneyFlow",
  description: "Know your money. Know your next payment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-mf-bg text-mf-text font-sans">{children}</body>
    </html>
  );
}
