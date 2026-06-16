import { NextResponse } from "next/server";
import { publicUser, saveDb, userFromToken } from "@/utils/mockApiDb";

export async function PUT(request: Request) {
  const user = userFromToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const body = await request.json();
  const firstName = body.firstName ?? user.firstName;
  const lastName = body.lastName ?? user.lastName;

  user.firstName = firstName;
  user.lastName = lastName;
  user.fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (body.password) {
    user.password = String(body.password);
  }

  user.updatedAt = new Date().toISOString();
  saveDb();

  return NextResponse.json({ user: publicUser(user) });
}
