import { NextResponse } from "next/server";
import { Course } from "@/types/course";
import { db, MockUser, saveDb, upsertCourseRelations, userFromToken } from "@/utils/mockApiDb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const findCourseIndex = (id: string) => db.courses.findIndex((course) => course.id === id);

const canReadCourse = (user: MockUser | null, course: Course) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "teacher") return course.teacherId === user.id;
  if (user.role === "student") return course.studentIds.includes(user.id);

  if (user.role === "parent") {
    const childIds = db.users.filter((item) => item.role === "student" && item.parent_id === user.id).map((item) => item.id);
    return childIds.some((childId) => course.studentIds.includes(childId));
  }

  return false;
};

const canManageCourse = (user: MockUser | null, course: Course) => {
  if (!user) return false;
  return user.role === "admin" || (user.role === "teacher" && course.teacherId === user.id);
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const course = db.courses.find((item) => item.id === id);
  const user = userFromToken(request.headers.get("authorization"));

  if (!course) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  if (!canReadCourse(user, course)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({ data: course, course });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const index = findCourseIndex(id);

  if (index === -1) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  const body = await request.json();
  const existing = db.courses[index];
  const user = userFromToken(request.headers.get("authorization"));

  if (!canManageCourse(user, existing)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const updatePayload =
    user?.role === "admin"
      ? body
      : {
          ...body,
          teacherId: existing.teacherId,
          teacherName: existing.teacherName,
          studentIds: existing.studentIds,
          students: existing.students,
          createdAt: existing.createdAt,
        };

  const nextCourse: Course = upsertCourseRelations({
    ...existing,
    ...updatePayload,
    id: existing.id,
    studentIds: Array.isArray(updatePayload.studentIds) ? updatePayload.studentIds.map(String) : existing.studentIds,
    updatedAt: new Date().toISOString(),
  });

  db.courses[index] = nextCourse;
  saveDb();

  return NextResponse.json({ data: nextCourse, course: nextCourse });
}

export async function PATCH(request: Request, context: RouteContext) {
  return PUT(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const index = findCourseIndex(id);
  const user = userFromToken(request.headers.get("authorization"));

  if (index === -1) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  if (user?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  db.courses.splice(index, 1);
  saveDb();

  return NextResponse.json({ message: "Course deleted successfully." });
}
