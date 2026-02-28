"use client";
import { configureStore } from "@reduxjs/toolkit";
import site from "./siteSlice";
import admin from "./adminSlice";

export const store = configureStore({
  reducer: { site, admin },
});
