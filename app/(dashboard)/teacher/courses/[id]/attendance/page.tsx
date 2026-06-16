"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course, AttendanceStatus, StudentAttendance } from "@/types/course";
import { getMyTeacherCourse, saveCourse } from "@/services/workflowService";
import { showToast } from "@/utils/toastUtils";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const recalc = (record: StudentAttendance) => {
  const totalPresent = Object.values(record.attendance).filter((value) => value === "present").length;
  const totalAbsent = Object.values(record.attendance).filter((value) => value === "absent").length;
  const total = totalPresent + totalAbsent;
  return { ...record, totalPresent, totalAbsent, attendancePercentage: total ? Math.round((totalPresent / total) * 100) : 0 };
};

export default function TeacherAttendancePage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isForbidden, setIsForbidden] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getMyTeacherCourse(params.id).then((item) => {
      setCourse(item);
      setIsForbidden(!item);
    });
  }, [params.id]);

  const dates = useMemo(() => Array.from(new Set(course?.attendance.flatMap((item) => Object.keys(item.attendance)) ?? [])).sort(), [course]);

  const ensureAttendance = () => {
    setCourse((current) => {
      if (!current || !date) return current;
      const existingMap = new Map(current.attendance.map((item) => [item.studentId, item]));
      const attendance = current.students.map((student) => {
        const existing = existingMap.get(student.id) ?? {
          studentId: student.id,
          studentName: student.name,
          attendance: {},
          totalPresent: 0,
          totalAbsent: 0,
          attendancePercentage: 0,
        };
        return recalc({
          ...existing,
          studentName: student.name,
          attendance: { ...existing.attendance, [date]: existing.attendance[date] ?? "present" },
        });
      });
      return { ...current, attendance };
    });
  };

  const toggle = (studentId: string, targetDate: string) => {
    setCourse((current) => {
      if (!current) return current;
      return {
        ...current,
        attendance: current.attendance.map((record) => {
          if (record.studentId !== studentId) return record;
          const next: AttendanceStatus = record.attendance[targetDate] === "present" ? "absent" : "present";
          return recalc({ ...record, attendance: { ...record.attendance, [targetDate]: next } });
        }),
      };
    });
  };

  const removeDate = (targetDate: string) => {
    setCourse((current) => {
      if (!current) return current;
      return {
        ...current,
        attendance: current.attendance.map((record) => {
          const nextAttendance = { ...record.attendance };
          delete nextAttendance[targetDate];
          return recalc({ ...record, attendance: nextAttendance });
        }),
      };
    });
  };

  const save = async () => {
    if (!course) return;
    setIsSaving(true);
    try {
      const saved = await saveCourse(course);
      if (saved) setCourse(saved);
      showToast("success", t("Attendance saved."));
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
    <WorkflowShell title="Attendance" subtitle={course?.name ?? "Course attendance"} nav={nav}>
      {!course ? <p className="text-sm text-gray-500">{t("loading")}</p> : null}
      {isForbidden ? <p className="text-sm text-red-600">{t("This course is not assigned to your account.")}</p> : null}
      {course ? (
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-md border border-gray-300 px-3 py-2" />
            <button onClick={ensureAttendance} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">{t("Add Date")}</button>
            <button onClick={save} disabled={isSaving} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {isSaving ? t("Saving...") : t("Save Attendance")}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-3 pr-4">{t("Student")}</th>
                  {dates.map((item) => (
                    <th key={item} className="px-3 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span>{item}</span>
                        <button onClick={() => removeDate(item)} className="text-[11px] font-medium text-red-600 normal-case">{t("Remove")}</button>
                      </div>
                    </th>
                  ))}
                  <th>{t("Rate")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {course.attendance.map((record) => (
                  <tr key={record.studentId}>
                    <td className="py-3 pr-4 font-medium">{record.studentName}</td>
                    {dates.map((item) => (
                      <td key={item} className="px-3 text-center">
                        <button onClick={() => toggle(record.studentId, item)} className={`rounded px-3 py-1 text-xs font-semibold ${record.attendance[item] === "present" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {record.attendance[item] ? t(record.attendance[item]) : "-"}
                        </button>
                      </td>
                    ))}
                    <td className="font-semibold text-blue-700">{record.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dates.length === 0 ? <p className="mt-4 rounded-md bg-gray-50 p-4 text-sm text-gray-500">{t("No attendance dates added yet. Add a date to get started.")}</p> : null}
        </div>
      ) : null}
    </WorkflowShell>
  );
}
