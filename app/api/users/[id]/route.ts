import { NextResponse } from "next/server";
import { db, MockUser, publicUser, saveDb } from "@/utils/mockApiDb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const findUser = (id: string) => db.users.find((user) => user.id === id);

const applyUserUpdate = (user: MockUser, body: Partial<MockUser> & { dob?: string; name?: string }) => {
  const fullName = body.fullName ?? body.name ?? user.fullName;
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);

  user.fullName = fullName;
  user.firstName = firstName;
  user.lastName = rest.join(" ");
  user.email = body.email ?? user.email;
  user.phone = body.phone ?? user.phone;
  user.gender = body.gender ?? user.gender;
  user.date_of_birth = body.date_of_birth ?? body.dob ?? user.date_of_birth;
  user.username = body.username ?? user.username;
  user.level = body.level ?? user.level;
  user.classSection = body.classSection ?? user.classSection;
  user.parent_id = body.parent_id ?? user.parent_id;
  user.enrollmentDate = body.enrollmentDate ?? user.enrollmentDate;
  user.specialty = body.specialty ?? user.specialty;
  user.experience = body.experience ?? user.experience;
  user.hireDate = body.hireDate ?? user.hireDate;
  user.address = body.address ?? user.address;
  user.linkedStudents = body.linkedStudents ?? user.linkedStudents;
  user.coursesAssigned = body.coursesAssigned ?? user.coursesAssigned;
  user.updatedAt = new Date().toISOString();
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const user = findUser(id);

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ data: publicUser(user), user: publicUser(user) });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const user = findUser(id);

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  applyUserUpdate(user, await request.json());
  saveDb();

  return NextResponse.json({ data: publicUser(user), user: publicUser(user) });
}

export async function PATCH(request: Request, context: RouteContext) {
  return PUT(request, context);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const index = db.users.findIndex((user) => user.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  db.users.splice(index, 1);
  saveDb();

  return NextResponse.json({ message: "User deleted successfully." });
}
