import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "LIGHT" | "DARK" | "SYSTEM";
export type Language = "en" | "fr";

export interface PreferenceState {
  theme: ThemeMode;
  language: Language;
  sidebarCollapsed: boolean;
}

const initialState: PreferenceState = {
  theme: "SYSTEM",
  language: "en",
  sidebarCollapsed: false,
};

const preferenceSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },

    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },

    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setPreferences: (
      state,
      action: PayloadAction<Partial<PreferenceState>>,
    ) => {
      Object.assign(state, action.payload);
    },

    resetPreferences: () => initialState,
  },
});

export const {
  setTheme,
  setLanguage,
  toggleSidebar,
  setPreferences,
  resetPreferences,
} = preferenceSlice.actions;

export default preferenceSlice.reducer;
