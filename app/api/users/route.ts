import { NextResponse } from "next/server";
import { db, MockUser, publicUser, saveDb } from "@/utils/mockApiDb";

const splitName = (fullName: string) => {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(" "),
  };
};

export async function GET() {
  return NextResponse.json({ data: db.users.map(publicUser) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const fullName = String(body.fullName ?? body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = body.role as MockUser["role"];

  if (!fullName || !email || !role || !["student", "teacher", "parent", "admin"].includes(role)) {
    return NextResponse.json({ message: "fullName, email, and role are required." }, { status: 422 });
  }

  if (db.users.some((user) => user.email.toLowerCase() === email)) {
    return NextResponse.json({ message: "Email already exists." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const nameParts = splitName(fullName);
  const user: MockUser = {
    id: crypto.randomUUID(),
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    fullName,
    email,
    username: String(body.username ?? email.split("@")[0]),
    password: String(body.password ?? "123456"),
    role,
    phone: String(body.phone ?? ""),
    gender: String(body.gender ?? ""),
    date_of_birth: String(body.date_of_birth ?? body.dob ?? ""),
    isActive: true,
    status: "active",
    createdAt: now,
    updatedAt: now,
    level: body.level,
    classSection: body.classSection,
    parent_id: body.parent_id,
    enrollmentDate: body.enrollmentDate,
    specialty: body.specialty,
    experience: body.experience,
    hireDate: body.hireDate,
    address: body.address,
    linkedStudents: body.linkedStudents,
    coursesAssigned: body.coursesAssigned,
  };

  db.users.unshift(user);
  saveDb();

  return NextResponse.json({ data: publicUser(user), user: publicUser(user) }, { status: 201 });
}
