import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { decodeSidecarImage, isSidecarImageFileName } from "./_core/vite";

describe("decodeSidecarImage", () => {
  let imgDir: string;
  // 假裝是一張 webp 的原始 bytes（內容不重要，只驗證解碼還原）
  const original = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

  beforeAll(() => {
    imgDir = fs.mkdtempSync(path.join(os.tmpdir(), "sidecar-img-"));
    fs.writeFileSync(
      path.join(imgDir, "DON-13-001.webp.b64"),
      original.toString("base64"),
      "utf-8"
    );
    fs.writeFileSync(path.join(imgDir, "EMPTY.webp.b64"), "", "utf-8");
  });

  afterAll(() => {
    fs.rmSync(imgDir, { recursive: true, force: true });
  });

  it("把 sidecar 解碼回原始 bytes", () => {
    const bytes = decodeSidecarImage(imgDir, "DON-13-001.webp");
    expect(bytes).not.toBeNull();
    expect(bytes!.equals(original)).toBe(true);
  });

  it("沒有 sidecar 時回傳 null，呼叫端照常走靜態檔案", () => {
    expect(decodeSidecarImage(imgDir, "COSTCO-15192.webp")).toBeNull();
  });

  it("sidecar 是空的時回傳 null", () => {
    expect(decodeSidecarImage(imgDir, "EMPTY.webp")).toBeNull();
  });

  it("拒絕路徑穿越與非 webp 檔名", () => {
    expect(decodeSidecarImage(imgDir, "../secret.webp")).toBeNull();
    expect(decodeSidecarImage(imgDir, "a/b.webp")).toBeNull();
    expect(decodeSidecarImage(imgDir, "DON-13-001.png")).toBeNull();
    expect(isSidecarImageFileName("DON-ES-015.webp")).toBe(true);
    expect(isSidecarImageFileName("..webp")).toBe(false);
  });
});
