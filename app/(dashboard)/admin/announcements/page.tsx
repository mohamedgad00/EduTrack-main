"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface AdminDashboardData {
  announcements: Array<{ id: string; category: string; title: string; body: string }>;
}

export default function AdminAnnouncementsPage() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<AdminDashboardData["announcements"]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<AdminDashboardData>("admin/announcements").then((response) => setAnnouncements(response.data.announcements));
  }, []);

  const addAnnouncement = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await api.post<{ announcement: AdminDashboardData["announcements"][number] }>("admin/announcements", {
        title,
        category,
        body,
      });
      setAnnouncements((current) => [response.data.announcement, ...current]);
      setTitle("");
      setCategory("General");
      setBody("");
    } catch {
      setError("Failed to save announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{t("Announcements")}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create school announcements and persist them through the local API.
          </p>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2"
            >
              <option value="General">{t("General")}</option>
              <option value="Academic">{t("Academic")}</option>
              <option value="System">{t("System")}</option>
              <option value="Parents">{t("Parents")}</option>
            </select>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("Announcement title")}
              className="rounded-md border border-gray-300 px-4 py-2"
            />
          </div>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t("Write announcement body...")}
            className="mt-3 min-h-28 w-full rounded-md border border-gray-300 px-4 py-2"
          />
          <button
            onClick={addAnnouncement}
            disabled={isSaving}
            className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSaving ? t("loading") : t("Add")}
          </button>
        </section>

        <section className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{announcement.category}</span>
              <h2 className="mt-3 font-semibold">{announcement.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{announcement.body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
