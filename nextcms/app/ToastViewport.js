"use client";
import { useEffect, useState } from "react";

export default function ToastViewport() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    function onToast(e) {
      const id = crypto.randomUUID();
      const payload = { id, ...e.detail };
      setItems((p) => [...p, payload]);
      setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 2600);
    }
    window.addEventListener("app-toast", onToast);
    return () => window.removeEventListener("app-toast", onToast);
  }, []);

  return (
    <div className="toastWrap">
      {items.map((t) => (
        <div key={t.id} className={`toastItem ${t.type || "info"}`}>{t.message}</div>
      ))}
    </div>
  );
}
