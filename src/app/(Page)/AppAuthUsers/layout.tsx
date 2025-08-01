import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Authorize User - Autoliv (Thailand) Co., Ltd.",
  description: "This is the layout for the application section.",
};

export default function AppAuthUsersLayout({
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