import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  role: null,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, role, email } = action.payload;
      state.token = token;
      state.role = role;
      state.email = email;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.role = null;
      state.email = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
