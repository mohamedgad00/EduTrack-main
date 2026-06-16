"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Award, Bell, BookOpen, CalendarCheck, CheckCircle2, Clock, GraduationCap, LogOut, TrendingUp } from "lucide-react";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface StudentDashboardData {
  user: { fullName?: string; email?: string; level?: string; classSection?: string };
  stats: {
    enrolledCourses: number;
    completedAssessments: number;
    attendanceRate: number;
    performanceScore: number;
  };
  courses: Array<{
    id: string;
    name: string;
    teacherName: string;
    averageScore: number;
    attendanceRate: number;
    assessments: number;
  }>;
  deadlines: Array<{ id: string; title: string; type: string; course: string; date: string }>;
  attendance: { present: number; absent: number };
  gradeRecords: Array<{
    id: string;
    course: string;
    title: string;
    type: string;
    date: string;
    grade?: number;
    maxGrade: number;
    percentage: number | null;
    status: string;
  }>;
  attendanceRows: Array<{ courseId: string; course: string; present: number; absent: number; rate: number }>;
}

export default function StudentDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<StudentDashboardData>("student/dashboard");
        if (isMounted) setData(response.data);
      } catch {
        if (isMounted) setError("Failed to load student dashboard.");
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
        { label: "Courses", value: data.stats.enrolledCourses, icon: BookOpen, color: "bg-blue-50 text-blue-700" },
        { label: "Tasks", value: data.stats.completedAssessments, icon: CheckCircle2, color: "bg-green-50 text-green-700" },
        { label: "Attendance", value: `${data.stats.attendanceRate}%`, icon: CalendarCheck, color: "bg-teal-50 text-teal-700" },
        { label: "Performance", value: `${data.stats.performanceScore}%`, icon: Award, color: "bg-purple-50 text-purple-700" },
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
              <h1 className="text-xl font-bold">{t("Student Dashboard")}</h1>
              <p className="text-xs text-gray-500">{data?.user.email ?? t("EduTrack learning portal")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { href: "/student/courses", label: "My Courses", icon: BookOpen },
              { href: "/student/grades", label: "My Grades", icon: Award },
              { href: "/student/attendance", label: "My Attendance", icon: CalendarCheck },
              { href: "/student/upcoming", label: "Upcoming Work", icon: Clock },
              { href: "/student/notifications", label: "Notifications", icon: Bell },
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
          <p className="text-sm text-blue-100">{t("welcome.back")}</p>
          <h2 className="mt-1 text-3xl font-bold">{data?.user.fullName ?? t("Student")}</h2>
          <p className="mt-2 text-blue-50">
            {data?.user.level ? `${t("Level")} ${data.user.level}, ${t("Section")} ${data.user.classSection}` : t("Track courses, grades, and attendance.")}
          </p>
        </section>

        {isLoading ? <p className="text-sm text-gray-500">{t("Loading dashboard...")}</p> : null}
        {error ? <p className="text-sm text-red-600">{t(error)}</p> : null}

        {data ? (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-5 font-semibold">{t("My Courses")}</h3>
                <div className="space-y-4">
                  {data.courses.map((course) => (
                    <div key={course.id} className="rounded-md border border-gray-100 p-4">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold">{course.name}</h4>
                          <p className="text-sm text-gray-500">{t("Teacher")}: {course.teacherName}</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                          {course.averageScore}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${course.averageScore}%` }} />
                      </div>
                      <div className="mt-3 flex gap-4 text-sm text-gray-500">
                        <span>{course.assessments} {t("Assessments")}</span>
                        <span>{course.attendanceRate}% {t("Attendance")}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                        <Link href={`/student/courses/${course.id}`} className="rounded-md bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-700">
                          {t("Open")}
                        </Link>
                        <Link href="/student/grades" className="rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold hover:bg-gray-50">
                          {t("Grades")}
                        </Link>
                        <Link href="/student/attendance" className="rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold hover:bg-gray-50">
                          {t("Attendance")}
                        </Link>
                        <Link href="/student/upcoming" className="rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-semibold hover:bg-gray-50">
                          {t("Upcoming Work")}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 font-semibold">{t("Upcoming Deadlines")}</h3>
                  <div className="space-y-3">
                    {data.deadlines.map((deadline) => (
                      <div key={deadline.id} className="flex gap-3 rounded-md bg-gray-50 p-3">
                        <Clock size={18} className="mt-0.5 text-amber-600" />
                        <div>
                          <p className="font-medium">{deadline.title}</p>
                          <p className="text-sm text-gray-500">{deadline.course}</p>
                          <p className="mt-1 text-xs text-blue-700">{deadline.type} - {deadline.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold">{t("Attendance Summary")}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{t("Present")}</p>
                      <p className="text-2xl font-bold text-green-600">{data.attendance.present}</p>
                    </div>
                    <TrendingUp className="text-blue-600" size={28} />
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{t("Absent")}</p>
                      <p className="text-2xl font-bold text-red-600">{data.attendance.absent}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-5 font-semibold">{t("Grade Records")}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="py-3 pr-4">{t("Assessment")}</th>
                        <th className="py-3 pr-4">{t("Course")}</th>
                        <th className="py-3 pr-4">{t("Type")}</th>
                        <th className="py-3 pr-4">{t("Grade")}</th>
                        <th className="py-3">{t("Status")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.gradeRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="py-3 pr-4 font-medium">{record.title}</td>
                          <td className="py-3 pr-4 text-gray-600">{record.course}</td>
                          <td className="py-3 pr-4 capitalize">{t(record.type)}</td>
                          <td className="py-3 pr-4 font-semibold text-blue-700">
                            {record.grade !== undefined ? `${record.grade}/${record.maxGrade} (${record.percentage}%)` : "-"}
                          </td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${record.status === "present" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                              {t(record.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-5 font-semibold">{t("Attendance by Course")}</h3>
                <div className="space-y-3">
                  {data.attendanceRows.map((row) => (
                    <div key={row.courseId} className="rounded-md bg-gray-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium">{row.course}</p>
                        <span className="font-semibold text-blue-700">{row.rate}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-green-600" style={{ width: `${row.rate}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">{row.present} {t("Present")} - {row.absent} {t("Absent")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
