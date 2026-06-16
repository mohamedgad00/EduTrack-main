import api from "@/utils/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Course, CreateCoursePayload } from "@/types/course";

interface CoursesState {
  courses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

const extractCourse = (payload: { data?: Course; course?: Course } | Course) => {
  if ("data" in payload && payload.data) return payload.data;
  if ("course" in payload && payload.course) return payload.course;
  return payload as Course;
};

const extractCourses = (payload: { data?: Course[]; courses?: Course[] } | Course[]) => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload.courses ?? [];
};

export const fetchCourses = createAsyncThunk("courses/fetchCourses", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<{ data?: Course[]; courses?: Course[] } | Course[]>("courses");
    return extractCourses(response.data);
  } catch {
    return rejectWithValue("Failed to load courses.");
  }
});

export const createCourse = createAsyncThunk(
  "courses/createCourse",
  async (payload: CreateCoursePayload, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data?: Course; course?: Course } | Course>("courses", payload);
      return extractCourse(response.data);
    } catch {
      return rejectWithValue("Failed to create course.");
    }
  },
);

export const updateCourse = createAsyncThunk(
  "courses/updateCourse",
  async (course: Course, { rejectWithValue }) => {
    try {
      const response = await api.put<{ data?: Course; course?: Course } | Course>(
        `courses/${encodeURIComponent(course.id)}`,
        course,
      );
      return extractCourse(response.data);
    } catch {
      return rejectWithValue("Failed to update course.");
    }
  },
);

export const deleteCourse = createAsyncThunk(
  "courses/deleteCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      await api.delete(`courses/${encodeURIComponent(courseId)}`);
      return courseId;
    } catch {
      return rejectWithValue("Failed to delete course.");
    }
  },
);

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    // Set courses
    setCoursesLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setCoursesSuccess: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
      state.loading = false;
    },
    setCoursesError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create course
    createCourseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCourseSuccess: (state, action: PayloadAction<Course>) => {
      state.courses.push(action.payload);
      state.loading = false;
    },
    createCourseError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update course
    updateCourseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCourseSuccess: (state, action: PayloadAction<Course>) => {
      const index = state.courses.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      state.loading = false;
    },
    updateCourseError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete course
    deleteCourseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteCourseSuccess: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter((c) => c.id !== action.payload);
      state.loading = false;
    },
    deleteCourseError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select course
    selectCourse: (state, action: PayloadAction<Course | null>) => {
      state.selectedCourse = action.payload;
    },

    // Clear state
    clearCourseState: (state) => {
      state.selectedCourse = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.courses = action.payload;
        state.loading = false;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load courses.";
      })
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.courses.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to create course.";
      })
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        const index = state.courses.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        state.selectedCourse = action.payload;
        state.loading = false;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to update course.";
      })
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action: PayloadAction<string>) => {
        state.courses = state.courses.filter((c) => c.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to delete course.";
      });
  },
});

export const {
  setCoursesLoading,
  setCoursesSuccess,
  setCoursesError,
  createCourseStart,
  createCourseSuccess,
  createCourseError,
  updateCourseStart,
  updateCourseSuccess,
  updateCourseError,
  deleteCourseStart,
  deleteCourseSuccess,
  deleteCourseError,
  selectCourse,
  clearCourseState,
} = coursesSlice.actions;

export default coursesSlice.reducer;
