"use client";
import { useRef, useState } from "react";

export default function ImageField({ label, value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file) {
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return alert(data.error || "Upload failed");
    onChange(data.url);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function onPaste(e) {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    if (file) await uploadFile(file);
  }

  return (
    <div className="imageField" onPaste={onPaste}>
      <label className="fieldLabel">{label}</label>
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {value ? <img src={value} alt="preview" className="imagePreview" /> : <div className="dropHint">Kéo thả ảnh vào đây / paste từ clipboard</div>}
        <div className="row">
          <button type="button" className="btn" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? "Đang upload..." : "Chọn ảnh"}</button>
          <input
            className="urlInput"
            placeholder="Hoặc dán URL ảnh"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => uploadFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}
