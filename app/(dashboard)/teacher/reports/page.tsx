"use client";

import { useEffect, useState } from "react";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course } from "@/types/course";
import { attendanceSummary, getMyTeacherCourses, studentAverage } from "@/services/workflowService";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function TeacherReportsPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    getMyTeacherCourses().then(setCourses);
  }, []);

  const exportCsv = () => {
    const rows = [
      ["Course", "Student", "Score", "Attendance"],
      ...courses.flatMap((course) =>
        course.students.map((student) => [
          course.name,
          student.name,
          `${studentAverage(course, student.id)}%`,
          `${attendanceSummary(course, student.id).rate}%`,
        ]),
      ),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "teacher-reports.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WorkflowShell title="Teacher Reports" subtitle="Class-level scores and attendance summaries." nav={[{ href: "/teacher", label: "Dashboard" }, { href: "/teacher/courses", label: "Courses" }]}>
      <div className="mb-5 flex justify-end">
        <button onClick={exportCsv} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {t("Export CSV")}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {courses.map((course) => (
          <div key={course.id} className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{course.name}</h2>
            <p className="text-sm text-gray-500">{course.teacherName}</p>
            <div className="mt-5 space-y-3">
              {course.students.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-md bg-gray-50 p-3 text-sm">
                  <span className="font-medium">{student.name}</span>
                  <span>{studentAverage(course, student.id)}% {t("Score")}</span>
                  <span>{attendanceSummary(course, student.id).rate}% {t("Attendance")}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {courses.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No courses found.")}</p> : null}
    </WorkflowShell>
  );
}
