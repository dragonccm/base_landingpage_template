import dotenv from "dotenv";
import { readdir } from "fs/promises";
import path from "path";

dotenv.config({ path: ".env.local" });
const { getMedia, saveMedia, getLanding, saveLanding, ensureSchema, getSettings, saveSettings } = await import("../lib/db.js");

function extType(file) {
  return /\.(mp4|webm|mov)$/i.test(file) ? "video" : "image";
}

function toUrl(folder, file) {
  return `/${folder}/${file}`.replace(/\\/g, "/");
}

async function listFiles(relativeFolder) {
  const folder = path.join(process.cwd(), "public", relativeFolder);
  try {
    const files = await readdir(folder, { withFileTypes: true });
    return files.filter((f) => f.isFile()).map((f) => f.name);
  } catch {
    return [];
  }
}

await ensureSchema();

const medias = await getMedia();
const mediaMap = new Map(medias.map((m) => [m.url, m]));

const targets = [
  ...(await listFiles("videos")).map((f) => ({ url: toUrl("videos", f), name: f, type: extType(f) })),
  ...(await listFiles("images")).map((f) => ({ url: toUrl("images", f), name: f, type: extType(f) })),
  ...(await listFiles("uploads")).map((f) => ({ url: toUrl("uploads", f), name: f, type: extType(f) })),
];

for (const item of targets) {
  if (!mediaMap.has(item.url)) {
    medias.unshift({
      id: `m_${crypto.randomUUID()}`,
      url: item.url,
      name: item.name,
      alt: "",
      type: item.type,
      createdAt: new Date().toISOString(),
    });
  }
}

await saveMedia(medias);

const landing = await getLanding();
landing.content = landing.content || {};
if (!landing.content.heroVideoUrl) landing.content.heroVideoUrl = "/videos/GettyImages-1308346105.mp4";
if (!landing.content.footerBgImageUrl) landing.content.footerBgImageUrl = "/images/Background-footer.png";
await saveLanding(landing);

const settings = await getSettings();
settings.identity = settings.identity || {};
if (!settings.identity.logoUrl) {
  const logoCandidate = medias.find((m) => m.type === "image" && /logo|trust|svg/i.test(m.name));
  if (logoCandidate) settings.identity.logoUrl = logoCandidate.url;
}
await saveSettings(settings);

console.log(`Synced media items: ${medias.length}`);
