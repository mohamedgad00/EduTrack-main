import { Course } from "@/types/course";
import fs from "node:fs";
import path from "node:path";

export type UserRole = "student" | "teacher" | "parent" | "admin";

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  phone: string;
  gender: string;
  date_of_birth: string;
  isActive: boolean;
  status: "active" | "offline";
  createdAt: string;
  updatedAt: string;
  level?: string;
  classSection?: string;
  parent_id?: string;
  enrollmentDate?: string;
  specialty?: string;
  experience?: string;
  hireDate?: string;
  address?: string;
  linkedStudents?: string[];
  coursesAssigned?: string[];
}

export interface MockAnnouncement {
  id: string;
  category: string;
  title: string;
  body: string;
  createdAt: string;
}

interface MockDb {
  users: MockUser[];
  courses: Course[];
  announcements: MockAnnouncement[];
}

const now = new Date().toISOString();
const seedVersion = 2;
const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "edutrack-db.json");

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const splitName = (fullName: string) => {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(" "),
  };
};

const createUser = (
  data: Omit<MockUser, "firstName" | "lastName" | "createdAt" | "updatedAt" | "isActive" | "status"> &
    Partial<Pick<MockUser, "isActive" | "status" | "createdAt" | "updatedAt">>,
): MockUser => {
  const nameParts = splitName(data.fullName);

  return {
    ...data,
    ...nameParts,
    isActive: data.isActive ?? true,
    status: data.status ?? "active",
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  };
};

const seedUsers: MockUser[] = [
  createUser({
    id: "u-admin",
    fullName: "Admin User",
    email: "admin@test.com",
    username: "admin",
    password: "123456",
    role: "admin",
    phone: "+20 100 000 0000",
    gender: "male",
    date_of_birth: "1990-01-01",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  }),
  createUser({
    id: "t1",
    fullName: "Ahmed Hassan",
    email: "ahmed.teacher@test.com",
    username: "ahmed.teacher",
    password: "123456",
    role: "teacher",
    phone: "+20 101 111 1111",
    gender: "male",
    date_of_birth: "1984-02-12",
    specialty: "math",
    experience: "8",
    hireDate: "2020-09-01",
    coursesAssigned: ["Mathematics 101", "Algebra Foundations"],
    createdAt: daysAgo(8),
    updatedAt: daysAgo(2),
  }),
  createUser({
    id: "t2",
    fullName: "Fatima Ali",
    email: "fatima.teacher@test.com",
    username: "fatima.teacher",
    password: "123456",
    role: "teacher",
    phone: "+20 102 222 2222",
    gender: "female",
    date_of_birth: "1988-06-18",
    specialty: "science",
    experience: "6",
    hireDate: "2021-09-01",
    coursesAssigned: ["Science Lab", "Physics Basics"],
    createdAt: daysAgo(12),
    updatedAt: daysAgo(3),
  }),
  createUser({
    id: "t3",
    fullName: "Mohamed Ibrahim",
    email: "mohamed.teacher@test.com",
    username: "mohamed.teacher",
    password: "123456",
    role: "teacher",
    phone: "+20 102 333 4444",
    gender: "male",
    date_of_birth: "1980-04-22",
    specialty: "english",
    experience: "11",
    hireDate: "2018-09-01",
    coursesAssigned: ["English Literature"],
    createdAt: daysAgo(28),
    updatedAt: daysAgo(4),
  }),
  createUser({
    id: "t4",
    fullName: "Layla Mahmoud",
    email: "layla.teacher@test.com",
    username: "layla.teacher",
    password: "123456",
    role: "teacher",
    phone: "+20 102 555 7777",
    gender: "female",
    date_of_birth: "1991-10-09",
    specialty: "history",
    experience: "5",
    hireDate: "2022-09-01",
    status: "offline",
    isActive: false,
    coursesAssigned: ["World History"],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(5),
  }),
  createUser({
    id: "p1",
    fullName: "Mona Saleh",
    email: "mona.parent@test.com",
    username: "mona.parent",
    password: "123456",
    role: "parent",
    phone: "+20 103 333 3333",
    gender: "female",
    date_of_birth: "1979-03-15",
    address: "Nasr City, Cairo",
    linkedStudents: ["Ali Ahmed", "Youssef Farah"],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  }),
  createUser({
    id: "p2",
    fullName: "Hassan Omar",
    email: "hassan.parent@test.com",
    username: "hassan.parent",
    password: "123456",
    role: "parent",
    phone: "+20 104 444 4444",
    gender: "male",
    date_of_birth: "1975-11-20",
    address: "Maadi, Cairo",
    linkedStudents: ["Noor Mohamed"],
    createdAt: daysAgo(16),
    updatedAt: daysAgo(2),
  }),
  createUser({
    id: "p3",
    fullName: "Sara Kamal",
    email: "sara.parent@test.com",
    username: "sara.parent",
    password: "123456",
    role: "parent",
    phone: "+20 104 777 6677",
    gender: "female",
    date_of_birth: "1981-05-05",
    address: "Heliopolis, Cairo",
    linkedStudents: ["Fatima Hassan", "Omar Ibrahim"],
    createdAt: daysAgo(24),
    updatedAt: daysAgo(6),
  }),
  createUser({
    id: "p4",
    fullName: "Robert Williams",
    email: "robert.parent@test.com",
    username: "robert.parent",
    password: "123456",
    role: "parent",
    phone: "+20 104 888 9900",
    gender: "male",
    date_of_birth: "1978-12-12",
    address: "Zamalek, Cairo",
    linkedStudents: ["Mona Adel"],
    status: "offline",
    isActive: false,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(9),
  }),
  createUser({
    id: "s1",
    fullName: "Ali Ahmed",
    email: "ali.student@test.com",
    username: "ali.student",
    password: "123456",
    role: "student",
    phone: "+20 105 555 5555",
    gender: "male",
    date_of_birth: "2008-08-15",
    level: "10",
    classSection: "A",
    parent_id: "p1",
    enrollmentDate: "2023-09-01",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  }),
  createUser({
    id: "s2",
    fullName: "Noor Mohamed",
    email: "noor.student@test.com",
    username: "noor.student",
    password: "123456",
    role: "student",
    phone: "+20 106 666 6666",
    gender: "female",
    date_of_birth: "2009-01-10",
    level: "10",
    classSection: "A",
    parent_id: "p2",
    enrollmentDate: "2023-09-01",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
  }),
  createUser({
    id: "s3",
    fullName: "Fatima Hassan",
    email: "fatima.student@test.com",
    username: "fatima.student",
    password: "123456",
    role: "student",
    phone: "+20 106 777 1111",
    gender: "female",
    date_of_birth: "2008-11-02",
    level: "10",
    classSection: "B",
    parent_id: "p3",
    enrollmentDate: "2023-09-01",
    createdAt: daysAgo(11),
    updatedAt: daysAgo(2),
  }),
  createUser({
    id: "s4",
    fullName: "Omar Ibrahim",
    email: "omar.student@test.com",
    username: "omar.student",
    password: "123456",
    role: "student",
    phone: "+20 106 888 2222",
    gender: "male",
    date_of_birth: "2009-04-12",
    level: "9",
    classSection: "C",
    parent_id: "p3",
    enrollmentDate: "2024-09-01",
    createdAt: daysAgo(18),
    updatedAt: daysAgo(2),
  }),
  createUser({
    id: "s5",
    fullName: "Mona Adel",
    email: "mona.student@test.com",
    username: "mona.student",
    password: "123456",
    role: "student",
    phone: "+20 106 999 3333",
    gender: "female",
    date_of_birth: "2010-07-20",
    level: "8",
    classSection: "A",
    parent_id: "p4",
    enrollmentDate: "2024-09-01",
    status: "offline",
    isActive: false,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(12),
  }),
  createUser({
    id: "s6",
    fullName: "Youssef Farah",
    email: "youssef.student@test.com",
    username: "youssef.student",
    password: "123456",
    role: "student",
    phone: "+20 107 222 4444",
    gender: "male",
    date_of_birth: "2008-09-30",
    level: "10",
    classSection: "A",
    parent_id: "p1",
    enrollmentDate: "2023-09-01",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  }),
];

const seedAnnouncements: MockAnnouncement[] = [
  {
    id: "ann-1",
    category: "System",
    title: "Platform data connected",
    body: "Admin dashboard, courses, users, and role dashboards are reading from the local API.",
    createdAt: daysAgo(2),
  },
  {
    id: "ann-2",
    category: "Academic",
    title: "Assessment review window",
    body: "Assessment records are available across all active courses.",
    createdAt: daysAgo(4),
  },
];

export const ensureAnnouncements = () => {
  if (!Array.isArray(db.announcements)) {
    db.announcements = [...seedAnnouncements];
    saveDb();
  }

  return db.announcements;
};

const assessment = (
  id: string,
  type: "quiz" | "homework" | "midterm" | "final",
  name: string,
  date: string,
  maxGrade: number,
  records: Array<[string, string, number | undefined, boolean]>,
) => ({
  id,
  type,
  name,
  date,
  maxGrade,
  studentRecords: records.map(([studentId, studentName, grade, isPresent]) => ({
    studentId,
    studentName,
    grade,
    isPresent,
  })),
});

const attendance = (
  studentId: string,
  studentName: string,
  dates: Record<string, "present" | "absent">,
) => {
  const totalPresent = Object.values(dates).filter((status) => status === "present").length;
  const totalAbsent = Object.values(dates).filter((status) => status === "absent").length;
  const total = totalPresent + totalAbsent;

  return {
    studentId,
    studentName,
    attendance: dates,
    totalPresent,
    totalAbsent,
    attendancePercentage: total > 0 ? Math.round((totalPresent / total) * 100) : 0,
  };
};

const seedCourses: Course[] = [
  {
    id: "c1",
    name: "Mathematics 101",
    level: "Grade 10",
    class: "A",
    description: "Core algebra and geometry course for grade 10 students.",
    teacherId: "t1",
    teacherName: "Ahmed Hassan",
    studentIds: ["s1", "s2", "s6"],
    students: [
      { id: "s1", name: "Ali Ahmed" },
      { id: "s2", name: "Noor Mohamed" },
      { id: "s6", name: "Youssef Farah" },
    ],
    createdAt: now,
    updatedAt: now,
    quizzes: [
      assessment("a-q1", "quiz", "Quiz 1 - Algebra", "2026-04-20", 20, [
        ["s1", "Ali Ahmed", 18, true],
        ["s2", "Noor Mohamed", 17, true],
        ["s6", "Youssef Farah", 14, true],
      ]),
      assessment("a-q2", "quiz", "Quiz 2 - Geometry", "2026-05-03", 20, [
        ["s1", "Ali Ahmed", 19, true],
        ["s2", "Noor Mohamed", 16, true],
        ["s6", "Youssef Farah", undefined, false],
      ]),
    ],
    homeworks: [
      assessment("a-h1", "homework", "Homework 1", "2026-04-25", 10, [
        ["s1", "Ali Ahmed", 9, true],
        ["s2", "Noor Mohamed", 10, true],
        ["s6", "Youssef Farah", 8, true],
      ]),
    ],
    midtermExam: assessment("a-m1", "midterm", "Midterm Exam", "2026-05-06", 100, [
      ["s1", "Ali Ahmed", 91, true],
      ["s2", "Noor Mohamed", 86, true],
      ["s6", "Youssef Farah", 78, true],
    ]),
    finalExam: null,
    attendance: [
      attendance("s1", "Ali Ahmed", {
        "2026-05-01": "present",
        "2026-05-02": "present",
        "2026-05-03": "present",
      }),
      attendance("s2", "Noor Mohamed", {
        "2026-05-01": "present",
        "2026-05-02": "absent",
        "2026-05-03": "present",
      }),
      attendance("s6", "Youssef Farah", {
        "2026-05-01": "absent",
        "2026-05-02": "present",
        "2026-05-03": "present",
      }),
    ],
  },
  {
    id: "c2",
    name: "Science Lab",
    level: "Grade 10",
    class: "B",
    description: "Hands-on science experiments with weekly homework and lab attendance.",
    teacherId: "t2",
    teacherName: "Fatima Ali",
    studentIds: ["s1", "s3", "s4"],
    students: [
      { id: "s1", name: "Ali Ahmed" },
      { id: "s3", name: "Fatima Hassan" },
      { id: "s4", name: "Omar Ibrahim" },
    ],
    createdAt: daysAgo(20),
    updatedAt: daysAgo(1),
    quizzes: [
      assessment("b-q1", "quiz", "Lab Safety Quiz", "2026-04-22", 25, [
        ["s1", "Ali Ahmed", 22, true],
        ["s3", "Fatima Hassan", 24, true],
        ["s4", "Omar Ibrahim", 20, true],
      ]),
    ],
    homeworks: [
      assessment("b-h1", "homework", "Observation Sheet", "2026-04-29", 15, [
        ["s1", "Ali Ahmed", 13, true],
        ["s3", "Fatima Hassan", 15, true],
        ["s4", "Omar Ibrahim", 12, true],
      ]),
      assessment("b-h2", "homework", "Experiment Report", "2026-05-05", 15, [
        ["s1", "Ali Ahmed", 14, true],
        ["s3", "Fatima Hassan", 14, true],
        ["s4", "Omar Ibrahim", undefined, false],
      ]),
    ],
    midtermExam: null,
    finalExam: assessment("b-f1", "final", "Final Practical", "2026-05-10", 100, [
      ["s1", "Ali Ahmed", 84, true],
      ["s3", "Fatima Hassan", 93, true],
      ["s4", "Omar Ibrahim", 76, true],
    ]),
    attendance: [
      attendance("s1", "Ali Ahmed", {
        "2026-05-04": "present",
        "2026-05-05": "present",
        "2026-05-06": "absent",
      }),
      attendance("s3", "Fatima Hassan", {
        "2026-05-04": "present",
        "2026-05-05": "present",
        "2026-05-06": "present",
      }),
      attendance("s4", "Omar Ibrahim", {
        "2026-05-04": "present",
        "2026-05-05": "absent",
        "2026-05-06": "absent",
      }),
    ],
  },
  {
    id: "c3",
    name: "English Literature",
    level: "Grade 9",
    class: "C",
    description: "Reading comprehension, essays, and literature discussion.",
    teacherId: "t3",
    teacherName: "Mohamed Ibrahim",
    studentIds: ["s3", "s4", "s5"],
    students: [
      { id: "s3", name: "Fatima Hassan" },
      { id: "s4", name: "Omar Ibrahim" },
      { id: "s5", name: "Mona Adel" },
    ],
    createdAt: daysAgo(36),
    updatedAt: daysAgo(2),
    quizzes: [],
    homeworks: [
      assessment("c-h1", "homework", "Essay Draft", "2026-05-01", 30, [
        ["s3", "Fatima Hassan", 28, true],
        ["s4", "Omar Ibrahim", 24, true],
        ["s5", "Mona Adel", 21, true],
      ]),
    ],
    midtermExam: assessment("c-m1", "midterm", "Midterm Essay", "2026-05-08", 100, [
      ["s3", "Fatima Hassan", 90, true],
      ["s4", "Omar Ibrahim", 82, true],
      ["s5", "Mona Adel", 74, true],
    ]),
    finalExam: null,
    attendance: [
      attendance("s3", "Fatima Hassan", {
        "2026-05-07": "present",
        "2026-05-08": "present",
      }),
      attendance("s4", "Omar Ibrahim", {
        "2026-05-07": "present",
        "2026-05-08": "present",
      }),
      attendance("s5", "Mona Adel", {
        "2026-05-07": "absent",
        "2026-05-08": "present",
      }),
    ],
  },
];

const globalForMockDb = globalThis as typeof globalThis & {
  __eduTrackMockDb?: MockDb;
  __eduTrackMockDbVersion?: number;
};

const createSeedDb = (): MockDb => ({
  users: seedUsers,
  courses: seedCourses,
  announcements: seedAnnouncements,
});

const loadDb = () => {
  try {
    if (!fs.existsSync(dataFile)) {
      return createSeedDb();
    }

    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8")) as MockDb & { seedVersion?: number };
    if (parsed.seedVersion !== seedVersion || !Array.isArray(parsed.users) || !Array.isArray(parsed.courses)) {
      return createSeedDb();
    }

    return {
      users: parsed.users,
      courses: parsed.courses,
      announcements: Array.isArray(parsed.announcements) ? parsed.announcements : seedAnnouncements,
    };
  } catch {
    return createSeedDb();
  }
};

export const db: MockDb =
  globalForMockDb.__eduTrackMockDb && globalForMockDb.__eduTrackMockDbVersion === seedVersion
    ? globalForMockDb.__eduTrackMockDb
    : (globalForMockDb.__eduTrackMockDb = loadDb());

globalForMockDb.__eduTrackMockDbVersion = seedVersion;

export const saveDb = () => {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify({ seedVersion, ...db }, null, 2));
};

export const publicUser = (user: MockUser) => {
  const safeUser = { ...user } as Omit<MockUser, "password"> & { password?: string };
  delete safeUser.password;
  return safeUser;
};

export const normalizeRoleParam = (role: string) => {
  if (role === "students") return "student";
  if (role === "teachers") return "teacher";
  if (role === "parents") return "parent";
  return role;
};

export const userFromToken = (authorization: string | null) => {
  const token = authorization?.replace(/^Bearer\s+/i, "") ?? "";
  const userId = token.replace(/^local-token-/, "");
  return db.users.find((user) => user.id === userId) ?? null;
};

export const upsertCourseRelations = (course: Course) => {
  const teacher = db.users.find((user) => user.id === course.teacherId && user.role === "teacher");
  const students = course.studentIds
    .map((id) => db.users.find((user) => user.id === id && user.role === "student"))
    .filter(Boolean)
    .map((user) => ({ id: user!.id, name: user!.fullName }));

  return {
    ...course,
    teacherName: teacher?.fullName ?? course.teacherName ?? "",
    students,
  };
};
