import { NextResponse } from "next/server";
import { publicUser, userFromToken } from "@/utils/mockApiDb";

export async function GET(request: Request) {
  const user = userFromToken(request.headers.get("authorization"));

  if (!user) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  return NextResponse.json({ user: publicUser(user) });
}
