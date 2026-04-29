import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "YesCity AI Content Engine",
  description:
    "AI-powered trend-to-content engine for YesCity — generate weekly content plans and quick ideas for Instagram, LinkedIn, and X.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0F1117]">
        {children}
      </body>
    </html>
  );
}
