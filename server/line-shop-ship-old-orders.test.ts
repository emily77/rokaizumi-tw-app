import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { createServer, type Server } from "node:http";
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  execute: vi.fn(),
  migration: {
    beginTransaction: vi.fn(),
    commit: vi.fn(),
    rollback: vi.fn(),
    release: vi.fn(),
  },
}));
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: vi.fn() } }));
vi.mock("mysql2/promise", () => ({
  default: {
    createPool: () => {
      let connections = 0;
      return {
        query: mocks.query,
        // 第一次 getConnection() 來自 initialize() 的 migrations。
        getConnection: async () =>
          ++connections === 1
            ? { query: mocks.query, execute: mocks.execute, ...mocks.migration }
            : mocks,
      };
    },
  },
}));
import router, { isCreatedBeforeJstDate } from "./line-shop";
let server: Server;
afterEach(async () => {
  if (server) await new Promise<void>(r => server.close(() => r()));
  vi.unstubAllEnvs();
});

describe("isCreatedBeforeJstDate", () => {
  const cutoff = "2026-11-13";
  it("treats the JST calendar date as the boundary", () => {
    // 2026-11-12 23:59:59 JST = 14:59:59 UTC → 範圍內
    expect(
      isCreatedBeforeJstDate(new Date("2026-11-12T14:59:59.000Z"), cutoff)
    ).toBe(true);
    // 2026-11-13 00:00:00 JST = 15:00:00 UTC → 範圍外
    expect(
      isCreatedBeforeJstDate(new Date("2026-11-12T15:00:00.000Z"), cutoff)
    ).toBe(false);
    expect(
      isCreatedBeforeJstDate(new Date("2026-10-01T00:00:00.000Z"), cutoff)
    ).toBe(true);
  });
  it("parses MySQL datetime strings as UTC", () => {
    // 05:00 UTC = 14:00 JST（11/12）→ 範圍內
    expect(isCreatedBeforeJstDate("2026-11-12 05:00:00", cutoff)).toBe(true);
    // 16:00 UTC = 01:00 JST（11/13）→ 範圍外
    expect(isCreatedBeforeJstDate("2026-11-12 16:00:00", cutoff)).toBe(false);
  });
  it("returns false for unparseable values instead of guessing", () => {
    expect(isCreatedBeforeJstDate(null, cutoff)).toBe(false);
    expect(isCreatedBeforeJstDate(undefined, cutoff)).toBe(false);
    expect(isCreatedBeforeJstDate("not a date", cutoff)).toBe(false);
    expect(isCreatedBeforeJstDate(new Date(NaN), cutoff)).toBe(false);
  });
});

describe("2026-11-13 ship-old-orders migration", () => {
  it("marks only pre-2026-11-13 (JST) paid orders shipped, excludes today's order by id, writes a record, and sends no mail", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://localhost/shop");
    const candidates = [
      {
        id: "LS-OLD-1",
        created_at: new Date("2026-11-05T03:00:00.000Z"),
        fulfillment_status: null,
        tracking_number: null,
      },
      {
        id: "LS-OLD-2",
        // 2026-11-12 10:00 JST
        created_at: new Date("2026-11-12T01:00:00.000Z"),
        fulfillment_status: "preparing",
        tracking_number: "",
      },
      {
        id: "LS-TODAY-OTHER",
        // 2026-11-13 01:30 JST — 今天的訂單，不在範圍內
        created_at: new Date("2026-11-12T16:30:00.000Z"),
        fulfillment_status: null,
        tracking_number: null,
      },
    ];
    mocks.query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (s.includes("GET_LOCK")) return [[{ acquired: 1 }]];
      if (s.includes("FROM line_shop_orders") && s.includes("LEFT JOIN line_shop_fulfillment"))
        return [candidates];
      return [[]];
    });
    const fulfillmentUpserts: unknown[][] = [];
    const recordInserts: unknown[][] = [];
    mocks.execute.mockImplementation(async (sql: string, params: unknown[] = []) => {
      const s = String(sql);
      if (s.startsWith("SELECT migration_key FROM line_shop_migrations"))
        // 只有本次 migration 尚未套用；其餘 migration 假裝都套用過，
        // 讓這個測試只專注在本次 migration 的行為。
        return params[0] === "2026-11-13-ship-orders-before-today"
          ? [[]]
          : [[{ migration_key: params[0] }]];
      if (s.startsWith("INSERT INTO line_shop_fulfillment")) {
        fulfillmentUpserts.push(params);
        return [{ affectedRows: 1 }];
      }
      if (s.startsWith("INSERT INTO line_shop_migration_records")) {
        recordInserts.push(params);
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 1 }];
    });

    const app = express();
    app.use(express.json());
    app.use("/api/line-shop", router);
    server = createServer(app);
    await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
    const res = await fetch(
      `http://127.0.0.1:${(server.address() as any).port}/api/line-shop/products`
    );
    expect(res.status).toBe(200);

    // 候選查詢：只挑已付款、未出貨／備貨中，且以 id 排除今天的訂單。
    const candidateCall = mocks.query.mock.calls.find(([sql]) =>
      String(sql).includes("LEFT JOIN line_shop_fulfillment")
    );
    expect(candidateCall).toBeTruthy();
    expect(String(candidateCall![0])).toContain("o.status = 'paid'");
    expect(candidateCall![1]).toEqual([
      "RZ-86213755-0a8b-4a07-8dd3-3830fea0f57d",
    ]);

    // 只翻轉兩張舊訂單；今天的另一張（LS-TODAY-OTHER）不動。
    expect(fulfillmentUpserts.map(p => p[0])).toEqual(["LS-OLD-1", "LS-OLD-2"]);
    for (const p of fulfillmentUpserts) {
      expect(p[1]).toBe("shipped");
      expect(p[2]).toBe("");
    }

    // 留痕：migration_records 寫入翻轉清單。
    expect(recordInserts).toHaveLength(1);
    expect(recordInserts[0][0]).toBe("2026-11-13-ship-orders-before-today");
    const detail = JSON.parse(String(recordInserts[0][1]));
    expect(detail.count).toBe(2);
    expect(detail.orders.map((o: any) => o.id)).toEqual([
      "LS-OLD-1",
      "LS-OLD-2",
    ]);
    expect(detail.orders[0].previousFulfillmentStatus).toBe(
      "awaiting_preparation"
    );
    expect(detail.orders[1].previousFulfillmentStatus).toBe("preparing");

    // 全程不得寫入任何信件（不寄出貨通知）。
    const allSql = [
      ...mocks.query.mock.calls.map(([sql]) => String(sql)),
      ...mocks.execute.mock.calls.map(([sql]) => String(sql)),
    ];
    expect(
      allSql.some(s => /INSERT\s+(IGNORE\s+)?INTO line_shop_mail/.test(s))
    ).toBe(false);
  });
});
