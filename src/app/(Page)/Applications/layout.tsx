import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications - Autoliv (Thailand) Co., Ltd.",
  description: "This is the layout for the application section.",
};

export default function ApplicationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        {children}
    </div>
  );
}