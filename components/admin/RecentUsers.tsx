
"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import api from "@/utils/api";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface User {
  id: string;
  initials: string;
  initClass: string;
  name: string;
  email: string;
  role: string;
  roleClass: string;
  status: string;
  statusClass: string;
  dotClass: string;
}

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

const roleStyles: Record<string, { initClass: string; roleClass: string }> = {
  student: {
    initClass: "bg-blue-100 text-blue-700",
    roleClass: "bg-blue-50 text-blue-700",
  },
  teacher: {
    initClass: "bg-purple-100 text-purple-700",
    roleClass: "bg-purple-50 text-purple-700",
  },
  parent: {
    initClass: "bg-orange-100 text-orange-700",
    roleClass: "bg-orange-50 text-orange-700",
  },
};

const fallbackRoleStyle = {
  initClass: "bg-gray-100 text-gray-700",
  roleClass: "bg-gray-100 text-gray-700",
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

const getInitials = (name: string) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "NA";
};

const toTitleCase = (value: string) =>
  value.length > 0 ? value[0].toUpperCase() + value.slice(1).toLowerCase() : "Unknown";

const mapApiUserToUiUser = (user: ApiUser): User => {
  const roleRaw = (user.role ?? "unknown").toLowerCase();
  const roleStyle = roleStyles[roleRaw] ?? fallbackRoleStyle;
  const name = user.fullName ?? user.name ?? "Unknown User";
  const email = user.email ?? "-";
  const isActive = user.isActive === true || user.status?.toLowerCase() === "active";

  return {
    id: String(user.id ?? user._id ?? ""),
    initials: getInitials(name),
    initClass: roleStyle.initClass,
    name,
    email,
    role: toTitleCase(roleRaw),
    roleClass: roleStyle.roleClass,
    status: isActive ? "Active" : "Offline",
    statusClass: isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600",
    dotClass: isActive ? "bg-green-500" : "bg-gray-400",
  };
};

export function RecentUsers() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecentUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [studentsResponse, teachersResponse, parentsResponse] = await Promise.all([
          api.get<ApiUsersResponse | ApiUser[]>("users/students"),
          api.get<ApiUsersResponse | ApiUser[]>("users/teachers"),
          api.get<ApiUsersResponse | ApiUser[]>("users/parents"),
        ]);

        const mergedUsers = [
          ...extractUsers(studentsResponse.data),
          ...extractUsers(teachersResponse.data),
          ...extractUsers(parentsResponse.data),
        ];

        const sortedByRecent = [...mergedUsers].sort((a, b) => {
          const first = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const second = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return second - first;
        });

        const recentUsers = sortedByRecent.slice(0, 6).map(mapApiUserToUiUser);

        if (isMounted) {
          setUsers(recentUsers);
        }
      } catch {
        if (isMounted) {
          setError("failed.recent.users");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRecentUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-[15px]">{t("Recent Users")}</h3>
        <Link
          href="/admin/users?role=all"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {t("View All")}
        </Link>
      </div>

      {error ? <p className="text-sm text-red-600 mb-3">{t(error)}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              {["Name", "Role", "Status", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className={`py-3 px-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${i === 3 ? "text-right" : ""}`}
                >
                  {t(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-8 px-2 text-center text-sm text-gray-500">
                  {t("Loading users...")}
                </td>
              </tr>
            ) : null}

            {!isLoading && users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 px-2 text-center text-sm text-gray-500">
                  {t("No users found.")}
                </td>
              </tr>
            ) : null}

            {!isLoading && users.map((user, index) => (
              <tr key={`${user.email}-${user.name}-${index}`} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${user.initClass}`}>
                      {user.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <Link
                    href={`/admin/users?role=${user.role.toLowerCase()}`}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.roleClass}`}
                  >
                    {t(user.role)}
                  </Link>
                </td>
                <td className="py-3 px-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${user.statusClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.dotClass}`} />
                    {t(user.status)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <Link
                    href={user.id ? `/admin/users/${encodeURIComponent(user.id)}?role=${user.role.toLowerCase()}` : "/admin/users?role=all"}
                    className="inline-flex text-gray-400 transition-colors hover:text-blue-600"
                    aria-label={t("view.user")}
                  >
                    <MoreHorizontal size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
