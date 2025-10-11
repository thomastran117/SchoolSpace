import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  email: null,
  role: null,
  avatar: null,
  username: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, email, role, avatar, username } = action.payload;
      state.token = token;
      state.email = email;
      state.role = role;
      state.avatar = avatar;
      state.username = username;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.email = null;
      state.role = null;
      state.avatar = null;
      state.username = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
