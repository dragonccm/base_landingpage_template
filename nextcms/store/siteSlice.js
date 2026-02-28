"use client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchLanding = createAsyncThunk("site/fetchLanding", async () => {
  const res = await fetch("/api/landing");
  const json = await res.json();
  return json.data;
});

export const fetchSettings = createAsyncThunk("site/fetchSettings", async () => {
  const res = await fetch("/api/settings");
  const json = await res.json();
  return json.data;
});

const siteSlice = createSlice({
  name: "site",
  initialState: { landing: null, settings: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanding.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchLanding.fulfilled, (s, a) => { s.loading = false; s.landing = a.payload; })
      .addCase(fetchLanding.rejected, (s) => { s.loading = false; s.error = "Không tải được landing"; })
      .addCase(fetchSettings.fulfilled, (s, a) => { s.settings = a.payload; });
  },
});

export default siteSlice.reducer;
