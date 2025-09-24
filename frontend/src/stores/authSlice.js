import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  role: null,
  id: null,
  email: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, role, id, email, refreshToken } = action.payload;
      state.token = token;
      state.role = role;
      state.id = id;
      state.email = email;
      state.refreshToken = refreshToken || null;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.role = null;
      state.id = null;
      state.email = null;
      state.refreshToken = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
