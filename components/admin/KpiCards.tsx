"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  FileQuestion,
  GraduationCap,
  LucideIcon,
  UserCheck,
  Users,
} from "lucide-react";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface AdminDashboardSummary {
  stats: {
    students: number;
    teachers: number;
    parents: number;
    courses: number;
    assessments: number;
    activeUsers: number;
    averageScore: number;
  };
}

interface KpiCard {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: number;
  suffix?: string;
  helper: string;
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

function KpiCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 h-10 w-10 rounded-md bg-gray-100" />
      <div className="mb-3 h-4 w-24 rounded bg-gray-100" />
      <div className="h-8 w-20 rounded bg-gray-100" />
    </div>
  );
}

export default function KpiCards() {
  const { t } = useLanguage();
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .get<AdminDashboardSummary>("admin/dashboard")
      .then((response) => {
        if (isMounted) setData(response.data);
      })
      .catch(() => {
        if (isMounted) setError("failed.admin.stats");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!data && !error) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const cards: KpiCard[] = data
    ? [
        { icon: Users, iconClass: "bg-blue-50 text-blue-600", label: "Students", value: data.stats.students, helper: "students" },
        { icon: GraduationCap, iconClass: "bg-purple-50 text-purple-600", label: "Teachers", value: data.stats.teachers, helper: "teachers" },
        { icon: UserCheck, iconClass: "bg-orange-50 text-orange-600", label: "Parents", value: data.stats.parents, helper: "parents" },
        { icon: BookOpen, iconClass: "bg-teal-50 text-teal-600", label: "Courses", value: data.stats.courses, helper: "active.courses" },
        { icon: FileQuestion, iconClass: "bg-amber-50 text-amber-600", label: "Assessments", value: data.stats.assessments, helper: "tasks" },
        { icon: Activity, iconClass: "bg-green-50 text-green-600", label: "Active", value: data.stats.activeUsers, helper: "users" },
        { icon: BarChart3, iconClass: "bg-rose-50 text-rose-600", label: "Average", value: data.stats.averageScore, suffix: "%", helper: "score" },
      ]
    : [];

  return (
    <div className="mb-8 space-y-3">
      {error ? <p className="text-sm text-red-600">{t(error)}</p> : null}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-7">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className={`mb-4 inline-flex rounded-md p-2 ${card.iconClass}`}>
                <Icon size={22} />
              </div>
              <p className="text-sm font-medium text-gray-500">{t(card.label)}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatNumber(card.value)}
                {card.suffix ?? ""}
              </p>
              <p className="mt-1 text-xs text-gray-400">{t(card.helper)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
