import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
