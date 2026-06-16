"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Course } from "@/types/course";
import { attendanceSummary, getCourse, studentAverage } from "@/services/workflowService";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function AdminCourseStudentsPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    getCourse(params.id).then(setCourse);
  }, [params.id]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("Course Students")}</h1>
            <p className="text-sm text-gray-500">{course?.name ?? t("Loading course...")}</p>
          </div>
          <Link href={`/admin/courses/${params.id}`} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            {t("Back to Report")}
          </Link>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-gray-500">
              <tr><th className="py-3">{t("Student")}</th><th>{t("Average")}</th><th>{t("Attendance")}</th></tr>
            </thead>
            <tbody className="divide-y">
              {course?.students.map((student) => (
                <tr key={student.id}>
                  <td className="py-3 font-medium">{student.name}</td>
                  <td className="font-semibold text-blue-700">{studentAverage(course, student.id)}%</td>
                  <td className="font-semibold text-green-700">{attendanceSummary(course, student.id).rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
