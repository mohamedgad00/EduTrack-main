import { NextResponse } from "next/server";
import { getParentDashboard } from "@/utils/dashboardData";
import { userFromToken } from "@/utils/mockApiDb";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const user = userFromToken(authorization);

  if (user?.role !== "parent") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json(getParentDashboard(authorization));
}
