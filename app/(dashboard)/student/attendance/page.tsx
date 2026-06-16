"use client";

import { useEffect, useState } from "react";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface StudentDashboardData {
  attendanceRows: Array<{ courseId: string; course: string; present: number; absent: number; rate: number }>;
}

export default function StudentAttendancePage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<StudentDashboardData["attendanceRows"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<StudentDashboardData>("student/dashboard")
      .then((response) => setRows(response.data.attendanceRows))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <WorkflowShell title="My Attendance" subtitle="Attendance percentage and counts by course." nav={[{ href: "/student", label: "Dashboard" }, { href: "/student/courses", label: "My Courses" }, { href: "/student/grades", label: "My Grades" }, { href: "/student/upcoming", label: "Upcoming Work" }]}>
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading attendance...")}</p> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.courseId} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex justify-between"><h2 className="font-semibold">{row.course}</h2><span className="font-bold text-blue-700">{row.rate}%</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-green-600" style={{ width: `${row.rate}%` }} /></div>
            <p className="mt-3 text-sm text-gray-500">{row.present} {t("Present")} - {row.absent} {t("Absent")}</p>
          </div>
        ))}
      </div>
      {!isLoading && rows.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No attendance records found.")}</p> : null}
    </WorkflowShell>
  );
}
