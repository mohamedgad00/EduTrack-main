"use client";

import { useEffect, useState } from "react";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface StudentDashboardData {
  gradeRecords: Array<{ id: string; course: string; title: string; type: string; grade?: number; maxGrade: number; percentage: number | null; status: string }>;
}

export default function StudentGradesPage() {
  const { t } = useLanguage();
  const [records, setRecords] = useState<StudentDashboardData["gradeRecords"]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<StudentDashboardData>("student/dashboard")
      .then((response) => setRecords(response.data.gradeRecords))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRecords = records.filter((record) => {
    const value = query.toLowerCase();
    return record.title.toLowerCase().includes(value) || record.course.toLowerCase().includes(value) || record.type.toLowerCase().includes(value);
  });

  return (
    <WorkflowShell title="My Grades" subtitle="All assessment records from enrolled courses." nav={[{ href: "/student", label: "Dashboard" }, { href: "/student/courses", label: "My Courses" }, { href: "/student/attendance", label: "My Attendance" }, { href: "/student/upcoming", label: "Upcoming Work" }]}>
      <div className="mb-5 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${t("search")}...`} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading grades...")}</p> : null}
      <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500"><tr><th className="py-3">{t("Assessment")}</th><th>{t("Course")}</th><th>{t("Type")}</th><th>{t("Grade")}</th><th>{t("Status")}</th></tr></thead>
          <tbody className="divide-y">
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td className="py-3 font-medium">{record.title}</td>
                <td>{record.course}</td>
                <td className="capitalize">{t(record.type)}</td>
                <td className="font-semibold text-blue-700">{record.grade !== undefined ? `${record.grade}/${record.maxGrade} (${record.percentage}%)` : "-"}</td>
                <td>{t(record.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filteredRecords.length === 0 ? <p className="pt-5 text-sm text-gray-500">{t("No grade records found.")}</p> : null}
      </div>
    </WorkflowShell>
  );
}
