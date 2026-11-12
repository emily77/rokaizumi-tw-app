import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { createServer, type Server } from "node:http";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  query: vi.fn(),
  execute: vi.fn(),
  beginTransaction: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
  release: vi.fn(),
  // initialize() 的庫存遷移會自己開一條連線，用獨立的 spy 才不會混進請求的交易斷言。
  migration: {
    beginTransaction: vi.fn(),
    commit: vi.fn(),
    rollback: vi.fn(),
    release: vi.fn(),
  },
}));

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.auth } }));
vi.mock("mysql2/promise", () => ({
  default: {
    createPool: () => {
      let connections = 0;
      return {
        query: mocks.query,
        getConnection: async () =>
          ++connections === 1
            ? { query: mocks.query, execute: mocks.execute, ...mocks.migration }
            : mocks,
      };
    },
  },
}));

import router from "./line-shop";

const PRODUCT = {
  id: "M001",
  name: "毛穴撫子｜米萃保濕面膜",
  jp: "毛穴撫子 お米のマスク",
  spec: "10片",
  price: 186,
  catalog: "shop",
};
// 前台 catalog() 讀到的價格；PATCH 測試途中會改成 250 模擬後台改價。
let catalogPrice = 186;
const catalogRow = () => ({
  id: "M001",
  data_json: JSON.stringify({ ...PRODUCT, price: catalogPrice }),
  stock: 10,
  active: 1,
});
const FOR_UPDATE_ROW = {
  id: "M001",
  data_json: JSON.stringify(PRODUCT),
  stock: 10,
  active: 1,
};

let server: Server;

beforeEach(() => {
  vi.clearAllMocks();
  catalogPrice = 186;
  vi.stubEnv("DATABASE_URL", "mysql://localhost/shop");
  // initialize() 會用 GET_LOCK 取得庫存遷移鎖，acquired 必須是 1，否則一律 503。
  mocks.query.mockImplementation(async (sql: string) =>
    String(sql).includes("GET_LOCK")
      ? [[{ acquired: 1 }]]
      : String(sql).includes("FROM line_shop_products")
        ? [[catalogRow()]]
        : [[]]
  );
  mocks.execute.mockImplementation(async (sql: string) =>
    String(sql).includes("FOR UPDATE") ? [[{ ...FOR_UPDATE_ROW }]] : [{ affectedRows: 1 }]
  );
  mocks.auth.mockResolvedValue({ role: "admin" });
});

afterEach(async () => {
  if (server) await new Promise<void>(r => server.close(() => r()));
  vi.unstubAllEnvs();
});

async function call(path: string, { method = "GET", body, headers = {} }: any = {}) {
  const app = express();
  app.use(express.json());
  app.use("/api/line-shop", router);
  server = createServer(app);
  await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
  return fetch(
    `http://127.0.0.1:${(server.address() as any).port}/api/line-shop${path}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        // 非 GET 有同源檢查，缺 Origin 會被 403。
        origin: "https://rokaizumi-tw.jp",
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }
  );
}

describe("LINE shop products response caching", () => {
  it("serves cache headers and answers If-None-Match with 304", async () => {
    const first = await call("/products");
    expect(first.status).toBe(200);
    expect(first.headers.get("cache-control")).toContain("max-age=60");
    expect(first.headers.get("cache-control")).toContain(
      "stale-while-revalidate"
    );
    const etag = first.headers.get("etag");
    expect(etag).toBeTruthy();
    const data = await first.json();
    expect(data.products).toHaveLength(1);
    expect(data.products[0]).toMatchObject({ id: "M001", price: 186 });

    const second = await call("/products", {
      headers: { "if-none-match": etag },
    });
    expect(second.status).toBe(304);
    expect(await second.text()).toBe("");
  });

  it("an admin price change produces a new ETag on the very next request", async () => {
    const before = await call("/products");
    const oldEtag = before.headers.get("etag");
    await before.json();

    catalogPrice = 250;
    const patch = await call("/admin/products/M001", {
      method: "PATCH",
      body: { price: 250 },
    });
    expect(patch.status).toBe(200);
    await patch.json();

    // 帶著舊 ETag 再問一次：ETag 是內容雜湊，後台一改價就必須換新值並回新內容。
    const after = await call("/products", {
      headers: { "if-none-match": oldEtag },
    });
    expect(after.status).toBe(200);
    expect(after.headers.get("etag")).not.toBe(oldEtag);
    const data = await after.json();
    expect(data.products[0]).toMatchObject({ id: "M001", price: 250 });
  });
});
