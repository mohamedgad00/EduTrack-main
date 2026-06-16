"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import { Course } from "@/types/course";
import { attendanceSummary, getMyParentChildCourses, studentAverage } from "@/services/workflowService";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ParentChildCoursesPage() {
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
    <WorkflowShell
      title="Child Courses"
      subtitle="Course performance and teacher assignments for selected child."
      nav={[
        { href: "/parent/children", label: "My Children" },
        { href: `/parent/children/${params.id}`, label: "Profile" },
        { href: `/parent/children/${params.id}/grades`, label: "Child Grades" },
        { href: `/parent/children/${params.id}/attendance`, label: "Child Attendance" },
      ]}
    >
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading courses...")}</p> : null}
      {isForbidden ? <p className="text-sm text-red-600">{t("This child is not linked to your account.")}</p> : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const attendance = attendanceSummary(course, params.id);
          return (
            <div key={course.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{course.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{course.teacherName}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-center text-sm">
                <span className="rounded bg-blue-50 p-3 text-blue-700">
                  <b>{studentAverage(course, params.id)}%</b>
                  <br />
                  {t("Average")}
                </span>
                <span className="rounded bg-green-50 p-3 text-green-700">
                  <b>{attendance.rate}%</b>
                  <br />
                  {t("Attendance")}
                </span>
              </div>
              <Link
                href={`/parent/children/${params.id}/grades`}
                className="mt-5 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                {t("Grades")}
              </Link>
            </div>
          );
        })}
      </div>

      {!isLoading && !isForbidden && courses.length === 0 ? (
        <p className="text-sm text-gray-500">{t("No courses found.")}</p>
      ) : null}
    </WorkflowShell>
  );
}
