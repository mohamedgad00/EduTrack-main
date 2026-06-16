"use client";

import { useEffect, useMemo, useState } from "react";
import { Course, CourseAssessment, StudentAssessmentRecord } from "@/types/course";
import { Plus, Trash2, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type AssessmentTab = "quiz" | "homework" | "midterm" | "final";

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSaveCourse: (updatedCourse: Course) => void;
}

const TAB_LABELS: Record<AssessmentTab, string> = {
  quiz: "Quizzes",
  homework: "Homework",
  midterm: "Midterm Exam",
  final: "Final Exam",
};

const buildStudentRecords = (
  students: Course["students"],
  existingRecords?: StudentAssessmentRecord[]
): StudentAssessmentRecord[] => {
  return students.map((student) => {
    const existing = existingRecords?.find((record) => record.studentId === student.id);
    return {
      studentId: student.id,
      studentName: student.name,
      grade: existing?.grade,
      isPresent: existing?.isPresent ?? true,
    };
  });
};

const createAssessment = (
  course: Course,
  type: AssessmentTab,
  index: number
): CourseAssessment => {
  const defaultName =
    type === "quiz"
      ? `Quiz ${index}`
      : type === "homework"
        ? `Homework ${index}`
        : type === "midterm"
          ? "Midterm Exam"
          : "Final Exam";

  return {
    id: crypto.randomUUID(),
    type,
    name: defaultName,
    date: new Date().toISOString().slice(0, 10),
    maxGrade: 100,
    studentRecords: buildStudentRecords(course.students),
  };
};

const getAllGrades = (course: Course) => {
  const allAssessments = [
    ...course.quizzes,
    ...course.homeworks,
    ...(course.midtermExam ? [course.midtermExam] : []),
    ...(course.finalExam ? [course.finalExam] : []),
  ];

  return allAssessments.flatMap((assessment) =>
    assessment.studentRecords
      .filter((record) => record.isPresent && record.grade !== undefined)
      .map((record) => record.grade as number)
  );
};

export default function GradeModal({ isOpen, onClose, course, onSaveCourse }: GradeModalProps) {
  const { t } = useLanguage();
  const [draftCourse, setDraftCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<AssessmentTab>("quiz");

  useEffect(() => {
    if (course) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftCourse({
        ...course,
        quizzes: (course.quizzes || []).map((quiz, idx) => ({
          ...quiz,
          type: "quiz",
          name: quiz.name || `Quiz ${idx + 1}`,
          date: quiz.date || new Date().toISOString().slice(0, 10),
          maxGrade: quiz.maxGrade || 100,
          studentRecords: buildStudentRecords(course.students, quiz.studentRecords),
        })),
        homeworks: (course.homeworks || []).map((homework, idx) => ({
          ...homework,
          type: "homework",
          name: homework.name || `Homework ${idx + 1}`,
          date: homework.date || new Date().toISOString().slice(0, 10),
          maxGrade: homework.maxGrade || 100,
          studentRecords: buildStudentRecords(course.students, homework.studentRecords),
        })),
        midtermExam: course.midtermExam
          ? {
            ...course.midtermExam,
            type: "midterm",
            name: course.midtermExam.name || "Midterm Exam",
            date: course.midtermExam.date || new Date().toISOString().slice(0, 10),
            maxGrade: course.midtermExam.maxGrade || 100,
            studentRecords: buildStudentRecords(course.students, course.midtermExam.studentRecords),
          }
          : null,
        finalExam: course.finalExam
          ? {
            ...course.finalExam,
            type: "final",
            name: course.finalExam.name || "Final Exam",
            date: course.finalExam.date || new Date().toISOString().slice(0, 10),
            maxGrade: course.finalExam.maxGrade || 100,
            studentRecords: buildStudentRecords(course.students, course.finalExam.studentRecords),
          }
          : null,
      });
      setActiveTab("quiz");
    } else {
      setDraftCourse(null);
    }
  }, [course]);

  const stats = useMemo(() => {
    if (!draftCourse) return null;
    const grades = getAllGrades(draftCourse);
    if (grades.length === 0) return null;

    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    const highest = Math.max(...grades);
    const lowest = Math.min(...grades);

    return { average, highest, lowest };
  }, [draftCourse]);

  const updateListAssessment = (
    listKey: "quizzes" | "homeworks",
    assessmentId: string,
    updater: (assessment: CourseAssessment) => CourseAssessment
  ) => {
    setDraftCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [listKey]: prev[listKey].map((assessment) =>
          assessment.id === assessmentId ? updater(assessment) : assessment
        ),
      };
    });
  };

  const updateSingleAssessment = (
    key: "midtermExam" | "finalExam",
    updater: (assessment: CourseAssessment) => CourseAssessment
  ) => {
    setDraftCourse((prev) => {
      if (!prev || !prev[key]) return prev;
      return {
        ...prev,
        [key]: updater(prev[key] as CourseAssessment),
      };
    });
  };

  const addAssessment = (type: "quiz" | "homework") => {
    setDraftCourse((prev) => {
      if (!prev) return prev;
      const listKey = type === "quiz" ? "quizzes" : "homeworks";
      const nextAssessment = createAssessment(prev, type, prev[listKey].length + 1);
      return {
        ...prev,
        [listKey]: [...prev[listKey], nextAssessment],
      };
    });
  };

  const ensureSingleExam = (type: "midterm" | "final") => {
    setDraftCourse((prev) => {
      if (!prev) return prev;
      const key = type === "midterm" ? "midtermExam" : "finalExam";
      if (prev[key]) return prev;

      return {
        ...prev,
        [key]: createAssessment(prev, type, 1),
      };
    });
  };

  const deleteAssessment = (listKey: "quizzes" | "homeworks", assessmentId: string) => {
    setDraftCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [listKey]: prev[listKey].filter((assessment) => assessment.id !== assessmentId),
      };
    });
  };

  const updateStudentRecord = (
    assessment: CourseAssessment,
    studentId: string,
    update: Partial<StudentAssessmentRecord>
  ) => {
    return {
      ...assessment,
      studentRecords: assessment.studentRecords.map((record) => {
        if (record.studentId !== studentId) {
          return record;
        }

        const nextRecord = { ...record, ...update };
        if (!nextRecord.isPresent) {
          nextRecord.grade = undefined;
        }

        return nextRecord;
      }),
    };
  };

  const renderAssessmentEditor = (
    assessment: CourseAssessment,
    onUpdate: (updater: (assessment: CourseAssessment) => CourseAssessment) => void,
    onDelete?: () => void
  ) => (
    <div key={assessment.id} className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Name")}</label>
          <input
            type="text"
            value={assessment.name}
            onChange={(e) => onUpdate((current) => ({ ...current, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Date")}</label>
          <input
            type="date"
            value={assessment.date}
            onChange={(e) => onUpdate((current) => ({ ...current, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Max Grade")}</label>
          <input
            type="number"
            min={1}
            value={assessment.maxGrade}
            onChange={(e) =>
              onUpdate((current) => ({
                ...current,
                maxGrade: Math.max(1, Number(e.target.value) || 1),
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-700">{t("Student")}</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-gray-700">{t("Present")}</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-gray-700">{t("Grade")}</th>
            </tr>
          </thead>
          <tbody>
            {assessment.studentRecords.map((record) => (
              <tr key={record.studentId} className="border-b border-gray-100 last:border-b-0">
                <td className="px-4 py-2 text-sm text-gray-800">{record.studentName}</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={record.isPresent}
                    onChange={(e) =>
                      onUpdate((current) =>
                        updateStudentRecord(current, record.studentId, {
                          isPresent: e.target.checked,
                        })
                      )
                    }
                    className="h-4 w-4 accent-blue-600"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="number"
                    min={0}
                    max={assessment.maxGrade}
                    disabled={!record.isPresent}
                    value={record.grade ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      onUpdate((current) =>
                        updateStudentRecord(current, record.studentId, {
                          grade:
                            value === ""
                              ? undefined
                              : Math.min(current.maxGrade, Math.max(0, Number(value))),
                        })
                      );
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onDelete && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
          >
            <Trash2 size={14} />
            {t("Delete")}
          </button>
        </div>
      )}
    </div>
  );

  const handleSave = () => {
    if (!draftCourse) return;
    onSaveCourse({ ...draftCourse, updatedAt: new Date().toISOString() });
    onClose();
  };

  if (!isOpen || !draftCourse) return null;

  const currentList = activeTab === "quiz" ? draftCourse.quizzes : draftCourse.homeworks;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{draftCourse.name} - {t("Assessments")}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {t("Create quizzes and homework after course creation, and manage one midterm and one final exam.")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(TAB_LABELS) as AssessmentTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {t(TAB_LABELS[tab])}
              </button>
            ))}
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">{t("Class Average")}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.average.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">{t("Highest Grade")}</p>
                <p className="text-2xl font-bold text-green-600">{stats.highest.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">{t("Lowest Grade")}</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowest.toFixed(2)}</p>
              </div>
            </div>
          )}

          {(activeTab === "quiz" || activeTab === "homework") && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => addAssessment(activeTab)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  {activeTab === "quiz" ? t("Add Quiz") : t("Add Homework")}
                </button>
              </div>

              {currentList.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg text-gray-500">
                  {activeTab === "quiz" ? t("No quizzes yet.") : t("No homework yet.")}
                </div>
              ) : (
                currentList.map((assessment) =>
                  renderAssessmentEditor(
                    assessment,
                    (updater) =>
                      updateListAssessment(activeTab === "quiz" ? "quizzes" : "homeworks", assessment.id, updater),
                    () => deleteAssessment(activeTab === "quiz" ? "quizzes" : "homeworks", assessment.id)
                  )
                )
              )}
            </div>
          )}

          {activeTab === "midterm" && (
            <div className="space-y-4">
              {!draftCourse.midtermExam ? (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600 mb-3">{t("No midterm exam created yet.")}</p>
                  <button
                    type="button"
                    onClick={() => ensureSingleExam("midterm")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    {t("Create Midterm Exam")}
                  </button>
                </div>
              ) : (
                renderAssessmentEditor(draftCourse.midtermExam, (updater) =>
                  updateSingleAssessment("midtermExam", updater)
                )
              )}
            </div>
          )}

          {activeTab === "final" && (
            <div className="space-y-4">
              {!draftCourse.finalExam ? (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600 mb-3">{t("No final exam created yet.")}</p>
                  <button
                    type="button"
                    onClick={() => ensureSingleExam("final")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    {t("Create Final Exam")}
                  </button>
                </div>
              ) : (
                renderAssessmentEditor(draftCourse.finalExam, (updater) =>
                  updateSingleAssessment("finalExam", updater)
                )
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t("Save Assessments")}
          </button>
        </div>
      </div>
    </div>
  );
}
