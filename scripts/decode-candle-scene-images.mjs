// 蠟燭情境圖以 .b64 文字檔進版控（推送通道只收文字檔），
// build 前把 client/public/candles/images/scene-*.webp.b64 解碼成 .webp，
// vite build 會把 public 目錄原樣複製到 dist。
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const imagesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "client",
  "public",
  "candles",
  "images"
);

let decoded = 0;
for (const name of readdirSync(imagesDir)) {
  if (!name.endsWith(".webp.b64")) continue;
  const target = join(imagesDir, name.slice(0, -".b64".length));
  const bytes = Buffer.from(readFileSync(join(imagesDir, name), "utf8"), "base64");
  if (bytes.length === 0) throw new Error(`Empty decode result for ${name}`);
  writeFileSync(target, bytes);
  decoded += 1;
}
console.log(`Decoded ${decoded} candle scene image(s).`);
