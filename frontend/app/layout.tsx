import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgriPulse — কৃষক সহকারী",
  description: "বাংলাদেশের কৃষকদের জন্য AI চ্যাটবট",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className={`${inter.className} min-h-screen font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
