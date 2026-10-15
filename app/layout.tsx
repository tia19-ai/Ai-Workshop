import type { Metadata } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";

// Fonts are built into Next.js and served from this site, so no new package is needed.
const heading = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body" });

// Applies the saved mood and text size before the page paints, so it never flashes the default colors.
const applySavedLook = `try{var d=document.documentElement,m=localStorage.getItem("mood"),s=localStorage.getItem("text-size");if(m)d.dataset.mood=m;if(s)d.dataset.size=s}catch(e){}`;

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
    <html
      lang="en"
      className={`${heading.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: applySavedLook }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
