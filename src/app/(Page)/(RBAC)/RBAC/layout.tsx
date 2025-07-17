import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import 'react-loading-skeleton/dist/skeleton.css'

export const metadata: Metadata = {
  title: "RBAC - Autoliv (Thailand) Co., Ltd.",
  description: "This is the layout for the application section.",
};

export default function RbacLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <Toaster
            position="bottom-center"
            reverseOrder={false}
        />
        {children}
    </div>
  );
}