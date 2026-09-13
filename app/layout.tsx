import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fördermonitor · Kommunale Energiewende",
  description: "Originalquellen, fachliche Prüfung und nachvollziehbare Programmauskünfte.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
