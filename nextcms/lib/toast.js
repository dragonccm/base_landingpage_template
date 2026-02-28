"use client";

export function pushToast(message, type = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));
}

export const toast = {
  success: (msg) => pushToast(msg, "success"),
  error: (msg) => pushToast(msg, "error"),
  info: (msg) => pushToast(msg, "info"),
};
