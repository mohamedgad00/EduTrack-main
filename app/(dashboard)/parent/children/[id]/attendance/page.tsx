"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course } from "@/types/course";
import { attendanceSummary, getMyParentChildCourses } from "@/services/workflowService";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ParentChildAttendancePage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyParentChildCourses(params.id)
      .then((data) => {
        setCourses(data.courses);
        setIsForbidden(!data.isLinkedChild);
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  return (
    <WorkflowShell title="Child Attendance" subtitle="Attendance by course for selected child." nav={[{ href: "/parent", label: "Dashboard" }, { href: "/parent/children", label: "My Children" }, { href: `/parent/children/${params.id}`, label: "Profile" }, { href: `/parent/children/${params.id}/courses`, label: "Child Courses" }, { href: `/parent/children/${params.id}/grades`, label: "Child Grades" }]}>
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading attendance...")}</p> : null}
      {isForbidden ? <p className="text-sm text-red-600">{t("This child is not linked to your account.")}</p> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {courses.map((course) => {
          const summary = attendanceSummary(course, params.id);
          return (
            <div key={course.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex justify-between"><h2 className="font-semibold">{course.name}</h2><span className="font-bold text-blue-700">{summary.rate}%</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-green-600" style={{ width: `${summary.rate}%` }} /></div>
              <p className="mt-3 text-sm text-gray-500">{summary.present} {t("Present")} - {summary.absent} {t("Absent")}</p>
            </div>
          );
        })}
      </div>
      {!isLoading && !isForbidden && courses.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No attendance records found.")}</p> : null}
    </WorkflowShell>
  );
}
