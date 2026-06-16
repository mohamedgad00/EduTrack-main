"use client";

import { useEffect, useMemo, useState } from "react";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface StudentDashboardData {
  deadlines: Array<{ id: string; title: string; course: string; date: string }>;
  gradeRecords: Array<{ id: string; course: string; title: string; grade?: number; percentage: number | null; status: string }>;
  attendanceRows: Array<{ courseId: string; course: string; rate: number }>;
}

export default function StudentNotificationsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<StudentDashboardData | null>(null);

  useEffect(() => {
    api.get<StudentDashboardData>("student/dashboard").then((response) => setData(response.data));
  }, []);

  const notifications = useMemo(() => {
    if (!data) return [];

    return [
      ...data.gradeRecords
        .filter((record) => record.grade !== undefined)
        .slice(0, 4)
        .map((record) => ({
          id: `grade-${record.id}`,
          title: t("New grade available"),
          body: `${record.title} - ${record.course}: ${record.percentage}%`,
        })),
      ...data.attendanceRows
        .filter((row) => row.rate < 80)
        .map((row) => ({
          id: `attendance-${row.courseId}`,
          title: t("Attendance needs attention"),
          body: `${row.course}: ${row.rate}%`,
        })),
      ...data.deadlines.slice(0, 4).map((item) => ({
        id: `deadline-${item.id}`,
        title: t("Upcoming assessment"),
        body: `${item.title} - ${item.course} - ${item.date}`,
      })),
    ];
  }, [data, t]);

  return (
    <WorkflowShell title="Notifications" subtitle="System and course updates for the student." nav={[{ href: "/student", label: "Dashboard" }, { href: "/student/courses", label: "My Courses" }, { href: "/student/upcoming", label: "Upcoming Work" }]}>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <p className="font-medium">{notification.title}</p>
            <p className="mt-1 text-sm text-gray-500">{notification.body}</p>
          </div>
        ))}
      </div>
      {data && notifications.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No notifications found.")}</p> : null}
    </WorkflowShell>
  );
}
