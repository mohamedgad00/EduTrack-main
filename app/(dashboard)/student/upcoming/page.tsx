"use client";

import { useEffect, useState } from "react";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface StudentDashboardData {
  deadlines: Array<{ id: string; title: string; type: string; course: string; date: string }>;
}

export default function StudentUpcomingPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<StudentDashboardData["deadlines"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<StudentDashboardData>("student/dashboard")
      .then((response) => setItems(response.data.deadlines))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <WorkflowShell title="Upcoming Work" subtitle="Assessments and deadlines from your courses." nav={[{ href: "/student", label: "Dashboard" }, { href: "/student/courses", label: "My Courses" }, { href: "/student/grades", label: "My Grades" }, { href: "/student/attendance", label: "My Attendance" }]}>
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading upcoming work...")}</p> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-gray-500">{item.course} - {t(item.type)} - {item.date}</p>
          </div>
        ))}
      </div>
      {!isLoading && items.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No upcoming work found.")}</p> : null}
    </WorkflowShell>
  );
}
