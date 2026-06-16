"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface ParentDashboardData {
  childSummaries: Array<{ id: string; name: string; level?: string; classSection?: string; courses: number; averageScore: number; attendanceRate: number; alerts: string[] }>;
}

export default function ParentChildrenPage() {
  const { t } = useLanguage();
  const [children, setChildren] = useState<ParentDashboardData["childSummaries"]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<ParentDashboardData>("parent/dashboard")
      .then((response) => setChildren(response.data.childSummaries))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredChildren = children.filter((child) => child.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <WorkflowShell title="My Children" subtitle="Open each child profile and follow progress." nav={[{ href: "/parent", label: "Dashboard" }, { href: "/parent/announcements", label: "Announcements" }]}>
      <div className="mb-5 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${t("search")}...`} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading children...")}</p> : null}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredChildren.map((child) => (
          <div key={child.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{child.name}</h2>
            <p className="text-sm text-gray-500">{t("Level")} {child.level} - {t("Section")} {child.classSection}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
              <span className="rounded bg-blue-50 p-2 text-blue-700"><b>{child.courses}</b><br />{t("Courses")}</span>
              <span className="rounded bg-purple-50 p-2 text-purple-700"><b>{child.averageScore}%</b><br />{t("Score")}</span>
              <span className="rounded bg-green-50 p-2 text-green-700"><b>{child.attendanceRate}%</b><br />{t("Attendance")}</span>
            </div>
            <Link href={`/parent/children/${child.id}`} className="mt-5 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white">
              {t("Open Profile")}
            </Link>
          </div>
        ))}
      </div>
      {!isLoading && filteredChildren.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No children found.")}</p> : null}
    </WorkflowShell>
  );
}
