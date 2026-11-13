import { describe, it, expect } from "vitest";
import {
  shippingQuote,
  orderShippingTwd,
  resolveShopItems,
  validPaidSession,
  merchantItemLines,
  donkiStoreHint,
  type MerchantItemHint,
  type ShopItem,
  type ShopProduct,
} from "./line-shop-pricing";
const products = [
  { id: "M001", name: "面膜", price: 500, stock: 10, catalog: "shop" },
  { id: "EXC002", name: "市田柿", price: 799, stock: 120, catalog: "exclusive", freeShipping: true },
  { id: "AIPC001", name: "Jabra Speak2 55 MS", price: 4500, stock: 5, catalog: "ai", freeShipping: true },
] as ShopProduct[];
describe("LINE shop server prices and minimum", () => {
  it("ignores a forged browser price and enforces the product subtotal", () => {
    expect(
      resolveShopItems([{ productId: "M001", quantity: 4, price: 1 }], products)
        .subtotalTwd
    ).toBe(2000);
    expect(() =>
      resolveShopItems([{ productId: "M001", quantity: 2 }], products)
    ).toThrow("2,000");
    expect(() =>
      resolveShopItems(
        [{ productId: "M001", quantity: 4 }],
        [{ ...products[0], price: 499 }]
      )
    ).toThrow("2,000");
  });
  it("allows the shipping-exempt Ichida-gaki below the normal minimum", () => {
    expect(resolveShopItems([{ productId: "EXC002", quantity: 1 }], products)).toMatchObject({
      subtotalTwd: 799,
      shippingSubtotalTwd: 0,
      items: [{ freeShipping: true }],
    });
    expect(resolveShopItems([
      { productId: "M001", quantity: 4 },
      { productId: "EXC002", quantity: 1 },
    ], products).shippingSubtotalTwd).toBe(2000);
    expect(() => resolveShopItems([
      { productId: "M001", quantity: 2 },
      { productId: "EXC002", quantity: 1 },
    ], products)).toThrow("2,000");
  });
  it("does not add postage to a free-shipping AI accessory", () => {
    // AIPC001 免運：單買就是售價，不會多收 NT$220。
    expect(
      resolveShopItems([{ productId: "AIPC001", quantity: 1 }], products)
    ).toMatchObject({
      subtotalTwd: 4500,
      shippingSubtotalTwd: 0,
      items: [{ freeShipping: true }],
    });
    // 混搭一般商品時，免運商品不計入運費門檻，只看一般商品小計。
    expect(
      resolveShopItems(
        [
          { productId: "AIPC001", quantity: 1 },
          { productId: "M001", quantity: 4 },
        ],
        products
      ).shippingSubtotalTwd
    ).toBe(2000);
    expect(() =>
      resolveShopItems(
        [
          { productId: "AIPC001", quantity: 1 },
          { productId: "M001", quantity: 1 },
        ],
        products
      )
    ).toThrow("2,000");
  });

  it("rejects duplicate, removed, fractional and out of stock items", () => {
    for (const items of [
      [{ productId: "missing", quantity: 3 }],
      [{ productId: "M001", quantity: 3.5 }],
      [{ productId: "M001", quantity: 11 }],
      [
        { productId: "M001", quantity: 2 },
        { productId: "M001", quantity: 2 },
      ],
    ])
      expect(() => resolveShopItems(items, products)).toThrow();
  });
});
describe("Taiwan fixed postage and free shipping", () => {
  it("enforces the minimum and both shipping boundaries", () => {
    expect(() => orderShippingTwd(1999)).toThrow("2,000");
    expect(orderShippingTwd(2000)).toBe(220);
    expect(orderShippingTwd(4999)).toBe(220);
    expect(orderShippingTwd(5000)).toBe(0);
    expect(orderShippingTwd(5001)).toBe(0);
  });
  it("records carrier cost without changing buyer postage", () => {
    expect(shippingQuote(500, 2000)).toEqual({
      packedWeightGrams: 500,
      emsJpy: 1450,
      shippingTwd: 220,
    });
    expect(shippingQuote(501, 4999).shippingTwd).toBe(220);
    expect(shippingQuote(2000, 5000).shippingTwd).toBe(0);
    expect(shippingQuote(30000, 5000).shippingTwd).toBe(0);
  });
  it("blocks unknown, zero, fractional and excessive packed weight", () => {
    for (const w of [null, undefined, 0, -1, 1.5, 30001, "500"])
      expect(() => shippingQuote(w, 2000)).toThrow();
  });
});
describe("verified Stripe payment amount and mode", () => {
  const order = { id: "RZ-1", subtotal: 1500, shipping: 145, mode: "live" };
  const session = {
    payment_status: "paid",
    currency: "twd",
    amount_total: 164500,
    livemode: true,
    metadata: { line_shop_order: "RZ-1" },
    client_reference_id: "RZ-1",
  };
  it("accepts a matching full TWD payment", () =>
    expect(validPaidSession(session, order)).toBe(true));
  it("accepts free shipping and rejects an underpayment", () => {
    const free = { ...order, subtotal: 5000, shipping: 0 };
    expect(validPaidSession({ ...session, amount_total: 500000 }, free)).toBe(true);
    expect(validPaidSession({ ...session, amount_total: 499900 }, free)).toBe(false);
    expect(validPaidSession(session, { ...order, shipping: null })).toBe(false);
  });
  it("rejects unpaid, wrong amount, wrong currency, test and another order", () => {
    for (const overrides of [
      { payment_status: "unpaid" },
      { amount_total: 150000 },
      { currency: "jpy" },
      { livemode: false },
      { metadata: { line_shop_order: "RZ-2" } },
      { client_reference_id: "RZ-2" },
    ])
      expect(validPaidSession({ ...session, ...overrides }, order)).toBe(false);
  });
});
describe("merchant order item lines (seller notifications)", () => {
  // 與 2026-11-13 實際訂單相同的品項組合：混合唐吉訶德與其他分類。
  const orderItems: ShopItem[] = [
    { productId: "DON-13-003", name: "唐吉訶德｜假睫毛 10對入（多款可選）", quantity: 1, unitPriceTwd: 286 },
    { productId: "DON-13-006", name: "唐吉訶德｜小蝦與腰果零食 57g", quantity: 2, unitPriceTwd: 112 },
    { productId: "DON-ES-001", name: "樂敦 Melano CC｜集中對策面膜 大容量 28枚", quantity: 1, unitPriceTwd: 171 },
    { productId: "SUP-0001", name: "關口醬油仙貝 85枚", quantity: 2, unitPriceTwd: 500 },
  ];
  const hints = new Map<string, MerchantItemHint>([
    ["DON-13-003", { catalog: "donki", flyerStores: "十三店・江坂店（兩店同價）" }],
    ["DON-13-006", { catalog: "donki", flyerStores: "十三店・江坂店（兩店同價）" }],
    ["DON-ES-001", { catalog: "donki", flyerStores: "江坂店限定" }],
    ["SUP-0001", { catalog: "supermarket" }],
  ]);
  it("renders product IDs on every line and store hints only for Donki items", () => {
    expect(merchantItemLines(orderItems, hints)).toBe(
      [
        "唐吉訶德｜假睫毛 10對入（多款可選）（DON-13-003）× 1 → 採買：十三店・江坂店（兩店同價）",
        "唐吉訶德｜小蝦與腰果零食 57g（DON-13-006）× 2 → 採買：十三店・江坂店（兩店同價）",
        "樂敦 Melano CC｜集中對策面膜 大容量 28枚（DON-ES-001）× 1 → 採買：江坂店限定",
        "關口醬油仙貝 85枚（SUP-0001）× 2",
      ].join("\n")
    );
  });
  it("adds an indented Japanese-name line only when the product has one", () => {
    const jpHints = new Map<string, MerchantItemHint>([
      [
        "DON-13-003",
        {
          catalog: "donki",
          flyerStores: "十三店・江坂店（兩店同價）",
          jp: "アイラッシュ 各種",
        },
      ],
      // jp 只有空白時視同沒有，不產生空行。
      [
        "DON-13-006",
        {
          catalog: "donki",
          flyerStores: "十三店・江坂店（兩店同價）",
          jp: "　",
        },
      ],
      ["SUP-0001", { catalog: "supermarket", jp: "醤油仙貝 85枚" }],
    ]);
    expect(merchantItemLines(orderItems, jpHints)).toBe(
      [
        "唐吉訶德｜假睫毛 10對入（多款可選）（DON-13-003）× 1 → 採買：十三店・江坂店（兩店同價）",
        "　日文名：アイラッシュ 各種",
        "唐吉訶德｜小蝦與腰果零食 57g（DON-13-006）× 2 → 採買：十三店・江坂店（兩店同價）",
        // DON-ES-001 不在 jpHints 裡：分店退回前綴判斷，也沒有日文名行。
        "樂敦 Melano CC｜集中對策面膜 大容量 28枚（DON-ES-001）× 1 → 採買：江坂店限定",
        "關口醬油仙貝 85枚（SUP-0001）× 2",
        "　日文名：醤油仙貝 85枚",
      ].join("\n")
    );
  });
  it("falls back to the ID prefix when the product row has no flyerStores", () => {
    expect(donkiStoreHint("DON-ES-099")).toBe("江坂店限定");
    expect(donkiStoreHint("DON-13-099", { catalog: "donki" })).toBe(
      "十三店・江坂店（兩店同價）"
    );
    expect(
      merchantItemLines(
        [{ productId: "DON-ES-099", name: "唐吉訶德｜測試商品", quantity: 3, unitPriceTwd: 100 }],
        new Map()
      )
    ).toBe("唐吉訶德｜測試商品（DON-ES-099）× 3 → 採買：江坂店限定");
  });
  it("never adds a store hint for non-Donki catalogs", () => {
    expect(donkiStoreHint("M001", { catalog: "shop" })).toBeNull();
    expect(
      donkiStoreHint("COSTCO-1", { catalog: "costco", flyerStores: "十三店" })
    ).toBeNull();
  });
});
