import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  username: string | null;
  role: string | null;
  avatar: string | null;
  id: number | null;
}

const initialState: AuthState = {
  accessToken: null,
  username: null,
  role: null,
  avatar: null,
  id: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken?: string | null;
        username?: string | null;
        role?: string | null;
        avatar?: string | null;
        id?: number | null;
      }>,
    ) => {
      if (action.payload.accessToken !== undefined) {
        state.accessToken = action.payload.accessToken;
      }
      if (action.payload.username !== undefined) {
        state.username = action.payload.username;
      }
      if (action.payload.role !== undefined) {
        state.role = action.payload.role;
      }
      if (action.payload.avatar !== undefined) {
        state.avatar = action.payload.avatar;
      }
      if (action.payload.id !== undefined) {
        state.id = action.payload.id;
      }
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.username = null;
      state.role = null;
      state.avatar = null;
      state.id = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
