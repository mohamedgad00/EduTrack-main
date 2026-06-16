"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course } from "@/types/course";
import { getCourseAssessments, getMyTeacherCourse, saveCourse } from "@/services/workflowService";
import { showToast } from "@/utils/toastUtils";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function TeacherGradesPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getMyTeacherCourse(params.id).then((item) => {
      setCourse(item);
      setIsForbidden(!item);
    });
  }, [params.id]);

  const updateGrade = (assessmentId: string, studentId: string, value: string) => {
    setCourse((current) => {
      if (!current) return current;
      const targetAssessment = getCourseAssessments(current).find((assessment) => assessment.id === assessmentId);
      const grade = value === "" ? undefined : Math.min(targetAssessment?.maxGrade ?? 100, Math.max(0, Number(value)));
      const updateAssessment = (assessment: typeof current.quizzes[number]) =>
        assessment.id === assessmentId
          ? {
              ...assessment,
              studentRecords: assessment.studentRecords.map((record) =>
                record.studentId === studentId ? { ...record, grade } : record,
              ),
            }
          : assessment;
      return {
        ...current,
        quizzes: current.quizzes.map(updateAssessment),
        homeworks: current.homeworks.map(updateAssessment),
        midtermExam: current.midtermExam ? updateAssessment(current.midtermExam) : null,
        finalExam: current.finalExam ? updateAssessment(current.finalExam) : null,
      };
    });
  };

  const save = async () => {
    if (!course) return;
    setIsSaving(true);
    try {
      const saved = await saveCourse(course);
      if (saved) setCourse(saved);
      showToast("success", t("Grades saved."));
    } finally {
      setIsSaving(false);
    }
  };

  const nav = [
    { href: "/teacher", label: "Dashboard" },
    { href: "/teacher/courses", label: "Courses" },
    { href: "/teacher/students", label: "Students" },
    { href: "/teacher/assessments", label: "Assessments" },
    { href: "/teacher/attendance", label: "Attendance" },
    { href: `/teacher/courses/${params.id}`, label: "Course" },
    { href: `/teacher/courses/${params.id}/assessments`, label: "Assessments" },
  ];

  return (
    <WorkflowShell title="Grade Entry" subtitle={course?.name ?? "Course grades"} nav={nav}>
      {course ? (
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">{t("Assessment Grades")}</h2>
            <button onClick={save} disabled={isSaving} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {isSaving ? t("Saving...") : t("Save Grades")}
            </button>
          </div>
          <div className="space-y-6">
            {getCourseAssessments(course).length === 0 ? (
              <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">{t("Create an assessment before entering grades.")}</p>
            ) : null}
            {getCourseAssessments(course).map((assessment) => (
              <section key={assessment.id} className="rounded-md border border-gray-100 p-4">
                <h3 className="font-semibold">{assessment.name}</h3>
                <p className="mb-3 text-sm text-gray-500">{t(assessment.type)} - {t("Max Grade")} {assessment.maxGrade}</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {assessment.studentRecords.map((record) => (
                    <label key={record.studentId} className="rounded-md bg-gray-50 p-3 text-sm">
                      <span className="mb-2 block font-medium">{record.studentName}</span>
                      <input
                        type="number"
                        min={0}
                        max={assessment.maxGrade}
                        disabled={!record.isPresent}
                        value={record.grade ?? ""}
                        onChange={(event) => updateGrade(assessment.id, record.studentId, event.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                      />
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <p className={isForbidden ? "text-sm text-red-600" : "text-sm text-gray-500"}>
          {isForbidden ? t("This course is not assigned to your account.") : t("loading")}
        </p>
      )}
    </WorkflowShell>
  );
}
