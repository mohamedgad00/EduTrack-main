"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Baby, Bell, BookOpen, CalendarCheck, ClipboardList, GraduationCap, LogOut, TrendingUp, Users, Bot } from "lucide-react";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface ParentDashboardData {
  user: { fullName?: string; email?: string; address?: string };
  children: Array<{ id: string; fullName?: string; level?: string; classSection?: string }>;
  stats: {
    children: number;
    totalCourses: number;
    attendanceRate: number;
    averagePerformance: number;
    upcomingTasks: number;
  };
  courses: Array<{
    childId: string;
    childName: string;
    courseId: string;
    courseName: string;
    teacherName: string;
    averageScore: number;
    attendanceRate: number;
  }>;
  upcoming: Array<{ id: string; title: string; type: string; course: string; date: string }>;
  attendance: { present: number; absent: number };
  childSummaries: Array<{
    id: string;
    name: string;
    level?: string;
    classSection?: string;
    courses: number;
    averageScore: number;
    attendanceRate: number;
    alerts: string[];
  }>;
}

export default function ParentDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<ParentDashboardData>("parent/dashboard");
        if (isMounted) setData(response.data);
      } catch {
        if (isMounted) setError("Failed to load parent dashboard.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user_id");
    Cookies.remove("admin_auth", { path: "/" });
    window.location.href = "/login";
  };

  const cards = data
    ? [
        { label: "Children", value: data.stats.children, icon: Baby, color: "bg-blue-50 text-blue-700" },
        { label: "Courses", value: data.stats.totalCourses, icon: BookOpen, color: "bg-purple-50 text-purple-700" },
        { label: "Attendance", value: `${data.stats.attendanceRate}%`, icon: CalendarCheck, color: "bg-green-50 text-green-700" },
        { label: "Performance", value: `${data.stats.averagePerformance}%`, icon: TrendingUp, color: "bg-teal-50 text-teal-700" },
        { label: "Upcoming", value: data.stats.upcomingTasks, icon: ClipboardList, color: "bg-amber-50 text-amber-700" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("Parent Dashboard")}</h1>
              <p className="text-xs text-gray-500">{data?.user.email ?? t("Family progress overview")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { href: "/parent/children", label: "My Children", icon: Baby },
              { href: "/parent/announcements", label: "Announcements", icon: Bell },
              { href: "/parent/ai-analysis", label: "AI Analysis", icon: Bot },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                  <Icon size={15} />
                  {t(item.label)}
                </Link>
              );
            })}
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
              <LogOut size={16} />
              {t("logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-8 rounded-lg bg-blue-600 p-6 text-white">
          <p className="text-sm text-blue-100">{t("welcome")}</p>
          <h2 className="mt-1 text-3xl font-bold">{data?.user.fullName ?? t("Parent")}</h2>
          <p className="mt-2 max-w-2xl text-blue-50">
            {t("Follow your children, their courses, attendance, and upcoming school work from one clear dashboard.")}
          </p>
        </section>

        {isLoading ? <p className="text-sm text-gray-500">{t("Loading dashboard...")}</p> : null}
        {error ? <p className="text-sm text-red-600">{t(error)}</p> : null}

        {data ? (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                    <div className={`mb-4 inline-flex rounded-md p-2 ${card.color}`}>
                      <Icon size={22} />
                    </div>
                    <p className="text-sm text-gray-500">{t(card.label)}</p>
                    <p className="mt-1 text-3xl font-bold">{card.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mb-8 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">{t("Children Summary")}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.childSummaries.map((child) => (
                  <div key={child.id} className="rounded-md bg-gray-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {child.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-gray-500">{t("Level")} {child.level ?? "-"} - {t("Section")} {child.classSection ?? "-"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <span className="rounded bg-white p-2"><b>{child.courses}</b><br />{t("Courses")}</span>
                      <span className="rounded bg-white p-2"><b>{child.averageScore}%</b><br />{t("Score")}</span>
                      <span className="rounded bg-white p-2"><b>{child.attendanceRate}%</b><br />{t("Attendance")}</span>
                    </div>
                    {child.alerts.length > 0 ? (
                      <div className="mt-3 space-y-1">
                        {child.alerts.map((alert) => (
                          <p key={alert} className="rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                            {t(alert)}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        {t("No urgent alerts")}
                      </p>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link href={`/parent/children/${child.id}`} className="rounded-md bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-700">
                        {t("Profile")}
                      </Link>
                      <Link href={`/parent/children/${child.id}/grades`} className="rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold hover:bg-gray-50">
                        {t("Grades")}
                      </Link>
                      <Link href={`/parent/children/${child.id}/attendance`} className="rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold hover:bg-gray-50">
                        {t("Attendance")}
                      </Link>
                      <Link href={`/parent/children/${child.id}/courses`} className="rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold hover:bg-gray-50">
                        {t("Courses")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-5 font-semibold">{t("Course Performance")}</h3>
                <div className="space-y-4">
                  {data.courses.map((course) => (
                    <div key={`${course.childId}-${course.courseId}`} className="rounded-md border border-gray-100 p-4">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-700">{course.childName}</p>
                          <h4 className="font-semibold">{course.courseName}</h4>
                          <p className="text-sm text-gray-500">{t("Teacher")}: {course.teacherName}</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                          {course.averageScore}%
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{course.attendanceRate}% {t("Attendance")}</span>
                        <span>{course.averageScore}% {t("Average")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 font-semibold">{t("Upcoming Work")}</h3>
                  <div className="space-y-3">
                    {data.upcoming.map((item) => (
                      <div key={item.id} className="rounded-md bg-gray-50 p-3">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.course}</p>
                        <p className="mt-1 text-xs text-blue-700">{t(item.type)} - {item.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold">{t("Family Attendance")}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{t("Present")}</p>
                      <p className="text-2xl font-bold text-green-600">{data.attendance.present}</p>
                    </div>
                    <Users className="text-blue-600" size={28} />
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{t("Absent")}</p>
                      <p className="text-2xl font-bold text-red-600">{data.attendance.absent}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
