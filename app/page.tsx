"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Bell, BookOpen, CheckCircle2, ClipboardCheck, GraduationCap, Languages, ShieldCheck, UsersRound } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const copy = {
  en: {
    nav: ["Platform", "Workflows", "Roles", "Contact"],
    login: "Login",
    demo: "Open demo",
    eyebrow: "School management, connected",
    title: "EduTrack",
    subtitle:
      "A complete school operating system for admins, teachers, students, and parents. Manage courses, users, attendance, grades, announcements, and reports from one connected workspace.",
    primary: "Start from login",
    secondary: "See workflows",
    stats: [
      ["4", "Role dashboards"],
      ["42", "Ready routes"],
      ["100%", "Mock API connected"],
    ],
    trust: ["Arabic and English", "Role-based access", "Production-ready structure"],
    sectionTitle: "Built around the real school day",
    sectionText:
      "EduTrack links the work of administration, classrooms, learners, and families so every update reaches the people who need it.",
    features: [
      ["Admin control center", "Create users, assign courses, publish announcements, monitor analytics, and manage enrollments."],
      ["Teacher workspace", "Open course rosters, take attendance, create assessments, enter grades, and review class reports."],
      ["Student portal", "Follow enrolled courses, grades, attendance, deadlines, and personal notifications."],
      ["Parent view", "Track children, course progress, attendance, grades, and school notices in one place."],
    ],
    workflowsTitle: "Every dashboard is wired to data",
    workflows: [
      "Course data is filtered by role and protected by access rules.",
      "Attendance, assessments, and grades update the same course records.",
      "Announcements are shared with the right audiences.",
      "Navigation routes are split into independent pages for each workflow.",
    ],
    rolesTitle: "One system, four clear experiences",
    roles: [
      ["Admin", "Full system management"],
      ["Teacher", "Classroom operations"],
      ["Student", "Learning progress"],
      ["Parent", "Family follow-up"],
    ],
    ctaTitle: "Ready to explore the system?",
    ctaText: "Use the prepared demo accounts on the login screen and switch between roles to test the full experience.",
    ctaButton: "Go to login",
  },
  ar: {
    nav: ["النظام", "مسارات العمل", "الأدوار", "التواصل"],
    login: "تسجيل الدخول",
    demo: "فتح التجربة",
    eyebrow: "إدارة مدرسية مترابطة",
    title: "EduTrack",
    subtitle:
      "نظام تشغيلي كامل للمدرسة يخدم المدير والمعلم والطالب وولي الأمر. إدارة الكورسات والمستخدمين والحضور والدرجات والإعلانات والتقارير من مساحة واحدة مترابطة.",
    primary: "ابدأ من تسجيل الدخول",
    secondary: "شاهد مسارات العمل",
    stats: [
      ["4", "لوحات تحكم"],
      ["42", "مسار جاهز"],
      ["100%", "Mock API مربوط"],
    ],
    trust: ["عربي وإنجليزي", "صلاحيات حسب الدور", "هيكل جاهز للإنتاج"],
    sectionTitle: "مصمم حول يوم المدرسة الحقيقي",
    sectionText:
      "EduTrack يربط الإدارة بالفصول والطلاب والأسر، بحيث تصل كل معلومة للشخص الصحيح في الوقت الصحيح.",
    features: [
      ["مركز تحكم المدير", "إنشاء المستخدمين، ربط الكورسات، نشر الإعلانات، متابعة التحليلات، وإدارة التسجيلات."],
      ["مساحة المعلم", "فتح قوائم الطلاب، تسجيل الحضور، إنشاء التقييمات، إدخال الدرجات، ومراجعة تقارير الفصل."],
      ["بوابة الطالب", "متابعة الكورسات المسجلة والدرجات والحضور والمواعيد والتنبيهات الشخصية."],
      ["واجهة ولي الأمر", "متابعة الأبناء ومستوى الكورسات والحضور والدرجات وإعلانات المدرسة من مكان واحد."],
    ],
    workflowsTitle: "كل لوحة تحكم مربوطة بالداتا",
    workflows: [
      "بيانات الكورسات تظهر حسب الدور وبصلاحيات واضحة.",
      "الحضور والتقييمات والدرجات تحدث نفس سجلات الكورس.",
      "الإعلانات تصل للجمهور المناسب.",
      "المسارات متقسمة لصفحات مستقلة لكل workflow.",
    ],
    rolesTitle: "نظام واحد بأربع تجارب واضحة",
    roles: [
      ["المدير", "إدارة النظام بالكامل"],
      ["المعلم", "تشغيل الفصل الدراسي"],
      ["الطالب", "متابعة التقدم الدراسي"],
      ["ولي الأمر", "متابعة الأسرة"],
    ],
    ctaTitle: "جاهز تجرب النظام؟",
    ctaText: "استخدم الحسابات التجريبية الجاهزة داخل صفحة الدخول وبدل بين الأدوار لاختبار التجربة كاملة.",
    ctaButton: "اذهب لتسجيل الدخول",
  },
};

const featureIcons = [ShieldCheck, ClipboardCheck, GraduationCap, UsersRound];
const workflowIcons = [BookOpen, CheckCircle2, Bell, BarChart3];

export default function Home() {
  const { locale, dir, toggleLocale } = useLanguage();
  const text = copy[locale];

  return (
    <main dir={dir} className="min-h-screen bg-white text-gray-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-gray-950/70 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-blue-700">ET</span>
            <span>EduTrack</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            {text.nav.map((item, index) => (
              <a key={item} href={["#platform", "#workflows", "#roles", "#contact"][index]} className="hover:text-white">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/10"
              aria-label="Toggle language"
            >
              <Languages size={18} />
            </button>
            <Link href="/login" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-blue-50">
              {text.login}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-[92vh] overflow-hidden pt-16 text-white">
        <Image src="/images/login.png" alt="EduTrack school dashboard preview" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gray-950/70" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.9),rgba(2,6,23,0.55),rgba(2,6,23,0.25))]" />
        <div className="relative mx-auto flex min-h-[calc(92vh-4rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">{text.eyebrow}</p>
            <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">{text.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/86">{text.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">
                {text.primary}
                <ArrowRight size={18} className={locale === "ar" ? "rotate-180" : ""} />
              </Link>
              <a href="#workflows" className="inline-flex items-center justify-center rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                {text.secondary}
              </a>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {text.stats.map(([value, label]) => (
                <div key={label} className="border-l border-white/25 px-4 first:border-l-0">
                  <p className="text-3xl font-semibold">{value}</p>
                  <p className="mt-1 text-xs text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-b border-gray-100 bg-gray-50 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4 sm:px-6 lg:px-8">
          {text.trust.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-gray-950 sm:text-4xl">{text.sectionTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">{text.sectionText}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {text.features.map(([title, body], index) => {
            const Icon = featureIcons[index];
            return (
              <article key={title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-gray-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="workflows" className="bg-gray-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">{text.workflowsTitle}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {text.workflows.map((item, index) => {
              const Icon = workflowIcons[index];
              return (
                <div key={item} className="rounded-lg border border-white/10 bg-white/4 p-5">
                  <Icon size={22} className="text-sky-300" />
                  <p className="mt-4 text-sm leading-6 text-white/78">{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-normal text-gray-950 sm:text-4xl">{text.rolesTitle}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {text.roles.map(([role, detail], index) => (
            <div key={role} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-4/3">
                <Image
                  src={["/images/login.png", "/images/teacher-1.png", "/images/student-1.png", "/images/parent-1.png"][index]}
                  alt={role}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-950">{role}</h3>
                <p className="mt-2 text-sm text-gray-600">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="bg-blue-700 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal">{text.ctaTitle}</h2>
            <p className="mt-3 text-blue-50">{text.ctaText}</p>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            {text.ctaButton}
            <ArrowRight size={18} className={locale === "ar" ? "rotate-180" : ""} />
          </Link>
        </div>
      </section>
    </main>
  );
}
