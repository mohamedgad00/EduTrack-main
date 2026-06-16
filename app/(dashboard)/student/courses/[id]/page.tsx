"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course } from "@/types/course";
import { attendanceSummary, getCourseAssessments, getMyStudentCourse, studentAverage } from "@/services/workflowService";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const nav = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/courses", label: "My Courses" },
  { href: "/student/grades", label: "My Grades" },
  { href: "/student/attendance", label: "My Attendance" },
  { href: "/student/upcoming", label: "Upcoming Work" },
];

export default function StudentCourseDetailsPage() { 
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [studentId, setStudentId] = useState("");
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    getMyStudentCourse(params.id).then((data) => {
      setStudentId(data.studentId);
      setCourse(data.course);
      setIsForbidden(!data.course);
    });
  }, [params.id]);

  return (
    <WorkflowShell title="Course Details" subtitle={course?.name ?? "Loading course..."} nav={nav}>
      {isForbidden ? <p className="text-sm text-red-600">{t("This course is not assigned to your account.")}</p> : null}
      {course ? (
        <div className="space-y-6">
          <section className="rounded-lg bg-blue-600 p-6 text-white">
            <h2 className="text-3xl font-bold">{course.name}</h2>
            <p className="mt-2 text-blue-50">{course.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <span><b>{course.teacherName}</b><br />{t("Teacher")}</span>
              <span><b>{getCourseAssessments(course).length}</b><br />{t("Assessments")}</span>
              <span><b>{studentAverage(course, studentId)}%</b><br />{t("Average")}</span>
              <span><b>{attendanceSummary(course, studentId).rate}%</b><br />{t("Attendance")}</span>
            </div>
          </section>
          <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">{t("My Assessment Records")}</h3>
            <div className="space-y-3">
              {getCourseAssessments(course).map((assessment) => {
                const record = assessment.studentRecords.find((item) => item.studentId === studentId);
                return (
                  <div key={assessment.id} className="flex justify-between rounded-md bg-gray-50 p-3 text-sm">
                    <span className="font-medium">{assessment.name}</span>
                    <span>{t(assessment.type)}</span>
                    <span>{record?.grade !== undefined ? `${record.grade}/${assessment.maxGrade}` : record?.isPresent ? t("Not graded") : t("Absent")}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <p className="text-sm text-gray-500">{t("loading")}</p>
      )}
    </WorkflowShell>
  );
}
