import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Portfolio",
};

export default function AdminRootPage() {
  redirect("/admin/portfolio");
}

