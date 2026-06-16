import { Course } from "@/types/course";
import { db, ensureAnnouncements, publicUser, userFromToken } from "@/utils/mockApiDb";

const allAssessments = (course: Course) => [
  ...(course.quizzes ?? []),
  ...(course.homeworks ?? []),
  ...(course.midtermExam ? [course.midtermExam] : []),
  ...(course.finalExam ? [course.finalExam] : []),
];

const average = (values: number[]) =>
  values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const courseAverage = (course: Course) => {
  const grades = allAssessments(course).flatMap((assessment) =>
    assessment.studentRecords
      .filter((record) => record.isPresent && record.grade !== undefined)
      .map((record) => Math.round(((record.grade as number) / assessment.maxGrade) * 100)),
  );

  return average(grades);
};

const monthLabel = (date: Date) => new Intl.DateTimeFormat("en", { month: "short" }).format(date);

const buildUserGrowth = () => {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthLabel(date),
      users: 0,
    };
  });

  const monthMap = new Map(months.map((month) => [month.key, month]));

  db.users.forEach((user) => {
    const date = new Date(user.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = monthMap.get(key);
    if (month) {
      month.users += 1;
    }
  });

  return months.map(({ label, users }) => ({ label, users }));
};

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));

export const getAdminDashboard = (authorization: string | null) => {
  const admin = userFromToken(authorization) ?? db.users.find((user) => user.role === "admin") ?? db.users[0];
  const students = db.users.filter((user) => user.role === "student");
  const teachers = db.users.filter((user) => user.role === "teacher");
  const parents = db.users.filter((user) => user.role === "parent");
  const activeUsers = db.users.filter((user) => user.isActive);
  const assessments = db.courses.flatMap(allAssessments);

  const performanceByCourse = db.courses.map((course) => ({
    label: course.name,
    score: courseAverage(course),
    students: course.students.length,
  }));

  const activities = [
    ...db.users.slice(0, 4).map((user) => ({
      type: user.role,
      title: `${user.role[0].toUpperCase()}${user.role.slice(1)} account active`,
      desc: `${user.fullName} is available in the system`,
      time: formatShortDate(user.updatedAt),
    })),
    ...db.courses.slice(0, 3).map((course) => ({
      type: "course",
      title: "Course ready",
      desc: `${course.name} has ${course.students.length} assigned students`,
      time: formatShortDate(course.updatedAt),
    })),
  ].slice(0, 6);

  const upcoming = assessments
    .map((assessment) => {
      const course = db.courses.find((item) => allAssessments(item).some((entry) => entry.id === assessment.id));
      return {
        id: assessment.id,
        title: assessment.name,
        type: assessment.type,
        course: course?.name ?? "Course",
        date: assessment.date,
        maxGrade: assessment.maxGrade,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return {
    admin: publicUser(admin),
    stats: {
      students: students.length,
      teachers: teachers.length,
      parents: parents.length,
      courses: db.courses.length,
      assessments: assessments.length,
      activeUsers: activeUsers.length,
      averageScore: average(performanceByCourse.map((item) => item.score).filter(Boolean)),
    },
    performanceByCourse,
    userGrowth: buildUserGrowth(),
    activities,
    upcoming,
    announcements: ensureAnnouncements()
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6),
  };
};
