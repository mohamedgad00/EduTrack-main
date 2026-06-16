"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { AlertCircle, ArrowLeft, BarChart3, TrendingUp, Users } from "lucide-react";
import api from "@/utils/api";
import { Course } from "@/types/course";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function CourseDetailsPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const { courses } = useSelector((state: RootState) => state.courses);
  const [remoteCourse, setRemoteCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const courseId = params.id as string;
  const course = courses.find((c) => c.id === courseId) ?? remoteCourse;

  useEffect(() => {
    if (courses.some((c) => c.id === courseId)) return;

    let isMounted = true;

    const loadCourse = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<{ data?: Course; course?: Course } | Course>(
          `courses/${encodeURIComponent(courseId)}`,
        );
        const payload = response.data;
        const loadedCourse =
          "id" in payload
            ? payload
            : payload.data ?? payload.course ?? null;

        if (isMounted && loadedCourse) {
          setRemoteCourse(loadedCourse);
        }
      } catch {
        if (isMounted) {
          setRemoteCourse(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId, courses]);

  if (!course) {
    return (
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoading ? t("Loading course...") : t("Course Not Found")}
          </h2>
          <p className="text-gray-600 mb-6">
            {isLoading ? t("Please wait while course data loads.") : t("The course you are looking for does not exist.")}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("Go Back")}
          </button>
        </div>
      </div>
    );
  }

  const allAssessments = [
    ...(course.quizzes || []),
    ...(course.homeworks || []),
    ...(course.midtermExam ? [course.midtermExam] : []),
    ...(course.finalExam ? [course.finalExam] : []),
  ];

  const allGrades = allAssessments.flatMap((assessment) =>
    assessment.studentRecords
      .filter((record) => record.isPresent && record.grade !== undefined)
      .map((record) => record.grade as number)
  );

  const assessmentStats =
    allGrades.length > 0
      ? {
        average: allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length,
        highest: Math.max(...allGrades),
        lowest: Math.min(...allGrades),
      }
      : null;

  const attendanceStats =
    course.attendance.length > 0
      ? {
        avgAttendance:
          course.attendance.reduce((sum, item) => sum + item.attendancePercentage, 0) /
          course.attendance.length,
      }
      : null;

  const studentRows = course.students.map((student) => {
    const studentGrades = allAssessments.flatMap((assessment) => {
      const record = assessment.studentRecords.find((r) => r.studentId === student.id);
      if (!record || !record.isPresent || record.grade === undefined) {
        return [];
      }
      return [record.grade];
    });

    const studentAverage =
      studentGrades.length > 0
        ? studentGrades.reduce((sum, grade) => sum + grade, 0) / studentGrades.length
        : undefined;

    const midtermRecord = course.midtermExam?.studentRecords.find((r) => r.studentId === student.id);
    const finalRecord = course.finalExam?.studentRecords.find((r) => r.studentId === student.id);

    return {
      id: student.id,
      name: student.name,
      quizCount: (course.quizzes || []).filter((quiz) => {
        const record = quiz.studentRecords.find((r) => r.studentId === student.id);
        return record?.isPresent;
      }).length,
      homeworkCount: (course.homeworks || []).filter((homework) => {
        const record = homework.studentRecords.find((r) => r.studentId === student.id);
        return record?.isPresent;
      }).length,
      midterm: midtermRecord?.isPresent ? midtermRecord.grade : undefined,
      finalExam: finalRecord?.isPresent ? finalRecord.grade : undefined,
      average: studentAverage,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        {t("Back to Courses")}
      </button>

      {/* Course Information */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
        <p className="text-blue-100 mb-4">{course.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-200 text-sm mb-1">{t("Level")}</p>
            <p className="font-semibold">{course.level}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">{t("Class")}</p>
            <p className="font-semibold">{course.class}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">{t("Teacher")}</p>
            <p className="font-semibold">{course.teacherName}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">{t("Students")}</p>
            <p className="font-semibold">{course.students.length}</p>
          </div>
        </div>
      </div>

      {/* Assessment Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {assessmentStats && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">{t("Class Average")}</h3>
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{assessmentStats.average.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{t("all assessments")}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">{t("Highest Grade")}</h3>
                <BarChart3 size={20} className="text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">{assessmentStats.highest.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{t("maximum score")}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">{t("Lowest Grade")}</h3>
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">{assessmentStats.lowest.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{t("minimum score")}</p>
            </div>
          </>
        )}

        {attendanceStats && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">{t("Avg Attendance")}</h3>
              <Users size={20} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{attendanceStats.avgAttendance.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-2">{t("daily attendance")}</p>
          </div>
        )}
      </div>

      {/* Student Assessment Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">{t("Student Assessment Summary")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">{t("Student")}</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">{t("Quizzes Present")}</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">{t("Homework Present")}</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">{t("Midterm")}</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">{t("Final")}</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">{t("Average")}</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.map((row, idx) => (
                <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">{row.quizCount}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">{row.homeworkCount}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {row.midterm !== undefined ? row.midterm : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {row.finalExam !== undefined ? row.finalExam : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-blue-600">
                    {row.average !== undefined ? row.average.toFixed(2) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{t("Quizzes")}</h2>
          </div>
          <div className="p-6 space-y-3">
            {(course.quizzes || []).length === 0 ? (
              <p className="text-sm text-gray-500">{t("No quizzes created yet.")}</p>
            ) : (
              (course.quizzes || []).map((quiz) => (
                <div key={quiz.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-gray-900">{quiz.name}</p>
                  <p className="text-xs text-gray-500">{t("Date")}: {quiz.date}</p>
                  <p className="text-xs text-gray-500">{t("Max Grade")}: {quiz.maxGrade}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Homework */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{t("Homework")}</h2>
          </div>
          <div className="p-6 space-y-3">
            {(course.homeworks || []).length === 0 ? (
              <p className="text-sm text-gray-500">{t("No homework created yet.")}</p>
            ) : (
              (course.homeworks || []).map((homework) => (
                <div key={homework.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-gray-900">{homework.name}</p>
                  <p className="text-xs text-gray-500">{t("Date")}: {homework.date}</p>
                  <p className="text-xs text-gray-500">{t("Max Grade")}: {homework.maxGrade}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Attendance Report "Not displayed now" */}
      {course.attendance.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{t("Attendance Report")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">{t("Student Name")}</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">{t("Present")}</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">{t("Absent")}</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">{t("Attendance")} %</th>
                </tr>
              </thead>
              <tbody>
                {course.attendance.map((record, idx) => (
                  <tr key={record.studentId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.studentName}</td>
                    <td className="px-6 py-4 text-sm text-center text-green-600 font-semibold">{record.totalPresent}</td>
                    <td className="px-6 py-4 text-sm text-center text-red-600 font-semibold">{record.totalAbsent}</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-blue-600">{record.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
