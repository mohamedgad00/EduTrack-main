"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface AdminDashboardWidgets {
  activities: Array<{ type: string; title: string; desc: string; time: string }>;
  upcoming: Array<{ id: string; title: string; type: string; course: string; date: string }>;
  announcements: Array<{ id: string; category: string; title: string; body: string }>;
}

const styleByType: Record<string, { dotBg: string; dot: string }> = {
  student: { dotBg: "bg-blue-100", dot: "bg-blue-600" },
  teacher: { dotBg: "bg-purple-100", dot: "bg-purple-600" },
  parent: { dotBg: "bg-orange-100", dot: "bg-orange-600" },
  course: { dotBg: "bg-green-100", dot: "bg-green-600" },
};

function useAdminWidgets() {
  const [data, setData] = useState<AdminDashboardWidgets | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const response = await api.get<AdminDashboardWidgets>("admin/dashboard");
        if (isMounted) setData(response.data);
      } catch {
        if (isMounted) setError("failed.dashboard.widgets");
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, error };
}

export function RecentActivity() {
  const { t } = useLanguage();
  const { data, error } = useAdminWidgets();
  const activities = data?.activities ?? [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 text-[15px] mb-4">{t("Recent Activity")}</h3>
      {error ? <p className="mb-3 text-sm text-red-600">{t(error)}</p> : null}

      <div className="relative">
        <div className="absolute left-2.5 top-2 bottom-0 w-px bg-gray-200" />
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const style = styleByType[activity.type] ?? { dotBg: "bg-gray-100", dot: "bg-gray-500" };
            return (
              <div key={`${activity.title}-${index}`} className="relative pl-8">
                <div className={`absolute left-0 top-1 w-5 h-5 ${style.dotBg} rounded-full border-2 border-white flex items-center justify-center`}>
                  <div className={`w-2 h-2 ${style.dot} rounded-full`} />
                </div>
                <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{activity.desc}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            );
          })}
          {!data && !error ? <p className="text-sm text-gray-500">{t("loading")}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function UpcomingQuizzes() {
  const { t } = useLanguage();
  const { data, error } = useAdminWidgets();
  const quizzes = data?.upcoming ?? [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-[15px]">{t("Upcoming Assessments")}</h3>
        <Link href="/admin/courses" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          {t("Courses")}
        </Link>
      </div>
      {error ? <p className="mb-3 text-sm text-red-600">{t(error)}</p> : null}

      <div className="space-y-3">
        {quizzes.map((quiz) => {
          const date = new Date(quiz.date);
          return (
            <div key={quiz.id} className="flex items-start gap-3 p-3 rounded-md bg-gray-50 border border-gray-100">
              <div className="shrink-0 w-10 h-10 bg-white rounded-md flex flex-col items-center justify-center border border-gray-200">
                <span className="text-[10px] text-red-500 uppercase font-semibold leading-none">
                  {new Intl.DateTimeFormat("en", { month: "short" }).format(date)}
                </span>
                <span className="text-sm font-bold text-gray-700">{date.getDate()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{quiz.title}</p>
                <p className="text-xs text-gray-500">{quiz.course} - {quiz.type}</p>
              </div>
            </div>
          );
        })}
        {!data && !error ? <p className="text-sm text-gray-500">{t("loading")}</p> : null}
      </div>
    </div>
  );
}

export function Announcements() {
  const { t } = useLanguage();
  const { data, error } = useAdminWidgets();
  const announcements = data?.announcements ?? [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-[15px]">{t("Announcements")}</h3>
        <Link
          href="/admin/announcements"
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0"
        >
          <Plus size={16} />
        </Link>
      </div>
      {error ? <p className="mb-3 text-sm text-red-600">{t(error)}</p> : null}

      <div className="flex-1 space-y-4">
        {announcements.map((announcement, index) => (
          <div
            key={announcement.id}
            className={`p-3 rounded-md border ${index % 2 === 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${index % 2 === 0 ? "bg-blue-500" : "bg-orange-500"}`} />
              <p className={`text-[11px] font-bold uppercase tracking-wider ${index % 2 === 0 ? "text-blue-800" : "text-orange-800"}`}>
                {announcement.category}
              </p>
            </div>
            <p className={`text-sm font-semibold ${index % 2 === 0 ? "text-blue-900" : "text-orange-900"}`}>
              {announcement.title}
            </p>
            <p className={`mt-1 text-xs ${index % 2 === 0 ? "text-blue-800" : "text-orange-800"}`}>
              {announcement.body}
            </p>
          </div>
        ))}
        {!data && !error ? <p className="text-sm text-gray-500">{t("loading")}</p> : null}
      </div>

      <Link
        href="/admin/announcements"
        className="w-full mt-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors cursor-pointer bg-transparent"
      >
        {t("Announcements")}
      </Link>
    </div>
  );
}
