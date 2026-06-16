"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { Course } from "@/types/course";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface CoursesResponse {
  data?: Course[];
  courses?: Course[];
}

const extractCourses = (payload: CoursesResponse | Course[]) => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload.courses ?? [];
};

export default function AdminEnrollmentsPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get<CoursesResponse | Course[]>("courses")
      .then((response) => setCourses(extractCourses(response.data)))
      .finally(() => setIsLoading(false));
  }, []);

  const rows = useMemo(
    () =>
      courses.flatMap((course) =>
        course.students.map((student) => ({
          id: `${course.id}-${student.id}`,
          courseId: course.id,
          courseName: course.name,
          teacherName: course.teacherName,
          studentName: student.name,
          level: course.level,
          classSection: course.class,
        })),
      ),
    [courses],
  );

  const filteredRows = rows.filter((row) => {
    const normalized = query.toLowerCase();
    return (
      row.courseName.toLowerCase().includes(normalized) ||
      row.studentName.toLowerCase().includes(normalized) ||
      row.teacherName.toLowerCase().includes(normalized)
    );
  });

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("Enrollments")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("Track every student course assignment from one operational view.")}</p>
        </div>
        <Link href="/admin/courses" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          {t("Manage Courses")}
        </Link>
      </div>

      <div className="mb-5 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${t("search")}...`}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <section className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        {isLoading ? <p className="p-5 text-sm text-gray-500">{t("Loading courses...")}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">{t("Student")}</th>
                <th className="px-5 py-3">{t("Course")}</th>
                <th className="px-5 py-3">{t("Teacher")}</th>
                <th className="px-5 py-3">{t("Level")}</th>
                <th className="px-5 py-3">{t("Class")}</th>
                <th className="px-5 py-3">{t("Open")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-medium text-gray-900">{row.studentName}</td>
                  <td className="px-5 py-4">{row.courseName}</td>
                  <td className="px-5 py-4">{row.teacherName}</td>
                  <td className="px-5 py-4">{row.level}</td>
                  <td className="px-5 py-4">{row.classSection}</td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/courses/${row.courseId}/students`} className="text-blue-600 hover:text-blue-700">
                      {t("Open")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredRows.length === 0 ? <p className="p-5 text-sm text-gray-500">{t("No enrollments found.")}</p> : null}
      </section>
    </main>
  );
}
