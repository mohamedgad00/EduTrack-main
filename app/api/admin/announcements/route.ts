import { NextResponse } from "next/server";
import { ensureAnnouncements, saveDb, userFromToken } from "@/utils/mockApiDb";

const ensureAdmin = (request: Request) => {
  const user = userFromToken(request.headers.get("authorization"));
  return user?.role === "admin";
};

export async function GET(request: Request) {
  if (!userFromToken(request.headers.get("authorization"))) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({
    announcements: ensureAnnouncements().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
}

export async function POST(request: Request) {
  if (!ensureAdmin(request)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "General").trim() || "General";
  const announcementBody = String(body.body ?? "").trim();

  if (!title || !announcementBody) {
    return NextResponse.json({ message: "Title and body are required." }, { status: 422 });
  }

  const announcement = {
    id: `ann-${Date.now()}`,
    category,
    title,
    body: announcementBody,
    createdAt: new Date().toISOString(),
  };

  ensureAnnouncements().unshift(announcement);
  saveDb();

  return NextResponse.json({ announcement }, { status: 201 });
}
