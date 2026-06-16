import { Course } from "@/types/course";
import { db, MockUser, publicUser, userFromToken } from "@/utils/mockApiDb";

const allAssessments = (course: Course) => [
  ...(course.quizzes ?? []),
  ...(course.homeworks ?? []),
  ...(course.midtermExam ? [course.midtermExam] : []),
  ...(course.finalExam ? [course.finalExam] : []),
];

const average = (values: number[]) =>
  values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const courseAverage = (course: Course, studentId?: string) => {
  const grades = allAssessments(course).flatMap((assessment) =>
    assessment.studentRecords
      .filter((record) => record.isPresent && record.grade !== undefined)
      .filter((record) => !studentId || record.studentId === studentId)
      .map((record) => Math.round(((record.grade as number) / assessment.maxGrade) * 100)),
  );

  return average(grades);
};

const courseAttendance = (course: Course, studentId?: string) => {
  const records = course.attendance.filter((record) => !studentId || record.studentId === studentId);
  const present = records.reduce((sum, record) => sum + record.totalPresent, 0);
  const absent = records.reduce((sum, record) => sum + record.totalAbsent, 0);
  const total = present + absent;

  return {
    present,
    absent,
    rate: total > 0 ? Math.round((present / total) * 100) : 0,
  };
};

const studentAssessmentRows = (courses: Course[], studentId: string) =>
  courses.flatMap((course) =>
    allAssessments(course)
      .map((assessment) => {
        const record = assessment.studentRecords.find((item) => item.studentId === studentId);
        if (!record) return null;

        return {
          id: `${course.id}-${assessment.id}-${studentId}`,
          courseId: course.id,
          course: course.name,
          title: assessment.name,
          type: assessment.type,
          date: assessment.date,
          grade: record.grade,
          maxGrade: assessment.maxGrade,
          percentage: record.grade !== undefined ? Math.round((record.grade / assessment.maxGrade) * 100) : null,
          status: record.isPresent ? "present" : "absent",
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  );

const courseAttendanceRows = (courses: Course[], studentId: string) =>
  courses
    .map((course) => {
      const item = courseAttendance(course, studentId);
      return {
        courseId: course.id,
        course: course.name,
        present: item.present,
        absent: item.absent,
        rate: item.rate,
      };
    })
    .filter((item) => item.present + item.absent > 0);

const upcomingAssessments = (courses: Course[], studentId?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = courses.flatMap((course) =>
    allAssessments(course)
      .filter((assessment) => !studentId || assessment.studentRecords.some((record) => record.studentId === studentId))
      .map((assessment) => ({
        id: assessment.id,
        title: assessment.name,
        type: assessment.type,
        course: course.name,
        date: assessment.date,
        maxGrade: assessment.maxGrade,
      })),
  );

  const futureRows = rows.filter((row) => {
    const parsed = new Date(row.date);
    parsed.setHours(0, 0, 0, 0);
    return !Number.isNaN(parsed.getTime()) && parsed >= today;
  });

  const sourceRows = futureRows.length > 0 ? futureRows : rows;
  return sourceRows.sort((a, b) => a.date.localeCompare(b.date));
};

const publicUserOrFallback = (authorization: string | null, role: MockUser["role"], fallbackId: string) => {
  const tokenUser = userFromToken(authorization);
  const user = tokenUser?.role === role ? tokenUser : db.users.find((item) => item.id === fallbackId);
  return user ?? db.users.find((item) => item.role === role) ?? db.users[0];
};

export const getTeacherDashboard = (authorization: string | null) => {
  const teacher = publicUserOrFallback(authorization, "teacher", "t1");
  const courses = db.courses.filter((course) => course.teacherId === teacher.id);
  const students = new Map<string, { id: string; name: string }>();

  courses.forEach((course) => course.students.forEach((student) => students.set(student.id, student)));

  const attendanceTotals = courses.reduce(
    (totals, course) => {
      const attendance = courseAttendance(course);
      return {
        present: totals.present + attendance.present,
        absent: totals.absent + attendance.absent,
      };
    },
    { present: 0, absent: 0 },
  );
  const attendanceTotal = attendanceTotals.present + attendanceTotals.absent;

  return {
    user: publicUser(teacher),
    stats: {
      totalCourses: courses.length,
      totalStudents: students.size,
      assessments: courses.reduce((sum, course) => sum + allAssessments(course).length, 0),
      attendanceRate: attendanceTotal > 0 ? Math.round((attendanceTotals.present / attendanceTotal) * 100) : 0,
      averageScore: average(courses.map((course) => courseAverage(course)).filter(Boolean)),
    },
    courses: courses.map((course) => ({
      id: course.id,
      name: course.name,
      level: course.level,
      class: course.class,
      students: course.students.length,
      assessments: allAssessments(course).length,
      averageScore: courseAverage(course),
      attendanceRate: courseAttendance(course).rate,
    })),
    upcoming: upcomingAssessments(courses).slice(0, 6),
    recentStudents: [...students.values()].slice(0, 6),
    gradebook: courses.flatMap((course) =>
      course.students.map((student) => ({
        id: `${course.id}-${student.id}`,
        courseId: course.id,
        course: course.name,
        studentId: student.id,
        studentName: student.name,
        averageScore: courseAverage(course, student.id),
        attendanceRate: courseAttendance(course, student.id).rate,
        completedAssessments: studentAssessmentRows([course], student.id).filter(
          (row) => row.status === "present" && row.grade !== undefined,
        ).length,
      })),
    ),
    assessmentBreakdown: courses.map((course) => ({
      courseId: course.id,
      course: course.name,
      quizzes: course.quizzes.length,
      homeworks: course.homeworks.length,
      exams: (course.midtermExam ? 1 : 0) + (course.finalExam ? 1 : 0),
    })),
  };
};

export const getStudentDashboard = (authorization: string | null) => {
  const student = publicUserOrFallback(authorization, "student", "s1");
  const courses = db.courses.filter((course) => course.studentIds.includes(student.id));
  const attendance = courses.reduce(
    (totals, course) => {
      const item = courseAttendance(course, student.id);
      return {
        present: totals.present + item.present,
        absent: totals.absent + item.absent,
      };
    },
    { present: 0, absent: 0 },
  );
  const attendanceTotal = attendance.present + attendance.absent;

  return {
    user: publicUser(student),
    stats: {
      enrolledCourses: courses.length,
      completedAssessments: courses.reduce(
        (sum, course) =>
          sum +
          allAssessments(course).filter((assessment) =>
            assessment.studentRecords.some(
              (record) => record.studentId === student.id && record.isPresent && record.grade !== undefined,
            ),
          ).length,
        0,
      ),
      attendanceRate: attendanceTotal > 0 ? Math.round((attendance.present / attendanceTotal) * 100) : 0,
      performanceScore: average(courses.map((course) => courseAverage(course, student.id)).filter(Boolean)),
    },
    courses: courses.map((course) => ({
      id: course.id,
      name: course.name,
      teacherName: course.teacherName,
      averageScore: courseAverage(course, student.id),
      attendanceRate: courseAttendance(course, student.id).rate,
      assessments: upcomingAssessments([course], student.id).length,
    })),
    deadlines: upcomingAssessments(courses, student.id).slice(0, 6),
    attendance,
    gradeRecords: studentAssessmentRows(courses, student.id),
    attendanceRows: courseAttendanceRows(courses, student.id),
  };
};

export const getParentDashboard = (authorization: string | null) => {
  const parent = publicUserOrFallback(authorization, "parent", "p1");
  const children = db.users.filter((user) => user.role === "student" && user.parent_id === parent.id);
  const childIds = children.map((child) => child.id);
  const courses = db.courses.filter((course) => course.studentIds.some((id) => childIds.includes(id)));
  const attendance = childIds.reduce(
    (totals, childId) => {
      const childAttendance = courses.reduce(
        (sum, course) => {
          const item = courseAttendance(course, childId);
          return {
            present: sum.present + item.present,
            absent: sum.absent + item.absent,
          };
        },
        { present: 0, absent: 0 },
      );
      return {
        present: totals.present + childAttendance.present,
        absent: totals.absent + childAttendance.absent,
      };
    },
    { present: 0, absent: 0 },
  );
  const attendanceTotal = attendance.present + attendance.absent;
  const childCourseRows = children.flatMap((child) =>
    courses
      .filter((course) => course.studentIds.includes(child.id))
      .map((course) => ({
        childId: child.id,
        childName: child.fullName,
        courseId: course.id,
        courseName: course.name,
        teacherName: course.teacherName,
        averageScore: courseAverage(course, child.id),
        attendanceRate: courseAttendance(course, child.id).rate,
      })),
  );

  return {
    user: publicUser(parent),
    children: children.map(publicUser),
    stats: {
      children: children.length,
      totalCourses: new Set(childCourseRows.map((row) => row.courseId)).size,
      attendanceRate: attendanceTotal > 0 ? Math.round((attendance.present / attendanceTotal) * 100) : 0,
      averagePerformance: average(childCourseRows.map((row) => row.averageScore).filter(Boolean)),
      upcomingTasks: upcomingAssessments(courses).length,
    },
    courses: childCourseRows,
    upcoming: upcomingAssessments(courses).slice(0, 6),
    attendance,
    childSummaries: children.map((child) => {
      const childCourses = courses.filter((course) => course.studentIds.includes(child.id));
      const scores = childCourses.map((course) => courseAverage(course, child.id)).filter(Boolean);
      const childAttendance = childCourses.reduce(
        (sum, course) => {
          const item = courseAttendance(course, child.id);
          return {
            present: sum.present + item.present,
            absent: sum.absent + item.absent,
          };
        },
        { present: 0, absent: 0 },
      );
      const total = childAttendance.present + childAttendance.absent;
      const attendanceRate = total > 0 ? Math.round((childAttendance.present / total) * 100) : 0;
      const averageScore = average(scores);

      return {
        id: child.id,
        name: child.fullName,
        level: child.level,
        classSection: child.classSection,
        courses: childCourses.length,
        averageScore,
        attendanceRate,
        alerts: [
          ...(attendanceRate > 0 && attendanceRate < 80 ? ["Attendance needs attention"] : []),
          ...(averageScore > 0 && averageScore < 75 ? ["Performance follow-up recommended"] : []),
        ],
      };
    }),
  };
};
