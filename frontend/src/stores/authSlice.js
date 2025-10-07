import { createSlice } from "@reduxjs/toolkit";

const PERSISTED_KEYS = ["role", "avatar", "username"];

function loadPersistedState() {
  try {
    const saved = JSON.parse(localStorage.getItem("authState"));
    return saved ?? {};
  } catch {
    return {};
  }
}

function savePersistedState(state) {
  const toSave = {};
  for (const key of PERSISTED_KEYS) {
    toSave[key] = state[key];
  }
  localStorage.setItem("authState", JSON.stringify(toSave));
}

const persisted = loadPersistedState();

const initialState = {
  token: null,
  email: null,
  role: persisted.role || null,
  avatar: persisted.avatar || null,
  username: persisted.username || null,
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
      savePersistedState(state);
    },
    clearCredentials: (state) => {
      state.token = null;
      state.email = null;
      state.role = null;
      state.avatar = null;
      state.username = null;
      localStorage.removeItem("authState");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
