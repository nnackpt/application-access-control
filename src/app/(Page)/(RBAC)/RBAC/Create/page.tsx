import Create from "./Create";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create RBAC - Autoliv (Thailand) Co., Ltd.",
  description: "This is the layout for the application section.",
};

export default function CreatePage() {
    return (
        <Create />
    )
}