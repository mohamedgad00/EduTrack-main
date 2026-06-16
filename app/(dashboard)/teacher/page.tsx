"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarCheck,
  FileQuestion,
  GraduationCap,
  LogOut,
  Search,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface TeacherDashboardData {
  user: { fullName?: string; email?: string; specialty?: string };
  stats: {
    totalCourses: number;
    totalStudents: number;
    assessments: number;
    attendanceRate: number;
    averageScore: number;
  };
  courses: Array<{
    id: string;
    name: string;
    level: string;
    class: string;
    students: number;
    assessments: number;
    averageScore: number;
    attendanceRate: number;
  }>;
  upcoming: Array<{ id: string; title: string; type: string; course: string; date: string; maxGrade: number }>;
  recentStudents: Array<{ id: string; name: string }>;
  gradebook: Array<{
    id: string;
    course: string;
    studentName: string;
    averageScore: number;
    attendanceRate: number;
    completedAssessments: number;
  }>;
  assessmentBreakdown: Array<{ courseId: string; course: string; quizzes: number; homeworks: number; exams: number }>;
}

const statCards: Array<{
  key: keyof TeacherDashboardData["stats"];
  label: string;
  icon: LucideIcon;
  suffix?: string;
  className: string;
}> = [
  { key: "totalCourses", label: "Courses", icon: BookOpen, className: "bg-blue-50 text-blue-700" },
  { key: "totalStudents", label: "Students", icon: Users, className: "bg-teal-50 text-teal-700" },
  { key: "assessments", label: "Assessments", icon: FileQuestion, className: "bg-amber-50 text-amber-700" },
  { key: "attendanceRate", label: "Attendance", icon: CalendarCheck, suffix: "%", className: "bg-green-50 text-green-700" },
  { key: "averageScore", label: "Avg Score", icon: BarChart3, suffix: "%", className: "bg-purple-50 text-purple-700" },
] as const;

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<TeacherDashboardData>("teacher/dashboard");
        if (isMounted) setData(response.data);
      } catch {
        if (isMounted) setError("Failed to load teacher dashboard.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const topCourse = useMemo(
    () => data?.courses.reduce((winner, course) => (course.averageScore > winner.averageScore ? course : winner), data.courses[0]),
    [data],
  );
  const filteredCourses = useMemo(() => {
    const value = query.toLowerCase();
    return data?.courses.filter((course) => course.name.toLowerCase().includes(value) || course.level.toLowerCase().includes(value) || course.class.toLowerCase().includes(value)) ?? [];
  }, [data?.courses, query]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user_id");
    Cookies.remove("admin_auth", { path: "/" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
            <GraduationCap size={22} />
          </div>
          <span className="text-xl font-bold">EduTrack</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {[
            { href: "/teacher", label: "Dashboard", icon: Activity },
            { href: "/teacher/courses", label: "My Courses", icon: BookOpen },
            { href: "/teacher/students", label: "Students", icon: Users },
            { href: "/teacher/assessments", label: "Assessments", icon: FileQuestion },
            { href: "/teacher/attendance", label: "Attendance", icon: CalendarCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                item.href === "/teacher" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {t(item.label)}
            </Link>
          );
          })}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <p className="truncate text-sm font-semibold">{data?.user.fullName ?? t("Teacher")}</p>
          <p className="truncate text-xs text-gray-500">{data?.user.email ?? t("teacher account")}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            <LogOut size={16} />
            {t("logout")}
          </button>
        </div>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold">{t("Teacher Dashboard")}</h1>
            <p className="text-xs text-gray-500">{data?.user.specialty ?? t("Live course overview")}</p>
          </div>
          <label className="hidden items-center gap-2 rounded-md border border-gray-200 px-3 py-2 md:flex">
            <Search size={16} className="text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${t("search")}...`} className="w-56 border-0 bg-transparent text-sm outline-none placeholder:text-gray-500" />
          </label>
        </header>

        <section id="overview" className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8 rounded-lg bg-blue-600 p-6 text-white">
            <p className="text-sm text-blue-100">{t("welcome.back")}</p>
            <h2 className="mt-1 text-3xl font-bold">{data?.user.fullName ?? t("Teacher")}</h2>
            <p className="mt-2 max-w-2xl text-blue-50">
              {t("Manage active courses, review class performance, and keep attendance under control from one place.")}
            </p>
          </div>

          {isLoading ? <p className="text-sm text-gray-500">{t("Loading dashboard...")}</p> : null}
          {error ? <p className="text-sm text-red-600">{t(error)}</p> : null}

          {data ? (
            <>
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  const value = data.stats[card.key];
                  return (
                    <div key={card.key} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                      <div className={`mb-4 inline-flex rounded-md p-2 ${card.className}`}>
                        <Icon size={22} />
                      </div>
                      <p className="text-sm text-gray-500">{t(card.label)}</p>
                      <p className="mt-1 text-3xl font-bold">
                        {value}
                        {card.suffix ?? ""}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div id="courses" className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-semibold">{t("Active Courses")}</h3>
                    <span className="text-sm text-gray-500">{t("Top")}: {topCourse?.name ?? "-"}</span>
                  </div>
                  <div className="space-y-4">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className="rounded-md border border-gray-100 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h4 className="font-semibold">{course.name}</h4>
                            <p className="text-sm text-gray-500">
                            {course.level} - {course.class} - {course.students} {t("Students")}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-center text-sm">
                            <span><b>{course.assessments}</b><br />{t("Tasks")}</span>
                            <span><b>{course.averageScore}%</b><br />{t("Score")}</span>
                            <span><b>{course.attendanceRate}%</b><br />{t("Attendance")}</span>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                          <Link href={`/teacher/courses/${course.id}`} className="rounded-md bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-700">
                            {t("Open")}
                          </Link>
                          <Link href={`/teacher/courses/${course.id}/attendance`} className="rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold hover:bg-gray-50">
                            {t("Attendance")}
                          </Link>
                          <Link href={`/teacher/courses/${course.id}/assessments`} className="rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold hover:bg-gray-50">
                            {t("Assessments")}
                          </Link>
                          <Link href={`/teacher/courses/${course.id}/grades`} className="rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold hover:bg-gray-50">
                            {t("Grades")}
                          </Link>
                        </div>
                      </div>
                    ))}
                    {filteredCourses.length === 0 ? (
                      <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">{t("No courses found.")}</p>
                    ) : null}
                  </div>
                </div>

                <div id="assessments" className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 font-semibold">{t("Upcoming Assessments")}</h3>
                  <div className="space-y-3">
                    {data.upcoming.map((item) => (
                      <div key={item.id} className="rounded-md bg-gray-50 p-3">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.course}</p>
                        <p className="mt-1 text-xs text-blue-700">{item.type} - {item.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div id="students" className="mb-8 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">{t("Recent Students")}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 rounded-md bg-gray-50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{student.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 font-semibold">{t("Gradebook")}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="py-3 pr-4">{t("Student")}</th>
                          <th className="py-3 pr-4">{t("Course")}</th>
                          <th className="py-3 pr-4">{t("Completed")}</th>
                          <th className="py-3 pr-4">{t("Average")}</th>
                          <th className="py-3">{t("Attendance")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.gradebook.map((row) => (
                          <tr key={row.id}>
                            <td className="py-3 pr-4 font-medium">{row.studentName}</td>
                            <td className="py-3 pr-4 text-gray-600">{row.course}</td>
                            <td className="py-3 pr-4">{row.completedAssessments}</td>
                            <td className="py-3 pr-4 font-semibold text-blue-700">{row.averageScore}%</td>
                            <td className="py-3 font-semibold text-green-700">{row.attendanceRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div id="attendance" className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 font-semibold">{t("Assessment Breakdown")}</h3>
                  <div className="space-y-3">
                    {data.assessmentBreakdown.map((row) => (
                      <div key={row.courseId} className="rounded-md bg-gray-50 p-4">
                        <p className="font-medium">{row.course}</p>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                          <span className="rounded bg-white p-2"><b>{row.quizzes}</b><br />{t("Quizzes")}</span>
                          <span className="rounded bg-white p-2"><b>{row.homeworks}</b><br />{t("Homework")}</span>
                          <span className="rounded bg-white p-2"><b>{row.exams}</b><br />{t("Exams")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
