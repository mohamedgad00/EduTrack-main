"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface WorkflowShellProps {
  title: string;
  subtitle: string;
  nav: Array<{ href: string; label: string }>;
  children: React.ReactNode;
}

export default function WorkflowShell({ title, subtitle, nav, children }: WorkflowShellProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user_id");
    Cookies.remove("admin_auth", { path: "/" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
              <GraduationCap size={24} />
            </div>
          <div>
              <h1 className="text-xl font-bold">{t(title)}</h1>
              <p className="text-xs text-gray-500">{t(subtitle)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {t(item.label)}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <LogOut size={16} />
            {t("logout")}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
