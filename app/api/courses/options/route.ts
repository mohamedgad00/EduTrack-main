import { NextResponse } from "next/server";
import { db } from "@/utils/mockApiDb";

export async function GET() {
  return NextResponse.json({
    teachers: db.users
      .filter((user) => user.role === "teacher")
      .map((user) => ({ id: user.id, name: user.fullName })),
    students: db.users
      .filter((user) => user.role === "student")
      .map((user) => ({ id: user.id, name: user.fullName })),
  });
}
