"use client";
import { useEffect, useRef, useState } from "react";

function btn(label, onClick, title) {
  return <button type="button" className="btn ghostBtn" title={title || label} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>{label}</button>;
}

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseChartData(raw) {
  try {
    const data = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) return [];
    return data.map((x) => ({ label: String(x.label ?? ""), value: toNumber(x.value, 0) }));
  } catch {
    return [];
  }
}

function buildChartSvg(type, data) {
  const safe = data.filter((x) => Number.isFinite(x.value));
  if (!safe.length) return "";
  const width = 520, height = 220, pad = 24;
  const max = Math.max(...safe.map((x) => x.value), 1);

  if (type === "pie") {
    const total = safe.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
    let start = 0;
    const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - 10;
    const slices = safe.map((d, i) => {
      const frac = Math.max(0, d.value) / total;
      const end = start + frac * Math.PI * 2;
      const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
      const large = end - start > Math.PI ? 1 : 0;
      const color = `hsl(${(i * 67) % 360} 72% 56%)`;
      const path = `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${color}" />`;
      start = end;
      return path;
    }).join("");
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg">${slices}</svg>`;
  }

  const innerW = width - pad * 2, innerH = height - pad * 2;
  if (type === "line") {
    const step = safe.length > 1 ? innerW / (safe.length - 1) : innerW;
    const points = safe.map((d, i) => `${pad + i * step},${pad + innerH - (d.value / max) * innerH}`).join(" ");
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${width}" height="${height}" fill="#fff"/><polyline fill="none" stroke="#1d7ddc" stroke-width="3" points="${points}"/></svg>`;
  }

  const barW = innerW / safe.length * 0.65, gap = innerW / safe.length;
  const bars = safe.map((d, i) => {
    const h = (d.value / max) * innerH;
    const x = pad + i * gap + (gap - barW) / 2;
    const y = pad + innerH - h;
    const color = `hsl(${(i * 57) % 360} 70% 52%)`;
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="${color}" rx="4"/>`;
  }).join("");
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${width}" height="${height}" fill="#fff"/>${bars}</svg>`;
}

export default function RichPostEditor({ value, onChange, placeholder = "Write your content...", mediaItems = [] }) {
  const ref = useRef(null);
  const savedRangeRef = useRef(null);
  const [chartType, setChartType] = useState("bar");
  const [chartData, setChartData] = useState('[{"label":"A","value":10},{"label":"B","value":20}]');
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
      renderCharts();
    }
  }, [value]);

  function notify(message) {
    setDialog({ type: "notice", title: "Thông báo", message });
  }

  function askInput(title, defaultValue = "", placeholderText = "") {
    return new Promise((resolve) => {
      setDialog({
        type: "input",
        title,
        value: defaultValue,
        placeholder: placeholderText,
        onCancel: () => { setDialog(null); resolve(null); },
        onOk: (val) => { setDialog(null); resolve(val || null); },
      });
    });
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!ref.current?.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  }

  function restoreSelection() {
    const sel = window.getSelection();
    if (!sel) return false;
    if (savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      return true;
    }
    return false;
  }

  function focusEditorEnd() {
    if (!ref.current) return;
    ref.current.focus();
    const range = document.createRange();
    range.selectNodeContents(ref.current);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    savedRangeRef.current = range;
  }

  function exec(command, arg = null) {
    ref.current?.focus();
    if (!restoreSelection()) focusEditorEnd();
    document.execCommand(command, false, arg);
    saveSelection();
    emit();
  }

  function emit() {
    renderCharts();
    onChange?.(ref.current?.innerHTML || "");
  }

  function setHeading(tag) { exec("formatBlock", tag); }

  async function insertLink() {
    saveSelection();
    const url = await askInput("Nhập URL", "", "https://...");
    if (!url) return;
    exec("createLink", url);
  }

  async function insertImage() {
    saveSelection();
    if (mediaItems?.length) {
      setDialog({ type: "media", title: "Chọn ảnh từ thư viện", items: mediaItems, onPick: (url) => { setDialog(null); exec("insertImage", url); } });
      return;
    }
    const url = await askInput("Nhập URL ảnh", "", "https://...");
    if (!url) return;
    exec("insertImage", url);
  }

  function currentCell() {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return null;
    let node = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
    while (node && node !== ref.current) {
      const tag = node.tagName?.toLowerCase();
      if (tag === "td" || tag === "th") return node;
      node = node.parentElement;
    }
    return null;
  }

  async function insertTable() {
    saveSelection();
    const cols = Math.max(2, Number(await askInput("Số cột", "2") || 2));
    const rows = Math.max(2, Number(await askInput("Số hàng", "2") || 2));
    const head = `<tr>${Array.from({ length: cols }).map((_, i) => `<th>Header ${i + 1}</th>`).join("")}</tr>`;
    const body = Array.from({ length: rows - 1 }).map((_, r) => `<tr>${Array.from({ length: cols }).map((_, c) => `<td>R${r + 1}C${c + 1}</td>`).join("")}</tr>`).join("");
    exec("insertHTML", `<table border="1" style="width:100%;border-collapse:collapse">${head}${body}</table><p></p>`);
  }

  function addTableRow() {
    const cell = currentCell();
    if (!cell) return notify("Đặt con trỏ trong bảng trước.");
    const tr = cell.parentElement;
    const cols = tr.children.length || 1;
    const newRow = document.createElement("tr");
    for (let i = 0; i < cols; i++) {
      const td = document.createElement("td");
      td.innerHTML = `New ${i + 1}`;
      newRow.appendChild(td);
    }
    tr.parentElement.appendChild(newRow);
    emit();
  }

  function addTableColumn() {
    const cell = currentCell();
    if (!cell) return notify("Đặt con trỏ trong bảng trước.");
    const table = cell.closest("table");
    table.querySelectorAll("tr").forEach((tr, idx) => {
      const el = document.createElement(idx === 0 ? "th" : "td");
      el.innerHTML = idx === 0 ? "Header" : "New";
      tr.appendChild(el);
    });
    emit();
  }

  function mergeRightCell() {
    const cell = currentCell();
    if (!cell) return notify("Đặt con trỏ trong ô cần gộp.");
    const next = cell.nextElementSibling;
    if (!next) return notify("Không có ô bên phải để gộp.");
    cell.setAttribute("colspan", String(Number(cell.getAttribute("colspan") || 1) + Number(next.getAttribute("colspan") || 1)));
    cell.innerHTML = `${cell.innerHTML} ${next.innerHTML}`;
    next.remove();
    emit();
  }

  function insertChartBlock() {
    const data = parseChartData(chartData);
    if (!data.length) return notify("Dữ liệu chart không hợp lệ (JSON array)");
    exec("insertHTML", `<figure data-chart="${chartType}" data-values='${JSON.stringify(data)}' style="border:1px dashed #9db8d2;padding:12px;border-radius:10px;background:#f8fbff"><figcaption><strong>Chart (${chartType})</strong></figcaption><div class="chart-preview">${buildChartSvg(chartType, data)}</div><small>${JSON.stringify(data)}</small></figure><p></p>`);
  }

  function renderCharts() {
    if (!ref.current) return;
    ref.current.querySelectorAll("figure[data-chart]").forEach((b) => {
      const type = b.getAttribute("data-chart") || "bar";
      const data = parseChartData(b.getAttribute("data-values") || "[]");
      const preview = b.querySelector(".chart-preview") || (() => {
        const d = document.createElement("div");
        d.className = "chart-preview";
        b.appendChild(d);
        return d;
      })();
      preview.innerHTML = buildChartSvg(type, data);
    });
  }

  return (
    <div className="card richEditorShell">
      <h3>Advanced Editor</h3>
      <div className="row editorToolbarRow" style={{ flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {btn("B", () => exec("bold"))}{btn("I", () => exec("italic"))}{btn("U", () => exec("underline"))}{btn("S", () => exec("strikeThrough"))}
        {btn("H1", () => setHeading("H1"))}{btn("H2", () => setHeading("H2"))}{btn("H3", () => setHeading("H3"))}{btn("P", () => setHeading("P"))}
        {btn("Left", () => exec("justifyLeft"))}{btn("Center", () => exec("justifyCenter"))}{btn("Right", () => exec("justifyRight"))}{btn("Justify", () => exec("justifyFull"))}
        {btn("• List", () => exec("insertUnorderedList"))}{btn("1. List", () => exec("insertOrderedList"))}{btn("Quote", () => setHeading("BLOCKQUOTE"))}
        {btn("Link", insertLink)}{btn("Image", insertImage)}{btn("Table", insertTable)}{btn("+Row", addTableRow)}{btn("+Col", addTableColumn)}{btn("Merge→", mergeRightCell)}
        {btn("Undo", () => exec("undo"))}{btn("Redo", () => exec("redo"))}
      </div>

      <div className="card editorChartCard" style={{ marginBottom: 10 }}>
        <strong>Chart Builder</strong>
        <div className="row" style={{ gap: 8, alignItems: "start", marginTop: 8 }}>
          <select className="editorSelect" value={chartType} onChange={(e) => setChartType(e.target.value)}><option value="bar">Bar</option><option value="line">Line</option><option value="pie">Pie</option></select>
          <textarea rows={3} style={{ flex: 1 }} value={chartData} onChange={(e) => setChartData(e.target.value)} />
          <button type="button" className="btn" onClick={insertChartBlock}>Insert Chart</button>
        </div>
      </div>

      <div ref={ref} contentEditable suppressContentEditableWarning onInput={() => { saveSelection(); emit(); }} onKeyUp={saveSelection} onMouseUp={saveSelection} onFocus={saveSelection} className="richEditor" data-placeholder={placeholder} />

      {dialog?.type === "input" && <DialogInput dialog={dialog} setDialog={setDialog} />}
      {dialog?.type === "notice" && <DialogNotice dialog={dialog} setDialog={setDialog} />}
      {dialog?.type === "media" && <DialogMedia dialog={dialog} setDialog={setDialog} />}
    </div>
  );
}

function DialogShell({ title, children }) {
  return <div className="editorModal"><div className="editorModalCard"><h4>{title}</h4>{children}</div></div>;
}

function DialogInput({ dialog }) {
  const [v, setV] = useState(dialog.value || "");
  return (
    <DialogShell title={dialog.title}>
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder={dialog.placeholder || ""} />
      <div className="row" style={{ justifyContent: "end", marginTop: 8, gap: 8 }}>
        <button className="btn ghostBtn" onClick={dialog.onCancel}>Cancel</button>
        <button className="btn" onClick={() => dialog.onOk(v)}>OK</button>
      </div>
    </DialogShell>
  );
}

function DialogNotice({ dialog, setDialog }) {
  return <DialogShell title={dialog.title}><p>{dialog.message}</p><div className="row" style={{ justifyContent: "end" }}><button className="btn" onClick={() => setDialog(null)}>OK</button></div></DialogShell>;
}

function DialogMedia({ dialog, setDialog }) {
  return (
    <DialogShell title={dialog.title}>
      <div style={{ maxHeight: 260, overflow: "auto", display: "grid", gap: 6 }}>
        {dialog.items.map((m) => <button key={m.id} className="btn ghostBtn" onClick={() => dialog.onPick(m.url)} style={{ justifyContent: "start" }}>{m.name || m.url}</button>)}
      </div>
      <div className="row" style={{ justifyContent: "end", marginTop: 8 }}>
        <button className="btn ghostBtn" onClick={() => setDialog(null)}>Close</button>
      </div>
    </DialogShell>
  );
}
