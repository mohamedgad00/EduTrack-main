import { NextResponse } from "next/server";
import { getAdminDashboard } from "@/utils/adminDashboardData";
import { userFromToken } from "@/utils/mockApiDb";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const user = userFromToken(authorization);

  if (user?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json(getAdminDashboard(authorization));
}
