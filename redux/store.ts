import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import usersReducer from "./features/users/usersSlice";
import coursesReducer from "./features/courses/coursesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    courses: coursesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
