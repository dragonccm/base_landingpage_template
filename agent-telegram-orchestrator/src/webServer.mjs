import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { handleMessageDetailed } from "./core.mjs";
import { listRuns, getRun } from "./runStore.mjs";
import { getAutoflowMetrics } from "./metricsStore.mjs";

const WEB_TOKEN = process.env.WEB_DASHBOARD_TOKEN || "";

function json(res, code, body) {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function unauthorized(res) {
  return json(res, 401, { ok: false, error: "Unauthorized" });
}

function checkAuth(req) {
  if (!WEB_TOKEN) return true;
  const hdr = req.headers.authorization || "";
  return hdr === `Bearer ${WEB_TOKEN}`;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

export async function runWebServer() {
  const port = Number(process.env.WEB_PORT || 8787);
  const liveMode = process.env.OPENCLAW_LIVE_MODE === "1";

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

      if (url.pathname === "/health") return json(res, 200, { ok: true });

      if (url.pathname === "/" && req.method === "GET") {
        const html = await readFile(path.resolve(process.cwd(), "src", "web", "index.html"), "utf8");
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(html);
        return;
      }

      if (!checkAuth(req)) return unauthorized(res);

      if (url.pathname === "/api/runs" && req.method === "GET") {
        const limit = Number(url.searchParams.get("limit") || 50);
        const runs = await listRuns(limit);
        return json(res, 200, { ok: true, runs });
      }

      if (url.pathname === "/api/metrics/autoflow" && req.method === "GET") {
        const metrics = await getAutoflowMetrics();
        return json(res, 200, { ok: true, metrics });
      }

      if (url.pathname.startsWith("/api/runs/") && req.method === "GET") {
        const runId = decodeURIComponent(url.pathname.split("/").pop() || "");
        const run = await getRun(runId);
        return json(res, run ? 200 : 404, run ? { ok: true, run } : { ok: false, error: "Run not found" });
      }

      if (url.pathname === "/api/command" && req.method === "POST") {
        const body = await readBody(req);
        const text = String(body.command || "").trim();
        if (!text.startsWith("/")) return json(res, 400, { ok: false, error: "command must start with /" });

        const result = await handleMessageDetailed(text, {
          dryRun: body.dryRun === true ? true : !liveMode,
          source: "web"
        });
        return json(res, 200, { ok: result.ok, result });
      }

      return json(res, 404, { ok: false, error: "Not found" });
    } catch (err) {
      return json(res, 500, { ok: false, error: err.message });
    }
  });

  server.listen(port, () => {
    console.log(`Web dashboard listening at http://localhost:${port}`);
    console.log(`Web auth: ${WEB_TOKEN ? "enabled" : "disabled (set WEB_DASHBOARD_TOKEN)"}`);
    console.log(`Execution mode: ${liveMode ? "live" : "dry-run"}`);
  });
}
