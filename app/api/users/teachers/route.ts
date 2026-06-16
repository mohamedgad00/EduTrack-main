import { NextResponse } from "next/server";
import { db, publicUser } from "@/utils/mockApiDb";

export async function GET() {
  return NextResponse.json({
    data: db.users.filter((user) => user.role === "teacher").map(publicUser),
  });
}
