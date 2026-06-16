"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface ParentDashboardData {
  childSummaries: Array<{ id: string; name: string; level?: string; classSection?: string; courses: number; averageScore: number; attendanceRate: number; alerts: string[] }>;
  courses: Array<{ childId: string; childName: string; courseId: string; courseName: string; teacherName: string; averageScore: number; attendanceRate: number }>;
}

export default function ParentChildDetailsPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    api.get<ParentDashboardData>("parent/dashboard")
      .then((response) => setData(response.data))
      .finally(() => setIsLoaded(true));
  }, []);

  const child = data?.childSummaries.find((item) => item.id === params.id);
  const courses = useMemo(() => data?.courses.filter((item) => item.childId === params.id) ?? [], [data, params.id]);

  return (
    <WorkflowShell title="Child Profile" subtitle={child?.name ?? "Child progress"} nav={[{ href: "/parent", label: "Dashboard" }, { href: "/parent/children", label: "My Children" }, { href: `/parent/children/${params.id}/courses`, label: "Child Courses" }, { href: `/parent/children/${params.id}/grades`, label: "Child Grades" }, { href: `/parent/children/${params.id}/attendance`, label: "Child Attendance" }]}>
      {child ? (
        <div className="space-y-6">
          <section className="rounded-lg bg-blue-600 p-6 text-white">
            <h2 className="text-3xl font-bold">{child.name}</h2>
            <p className="mt-2 text-blue-50">{t("Level")} {child.level} - {t("Section")} {child.classSection}</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <span><b>{child.courses}</b><br />{t("Courses")}</span>
              <span><b>{child.averageScore}%</b><br />{t("Average")}</span>
              <span><b>{child.attendanceRate}%</b><br />{t("Attendance")}</span>
            </div>
          </section>
          <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">{t("Courses")}</h3>
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.courseId} className="rounded-md bg-gray-50 p-4">
                  <p className="font-medium">{course.courseName}</p>
                  <p className="text-sm text-gray-500">{t("Teacher")}: {course.teacherName}</p>
                  <p className="mt-2 text-sm">{course.averageScore}% {t("Score")} - {course.attendanceRate}% {t("Attendance")}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <p className={isLoaded ? "text-sm text-red-600" : "text-sm text-gray-500"}>
          {isLoaded ? t("This child is not linked to your account.") : t("Loading child profile...")}
        </p>
      )}
    </WorkflowShell>
  );
}
