"use client";
import { useRef, useState } from "react";
import { toast } from "@/lib/toast";

function isVideoUrl(url = "") {
  return /\.(mp4|webm|mov)$/i.test(url);
}

export default function ImageField({ label, value, onChange, mediaType = "any" }) {
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
    if (!res.ok) return toast.error(data.error || "Upload failed");
    onChange(data.url, data.type);
    toast.success(data.type === "video" ? "Upload video thành công" : "Upload ảnh thành công");
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function onPaste(e) {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/") || i.type.startsWith("video/"));
    if (!item) return;
    const file = item.getAsFile();
    if (file) await uploadFile(file);
  }

  const accept = mediaType === "image" ? "image/*" : mediaType === "video" ? "video/*" : "image/*,video/*";
  const isVideo = isVideoUrl(value);

  return (
    <div className="imageField" onPaste={onPaste}>
      <label className="fieldLabel">{label}</label>
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {value ? (
          isVideo ? <video src={value} className="imagePreview" controls muted /> : <img src={value} alt="preview" className="imagePreview" />
        ) : (
          <div className="dropHint">Kéo thả media vào đây / paste từ clipboard</div>
        )}
        <div className="row">
          <button type="button" className="btn" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? "Đang upload..." : "Chọn file"}</button>
          <input className="urlInput" placeholder="Hoặc dán URL ảnh/video" value={value || ""} onChange={(e) => onChange(e.target.value, isVideoUrl(e.target.value) ? "video" : "image")} />
        </div>
        <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => uploadFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}
