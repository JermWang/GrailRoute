import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "docs", "design", "sitewide-polishing-and-motion-video");
const exportDir = path.join(root, "artifacts", "grailroute-motion");
const frameDir = path.join(exportDir, ".frames");
const publicVideoDir = path.join(root, "public", "video");
const exportVideo = path.join(exportDir, "GrailRoute-Motion-Demo-1920x1080.mp4");
const publicVideo = path.join(root, "public", "grailroute-motion-demo.mp4");
const poster = path.join(publicVideoDir, "grailroute-motion-poster.jpg");
const fps = 30;
const duration = 15;
const totalFrames = fps * duration;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
};

function staticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  if (decoded.startsWith("/pokemon/")) return path.join(root, "public", decoded);
  return path.join(root, decoded);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit", windowsHide: true });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${path.basename(command)} exited with code ${code}`)));
  });
}

await mkdir(frameDir, { recursive: true });
await mkdir(publicVideoDir, { recursive: true });

const server = createServer(async (request, response) => {
  try {
    const requested = staticPath(request.url || "/");
    const safeRoot = path.resolve(root) + path.sep;
    const resolved = path.resolve(requested);
    if (!resolved.startsWith(safeRoot)) throw new Error("Path outside project");
    const body = await readFile(resolved);
    response.writeHead(200, { "content-type": contentTypes[path.extname(resolved).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const chromePaths = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
let executablePath = null;
for (const candidate of chromePaths) {
  try { await stat(candidate); executablePath = candidate; break; } catch {}
}
if (!executablePath) throw new Error("Chrome or Edge is required to render the motion composition.");

const browser = await chromium.launch({ executablePath, headless: true, args: ["--disable-web-security", "--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1124 }, deviceScaleFactor: 1 });
page.on("pageerror", (error) => process.stderr.write(`[page] ${error.message}\n`));

try {
  const url = `http://127.0.0.1:${address.port}/${encodeURIComponent(path.basename(sourceDir))}/GrailRoute-Video.dc.html`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
  const stage = page.locator("[data-om-exportable-video-with-duration-secs]");
  await stage.waitFor({ state: "visible", timeout: 120_000 });
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 120_000 });
  await page.locator('button[title^="Preview only"]').evaluateAll((buttons) => buttons.forEach((button) => { button.style.display = "none"; }));
  await page.waitForTimeout(750);

  const box = await stage.boundingBox();
  if (!box || Math.round(box.width) !== 1920 || Math.round(box.height) !== 1080) {
    throw new Error(`Expected a 1920x1080 export canvas, received ${box ? `${Math.round(box.width)}x${Math.round(box.height)}` : "no bounds"}.`);
  }

  for (let frame = 0; frame < totalFrames; frame += 1) {
    const time = frame / fps;
    await stage.evaluate((element, value) => element.dispatchEvent(new CustomEvent("data-om-seek-to-time-frame", { detail: { time: value, sync: true } })), time);
    const clip = { x: box.x, y: box.y, width: 1920, height: 1080 };
    await page.screenshot({ path: path.join(frameDir, `frame-${String(frame).padStart(4, "0")}.jpg`), type: "jpeg", quality: 92, clip });
    if (frame === 198) await page.screenshot({ path: poster, type: "jpeg", quality: 92, clip });
    if (frame % 90 === 0) process.stdout.write(`Rendered ${frame}/${totalFrames} frames\n`);
  }

  await run(ffmpeg.path, [
    "-y", "-framerate", String(fps), "-i", path.join(frameDir, "frame-%04d.jpg"),
    "-vf", "scale=1920:1080:flags=lanczos,setsar=1", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "-r", String(fps), exportVideo,
  ]);
  await cp(exportVideo, publicVideo);

  const manifest = {
    title: "GrailRoute Motion Demo",
    source: "docs/design/sitewide-polishing-and-motion-video/GrailRoute-Video.dc.html",
    output: "GrailRoute-Motion-Demo-1920x1080.mp4",
    resolution: { width: 1920, height: 1080 },
    fps,
    durationSeconds: duration,
    codec: "H.264",
    pixelFormat: "yuv420p",
    audio: "none",
    renderedAt: new Date().toISOString(),
  };
  await writeFile(path.join(exportDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(path.join(exportDir, "PROVENANCE.md"), [
    "# GrailRoute motion export",
    "",
    "Deterministically rendered from the supplied Claude Design composition at 1920×1080, 30 fps, for 15 seconds.",
    "",
    "Pokémon card imagery uses the exact Base Set reference assets supplied by the design handoff. The public website identifies these visuals as illustrative rather than connected-wallet inventory.",
    "",
    "Speculative gasless and USDG claims from the handoff were replaced with onchain, atomic-routing language that matches the current product implementation.",
    "",
    "The export is silent because the source composition marks its browser speech and ambient pad as preview-only and excluded from video export.",
    "",
  ].join("\n"), "utf8");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  await rm(frameDir, { recursive: true, force: true });
}

process.stdout.write(`Video exported to ${exportVideo}\n`);
