import api from "@/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type UserRole = "student" | "teacher" | "parent";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  dailyActiveUsers: number;
}

interface UserSummaryItem {
  role?: string;
  isActive?: boolean;
  status?: string;
}

interface RoleStatsResponse {
  data?: UserSummaryItem[];
  users?: UserSummaryItem[];
  results?: UserSummaryItem[];
  items?: UserSummaryItem[];
  total?: number;
  count?: number;
  meta?: {
    total?: number;
    count?: number;
  };
}

export interface CreateUserPayload {
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  username: string;
  password: string;
  level?: string;
  classSection?: string;
  parent_id?: string;
  enrollmentDate?: string;
  specialty?: string;
  experience?: string;
  hireDate?: string;
  address?: string;
}

interface UsersState {
  isCreating: boolean;
  createError: string | null;
  isLoadingStats: boolean;
  statsLoaded: boolean;
  statsError: string | null;
  dashboardStats: DashboardStats;
}

const initialState: UsersState = {
  isCreating: false,
  createError: null,
  isLoadingStats: false,
  statsLoaded: false,
  statsError: null,
  dashboardStats: {
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    dailyActiveUsers: 0,
  },
};

const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const extractItems = (payload: RoleStatsResponse | UserSummaryItem[]) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const candidateLists = [
    payload.data,
    payload.users,
    payload.results,
    payload.items,
  ];

  for (const candidate of candidateLists) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [] as UserSummaryItem[];
};

const extractCount = (payload: RoleStatsResponse | UserSummaryItem[]) => {
  if (Array.isArray(payload)) {
    return payload.length;
  }

  const response = payload as RoleStatsResponse;
  const itemList = extractItems(response);

  if (itemList.length > 0) {
    return itemList.length;
  }

  const meta = response.meta;

  return (
    toNumber(response.total) ||
    toNumber(response.count) ||
    toNumber(meta?.total) ||
    toNumber(meta?.count)
  );
};

const countActiveUsers = (payload: RoleStatsResponse | UserSummaryItem[]) => {
  const items = extractItems(payload);

  return items.reduce((total, user) => {
    if (user.isActive === true || user.status?.toLowerCase() === "active") {
      return total + 1;
    }

    return total;
  }, 0);
};

export const createUser = createAsyncThunk(
  "users/createUser",
  async (payload: CreateUserPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("users", payload);
      return response.data;
    } catch (error: unknown) {
      const fallbackMessage = "Failed to create user. Please try again.";
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: unknown } } })
          .response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : fallbackMessage;

      return rejectWithValue(message ?? fallbackMessage);
    }
  },
);

export const fetchDashboardStats = createAsyncThunk(
  "users/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const [studentsResponse, teachersResponse, parentsResponse] =
        await Promise.all([
          api.get<RoleStatsResponse | UserSummaryItem[]>("users/students"),
          api.get<RoleStatsResponse | UserSummaryItem[]>("users/teachers"),
          api.get<RoleStatsResponse | UserSummaryItem[]>("users/parents"),
        ]);

      return {
        totalStudents: extractCount(studentsResponse.data),
        totalTeachers: extractCount(teachersResponse.data),
        totalParents: extractCount(parentsResponse.data),
        dailyActiveUsers:
          countActiveUsers(studentsResponse.data) +
          countActiveUsers(teachersResponse.data) +
          countActiveUsers(parentsResponse.data),
      } satisfies DashboardStats;
    } catch (error: unknown) {
      const fallbackMessage =
        "Failed to load dashboard stats. Please try again.";
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: unknown } } })
          .response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : fallbackMessage;

      return rejectWithValue(message ?? fallbackMessage);
    }
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearCreateUserState: (state) => {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.isCreating = false;
        state.createError = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreating = false;
        state.createError =
          (action.payload as string) ??
          "Failed to create user. Please try again.";
      })
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoadingStats = true;
        state.statsError = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.statsLoaded = true;
        state.statsError = null;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.statsLoaded = true;
        state.statsError =
          (action.payload as string) ??
          "Failed to load dashboard stats. Please try again.";
      });
  },
});

export const { clearCreateUserState } = usersSlice.actions;
export default usersSlice.reducer;
