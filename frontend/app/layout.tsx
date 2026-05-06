import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Agripulse AI",
  description: "Agripulse AI — Your Smart Agricultural Assistant",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark">
      <body
        className={`${notoBengali.className} min-h-screen font-sans antialiased bg-agri-dark text-white`}
      >
        {children}
      </body>
    </html>
  );
}
