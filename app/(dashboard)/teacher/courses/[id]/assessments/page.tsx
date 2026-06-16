"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course, AssessmentType, CourseAssessment } from "@/types/course";
import { getCourseAssessments, getMyTeacherCourse, saveCourse } from "@/services/workflowService";
import { showToast } from "@/utils/toastUtils";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const assessmentLabels: Record<AssessmentType, string> = {
  quiz: "Quiz",
  homework: "Homework",
  midterm: "Midterm",
  final: "Final",
};

export default function TeacherAssessmentsPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [type, setType] = useState<AssessmentType>("quiz");
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [maxGrade, setMaxGrade] = useState(100);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getMyTeacherCourse(params.id).then((item) => {
      setCourse(item);
      setIsForbidden(!item);
    });
  }, [params.id]);

  const addAssessment = () => {
    if (!course || !name.trim()) return;
    if (type === "midterm" && course.midtermExam) {
      showToast("error", t("Midterm exam already exists."));
      return;
    }
    if (type === "final" && course.finalExam) {
      showToast("error", t("Final exam already exists."));
      return;
    }

    const assessment: CourseAssessment = {
      id: crypto.randomUUID(),
      type,
      name: name.trim(),
      date,
      maxGrade: Math.max(1, maxGrade),
      studentRecords: course.students.map((student) => ({
        studentId: student.id,
        studentName: student.name,
        isPresent: true,
      })),
    };

    setCourse((current) => {
      if (!current) return current;
      if (type === "quiz") return { ...current, quizzes: [...current.quizzes, assessment] };
      if (type === "homework") return { ...current, homeworks: [...current.homeworks, assessment] };
      if (type === "midterm") return { ...current, midtermExam: assessment };
      return { ...current, finalExam: assessment };
    });
    setName("");
  };

  const updateAssessment = (assessmentId: string, patch: Partial<CourseAssessment>) => {
    setCourse((current) => {
      if (!current) return current;
      const update = (assessment: CourseAssessment) =>
        assessment.id === assessmentId
          ? {
              ...assessment,
              ...patch,
              maxGrade: patch.maxGrade ? Math.max(1, patch.maxGrade) : assessment.maxGrade,
            }
          : assessment;

      return {
        ...current,
        quizzes: current.quizzes.map(update),
        homeworks: current.homeworks.map(update),
        midtermExam: current.midtermExam ? update(current.midtermExam) : null,
        finalExam: current.finalExam ? update(current.finalExam) : null,
      };
    });
  };

  const removeAssessment = (assessmentId: string) => {
    setCourse((current) => {
      if (!current) return current;
      return {
        ...current,
        quizzes: current.quizzes.filter((item) => item.id !== assessmentId),
        homeworks: current.homeworks.filter((item) => item.id !== assessmentId),
        midtermExam: current.midtermExam?.id === assessmentId ? null : current.midtermExam,
        finalExam: current.finalExam?.id === assessmentId ? null : current.finalExam,
      };
    });
  };

  const save = async () => {
    if (!course) return;
    setIsSaving(true);
    try {
      const saved = await saveCourse(course);
      if (saved) setCourse(saved);
      showToast("success", t("Assessments saved."));
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
    { href: `/teacher/courses/${params.id}/grades`, label: "Grades" },
  ];

  return (
    <WorkflowShell title="Assessments" subtitle={course?.name ?? "Course assessments"} nav={nav}>
      {course ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">{t("Create Assessment")}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[150px_1fr_160px_140px_auto_auto]">
              <select value={type} onChange={(event) => setType(event.target.value as AssessmentType)} className="rounded-md border border-gray-300 px-3 py-2">
                <option value="quiz">{t("Quiz")}</option>
                <option value="homework">{t("Homework")}</option>
                <option value="midterm">{t("Midterm")}</option>
                <option value="final">{t("Final")}</option>
              </select>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("Assessment name")} className="rounded-md border border-gray-300 px-3 py-2" />
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-md border border-gray-300 px-3 py-2" />
              <input type="number" min={1} value={maxGrade} onChange={(event) => setMaxGrade(Number(event.target.value) || 1)} className="rounded-md border border-gray-300 px-3 py-2" />
              <button onClick={addAssessment} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">{t("Add")}</button>
              <button onClick={save} disabled={isSaving} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {isSaving ? t("Saving...") : t("Save")}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">{t("Assessment List")}</h2>
            <div className="space-y-3">
              {getCourseAssessments(course).length === 0 ? (
                <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">{t("No assessments created yet.")}</p>
              ) : null}
              {getCourseAssessments(course).map((assessment) => (
                <div key={assessment.id} className="flex flex-col gap-3 rounded-md border border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_160px_120px]">
                    <input value={assessment.name} onChange={(event) => updateAssessment(assessment.id, { name: event.target.value })} className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium" />
                    <input type="date" value={assessment.date} onChange={(event) => updateAssessment(assessment.id, { date: event.target.value })} className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
                    <input type="number" min={1} value={assessment.maxGrade} onChange={(event) => updateAssessment(assessment.id, { maxGrade: Number(event.target.value) || 1 })} className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
                    <p className="text-sm text-gray-500 md:col-span-3">
                      {t(assessmentLabels[assessment.type])} - {assessment.studentRecords.length} {t("Students")}
                    </p>
                  </div>
                  <button onClick={() => removeAssessment(assessment.id)} className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{t("Delete")}</button>
                </div>
              ))}
            </div>
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
