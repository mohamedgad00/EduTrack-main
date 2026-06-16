"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { attendanceSummary, getMyTeacherCourses } from "@/services/workflowService";
import { Course } from "@/types/course";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const nav = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/courses", label: "My Courses" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/assessments", label: "Assessments" },
];

export default function TeacherAllAttendancePage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getMyTeacherCourses()
      .then(setCourses)
      .finally(() => setIsLoading(false));
  }, []);

  const rows = useMemo(
    () =>
      courses.flatMap((course) =>
        course.students.map((student) => {
          const summary = attendanceSummary(course, student.id);
          return {
            id: `${course.id}-${student.id}`,
            courseId: course.id,
            courseName: course.name,
            studentName: student.name,
            present: summary.present,
            absent: summary.absent,
            rate: summary.rate,
          };
        }),
      ),
    [courses],
  );

  const filteredRows = rows.filter((row) => {
    const value = query.toLowerCase();
    return row.studentName.toLowerCase().includes(value) || row.courseName.toLowerCase().includes(value);
  });

  return (
    <WorkflowShell title="Attendance" subtitle="Attendance overview across your courses." nav={nav}>
      <div className="mb-5 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${t("search")}...`}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {isLoading ? <p className="text-sm text-gray-500">{t("Loading courses...")}</p> : null}

      <section className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">{t("Student")}</th>
                <th className="px-5 py-3">{t("Course")}</th>
                <th className="px-5 py-3">{t("Present")}</th>
                <th className="px-5 py-3">{t("Absent")}</th>
                <th className="px-5 py-3">{t("Rate")}</th>
                <th className="px-5 py-3">{t("Open")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-medium text-gray-900">{row.studentName}</td>
                  <td className="px-5 py-4 text-gray-600">{row.courseName}</td>
                  <td className="px-5 py-4 font-semibold text-green-700">{row.present}</td>
                  <td className="px-5 py-4 font-semibold text-red-700">{row.absent}</td>
                  <td className="px-5 py-4 font-semibold text-blue-700">{row.rate}%</td>
                  <td className="px-5 py-4">
                    <Link href={`/teacher/courses/${row.courseId}/attendance`} className="text-blue-600 hover:text-blue-700">
                      {t("Take Attendance")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredRows.length === 0 ? <p className="p-5 text-sm text-gray-500">{t("No attendance records found.")}</p> : null}
      </section>
    </WorkflowShell>
  );
}
