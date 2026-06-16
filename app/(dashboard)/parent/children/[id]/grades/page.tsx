"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course } from "@/types/course";
import { getCourseAssessments, getMyParentChildCourses } from "@/services/workflowService";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ParentChildGradesPage() {
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
    <WorkflowShell title="Child Grades" subtitle="Assessment grades for selected child." nav={[{ href: "/parent", label: "Dashboard" }, { href: "/parent/children", label: "My Children" }, { href: `/parent/children/${params.id}`, label: "Profile" }, { href: `/parent/children/${params.id}/courses`, label: "Child Courses" }, { href: `/parent/children/${params.id}/attendance`, label: "Child Attendance" }]}>
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading grades...")}</p> : null}
      {isForbidden ? <p className="text-sm text-red-600">{t("This child is not linked to your account.")}</p> : null}
      <div className="space-y-5">
        {courses.map((course) => (
          <div key={course.id} className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">{course.name}</h2>
            <div className="space-y-2">
              {getCourseAssessments(course).map((assessment) => {
                const record = assessment.studentRecords.find((item) => item.studentId === params.id);
                return (
                  <div key={assessment.id} className="flex justify-between rounded-md bg-gray-50 p-3 text-sm">
                    <span>{assessment.name}</span>
                    <span>{record?.grade !== undefined ? `${record.grade}/${assessment.maxGrade}` : record?.isPresent ? t("Not graded") : t("Absent")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!isLoading && !isForbidden && courses.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No grade records found.")}</p> : null}
    </WorkflowShell>
  );
}
