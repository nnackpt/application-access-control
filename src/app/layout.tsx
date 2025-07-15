"use client"

// import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Open_Sans } from "next/font/google";

import "./globals.css";
// import Navbar from "@/Components/Layout/Navbar";
import Footer from "@/Components/Layout/Footer";
import { Sidebar, useSidebar } from '@/Components/Layout/Sidebar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto", 
  subsets: ["latin"],
  weight: ["400", "700"] 
});

const openSans = Open_Sans({
  variable: "--font-open-sans", 
  subsets: ["latin"],
  weight: ["400", "700"] 
});

// export const metadata: Metadata = {
//   title: "Home - Autoliv (Thailand) Co., Ltd.",
//   description: "This is the layout for the application section.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${openSans.variable} antialiased`}
      >
        {/* <Navbar /> */}
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggle} />

        <main 
        className="transition-all duration-300 min-h-screen"
        style={{ 
          marginLeft: isCollapsed ? '80px' : '320px' 
        }}
      >
        <div className="p-4 lg:p-8">
          {children}
        </div>

        <Footer />
      </main>

        
      </body>
    </html>
  );
}
