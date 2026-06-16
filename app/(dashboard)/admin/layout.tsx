import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const hasAdminSession = cookieStore.get("admin_auth")?.value === "true";

  if (!hasAdminSession) {
    redirect("/login");
  }

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}

