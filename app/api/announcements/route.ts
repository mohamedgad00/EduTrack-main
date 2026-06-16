import { NextResponse } from "next/server";
import { ensureAnnouncements, userFromToken } from "@/utils/mockApiDb";

export async function GET(request: Request) {
  if (!userFromToken(request.headers.get("authorization"))) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({
    announcements: ensureAnnouncements().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
}
