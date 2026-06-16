import { NextResponse } from "next/server";
import { getStudentDashboard } from "@/utils/dashboardData";
import { userFromToken } from "@/utils/mockApiDb";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const user = userFromToken(authorization);

  if (user?.role !== "student") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json(getStudentDashboard(authorization));
}
