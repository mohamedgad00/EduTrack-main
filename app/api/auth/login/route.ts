import { NextResponse } from "next/server";
import { db, publicUser } from "@/utils/mockApiDb";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").toLowerCase();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "");

  const user = db.users.find(
    (item) => item.email.toLowerCase() === email && item.password === password && item.role === role,
  );

  if (!user) {
    return NextResponse.json({ message: "Invalid email, password, or role." }, { status: 401 });
  }

  return NextResponse.json({
    user: publicUser(user),
    token: `local-token-${user.id}`,
  });
}
