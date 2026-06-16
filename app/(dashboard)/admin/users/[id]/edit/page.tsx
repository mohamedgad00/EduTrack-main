"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/api";
import { showToast } from "@/utils/toastUtils";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type RoleFilter = "all" | "student" | "teacher" | "parent";

interface ApiUser {
  id?: string | number;
  _id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  status?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  dob?: string;
  username?: string;
  address?: string;
  emergencyContact?: string;
  level?: string;
  grade?: string;
  classSection?: string;
  parent_id?: string;
  parentGuardian?: string;
  specialty?: string;
  experience?: string;
  course_id?: string;
  enrollmentDate?: string;
  hireDate?: string;
  linkedStudents?: string[];
  coursesAssigned?: string[];
}

interface ApiUserResponse {
  data?: ApiUser;
  user?: ApiUser;
  result?: ApiUser;
}

interface UserFormState {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  username: string;
  address: string;
  emergencyContact: string;
  grade: string;
  classSection: string;
  parentGuardian: string;
  specialty: string;
  experience: string;
  linkedStudentsText: string;
  coursesAssignedText: string;
}

const defaultFormState: UserFormState = {
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
  username: "",
  address: "",
  emergencyContact: "",
  grade: "",
  classSection: "",
  parentGuardian: "",
  specialty: "",
  experience: "",
  linkedStudentsText: "",
  coursesAssignedText: "",
};

const roleEndpointByRole: Record<Exclude<RoleFilter, "all">, string> = {
  student: "users/students",
  teacher: "users/teachers",
  parent: "users/parents",
};

const normalizeRole = (role: string): RoleFilter => {
  if (role === "student" || role === "teacher" || role === "parent") {
    return role;
  }

  return "all";
};

const extractUser = (payload: ApiUserResponse | ApiUser): ApiUser => {
  if (typeof payload === "object" && payload !== null) {
    const responsePayload = payload as ApiUserResponse;
    const candidate = responsePayload.data ?? responsePayload.user ?? responsePayload.result;
    if (candidate) {
      return candidate;
    }
  }

  return payload as ApiUser;
};

const parseCsvToArray = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeDateForInput = (value?: string) => {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
};

export default function EditUserPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = String(params.id ?? "");
  const roleHint = normalizeRole((searchParams.get("role") ?? "all").toLowerCase());

  const [form, setForm] = useState<UserFormState>(defaultFormState);
  const [loadedUser, setLoadedUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      if (!userId) {
        setError("Invalid user id.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const applyLoadedData = (user: ApiUser) => {
        if (!isMounted) {
          return;
        }

        setLoadedUser(user);
        setForm({
          fullName: user.fullName ?? user.name ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          gender: user.gender ?? "",
          dob: normalizeDateForInput(user.date_of_birth ?? user.dob),
          username: user.username ?? "",
          address: user.address ?? "",
          emergencyContact: user.emergencyContact ?? "",
          grade: user.level ?? user.grade ?? "",
          classSection: user.classSection ?? "",
          parentGuardian: user.parent_id ?? user.parentGuardian ?? "",
          specialty: user.specialty ?? "",
          experience: user.experience ?? "",
          linkedStudentsText: (user.linkedStudents ?? []).join(", "),
          coursesAssignedText: user.course_id ?? (user.coursesAssigned ?? []).join(", "),
        });
      };

      try {
        const response = await api.get<ApiUserResponse | ApiUser>(`users/${encodeURIComponent(userId)}`);
        applyLoadedData(extractUser(response.data));
      } catch {
        if (roleHint !== "all") {
          try {
            const fallbackEndpoint = roleEndpointByRole[roleHint];
            const fallbackResponse = await api.get<ApiUserResponse | ApiUser>(
              `${fallbackEndpoint}/${encodeURIComponent(userId)}`,
            );
            applyLoadedData(extractUser(fallbackResponse.data));
            return;
          } catch {
            if (isMounted) {
              setError("Failed to load user data for editing.");
            }
          }
        } else if (isMounted) {
          setError("Failed to load user data for editing.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [roleHint, userId]);

  const detectedRole = useMemo(
    () => normalizeRole((loadedUser?.role ?? roleHint).toLowerCase()),
    [loadedUser?.role, roleHint],
  );

  const setField = <K extends keyof UserFormState>(key: K, value: UserFormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId) {
      showToast("error", "Invalid user id.");
      return;
    }

    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      gender: form.gender,
      date_of_birth: form.dob,
      dob: form.dob,
      username: form.username,
      ...(detectedRole === "student"
        ? {
          level: form.grade,
          grade: form.grade,
          classSection: form.classSection,
          parent_id: form.parentGuardian,
          parentGuardian: form.parentGuardian,
        }
        : {}),
      ...(detectedRole === "teacher"
        ? {
          specialty: form.specialty,
          experience: form.experience,
          course_id: form.coursesAssignedText,
          coursesAssigned: parseCsvToArray(form.coursesAssignedText),
        }
        : {}),
      ...(detectedRole === "parent"
        ? {
          linkedStudents: parseCsvToArray(form.linkedStudentsText),
          emergencyContact: form.emergencyContact,
          address: form.address,
        }
        : {}),
    };

    setIsSaving(true);

    try {
      await api.put(`users/${encodeURIComponent(userId)}`, payload);
      showToast("success", "User updated successfully.");
      router.push(`/admin/users/${encodeURIComponent(userId)}?role=${detectedRole}`);
      return;
    } catch {
      try {
        await api.patch(`users/${encodeURIComponent(userId)}`, payload);
        showToast("success", "User updated successfully.");
        router.push(`/admin/users/${encodeURIComponent(userId)}?role=${detectedRole}`);
        return;
      } catch {
        if (detectedRole !== "all") {
          try {
            await api.put(`${roleEndpointByRole[detectedRole]}/${encodeURIComponent(userId)}`, payload);
            showToast("success", "User updated successfully.");
            router.push(`/admin/users/${encodeURIComponent(userId)}?role=${detectedRole}`);
            return;
          } catch (finalError: unknown) {
            const fallbackMessage = "Failed to update user. Please try again.";
            const message =
              typeof finalError === "object" &&
                finalError !== null &&
                "response" in finalError &&
                typeof (finalError as { response?: { data?: { message?: unknown } } }).response?.data
                  ?.message === "string"
                ? (finalError as { response?: { data?: { message?: string } } }).response?.data?.message
                : fallbackMessage;

            showToast("error", message ?? fallbackMessage);
          }
        } else {
          showToast("error", "Failed to update user. Please try again.");
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8 text-gray-900">
      <main className="mx-auto max-w-5xl py-4">
        {/* Page Header */}
        <header className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("Edit User")}</h2>
              <p className="mt-1 text-sm text-gray-600">{t("Update user information with prefilled values.")}</p>
            </div>
            <Link
              href={loadedUser ? `/admin/users/${encodeURIComponent(userId)}?role=${detectedRole}` : "/admin/users?role=all"}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <ArrowLeft size={16} />
              {t("Back")}
            </Link>
          </div>
        </header>

        {/* User Form */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          {isLoading ? <p className="text-sm text-gray-500">{t("Loading user data...")}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {!isLoading && !error ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t("Full Name")}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.fullName}
                    onChange={(event) => setField("fullName", event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t("Email")}</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(event) => setField("email", event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t("Phone")}</label>
                  <input
                    type="tel"
                    className={inputClass}
                    value={form.phone}
                    onChange={(event) => setField("phone", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t("Gender")}</label>
                  <select
                    className={inputClass}
                    value={form.gender}
                    onChange={(event) => setField("gender", event.target.value)}
                  >
                    <option value="">{t("Select Gender")}</option>
                    <option value="male">{t("Male")}</option>
                    <option value="female">{t("Female")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t("Date of Birth")}</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.dob}
                    onChange={(event) => setField("dob", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t("Username")}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.username}
                    onChange={(event) => setField("username", event.target.value)}
                  />
                </div>
              </div>

              {/* Student-specific fields */}
              {detectedRole === "student" ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t("Grade")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.grade}
                      onChange={(event) => setField("grade", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t("Class Section")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.classSection}
                      onChange={(event) => setField("classSection", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t("Parent / Guardian")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.parentGuardian}
                      onChange={(event) => setField("parentGuardian", event.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              {/* Teacher-specific fields */}
              {detectedRole === "teacher" ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t("Specialty")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.specialty}
                      onChange={(event) => setField("specialty", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t("Experience")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.experience}
                      onChange={(event) => setField("experience", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t("Courses (comma separated)")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.coursesAssignedText}
                      onChange={(event) => setField("coursesAssignedText", event.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              {/* Parent-specific fields */}
              {detectedRole === "parent" ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t("Linked Students (comma separated)")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.linkedStudentsText}
                      onChange={(event) => setField("linkedStudentsText", event.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t("Address")}</label>
                    <textarea
                      rows={3}
                      className={`${inputClass} resize-none`}
                      value={form.address}
                      onChange={(event) => setField("address", event.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={16} />
                  {isSaving ? t("Saving...") : t("Save Changes")}
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </main>
    </div>
  );
}
