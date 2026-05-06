import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriPulse — কৃষক সহকারী",
  description: "বাংলাদেশের কৃষকদের জন্য AI চ্যাটবট",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="bg-green-50 min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
