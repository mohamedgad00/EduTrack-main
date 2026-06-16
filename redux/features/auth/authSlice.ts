import api from "@/utils/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface User {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "teacher" | "parent" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gradeLevel?: string;
  classId?: number;
  studentId?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get("token") || null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

interface LoginResponse {
  user?: User;
  access_token?: string;
  accessToken?: string;
  token?: string;
  data?: {
    user?: User;
    access_token?: string;
    accessToken?: string;
    token?: string;
  };
}

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (
    {
      email,
      password,
      role,
    }: { email: string; password: string; role: User["role"] },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<LoginResponse>("auth/login", {
        email,
        password,
        role,
      });

      const payload = response.data?.data ?? response.data;
      const user = payload?.user ?? null;
      const token =
        payload?.access_token ?? payload?.accessToken ?? payload?.token;

      if (!token) {
        return rejectWithValue("Login failed. Token not found in response.");
      }

      Cookies.set("token", token, { expires: 7 });
      if (user?.role) {
        Cookies.set("role", user.role, { expires: 7 });
      }
      if (user?.role === "admin") {
        Cookies.set("admin_auth", "true", { expires: 7, path: "/" });
      } else {
        Cookies.remove("admin_auth", { path: "/" });
      }
      if (user?.id != null) {
        Cookies.set("user_id", String(user.id), { expires: 7 });
      }
      return { user, token };
    } catch {
      return rejectWithValue("Login failed. Please check your credentials.");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("user_id");
      Cookies.remove("admin_auth", { path: "/" });
    } catch {
      return rejectWithValue("Logout failed.");
    }
  },
);

export const getMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ user: User }>("/me");
      return response.data;
    } catch {
      return rejectWithValue("Failed to fetch user information.");
    }
  },
);

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  password?: string;
}

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: UpdateProfileData, { rejectWithValue }) => {
    try {
      const response = await api.put<{ user: User }>(
        "/auth/update-profile",
        profileData,
      );
      return response.data.user;
    } catch {
      return rejectWithValue("Failed to update profile. Please try again.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (
          state,
          action: PayloadAction<{ user: User | null; token: string }>,
        ) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.error = null;
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getMe.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          Cookies.set("role", action.payload.user.role, { expires: 7 });
          Cookies.set("user_id", String(action.payload.user.id), { expires: 7 });
          if (action.payload.user.role === "admin") {
            Cookies.set("admin_auth", "true", { expires: 7, path: "/" });
          }
          state.error = null;
        },
      )
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          state.user = action.payload;
          state.error = null;
        },
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
