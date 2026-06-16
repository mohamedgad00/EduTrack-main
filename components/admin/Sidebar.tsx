"use client";

import {
  GraduationCap, LayoutDashboard, Users, BookOpen,
  ClipboardList, BarChart2, Megaphone,
  Settings, LogOut, LucideIcon, X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface NavItem { label: string; icon: LucideIcon; href: string; }
interface NavGroup { section: string | null; items: NavItem[]; }

const navItems: NavGroup[] = [
  {
    section: null,
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/admin" }],
  },
  {
    section: "Management",
    items: [
      { label: "Users", icon: Users, href: "/admin/users" },
      { label: "Courses", icon: BookOpen, href: "/admin/courses" },
      { label: "Enrollments", icon: ClipboardList, href: "/admin/enrollments" },
    ],
  },
  {
    section: "Academic",
    items: [
      { label: "Reports & Analytics", icon: BarChart2, href: "/admin/analytics" },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Announcements", icon: Megaphone, href: "/admin/announcements" },
      { label: "Settings", icon: Settings, href: "/admin/settings" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = () => {
    Cookies.remove("admin_auth", { path: "/" });
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role");
    Cookies.remove("user_id");
    router.push("/login");
  };

  const isItemActive = (href: string) => {
    if (href === "#") {
      return false;
    }

    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  return (
    <aside className={`
      w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 min-h-screen
      fixed md:relative z-40
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white">
            <GraduationCap size={20} />
          </div>
          <span className="font-bold text-xl text-gray-900">{t("app.name")}</span>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="md:hidden p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Close menu"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <p className="pt-4 pb-2 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                {t(group.section)}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group mb-0.5
                    ${active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <Icon
                    size={20}
                    className={active ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"}
                  />
                {t(item.label)}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <Image
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Admin Profile"
            width={40}
            height={40}
            className="rounded-full object-cover border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{t("Admin")}</p>
            <p className="text-xs text-gray-500 truncate">{t("admin.dashboard")}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer border-0"
        >
          <LogOut size={16} />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
