"use client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchAdminData = createAsyncThunk("admin/fetch", async () => {
  const [landing, settings, media] = await Promise.all([
    fetch("/api/admin/landing").then((r) => r.json()),
    fetch("/api/admin/settings").then((r) => r.json()),
    fetch("/api/admin/media").then((r) => r.json()),
  ]);
  return { landing: landing.data, settings: settings.data, media: media.items || [] };
});

const adminSlice = createSlice({
  name: "admin",
  initialState: { landing: null, settings: null, media: [], active: "dashboard", loading: false },
  reducers: {
    setActiveTab: (s, a) => { s.active = a.payload; },
    setLandingState: (s, a) => { s.landing = a.payload; },
    setSettingsState: (s, a) => { s.settings = a.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminData.pending, (s) => { s.loading = true; })
      .addCase(fetchAdminData.fulfilled, (s, a) => {
        s.loading = false;
        s.landing = a.payload.landing;
        s.settings = a.payload.settings;
        s.media = a.payload.media;
      })
      .addCase(fetchAdminData.rejected, (s) => { s.loading = false; });
  },
});

export const { setActiveTab, setLandingState, setSettingsState } = adminSlice.actions;
export default adminSlice.reducer;
