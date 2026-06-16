"use client";

import { useEffect, useState } from "react";
import WorkflowShell from "@/components/workflows/WorkflowShell";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface Announcement {
  id: string;
  category: string;
  title: string;
  body: string;
  createdAt: string;
}

export default function ParentAnnouncementsPage() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data?: Announcement[]; announcements?: Announcement[] } | Announcement[]>("announcements")
      .then((response) => {
        const payload = response.data;
        setAnnouncements(Array.isArray(payload) ? payload : payload.data ?? payload.announcements ?? []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <WorkflowShell title="Announcements" subtitle="School and course notices for parents." nav={[{ href: "/parent", label: "Dashboard" }, { href: "/parent/children", label: "My Children" }]}>
      {isLoading ? <p className="text-sm text-gray-500">{t("Loading announcements...")}</p> : null}
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium">{announcement.title}</p>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{announcement.category}</span>
            </div>
            <p className="text-sm text-gray-600">{announcement.body}</p>
            <p className="mt-2 text-xs text-gray-500">{new Date(announcement.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      {!isLoading && announcements.length === 0 ? <p className="rounded-lg bg-white p-5 text-sm text-gray-500">{t("No announcements found.")}</p> : null}
    </WorkflowShell>
  );
}
