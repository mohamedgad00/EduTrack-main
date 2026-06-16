"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { getMyTeacherCourses, studentAverage, attendanceSummary, getCourseAssessments } from "@/services/workflowService";
import { Course } from "@/types/course";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const nav = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/courses", label: "My Courses" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/assessments", label: "Assessments" },
  { href: "/teacher/attendance", label: "Attendance" },
  { href: "/teacher/reports", label: "Reports" },
];

export default function TeacherCoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getMyTeacherCourses()
      .then(setCourses)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCourses = courses.filter((course) => {
    const value = query.toLowerCase();
    return course.name.toLowerCase().includes(value) || course.level.toLowerCase().includes(value) || course.class.toLowerCase().includes(value);
  });

  return (
    <WorkflowShell title="Teacher Courses" subtitle="Manage course rosters, attendance, assessments, and grades." nav={nav}>
      <div className="mb-5 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${t("search")}...`} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading courses...")}</p> : null}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => {
          const averageScore = Math.round(
            course.students.reduce((sum, student) => sum + studentAverage(course, student.id), 0) /
              Math.max(course.students.length, 1),
          );
          const attendance = attendanceSummary(course);
          return (
            <div key={course.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{course.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {course.level} - {course.class} - {course.students.length} {t("Students")}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                <span className="rounded bg-blue-50 p-2 text-blue-700"><b>{getCourseAssessments(course).length}</b><br />{t("Tasks")}</span>
                <span className="rounded bg-green-50 p-2 text-green-700"><b>{attendance.rate}%</b><br />{t("Attendance")}</span>
                <span className="rounded bg-purple-50 p-2 text-purple-700"><b>{averageScore}%</b><br />{t("Score")}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link className="rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700" href={`/teacher/courses/${course.id}`}>
                  {t("Open")}
                </Link>
                <Link className="rounded-md border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50" href={`/teacher/courses/${course.id}/attendance`}>
                  {t("Attendance")}
                </Link>
                <Link className="rounded-md border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50" href={`/teacher/courses/${course.id}/assessments`}>
                  {t("Assessments")}
                </Link>
                <Link className="rounded-md border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50" href={`/teacher/courses/${course.id}/grades`}>
                  {t("Grades")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {!isLoading && filteredCourses.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No courses found.")}</p> : null}
    </WorkflowShell>
  );
}
