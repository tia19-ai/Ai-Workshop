import type { Metadata } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";

// Fonts are built into Next.js and served from this site, so no new package is needed.
const heading = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Tia",
  description: "Tia, a freshman at UH Manoa studying entrepreneurship.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
