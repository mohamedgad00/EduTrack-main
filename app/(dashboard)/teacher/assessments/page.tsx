"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { getCourseAssessments, getMyTeacherCourses } from "@/services/workflowService";
import { Course } from "@/types/course";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const nav = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/courses", label: "My Courses" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/attendance", label: "Attendance" },
];

export default function TeacherAllAssessmentsPage() {
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
        getCourseAssessments(course).map((assessment) => ({
          ...assessment,
          courseId: course.id,
          courseName: course.name,
          gradedCount: assessment.studentRecords.filter((record) => record.isPresent && record.grade !== undefined).length,
        })),
      ),
    [courses],
  );

  const filteredRows = rows.filter((row) => {
    const value = query.toLowerCase();
    return row.name.toLowerCase().includes(value) || row.courseName.toLowerCase().includes(value) || row.type.toLowerCase().includes(value);
  });

  return (
    <WorkflowShell title="Assessments" subtitle="All assessments across your courses." nav={nav}>
      <div className="mb-5 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${t("search")}...`}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {isLoading ? <p className="text-sm text-gray-500">{t("Loading courses...")}</p> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredRows.map((row) => (
          <article key={row.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-blue-600">{t(row.type)}</p>
                <h2 className="mt-1 text-lg font-semibold text-gray-900">{row.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{row.courseName}</p>
              </div>
              <span className="rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                {row.gradedCount}/{row.studentRecords.length} {t("Completed")}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <span className="rounded-md bg-gray-50 p-3">{t("Date")}: <b>{row.date}</b></span>
              <span className="rounded-md bg-gray-50 p-3">{t("Max Grade")}: <b>{row.maxGrade}</b></span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href={`/teacher/courses/${row.courseId}/assessments`} className="rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">
                {t("Manage Assessments")}
              </Link>
              <Link href={`/teacher/courses/${row.courseId}/grades`} className="rounded-md border border-gray-200 px-3 py-2 text-center text-sm font-medium hover:bg-gray-50">
                {t("Enter Grades")}
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!isLoading && filteredRows.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No assessments created yet.")}</p> : null}
    </WorkflowShell>
  );
}
