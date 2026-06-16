import { NextResponse } from "next/server";
import { getTeacherDashboard } from "@/utils/dashboardData";
import { userFromToken } from "@/utils/mockApiDb";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const user = userFromToken(authorization);

  if (user?.role !== "teacher") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json(getTeacherDashboard(authorization));
}
