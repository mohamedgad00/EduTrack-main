"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course } from "@/types/course";
import { attendanceSummary, getMyStudentCourses, studentAverage } from "@/services/workflowService";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const nav = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/grades", label: "My Grades" },
  { href: "/student/attendance", label: "My Attendance" },
  { href: "/student/upcoming", label: "Upcoming Work" },
  { href: "/student/notifications", label: "Notifications" },
];

export default function StudentCoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentId, setStudentId] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyStudentCourses()
      .then((data) => {
        setStudentId(data.studentId);
        setCourses(data.courses);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCourses = courses.filter((course) => {
    const value = query.toLowerCase();
    return course.name.toLowerCase().includes(value) || course.teacherName.toLowerCase().includes(value);
  });

  return (
    <WorkflowShell title="My Courses" subtitle="Open enrolled courses and follow your progress." nav={nav}>
      <div className="mb-5 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${t("search")}...`} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading courses...")}</p> : null}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => (
          <div key={course.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{course.name}</h2>
            <p className="text-sm text-gray-500">{t("Teacher")}: {course.teacherName}</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-center text-sm">
              <span className="rounded bg-blue-50 p-3 text-blue-700"><b>{studentAverage(course, studentId)}%</b><br />{t("Average")}</span>
              <span className="rounded bg-green-50 p-3 text-green-700"><b>{attendanceSummary(course, studentId).rate}%</b><br />{t("Attendance")}</span>
            </div>
            <Link href={`/student/courses/${course.id}`} className="mt-5 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white">
              {t("Open Course")}
            </Link>
          </div>
        ))}
      </div>
      {!isLoading && filteredCourses.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No courses found.")}</p> : null}
    </WorkflowShell>
  );
}
