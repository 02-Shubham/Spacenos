import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPACENOS — Your External Brain",
  description: "An external brain designed to reduce overwhelm and help users focus on what actually matters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        {children}
      </body>
    </html>
  );
}
