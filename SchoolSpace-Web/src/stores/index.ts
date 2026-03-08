import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import prefrencesReducer from "./preferenceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: prefrencesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
