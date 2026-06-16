"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Loader2, Users } from "lucide-react";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type TimeRange = "7d" | "30d" | "90d";
type RoleKey = "student" | "teacher" | "parent";

interface ApiUser {
  id?: string | number;
  _id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
}

interface ApiUsersResponse {
  data?: ApiUser[];
  users?: ApiUser[];
  results?: ApiUser[];
  items?: ApiUser[];
}

interface AnalyticsRow {
  date: string;
  label: string;
  students: number;
  teachers: number;
  parents: number;
  total: number;
  active: number;
}

interface LoadedUser {
  name: string;
  role: RoleKey;
  status: string;
  createdAt: Date | null;
}

const rangeOptions: Array<{ label: string; value: TimeRange; days: number }> = [
  { label: "Last 7 days", value: "7d", days: 7 },
  { label: "Last 30 days", value: "30d", days: 30 },
  { label: "Last 90 days", value: "90d", days: 90 },
];

const roleMeta: Record<RoleKey, { label: string; chipClass: string; dotClass: string }> = {
  student: {
    label: "Students",
    chipClass: "bg-blue-50 text-blue-700",
    dotClass: "bg-blue-500",
  },
  teacher: {
    label: "Teachers",
    chipClass: "bg-purple-50 text-purple-700",
    dotClass: "bg-purple-500",
  },
  parent: {
    label: "Parents",
    chipClass: "bg-orange-50 text-orange-700",
    dotClass: "bg-orange-500",
  },
};

const roleEndpoints: Record<RoleKey, string> = {
  student: "users/students",
  teacher: "users/teachers",
  parent: "users/parents",
};

const roleCountField: Record<RoleKey, keyof Pick<AnalyticsRow, "students" | "teachers" | "parents">> = {
  student: "students",
  teacher: "teachers",
  parent: "parents",
};

const countFormatter = new Intl.NumberFormat("en");

const getRole = (value: string | undefined): RoleKey | null => {
  const normalized = (value ?? "").toLowerCase();

  if (normalized === "student" || normalized === "teacher" || normalized === "parent") {
    return normalized;
  }

  return null;
};

const parseDate = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date: Date) =>
  new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(date);

const getRangeStart = (days: number) => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));
  return startDate;
};

const extractUsers = (payload: ApiUsersResponse | ApiUser[]) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const candidateLists = [payload.data, payload.users, payload.results, payload.items];

  for (const candidate of candidateLists) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [] as ApiUser[];
};

const mapApiUser = (user: ApiUser): LoadedUser | null => {
  const role = getRole(user.role);

  if (!role) {
    return null;
  }

  return {
    name: user.fullName ?? user.name ?? "Unknown",
    role,
    status: (user.status ?? (user.isActive ? "active" : "inactive")).toLowerCase(),
    createdAt: parseDate(user.createdAt),
  };
};

const buildDateSeries = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const downloadCsv = (rows: AnalyticsRow[], rangeLabel: string) => {
  const header = ["Date", "Students", "Teachers", "Parents", "Total New Accounts", "Active Accounts"];
  const csvRows = rows.map((row) => [
    row.label,
    row.students,
    row.teachers,
    row.parents,
    row.total,
    row.active,
  ]);

  const csv = [header, ...csvRows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics-${rangeLabel.replaceAll(" ", "-").toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [range, setRange] = useState<TimeRange>("30d");
  const [users, setUsers] = useState<LoadedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [studentsResponse, teachersResponse, parentsResponse] = await Promise.all([
          api.get<ApiUsersResponse | ApiUser[]>(roleEndpoints.student),
          api.get<ApiUsersResponse | ApiUser[]>(roleEndpoints.teacher),
          api.get<ApiUsersResponse | ApiUser[]>(roleEndpoints.parent),
        ]);

        const mergedUsers = [
          ...extractUsers(studentsResponse.data),
          ...extractUsers(teachersResponse.data),
          ...extractUsers(parentsResponse.data),
        ]
          .map(mapApiUser)
          .filter((user): user is LoadedUser => user !== null);

        if (isMounted) {
          setUsers(mergedUsers);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load analytics data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedRange = rangeOptions.find((option) => option.value === range) ?? rangeOptions[1];

  const analytics = useMemo(() => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = getRangeStart(selectedRange.days);
    const rowMap = new Map<string, AnalyticsRow>();

    for (const date of buildDateSeries(startDate, endDate)) {
      const dateKey = formatDateKey(date);
      rowMap.set(dateKey, {
        date: dateKey,
        label: formatDateLabel(date),
        students: 0,
        teachers: 0,
        parents: 0,
        total: 0,
        active: 0,
      });
    }

    const filteredUsers = users.filter((user) => {
      if (!user.createdAt) {
        return false;
      }

      return user.createdAt >= startDate && user.createdAt <= endDate;
    });

    for (const user of filteredUsers) {
      const rowKey = formatDateKey(user.createdAt as Date);
      const row = rowMap.get(rowKey);

      if (!row) {
        continue;
      }

      row.total += 1;
      if (user.status === "active") {
        row.active += 1;
      }

      row[roleCountField[user.role]] += 1;
    }

    const rows = [...rowMap.values()];
    const totals = rows.reduce(
      (accumulator, row) => ({
        students: accumulator.students + row.students,
        teachers: accumulator.teachers + row.teachers,
        parents: accumulator.parents + row.parents,
        total: accumulator.total + row.total,
        active: accumulator.active + row.active,
      }),
      { students: 0, teachers: 0, parents: 0, total: 0, active: 0 },
    );

    const busiestDay = rows.reduce<AnalyticsRow | null>((winner, row) => {
      if (!winner || row.total > winner.total) {
        return row;
      }

      return winner;
    }, null);

    return {
      rows,
      totals,
      filteredCount: filteredUsers.length,
      busiestDay,
      activeRate: totals.total > 0 ? Math.round((totals.active / totals.total) * 100) : 0,
    };
  }, [selectedRange.days, users]);

  const handleExport = () => {
    downloadCsv(analytics.rows, selectedRange.label);
  };

  const statsCards = [
    {
      label: "New accounts",
      value: analytics.totals.total,
      meta: `${selectedRange.label} window`,
    },
    {
      label: "Students",
      value: analytics.totals.students,
      meta: `${analytics.filteredCount > 0 ? Math.round((analytics.totals.students / analytics.filteredCount) * 100) : 0}% of new accounts`,
    },
    {
      label: "Teachers",
      value: analytics.totals.teachers,
      meta: `${analytics.filteredCount > 0 ? Math.round((analytics.totals.teachers / analytics.filteredCount) * 100) : 0}% of new accounts`,
    },
    {
      label: "Parents",
      value: analytics.totals.parents,
      meta: `${analytics.activeRate}% active in period`,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <Users size={14} />
                {t("System analytics")}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{t("Whole system analytics")}</h1>
                <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                  {t("Review how students, teachers, and parents are added over time, then export the visible period as a CSV file for Excel.")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Download size={16} />
              {t("Export CSV")}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-500">{t("Period")}</span>
            {rangeOptions.map((option) => {
              const active = option.value === range;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${active
                    ? "bg-white text-blue-700 shadow-sm border border-gray-100"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                    }`}
                >
                  {t(option.label)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => {
            const iconClass =
              index === 0
                ? "bg-blue-50 text-blue-600"
                : index === 1
                  ? "bg-purple-50 text-purple-600"
                  : index === 2
                    ? "bg-orange-50 text-orange-600"
                    : "bg-teal-50 text-teal-600";

            return (
              <div key={card.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-md ${iconClass}`}>
                    <Users size={20} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                    {card.meta}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-500">{t(card.label)}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{countFormatter.format(card.value)}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)] gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 text-[15px]">{t("Spreadsheet view")}</h2>
                <p className="text-sm text-gray-500">
                  {selectedRange.label} · {analytics.rows.length} rows
                </p>
              </div>
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {analytics.busiestDay ? `Busiest day: ${analytics.busiestDay.label}` : "No activity yet"}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-4 font-semibold">{t("Date")}</th>
                    <th className="px-4 py-4 font-semibold">{t("Students")}</th>
                    <th className="px-4 py-4 font-semibold">{t("Teachers")}</th>
                    <th className="px-4 py-4 font-semibold">{t("Parents")}</th>
                    <th className="px-4 py-4 font-semibold">{t("Total new")}</th>
                    <th className="px-6 py-4 font-semibold">{t("Active")}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-sm text-gray-500">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          {t("Loading analytics...")}
                        </span>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-sm text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : analytics.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-sm text-gray-500">
                        {t("No user records were found for this period.")}
                      </td>
                    </tr>
                  ) : (
                    analytics.rows.map((row) => (
                      <tr key={row.date} className="border-b border-gray-100 text-sm text-gray-700 last:border-b-0">
                        <td className="px-6 py-4 font-medium text-gray-900">{row.label}</td>
                        <td className="px-4 py-4">{row.students}</td>
                        <td className="px-4 py-4">{row.teachers}</td>
                        <td className="px-4 py-4">{row.parents}</td>
                        <td className="px-4 py-4 font-semibold text-gray-900">{row.total}</td>
                        <td className="px-6 py-4">{row.active}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 text-[15px]">{t("Role mix")}</h3>
              <p className="mt-1 text-sm text-gray-500">{t("Distribution of new accounts inside the selected period.")}</p>

              <div className="mt-5 space-y-4">
                {(Object.keys(roleMeta) as RoleKey[]).map((role) => {
                  const total = role === "student"
                    ? analytics.totals.students
                    : role === "teacher"
                      ? analytics.totals.teachers
                      : analytics.totals.parents;
                  const percentage = analytics.totals.total > 0 ? Math.round((total / analytics.totals.total) * 100) : 0;

                  return (
                    <div key={role} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-medium ${roleMeta[role].chipClass}`}>
                          <span className={`h-2.5 w-2.5 rounded-full ${roleMeta[role].dotClass}`} />
                          {t(roleMeta[role].label)}
                        </span>
                        <span className="font-semibold text-gray-900">{total}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${roleMeta[role].dotClass}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 text-[15px]">{t("Quick summary")}</h3>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">{t("Average new accounts/day")}</dt>
                  <dd className="font-semibold text-gray-900">
                    {analytics.rows.length > 0 ? Math.round(analytics.totals.total / analytics.rows.length) : 0}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">{t("Peak day")}</dt>
                  <dd className="font-semibold text-gray-900">{analytics.busiestDay?.label ?? "None"}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">{t("Most active rate")}</dt>
                  <dd className="font-semibold text-gray-900">{analytics.activeRate}%</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">{t("Period span")}</dt>
                  <dd className="font-semibold text-gray-900">{selectedRange.label}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
