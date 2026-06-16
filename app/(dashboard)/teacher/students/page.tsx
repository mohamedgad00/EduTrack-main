"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { attendanceSummary, getMyTeacherCourses, studentAverage } from "@/services/workflowService";
import { Course } from "@/types/course";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const nav = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/courses", label: "My Courses" },
  { href: "/teacher/assessments", label: "Assessments" },
  { href: "/teacher/attendance", label: "Attendance" },
];

export default function TeacherStudentsPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getMyTeacherCourses()
      .then(setCourses)
      .finally(() => setIsLoading(false));
  }, []);

  const rows = useMemo(() => {
    const studentMap = new Map<
      string,
      {
        id: string;
        name: string;
        courses: Array<{ id: string; name: string }>;
        averages: number[];
        attendanceRates: number[];
      }
    >();

    courses.forEach((course) => {
      course.students.forEach((student) => {
        const current =
          studentMap.get(student.id) ??
          {
            id: student.id,
            name: student.name,
            courses: [],
            averages: [],
            attendanceRates: [],
          };

        current.courses.push({ id: course.id, name: course.name });
        current.averages.push(studentAverage(course, student.id));
        current.attendanceRates.push(attendanceSummary(course, student.id).rate);
        studentMap.set(student.id, current);
      });
    });

    return [...studentMap.values()].map((student) => ({
      ...student,
      averageScore: Math.round(student.averages.reduce((sum, value) => sum + value, 0) / Math.max(student.averages.length, 1)),
      attendanceRate: Math.round(
        student.attendanceRates.reduce((sum, value) => sum + value, 0) / Math.max(student.attendanceRates.length, 1),
      ),
    }));
  }, [courses]);

  const filteredRows = rows.filter((row) => {
    const value = query.toLowerCase();
    return row.name.toLowerCase().includes(value) || row.courses.some((course) => course.name.toLowerCase().includes(value));
  });

  return (
    <WorkflowShell title="Students" subtitle="All students assigned to your courses." nav={nav}>
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
                <th className="px-5 py-3">{t("Courses")}</th>
                <th className="px-5 py-3">{t("Average")}</th>
                <th className="px-5 py-3">{t("Attendance")}</th>
                <th className="px-5 py-3">{t("Open")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-medium text-gray-900">{row.name}</td>
                  <td className="px-5 py-4 text-gray-600">{row.courses.map((course) => course.name).join(", ")}</td>
                  <td className="px-5 py-4 font-semibold text-blue-700">{row.averageScore}%</td>
                  <td className="px-5 py-4 font-semibold text-green-700">{row.attendanceRate}%</td>
                  <td className="px-5 py-4">
                    <Link href={`/teacher/courses/${row.courses[0]?.id ?? ""}`} className="text-blue-600 hover:text-blue-700">
                      {t("Open Course")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredRows.length === 0 ? <p className="p-5 text-sm text-gray-500">{t("No students found.")}</p> : null}
      </section>
    </WorkflowShell>
  );
}
