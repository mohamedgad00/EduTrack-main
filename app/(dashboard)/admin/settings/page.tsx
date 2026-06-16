"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface MeResponse {
  user: {
    fullName?: string;
    email?: string;
    role?: string;
    username?: string;
  };
}

export default function AdminSettingsPage() {
  const { t, locale, dir } = useLanguage();
  const [user, setUser] = useState<MeResponse["user"] | null>(null);

  useEffect(() => {
    api.get<MeResponse>("me").then((response) => setUser(response.data.user));
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("Settings")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("Manage account preferences and workspace language.")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">{t("Profile")}</h2>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">{t("Name")}</dt>
              <dd className="font-medium text-gray-900">{user?.fullName ?? t("loading")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">{t("Email")}</dt>
              <dd className="font-medium text-gray-900">{user?.email ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">{t("Role")}</dt>
              <dd className="font-medium text-gray-900">{user?.role ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">{t("Username")}</dt>
              <dd className="font-medium text-gray-900">{user?.username ?? "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">{t("language.toggle")}</h2>
          <div className="flex items-center justify-between rounded-md bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">{locale.toUpperCase()}</p>
              <p className="text-sm text-gray-500">{t("Direction")}: {dir.toUpperCase()}</p>
            </div>
            <LanguageToggle />
          </div>
        </section>
      </div>
    </main>
  );
}
