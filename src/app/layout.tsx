"use client"

import { Inter } from "next/font/google";

import "./globals.css";
// import Navbar from "@/Components/Layout/Navbar";
import Footer from "@/Components/Layout/Footer";
import { Sidebar, useSidebar } from '@/Components/Layout/Sidebar';

// const roboto = Roboto({
//   variable: "--font-roboto", 
//   subsets: ["latin"],
//   weight: ["400", "700"] 
// });

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} font-sans antialiased`}>

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
