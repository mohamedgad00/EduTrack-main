"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course } from "@/types/course";
import { attendanceSummary, getCourseAssessments, getMyTeacherCourse, studentAverage } from "@/services/workflowService";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function TeacherCourseDetailsPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    getMyTeacherCourse(params.id).then((item) => {
      setCourse(item);
      setIsForbidden(!item);
    });
  }, [params.id]);

  const nav = [
    { href: "/teacher", label: "Dashboard" },
    { href: "/teacher/courses", label: "My Courses" },
    { href: "/teacher/students", label: "Students" },
    { href: "/teacher/assessments", label: "Assessments" },
    { href: "/teacher/attendance", label: "Attendance" },
    { href: `/teacher/courses/${params.id}/attendance`, label: "Take Attendance" },
    { href: `/teacher/courses/${params.id}/assessments`, label: "Manage Assessments" },
    { href: `/teacher/courses/${params.id}/grades`, label: "Enter Grades" },
  ];

  return (
    <WorkflowShell title="Course Workspace" subtitle={course?.name ?? "Loading course..."} nav={nav}>
      {!course ? <p className="text-sm text-gray-500">{t("Loading course...")}</p> : null}
      {isForbidden ? <p className="text-sm text-red-600">{t("This course is not assigned to your account.")}</p> : null}
      {course ? (
        <div className="space-y-6">
          <section className="rounded-lg bg-blue-600 p-6 text-white">
            <h2 className="text-3xl font-bold">{course.name}</h2>
            <p className="mt-2 text-blue-50">{course.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <span><b>{course.teacherName}</b><br />{t("Teacher")}</span>
              <span><b>{course.students.length}</b><br />{t("Students")}</span>
              <span><b>{getCourseAssessments(course).length}</b><br />{t("Assessments")}</span>
              <span><b>{attendanceSummary(course).rate}%</b><br />{t("Attendance")}</span>
            </div>
          </section>

          <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">{t("Roster Performance")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
                  <tr><th className="py-3">{t("Student")}</th><th>{t("Average")}</th><th>{t("Attendance")}</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {course.students.map((student) => (
                    <tr key={student.id}>
                      <td className="py-3 font-medium">{student.name}</td>
                      <td className="font-semibold text-blue-700">{studentAverage(course, student.id)}%</td>
                      <td className="font-semibold text-green-700">{attendanceSummary(course, student.id).rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Link href={`/teacher/courses/${course.id}/attendance`} className="rounded-lg border border-gray-200 bg-white p-5 font-semibold hover:bg-blue-50">{t("Take Attendance")}</Link>
            <Link href={`/teacher/courses/${course.id}/assessments`} className="rounded-lg border border-gray-200 bg-white p-5 font-semibold hover:bg-blue-50">{t("Manage Assessments")}</Link>
            <Link href={`/teacher/courses/${course.id}/grades`} className="rounded-lg border border-gray-200 bg-white p-5 font-semibold hover:bg-blue-50">{t("Enter Grades")}</Link>
          </div>
        </div>
      ) : null}
    </WorkflowShell>
  );
}
