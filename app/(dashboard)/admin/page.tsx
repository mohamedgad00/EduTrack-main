
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, FileQuestion, Megaphone, Users } from "lucide-react";
import { Announcements, RecentActivity, UpcomingQuizzes } from "@/components/admin/BottomWidgets";
import Charts from "@/components/admin/Charts";
import KpiCards from "@/components/admin/KpiCards";
import { QuickActions } from "@/components/admin/QuickActions";
import { RecentUsers } from "@/components/admin/RecentUsers";
import AddUserModal from "@/components/modals/AddUserModal";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  if (isAddUserModalOpen) {
    return <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      {/* KPI Cards */}
      <KpiCards />
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { href: "/admin/users?role=all", label: "Manage Users", icon: Users, desc: "Create, edit, search, delete" },
          { href: "/admin/courses", label: "Manage Courses", icon: BookOpen, desc: "Courses, reports, rosters" },
          { href: "/admin/analytics", label: "Analytics", icon: FileQuestion, desc: "System reports and export" },
          { href: "/admin/announcements", label: "Announcements", icon: Megaphone, desc: "Draft and review notices" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:bg-blue-50">
              <Icon className="mb-3 text-blue-600" size={24} />
              <p className="font-semibold text-gray-900">{t(item.label)}</p>
              <p className="mt-1 text-sm text-gray-500">{t(item.desc)}</p>
            </Link>
          );
        })}
      </div>
      {/* Charts */}
      <Charts />
      {/* Quick Actions + Recent Users */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-1">
          <QuickActions
            onAddUserClick={() => setIsAddUserModalOpen(true)}
            onAddCourseClick={() => router.push("/admin/courses")}
            onReportsClick={() => router.push("/admin/analytics")}
            onAnnounceClick={() => router.push("/admin/announcements")}
          />
        </div>
        <div className="xl:col-span-2">
          <RecentUsers />
        </div>
      </div>
      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity />
        <UpcomingQuizzes />
        <Announcements />
      </div>
    </div>
  );
}
