import api from "@/utils/api";
import { Course } from "@/types/course";

interface CurrentUser {
  id: string | number;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "parent" | "admin";
}

interface CourseResponse {
  data?: Course;
  course?: Course;
}

interface CoursesResponse {
  data?: Course[];
  courses?: Course[];
}

interface ParentDashboardData {
  childSummaries: Array<{ id: string }>;
}

export const extractCourse = (payload: CourseResponse | Course) => {
  if ("id" in payload) return payload;
  return payload.data ?? payload.course ?? null;
};

export const extractCourses = (payload: CoursesResponse | Course[]) => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload.courses ?? [];
};

export async function getCourses() {
  const response = await api.get<CoursesResponse | Course[]>("courses");
  return extractCourses(response.data);
}

export async function getCurrentUser() {
  const response = await api.get<{ user: CurrentUser }>("me");
  return response.data.user;
}

export async function getMyTeacherCourses() {
  const [user, courses] = await Promise.all([getCurrentUser(), getCourses()]);
  return courses.filter((course) => course.teacherId === String(user.id));
}

export async function getMyStudentCourses() {
  const [user, courses] = await Promise.all([getCurrentUser(), getCourses()]);
  return {
    studentId: String(user.id),
    courses: courses.filter((course) => course.studentIds.includes(String(user.id))),
  };
}

export async function getCourse(courseId: string) {
  const response = await api.get<CourseResponse | Course>(`courses/${encodeURIComponent(courseId)}`);
  return extractCourse(response.data);
}

export async function getMyTeacherCourse(courseId: string) {
  const [user, course] = await Promise.all([getCurrentUser(), getCourse(courseId)]);
  if (!course || course.teacherId !== String(user.id)) return null;
  return course;
}

export async function getMyStudentCourse(courseId: string) {
  const [user, course] = await Promise.all([getCurrentUser(), getCourse(courseId)]);
  if (!course || !course.studentIds.includes(String(user.id))) {
    return { studentId: String(user.id), course: null };
  }
  return { studentId: String(user.id), course };
}

export async function getMyParentChildCourses(childId: string) {
  const [dashboard, courses] = await Promise.all([
    api.get<ParentDashboardData>("parent/dashboard"),
    getCourses(),
  ]);
  const isLinkedChild = dashboard.data.childSummaries.some((child) => child.id === childId);

  return {
    isLinkedChild,
    courses: isLinkedChild ? courses.filter((course) => course.studentIds.includes(childId)) : [],
  };
}

export async function saveCourse(course: Course) {
  const response = await api.put<CourseResponse | Course>(`courses/${encodeURIComponent(course.id)}`, course);
  return extractCourse(response.data);
}

export function getCourseAssessments(course: Course) {
  return [
    ...(course.quizzes ?? []),
    ...(course.homeworks ?? []),
    ...(course.midtermExam ? [course.midtermExam] : []),
    ...(course.finalExam ? [course.finalExam] : []),
  ];
}

export function average(values: number[]) {
  return values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

export function studentAverage(course: Course, studentId: string) {
  const percentages = getCourseAssessments(course).flatMap((assessment) => {
    const record = assessment.studentRecords.find((item) => item.studentId === studentId);
    if (!record || !record.isPresent || record.grade === undefined) return [];
    return [Math.round((record.grade / assessment.maxGrade) * 100)];
  });

  return average(percentages);
}

export function attendanceSummary(course: Course, studentId?: string) {
  const records = course.attendance.filter((record) => !studentId || record.studentId === studentId);
  const present = records.reduce((sum, record) => sum + record.totalPresent, 0);
  const absent = records.reduce((sum, record) => sum + record.totalAbsent, 0);
  const total = present + absent;

  return {
    present,
    absent,
    rate: total > 0 ? Math.round((present / total) * 100) : 0,
  };
}
