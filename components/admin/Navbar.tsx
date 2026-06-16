"use client";

import { FormEvent, useEffect, useState } from "react";
import { Search, Bell, Settings, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface NavbarProps {
  onMenuToggle: () => void;
}

interface AdminDashboardHeader {
  admin: {
    fullName?: string;
    email?: string;
  };
  stats: {
    activeUsers: number;
    assessments: number;
  };
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<AdminDashboardHeader | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHeader = async () => {
      try {
        const response = await api.get<AdminDashboardHeader>("admin/dashboard");
        if (isMounted) setData(response.data);
      } catch {
        if (isMounted) setData(null);
      }
    };

    loadHeader();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    router.push(trimmedQuery ? `/admin/users?role=all&q=${encodeURIComponent(trimmedQuery)}` : "/admin/users?role=all");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 hover:bg-gray-50 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {t("welcome")}, {data?.admin.fullName?.split(" ")[0] ?? t("admin")}
          </h1>
          <p className="text-xs text-gray-500">
            {data ? `${data.stats.activeUsers} ${t("users")} - ${data.stats.assessments} ${t("assessments")}` : t("loading")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`${t("search")}...`}
            className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
          />
        </form>

        <button
          onClick={() => router.push("/admin/analytics")}
          className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
          aria-label="Open analytics"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <button
          onClick={() => router.push("/admin/users?role=all")}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
          aria-label="Open admin settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
