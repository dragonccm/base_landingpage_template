"use client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

async function safeJson(url, fallback) {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export const fetchAdminData = createAsyncThunk("admin/fetch", async () => {
  const [landing, settings, media, contacts, users] = await Promise.all([
    safeJson("/api/admin/landing", { data: null }),
    safeJson("/api/admin/settings", { data: null }),
    safeJson("/api/admin/media", { items: [] }),
    safeJson("/api/admin/contacts", { items: [] }),
    safeJson("/api/admin/users", { items: [] }),
  ]);
  return {
    landing: landing.data,
    settings: settings.data,
    media: media.items || [],
    contacts: contacts.items || [],
    users: users.items || [],
  };
});

const adminSlice = createSlice({
  name: "admin",
  initialState: { landing: null, settings: null, media: [], contacts: [], users: [], active: "dashboard", loading: false },
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
        s.contacts = a.payload.contacts;
        s.users = a.payload.users;
      })
      .addCase(fetchAdminData.rejected, (s) => { s.loading = false; });
  },
});

export const { setActiveTab, setLandingState, setSettingsState } = adminSlice.actions;
export default adminSlice.reducer;
