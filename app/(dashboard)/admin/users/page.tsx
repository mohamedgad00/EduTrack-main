"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/api";
import { showToast } from "@/utils/toastUtils";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type RoleFilter = "all" | "student" | "teacher" | "parent";

interface TableUser {
  key: string;
  userId: string | null;
  initials: string;
  initClass: string;
  name: string;
  email: string;
  role: string;
  roleClass: string;
  roleSlug: RoleFilter;
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

const roleFilters: Array<{ label: string; value: RoleFilter }> = [
  { label: "All", value: "all" },
  { label: "Students", value: "student" },
  { label: "Teachers", value: "teacher" },
  { label: "Parents", value: "parent" },
];

const PAGE_SIZE = 10;

const roleDeleteEndpoint: Record<Exclude<RoleFilter, "all">, string> = {
  student: "users/students",
  teacher: "users/teachers",
  parent: "users/parents",
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

const sanitizeRole = (role: string): RoleFilter => {
  if (role === "student" || role === "teacher" || role === "parent") {
    return role;
  }

  return "all";
};

// Maps an ApiUser to a TableUser, applying necessary transformations and fallbacks.
const mapApiUserToTableUser = (user: ApiUser, index: number): TableUser => {
  const roleRaw = (user.role ?? "unknown").toLowerCase();
  const roleSlug = sanitizeRole(roleRaw);
  const roleStyle = roleStyles[roleRaw] ?? fallbackRoleStyle;
  const name = user.fullName ?? user.name ?? "Unknown User";
  const email = user.email ?? "-";
  const isActive = user.isActive === true || user.status?.toLowerCase() === "active";
  const idPart = user.id ?? user._id ?? index;
  const userId = user.id ?? user._id;

  // Using a combination of id (or _id) and email to generate a unique key for the table row.
  return {
    key: `${String(idPart)}-${email}`,
    userId: userId != null ? String(userId) : null,
    initials: getInitials(name),
    initClass: roleStyle.initClass,
    name,
    email,
    role: toTitleCase(roleRaw),
    roleClass: roleStyle.roleClass,
    roleSlug,
    status: isActive ? "Active" : "Offline",
    statusClass: isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600",
    dotClass: isActive ? "bg-green-500" : "bg-gray-400",
  };
};

export default function UsersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<TableUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingUserKey, setDeletingUserKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeRoleFilter = sanitizeRole((searchParams.get("role") ?? "all").toLowerCase());
  const searchQuery = searchParams.get("q")?.trim() ?? "";
  const currentPageParam = Number(searchParams.get("page") ?? "1");

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);

      // Fetch all user types in parallel, then merge and sort them by creation date.
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

        const mappedUsers = sortedByRecent.map((user, index) => mapApiUserToTableUser(user, index));

        if (isMounted) {
          setUsers(mappedUsers);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load users.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtering and pagination logic is memoized to optimize performance, especially for larger user lists.
  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();

    return users.filter((user) => {
      const matchesRole = activeRoleFilter === "all" || user.roleSlug === activeRoleFilter;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.role.toLowerCase().includes(normalizedQuery);

      return matchesRole && matchesSearch;
    });
  }, [activeRoleFilter, searchQuery, users]);

  // Calculates total pages based on the number of filtered users and the defined page size, ensuring that there is at least one page even if there are no users. It also determines the current page from the URL query parameters, validating it to ensure it falls within the valid range of pages. This allows for robust pagination that responds to user input and URL changes.
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(currentPageParam) && currentPageParam > 0
      ? Math.min(currentPageParam, totalPages)
      : 1;

  // Calculates the subset of users to display on the current page based on the active filters and pagination settings.
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredUsers]);

  // Updates the URL query parameters to reflect the selected role filter, resetting the page to 1 to ensure users see the first page of results for the new filter.
  const updateRoleFilter = (role: RoleFilter) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("role", role);
    nextParams.set("page", "1");
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // Updates the URL query parameters to reflect the current search query, ensuring that the page resets to 1 when a new search is performed. This allows users to share URLs with specific search queries and filters applied.
  const updateSearchQuery = (value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      nextParams.set("q", value);
    } else {
      nextParams.delete("q");
    }

    nextParams.set("page", "1");
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // Updates the URL query parameters to reflect the selected page, ensuring that the page number stays within valid bounds. This allows users to navigate through pages of results while maintaining the current filters and search query in the URL.
  const updatePage = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(safePage));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // Handles user deletion with a confirmation prompt and error handling. It first attempts to delete the user via a general endpoint, and if that fails (potentially due to role-specific constraints), it tries the role-specific endpoint. This approach ensures maximum compatibility with different backend implementations while providing feedback to the user.
  const handleDeleteUser = async (user: TableUser) => {
    if (!user.userId) {
      showToast("error", "User id not found. Cannot delete this record.");
      return;
    }

    const confirmed = window.confirm(`Delete ${user.name}? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeletingUserKey(user.key);

    try {
      await api.delete(`users/${user.userId}`);
      setUsers((previousUsers) => previousUsers.filter((item) => item.key !== user.key));
      showToast("success", "User deleted successfully.");
    } catch (deleteError: unknown) {
      if (user.roleSlug !== "all") {
        try {
          await api.delete(`${roleDeleteEndpoint[user.roleSlug]}/${user.userId}`);
          setUsers((previousUsers) => previousUsers.filter((item) => item.key !== user.key));
          showToast("success", "User deleted successfully.");
          return;
        } catch {
          // Fall through to error toast below.
        }
      }

      // Attempt to extract a meaningful error message from the API response, with a fallback for unexpected formats.
      const fallbackMessage = "Failed to delete user. Please try again.";
      const message =
        typeof deleteError === "object" &&
          deleteError !== null &&
          "response" in deleteError &&
          typeof (deleteError as { response?: { data?: { message?: unknown } } }).response?.data
            ?.message === "string"
          ? (deleteError as { response?: { data?: { message?: string } } }).response?.data?.message
          : fallbackMessage;

      showToast("error", message ?? fallbackMessage);
    } finally {
      setDeletingUserKey(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{t("Users")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("Manage students, teachers, and parents in one place.")}</p>
          </div>
          <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            {t("Back to Dashboard")}
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {roleFilters.map((filter) => {
            const isActive = filter.value === activeRoleFilter;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => updateRoleFilter(filter.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${isActive
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {t(filter.label)}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => updateSearchQuery(event.target.value)}
            placeholder={t("Search by name, email, or role")}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {["Name", "Role", "Status", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3 px-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${i === 3 ? "text-right" : ""
                      }`}
                  >
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 px-2 text-center text-sm text-gray-500">
                    {t("Loading users...")}
                  </td>
                </tr>
              ) : null}

              {!isLoading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 px-2 text-center text-sm text-gray-500">
                    {t("No users found for the current filters.")}
                  </td>
                </tr>
              ) : null}

              {!isLoading &&
                paginatedUsers.map((user) => (
                  <tr key={user.key} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${user.initClass}`}
                        >
                          {user.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.roleClass}`}>
                        {t(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${user.statusClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.dotClass}`} />
                        {t(user.status)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        {user.userId ? (
                          <Link
                            href={`/admin/users/${encodeURIComponent(user.userId)}/edit?role=${user.roleSlug}`}
                            className="text-gray-400 hover:text-amber-600 transition-colors"
                            title="Edit user"
                          >
                            <Pencil size={16} />
                          </Link>
                        ) : (
                          <button
                            className="text-gray-300 cursor-not-allowed"
                            type="button"
                            disabled
                            title="User id not available"
                          >
                            <Pencil size={16} />
                          </button>
                        )}

                        {user.userId ? (
                          <Link
                            href={`/admin/users/${encodeURIComponent(user.userId)}?role=${user.roleSlug}`}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="View user details"
                          >
                            <Eye size={16} />
                          </Link>
                        ) : (
                          <button
                            className="text-gray-300 cursor-not-allowed"
                            type="button"
                            disabled
                            title="User id not available"
                          >
                            <Eye size={16} />
                          </button>
                        )}

                        <button
                          className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                          type="button"
                          title="Delete user"
                          onClick={() => handleDeleteUser(user)}
                          disabled={!user.userId || deletingUserKey === user.key}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredUsers.length > 0 ? (
          <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}
              {" - "}
              {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)}
              {" of "}
              {filteredUsers.length}
              {" "}
              {t("Users")}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("Previous")}
              </button>

              <span className="text-xs font-medium text-gray-500">
                {t("Page")} {currentPage} {t("of")} {totalPages}
              </span>

              <button
                type="button"
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("Next")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
