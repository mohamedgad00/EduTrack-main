"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  GraduationCap,
  TrendingUp,
  Users,
  Mail,
  Lock,
  ArrowRight,
  User,
  BookOpen,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { loginUser, getMe } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toastUtils";
import Cookies from "js-cookie";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const ROLES = [
  { key: "student", label: "Student", icon: User },
  { key: "teacher", label: "Teacher", icon: BookOpen },
  { key: "parent", label: "Parent", icon: Users },
  { key: "admin", label: "Admin", icon: Shield },
] as const;

const QUICK_LOGIN_CREDENTIALS = {
  student: {
    email: "ali.student@test.com",
    password: "123456",
    label: "Ali Ahmed",
  },
  teacher: {
    email: "ahmed.teacher@test.com",
    password: "123456",
    label: "Ahmed Hassan",
  },
  parent: {
    email: "mona.parent@test.com",
    password: "123456",
    label: "Mona Saleh",
  },
  admin: {
    email: "admin@test.com",
    password: "123456",
    label: "Admin User",
  },
} satisfies Record<UserRole, { email: string; password: string; label: string }>;

// Zod schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["student", "teacher", "parent", "admin"], {
    message: "Role is required",
  }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;
type UserRole = "student" | "teacher" | "parent" | "admin";

export default function LoginPage() {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    Cookies.remove("admin_auth", { path: "/" });

    try {
      const action = await dispatch(
        loginUser({ email: data.email, password: data.password, role: data.role })
      );

      if (loginUser.fulfilled.match(action)) {
        let role = action.payload.user?.role as UserRole | undefined;

        if (!role) {
          const meAction = await dispatch(getMe());
          if (getMe.fulfilled.match(meAction)) {
            role = meAction.payload.user.role;
          }
        }

        if (!role) {
          showToast("error", "Login succeeded, but user role could not be resolved.");
          return;
        }

        if (role === "admin") {
          const adminCookieOptions = {
            path: "/",
            ...(rememberMe ? { expires: 7 } : {}),
          };

          Cookies.set("admin_auth", "true", adminCookieOptions);
          router.replace("/admin");
        } else if (role === "teacher") {
          router.replace("/teacher");
        } else if (role === "student") {
          router.replace("/student");
        } else if (role === "parent") {
          router.replace("/parent");
        }

        showToast("success", "Login successful.");
        return;
      }

      if (loginUser.rejected.match(action)) {
        const errorMessage =
          (action.payload as string) ?? "Login failed. Please try again.";
        showToast("error", errorMessage);
      }
    } catch {
      showToast("error", "Login failed. Please try again.");
    }
  };
  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case "admin":
        router.push("/admin");
        break;
      case "teacher":
        router.push("/teacher");
        break;
      case "student":
        router.push("/student");
        break;
      case "parent":
        router.push("/parent");
        break;
    }
  }, [user, router]);

  const handleRoleSelect = (role: "student" | "teacher" | "parent" | "admin") => {
    const credentials = QUICK_LOGIN_CREDENTIALS[role];
    setSelectedRole(role);
    setValue("role", role, { shouldValidate: true, shouldDirty: true });
    setValue("email", credentials.email, { shouldValidate: true, shouldDirty: true });
    setValue("password", credentials.password, { shouldValidate: true, shouldDirty: true });
  };

  const selectedCredentials = selectedRole
    ? QUICK_LOGIN_CREDENTIALS[selectedRole as UserRole]
    : null;

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-500 to-teal-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-600">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="font-bold text-3xl text-white tracking-tight">{t("app.name")}</span>
          </div>
          <p className="text-white/90 text-lg font-medium max-w-md">
            Smart Performance Tracking for Modern Education.
          </p>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-lg">
            <Image
              src="/images/login.png"
              alt="Students collaborating"
              width={800}
              height={533}
              className="rounded-xl shadow-2xl w-full h-auto"
              priority
            />

            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg max-w-45 animate-bounce [animation-duration:3s]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Performance</p>
                  <p className="font-bold text-gray-900">A+ (95%)</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg max-w-45 animate-bounce [animation-duration:4s]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Users</p>
                  <p className="font-bold text-gray-900">1,248</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-gray-900 tracking-tight">{t("app.name")}</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t("login.welcome")}</h1>
              <p className="text-gray-600">{t("login.subtitle")}</p>
            </div>

            {/* Role selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("login.role")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRoleSelect(key)}
                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg font-medium transition-all
                      ${selectedRole === key
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
              {selectedCredentials ? (
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  <p className="font-semibold">{t("login.quick.account")}: {selectedCredentials.label}</p>
                  <p className="mt-1">
                  {t("login.email")}: {selectedCredentials.email} | {t("login.password")}: {selectedCredentials.password}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <input type="hidden" {...register("role")} />

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("login.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("login.password")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              {/* Remember & forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{t("login.remember")}</span>
                </label>
                <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {isLoading ? t("loading") : t("login.submit")}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {error && (
              <p className="text-red-500 text-center mt-3">
                {error}
              </p>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need an account?</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  Contact your administrator
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Accounts are created by system administrators
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
