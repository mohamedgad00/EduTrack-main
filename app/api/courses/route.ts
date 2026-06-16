import { NextResponse } from "next/server";
import { Course } from "@/types/course";
import { db, saveDb, upsertCourseRelations, userFromToken } from "@/utils/mockApiDb";

export async function GET(request: Request) {
  const user = userFromToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const data =
    user.role === "admin"
      ? db.courses
      : user.role === "teacher"
        ? db.courses.filter((course) => course.teacherId === user.id)
        : user.role === "student"
          ? db.courses.filter((course) => course.studentIds.includes(user.id))
          : db.courses.filter((course) => {
              const childIds = db.users
                .filter((student) => student.role === "student" && student.parent_id === user.id)
                .map((student) => student.id);
              return course.studentIds.some((id) => childIds.includes(id));
            });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const user = userFromToken(request.headers.get("authorization"));
  if (user?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const body = await request.json();
  const now = new Date().toISOString();

  const course: Course = upsertCourseRelations({
    id: crypto.randomUUID(),
    name: String(body.name ?? ""),
    level: String(body.level ?? ""),
    class: String(body.class ?? ""),
    description: String(body.description ?? ""),
    teacherId: String(body.teacherId ?? ""),
    teacherName: "",
    studentIds: Array.isArray(body.studentIds) ? body.studentIds.map(String) : [],
    students: [],
    createdAt: now,
    updatedAt: now,
    quizzes: [],
    homeworks: [],
    midtermExam: null,
    finalExam: null,
    attendance: [],
  });

  if (!course.name || !course.teacherId || course.studentIds.length === 0) {
    return NextResponse.json({ message: "Course name, teacher, and students are required." }, { status: 422 });
  }

  db.courses.unshift(course);
  saveDb();

  return NextResponse.json({ data: course, course }, { status: 201 });
}
