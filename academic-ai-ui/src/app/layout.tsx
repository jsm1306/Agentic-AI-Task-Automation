import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../components/ui/Toast";
import { SubjectProvider } from "../components/context/SubjectContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autonomous Academic AI Assistant",
  description: "Premium AI-powered academic assistant for research and learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Top-level toast root (portal target) — very high in the DOM hierarchy */}
        <div id="toast-root" className="fixed inset-0 pointer-events-none z-[999999] flex items-start justify-center p-6" />
        <ToastProvider>
          <SubjectProvider>
            {children}
          </SubjectProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
