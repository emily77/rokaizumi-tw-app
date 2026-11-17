/**
 * 資料庫開機自檢
 *
 * 全新的資料庫沒有任何資料表，即使連線成功，所有查詢仍會失敗並退回靜態檔。
 * Render 免付費方案沒有 One-off Jobs，Web Shell 也不便自動化，
 * 因此把「建表 + 首次匯入」放在啟動流程：偵測到缺表才執行，
 * 之後每次開機都會直接跳過。
 */

import fs from 'fs';
import path from 'path';

/** 資料表是否已存在 */
async function tableExists(pool: any, name: string): Promise<boolean> {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
    [name]
  );
  return Number(rows?.[0]?.n ?? 0) > 0;
}

/**
 * 讓 SQL 相容 TiDB。
 *
 * drizzle 會為 json 欄位產生 `DEFAULT ('[]')`，TiDB 不允許 json/blob/text
 * 使用預設值，整道 ALTER 會因語法錯誤失敗，導致 images 欄位建不出來，
 * 後續所有查詢（SELECT 會列出該欄位）跟著失敗。
 * 去掉預設值後結果一致——後面的 migration 本來就會 MODIFY 成無預設。
 */
function toTiDBCompatible(sql: string): string {
  return sql.replace(/(`?\w+`?\s+json)\s+DEFAULT\s*\([^)]*\)/gi, '$1');
}

/**
 * 把 migration 檔切成單一語句。
 *
 * drizzle-kit 產生的檔案用 `--> statement-breakpoint` 分隔，但手寫的
 * 0013_v4_additions.sql 沒有標記，整份檔案會被當成一句送出去而語法錯誤，
 * 導致 newsletter_subscribers / b2b_inquiries / product_reviews 三張表
 * 永遠建不起來。這裡兩種格式都支援：逐字元掃描，跳過註解與字串常值，
 * 遇到分號才切。
 */
function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let quote: string | null = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
        current += ch;
      }
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (quote) {
      current += ch;
      if (ch === '\\') {
        current += next ?? '';
        i++;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '-' && next === '-') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === ';') {
      statements.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  statements.push(current);

  return statements.map(s => s.trim()).filter(Boolean);
}

/** 依序套用 drizzle 產生的 migration SQL */
async function applyMigrations(pool: any) {
  const dir = ['drizzle', '../drizzle', '../../drizzle']
    .map(d => path.resolve(process.cwd(), d))
    .find(d => fs.existsSync(d));

  if (!dir) {
    console.warn('⚠️  找不到 drizzle 目錄，略過建表');
    return;
  }

  const files = fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`🔧 開始建立資料表（${files.length} 個 migration）`);

  for (const file of files) {
    const sql = toTiDBCompatible(fs.readFileSync(path.join(dir, file), 'utf-8'));
    const statements = splitStatements(sql);

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (e: any) {
        // 欄位/資料表已存在屬正常（重複套用），其餘才需要記錄
        const code = e?.code ?? '';
        if (
          code === 'ER_TABLE_EXISTS_ERROR' ||
          code === 'ER_DUP_FIELDNAME' ||
          code === 'ER_DUP_KEYNAME' ||
          code === 'ER_CANT_DROP_FIELD_OR_KEY'
        ) {
          continue;
        }
        console.warn(`   ⚠️  ${file}: ${e.message?.slice(0, 100)}`);
      }
    }
  }
  console.log('✅ 資料表建立完成');
}

/**
 * 讀取商品資料。
 *
 * public 底下的 products.json 是給前端列表用的精簡版，為了體積把
 * description 拆走了；匯入資料庫要讀 data/products-full.json，
 * 否則 1409 筆商品說明會全部寫成空字串。
 */
function loadProductsJson() {
  const file = [
    'data/products-full.json',
    'dist/public/products.json',
    'server/public/products.json',
    'client/public/products.json',
  ]
    .map(p => path.resolve(process.cwd(), p))
    .find(p => fs.existsSync(p));
  return file ? JSON.parse(fs.readFileSync(file, 'utf-8')) : null;
}

/**
 * 回填 jan / code / nameJa / nameEn / origin / priceJpy。
 *
 * 這些欄位是後來才加進資料表的，先前匯入的商品全部是空的；
 * 其中 JAN 條碼有 1374 筆，缺了會影響商品辨識與後續對帳。
 */
async function backfillProductFields(pool: any) {
  const [[{ ids }]]: any = await pool.query(
    "SELECT COUNT(*) AS ids FROM products WHERE jan IS NULL AND code IS NULL"
  );
  const [[{ descs }]]: any = await pool.query(
    "SELECT COUNT(*) AS descs FROM products WHERE description IS NULL OR description = ''"
  );
  if (Number(ids) === 0 && Number(descs) === 0) return;

  const products = loadProductsJson();
  if (!products) return;

  console.log(`🔧 回填商品資料（識別欄位 ${ids} 筆、商品說明 ${descs} 筆）…`);
  let done = 0;
  for (const p of products) {
    if (!p.jan && !p.code && !p.nameJa && !p.description) continue;
    try {
      const [r]: any = await pool.query(
        'UPDATE products SET jan = ?, code = ?, nameJa = ?, nameEn = ?, origin = ?, priceJpy = ?, ' +
          "description = COALESCE(NULLIF(?, ''), description) WHERE name = ?",
        [
          p.jan ?? null,
          p.code ?? null,
          p.nameJa ?? null,
          p.nameEn ?? null,
          p.origin ?? null,
          p.priceJpy ?? null,
          p.description ?? '',
          p.name,
        ]
      );
      if (r.affectedRows) done++;
    } catch {
      /* 單筆失敗不中斷 */
    }
  }
  console.log(`✅ 已回填 ${done} 筆`);
}

/** 商品表是空的就把 products.json 匯進去 */
async function seedProducts(pool: any) {
  const [[{ n }]]: any = await pool.query('SELECT COUNT(*) AS n FROM products');
  if (Number(n) > 0) {
    console.log(`ℹ️  資料庫已有 ${n} 筆商品，略過匯入`);
    await backfillProductFields(pool);
    return;
  }

  const products = loadProductsJson();
  if (!products) {
    console.warn('⚠️  找不到 products.json，略過匯入');
    return;
  }

  console.log(`📦 匯入 ${products.length} 筆商品…`);

  // categories.name 有唯一鍵，而上一次執行可能已經寫入部分分類
  // （商品匯入失敗但分類已成功），這裡用 INSERT IGNORE 讓重複執行安全。
  const names = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)));
  for (const name of names) {
    await pool.query('INSERT IGNORE INTO categories (name, description) VALUES (?, ?)', [
      name,
      `分類: ${name}`,
    ]);
  }
  const [cats]: any = await pool.query('SELECT id, name FROM categories');
  const catId = new Map(cats.map((c: any) => [c.name, c.id]));

  let done = 0;
  for (const p of products) {
    const cid = catId.get(p.category);
    if (!cid) continue;
    try {
      await pool.query(
        'INSERT INTO products (name, jan, code, nameJa, nameEn, origin, priceJpy, description, price, categoryId, imageUrl, images, status, specifications, stock) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          p.name,
          p.jan ?? null,
          p.code ?? null,
          p.nameJa ?? null,
          p.nameEn ?? null,
          p.origin ?? null,
          p.priceJpy ?? null,
          p.description ?? '',
          p.price ?? 0,
          cid,
          p.imageUrl ?? '',
          JSON.stringify(p.images ?? []),
          p.status ?? 'available',
          p.specifications ?? '',
          99,
        ]
      );
      done++;
    } catch {
      /* 單筆失敗不中斷整批 */
    }
  }
  console.log(`✅ 已匯入 ${done} 筆商品、${catId.size} 個分類`);
}


/**
 * 介護目錄一次性整理（2026-11-17，data_jobs 標記後不再重跑）：
 * 1. 介護 11 分類＋銀髮親子的商品價格全數歸零——本站已有「價格待確認」
 *    機制（price 非正數即顯示『價格待確認，請聯絡我們』且不可下單），
 *    歸零後這些商品一律改走詢價，不再顯示搬運自日本目錄的參考價。
 * 2. 同商品的顏色／尺寸變體合併為一筆：保留一筆改名並在規格註明
 *    款式，其餘刪除；已被訂單／購物車／評論／願望清單參照的列不刪。
 */
async function cleanupCareCatalog(pool: any) {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS data_jobs (name VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  );
  const [[{ n }]]: any = await pool.query(
    "SELECT COUNT(*) AS n FROM data_jobs WHERE name = 'care-catalog-cleanup-2026-11-17'"
  );
  if (Number(n) > 0) return;

  const careCategories = ['拐杖', '助行器', '介護鞋', '輪椅移位', '入浴用品', '如廁照護', '成人紙尿褲', '介護床寢具', '防褥瘡', '安全扶手', '餐具圍兜', '銀髮親子'];
  const [priceRes]: any = await pool.query(
    'UPDATE products SET price = 0 WHERE price <> 0 AND categoryId IN (SELECT id FROM categories WHERE name IN (?))',
    [careCategories]
  );
  console.log(`🧹 介護目錄整理：${priceRes.affectedRows} 筆商品價格改為詢價（歸零）`);

  const merges: { keeper: string; newName: string; note: string; remove: string[] }[] = [
    {
      keeper: 'サニーウォーカーSP（中） 島製作所 コンパクトタイプシルバーカー',
      newName: 'サニーウォーカーSP 島製作所 コンパクトタイプシルバーカー',
      note: 'サイズ：中・小',
      remove: [
        'サニーウォーカーSP（小） 島製作所 コンパクトタイプシルバーカー',
      ],
    },
    {
      keeper: '介護食器 曲げ曲げハンドルシリコンスポンジ付(スプーン・フォーク兼用大) 2本セット',
      newName: '介護食器 曲げ曲げハンドル シリコンスポンジ付 2本セット',
      note: '種類：スプーン／フォーク／スプーン・フォーク兼用、サイズ：大／小',
      remove: [
        '介護食器 曲げ曲げハンドルシリコンスポンジ付(スプーン・フォーク兼用小) 2本セット',
        '介護食器 曲げ曲げハンドルシリコンスポンジ付(フォーク小) 2本セット',
        '介護食器 曲げ曲げハンドルシリコンスポンジ付(スプーン小) 2本セット',
        '介護食器 曲げ曲げハンドルシリコンスポンジ付き（フォーク大） 2本セット',
        '介護食器 曲げ曲げハンドル シリコンスポンジ付き（スプーン大）2本セット',
      ],
    },
    {
      keeper: '[おうちモンテ] ぞうきん きいろ（モンテッソーリ知育 日常生活の練習／拭く）',
      newName: '[おうちモンテ] ぞうきん（モンテッソーリ知育 日常生活の練習／拭く）',
      note: 'カラー：ベージュ／きいろ／みずいろ／ピンク',
      remove: [
        '[おうちモンテ] ぞうきん ピンク（モンテッソーリ知育 日常生活の練習／拭く）',
        '[おうちモンテ] ぞうきん みずいろ（モンテッソーリ知育 日常生活の練習／拭く）',
        '[おうちモンテ] ぞうきん ベージュ（モンテッソーリ知育 日常生活の練習／拭く）',
      ],
    },
    {
      keeper: '[おうちモンテ] だいふきん ベージュ（モンテッソーリ知育 日常生活の練習／拭く）',
      newName: '[おうちモンテ] だいふきん（モンテッソーリ知育 日常生活の練習／拭く）',
      note: 'カラー：ベージュ／きいろ／みずいろ／ピンク',
      remove: [
        '[おうちモンテ] だいふきん ピンク（モンテッソーリ知育 日常生活の練習／拭く）',
        '[おうちモンテ] だいふきん みずいろ（モンテッソーリ知育 日常生活の練習／拭く）',
        '[おうちモンテ] だいふきん きいろ（モンテッソーリ知育 日常生活の練習／拭く）',
      ],
    },
  ];

  for (const m of merges) {
    const [rows]: any = await pool.query('SELECT specifications FROM products WHERE name = ?', [m.keeper]);
    if (rows.length > 0) {
      const spec = String(rows[0].specifications ?? '');
      const merged = spec.includes(m.note) ? spec : [spec, m.note].filter(Boolean).join(' / ');
      await pool.query('UPDATE products SET name = ?, specifications = ? WHERE name = ?', [
        m.newName,
        merged,
        m.keeper,
      ]);
      // 日文品名原本與品名相同時一併更新，避免日文介面還顯示舊的顏色／尺寸名
      await pool.query('UPDATE products SET nameJa = ? WHERE name = ? AND nameJa = ?', [
        m.newName,
        m.newName,
        m.keeper,
      ]);
    }
    for (const name of m.remove) {
      const [r]: any = await pool.query(
        `DELETE FROM products WHERE name = ?
           AND NOT EXISTS (SELECT 1 FROM orderItems WHERE orderItems.productId = products.id)
           AND NOT EXISTS (SELECT 1 FROM cartItems WHERE cartItems.productId = products.id)
           AND NOT EXISTS (SELECT 1 FROM reviews WHERE reviews.productId = products.id)
           AND NOT EXISTS (SELECT 1 FROM wishlists WHERE wishlists.productId = products.id)`,
        [name]
      );
      if (r.affectedRows) console.log(`🧹 已合併移除變體：${name}`);
    }
  }

  await pool.query("INSERT INTO data_jobs (name) VALUES ('care-catalog-cleanup-2026-11-17')");
  console.log('✅ 介護目錄整理完成');
}

/**
 * 事業計畫書指定仕入先產品上架（2026-11-17，data_jobs 標記後不再重跑）：
 * 自計畫書 5 家仕入先的官方商店／官方目錄核實的 23 項產品
 * （シナノ 6、ケープ 6、高田ベッド製作所 6、トリニティ 5）。
 * 比照介護區政策：本站價格歸零走詢價，日本官方定價存 priceJpy
 * 並註明於規格欄，僅供詢價時參考。品名已存在者不重複新增。
 */
async function seedSupplierProducts(pool: any) {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS data_jobs (name VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  );
  const [[{ n }]]: any = await pool.query(
    "SELECT COUNT(*) AS n FROM data_jobs WHERE name = 'supplier-products-2026-11-17'"
  );
  if (Number(n) > 0) return;

  const items: {
    name: string;
    code: string;
    category: string;
    priceJpy: number;
    imageUrl: string;
    specifications: string;
    description: string;
  }[] = [
    // 株式会社シナノ（公式オンラインストア）
    { name: 'やわらGELグリップ4点杖 TYPE-U', code: 'TAIS 01436-000009', category: '拐杖', priceJpy: 23000, imageUrl: 'https://sinano.co.jp/store/product/stick/yawaragel-type-u/type-u-01.webp', specifications: '型番：TAIS 01436-000009／メーカー：株式会社シナノ／日本参考価格：¥23,000（非課税）', description: 'GELグリップとオフセットネックを採用した4点杖。約525g、長さ70〜90cm対応。介護保険貸与対象品。' },
    { name: 'やわらGELグリップ4点杖', code: 'TAIS 01436-000007', category: '拐杖', priceJpy: 20000, imageUrl: 'https://kainos.jp/softgrip/images/YGG4_01.png', specifications: '型番：TAIS 01436-000007／メーカー：株式会社シナノ／日本参考価格：¥20,000（非課税）', description: '約380gの軽量4点杖。VESSEL×SINANO共同開発のGELグリップ採用。' },
    { name: 'しっかり2本杖', code: '184837304', category: '拐杖', priceJpy: 14300, imageUrl: 'https://sinano.co.jp/store/product/walking/shikkari2hon/shikkari2-02.webp', specifications: '商品番号：184837304（シナノオンラインストア）／メーカー：株式会社シナノ／日本参考価格：¥14,300（税込・2本1組）', description: '歩行サポートSG規格取得の2本杖。1本あたり耐荷重69kg、リハビリ歩行訓練にも。' },
    { name: '伸縮杖 結 -yui-', code: '158335444', category: '拐杖', priceJpy: 9900, imageUrl: 'https://sinano.co.jp/store/product/stick/yui/158335444_o6.webp', specifications: '商品番号：158335444（シナノオンラインストア）／メーカー：株式会社シナノ／日本参考価格：¥9,900（税込）', description: '公式ストア限定の伸縮杖。日本の伝統色 全12色、花梨木グリップ、約245g。' },
    { name: 'LUMINA ルミナ 折り畳み', code: '193549783', category: '拐杖', priceJpy: 26400, imageUrl: 'https://sinano.co.jp/store/product/stick/lumina/rumi-01.webp', specifications: '商品番号：193549783（シナノオンラインストア）／メーカー：株式会社シナノ／日本参考価格：¥26,400（税込）', description: '日本製折り畳み杖。光で色合いが変わるラメ調仕上げ、収納時約31cm、収納袋付き。' },
    { name: 'ベーシックライト', code: '153721112', category: '拐杖', priceJpy: 20900, imageUrl: 'https://sinano.co.jp/store/product/stick/basiclight/basiclight_img01.webp', specifications: '商品番号：153721112（シナノオンラインストア）／メーカー：株式会社シナノ／日本参考価格：¥20,900（税込）', description: '同社折り畳み杖で最軽量クラス（約250〜260g）。3段折り畳み、収納袋付き。' },
    // 株式会社ケープ（公式製品ページ）
    { name: 'マイクロクライメイト ネクサス アイビー', code: 'CR-770', category: '防褥瘡', priceJpy: 220000, imageUrl: 'https://www.cape.co.jp/wpMgr/wp-content/themes/cape/assets/img/products/pdt043/key/fig-key01-1.jpg', specifications: '型番：CR-770／CR-773／CR-775／CR-777／CR-781／メーカー：株式会社ケープ／日本参考価格：セット ¥220,000＋税（1000型 ¥240,000＋税）', description: 'ファンでマットレス内の熱と湿気を排出するエアマットレス。傾斜型2層エアセルで背上げ時のずれを軽減。' },
    { name: 'スモールチェンジ ラグーナ', code: 'CR-700', category: '防褥瘡', priceJpy: 258000, imageUrl: 'https://www.cape.co.jp/wpMgr/wp-content/themes/cape/assets/img/products/pdt001/fig-key1-1.png', specifications: '型番：CR-700／CR-703／CR-705／CR-707／CR-711／メーカー：株式会社ケープ／日本参考価格：セット ¥258,000（非課税、1000型 ¥278,000）', description: '自動で小さな対角線体位変換を行うエアマットレス。夜間の介護負担を軽減（体位変換器として非課税）。' },
    { name: 'エアドクター', code: 'CR-238', category: '防褥瘡', priceJpy: 125000, imageUrl: 'https://www.cape.co.jp/wpMgr/wp-content/themes/cape/assets/img/products/pdt005/fig01-1.jpg', specifications: '型番：CR-238／CR-268／メーカー：株式会社ケープ／日本参考価格：セット ¥125,000（税抜）', description: '体重設定ダイヤルとセンサーで自動圧力コントロール。20本のエアセルが交互に膨縮。' },
    { name: 'デュオジェルクッション', code: 'CK-385', category: '輪椅移位', priceJpy: 45000, imageUrl: 'https://www.cape.co.jp/wpMgr/wp-content/themes/cape/assets/img/products/pdt023/fig1-1.jpg', specifications: '型番：CK-385／CK-395／メーカー：株式会社ケープ／日本参考価格：¥45,000（税抜）', description: '車いす用クッション。後部ジェルでお尻を包み、前部TRUGELで大腿部を支えるU字構造で圧力を分散。' },
    { name: 'ドライアルファシーツ', code: 'CK-403', category: '介護床寢具', priceJpy: 8900, imageUrl: 'https://www.cape.co.jp/wpMgr/wp-content/themes/cape/assets/img/products/pdt028/fig1-1.jpg', specifications: '型番：CK-403 ¥8,900／CK-404 ¥11,500／CK-402 ¥5,000（いずれも税抜）／メーカー：株式会社ケープ', description: '吸水速乾素材「アクエアー®」のシーツ。汗や水分を素早く吸収し、丸洗い可能。' },
    { name: 'ケープ介助グローブ', code: 'CK-388', category: '輪椅移位', priceJpy: 2500, imageUrl: 'https://www.cape.co.jp/wpMgr/wp-content/themes/cape/assets/img/products/pdt030/fig1-1.jpg', specifications: '型番：CK-388／メーカー：株式会社ケープ／日本参考価格：¥2,500（税抜）', description: '体の下に手を差し入れてずれを直す介助用グローブ。滑りの良い素材で丸洗い可能。' },
    // 株式会社高田ベッド製作所（公式総合カタログ Vol.29）
    { name: 'HAマットレス', code: 'TB-1161', category: '介護床寢具', priceJpy: 39000, imageUrl: '', specifications: '型番：TB-1161／メーカー：株式会社高田ベッド製作所／日本参考価格：¥39,000（税別）', description: '適度な硬さのマットレス。綿100%の側地は洗濯可能、厚さ6cm。' },
    { name: 'ロングパラレルDX（01）', code: 'TB-1078-01', category: '助行器', priceJpy: 190000, imageUrl: '', specifications: '型番：TB-1078-01／メーカー：株式会社高田ベッド製作所／日本参考価格：¥190,000（税別）', description: 'ステンレス製平行棒。高さ15段階ラチェット昇降、握り幅は無段階調節。歩行訓練用。' },
    { name: '介助シート', code: 'TB-981', category: '輪椅移位', priceJpy: 14800, imageUrl: '', specifications: '型番：TB-981／メーカー：株式会社高田ベッド製作所／日本参考価格：¥14,800（税別）', description: '8か所の持ち手付き移乗・搬送介助シート。ナイロン製防水仕様、48×170cm。' },
    { name: '体位変換マット', code: 'TB-77-69', category: '防褥瘡', priceJpy: 9100, imageUrl: '', specifications: '型番：TB-77-69／メーカー：株式会社高田ベッド製作所／日本参考価格：¥9,100（税別）', description: '三角枕2個セットの体位変換マット。綿100%で洗濯可能。' },
    { name: 'トイレ補助手すり', code: 'TB-1426', category: '如廁照護', priceJpy: 21000, imageUrl: '', specifications: '型番：TB-1426／メーカー：株式会社高田ベッド製作所／日本参考価格：¥21,000（税別）', description: '置くだけで使えるトイレ用立ち座り手すり。工事不要、高さ調整脚付き。' },
    { name: '車イス用安全ベルト', code: 'TB-1451', category: '輪椅移位', priceJpy: 7600, imageUrl: '', specifications: '型番：TB-1451／メーカー：株式会社高田ベッド製作所／日本参考価格：¥7,600（税別）', description: 'ワンタッチで装着できる車イス用安全ベルト。体格に合わせて調節可能（拘束用ではありません）。' },
    // 株式会社トリニティ（公式通販キテコ／TCマート取扱品）
    { name: '伸縮ジョイントレザーステッキ', code: 's0662', category: '拐杖', priceJpy: 8970, imageUrl: '', specifications: '商品番号：s0662／販売：株式会社トリニティ（キテコ）／日本参考価格：¥8,970', description: '長さ66〜96.5cm・13段階伸縮、約280gのアルミ製ステッキ。SGマーク取得、二重成型グリップ。' },
    { name: 'シルバーカー 軽量 アソシエ ゼブラ・デイジー・牡丹', code: 'ws0234', category: '助行器', priceJpy: 13360, imageUrl: 'https://item-shopping.c.yimg.jp/i/j/tc-mart_ws0234', specifications: '商品番号：ws0234／販売：株式会社トリニティ（キテコ）／日本参考価格：¥13,360', description: '約3.15kgの超軽量折りたたみシルバーカー。LEDライトと杖・傘ホルダー付き、SGマーク取得。' },
    { name: '介護用三輪歩行器 ターンウォーカー', code: 'wh0276', category: '助行器', priceJpy: 21870, imageUrl: 'https://item-shopping.c.yimg.jp/i/j/tc-mart_wh0276', specifications: '商品コード：wh0276／販売：株式会社トリニティ（キテコ）／日本参考価格：¥21,870', description: '小回りの利く三輪歩行器。大型ブレーキレバー、高さ5段階調節、折りたたみ収納可能、6.15kg。' },
    { name: '車椅子 軽量 折りたたみ コンパクト アルミ超軽量折り畳み介助用ハンディライトプラス', code: 'kc0021', category: '輪椅移位', priceJpy: 42670, imageUrl: 'https://item-shopping.c.yimg.jp/i/j/tc-mart_kc0021', specifications: '商品コード：kc0021／メーカー：ユーキ・トレーディング／販売：株式会社トリニティ（キテコ）／日本参考価格：¥42,670', description: '約8.2kgの超軽量アルミ製介助用車椅子。折りたたみ幅25cm、収納袋と介助ブレーキ付き。' },
    { name: '介護用品 靴すたこらさんソフト 05', code: 'sh0218-2z', category: '介護鞋', priceJpy: 6530, imageUrl: 'https://item-shopping.c.yimg.jp/i/j/tc-mart_sh0218-2z', specifications: '商品コード：sh0218-2z／販売：株式会社トリニティ（キテコ）／日本参考価格：¥6,530', description: '柔らかく履きやすい高齢者向け屋外用介護靴。' },
  ];

  let added = 0;
  for (const it of items) {
    const [r]: any = await pool.query(
      `INSERT INTO products (name, jan, code, nameJa, nameEn, origin, priceJpy, description, price, categoryId, imageUrl, images, status, specifications, stock)
       SELECT ?, NULL, ?, ?, NULL, '日本', ?, ?, 0, c.id, ?, ?, 'available', ?, 99
       FROM categories c WHERE c.name = ?
         AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = ?)`,
      [
        it.name,
        it.code,
        it.name,
        it.priceJpy,
        it.description,
        it.imageUrl,
        JSON.stringify(it.imageUrl ? [it.imageUrl] : []),
        it.specifications,
        it.category,
        it.name,
      ]
    );
    if (r.affectedRows) added++;
  }

  await pool.query("INSERT INTO data_jobs (name) VALUES ('supplier-products-2026-11-17')");
  console.log(`✅ 仕入先產品上架完成：新增 ${added} 筆`);
}

/**
 * 啟動時呼叫。失敗只記錄不拋出——回退機制仍會讓網站正常運作，
 * 不該因為初始化問題導致整個服務起不來。
 */
export async function bootstrapDatabase(pool: any) {
  if (!pool) return;
  try {
    // 每次都完整套用一次 migration。已存在的資料表與欄位會被忽略，
    // 所以重複執行是安全的；而「表存在就整批跳過」的話，
    // 一旦某道 ALTER 曾經失敗（例如 TiDB 不接受的語法），
    // 缺掉的欄位就永遠補不回來。
    const fresh = !(await tableExists(pool, 'products'));
    console.log(fresh ? '🆕 偵測到全新資料庫，開始初始化' : '🔄 檢查資料表結構');
    await applyMigrations(pool);
    await seedProducts(pool);
    await cleanupCareCatalog(pool);
    await seedSupplierProducts(pool);
  } catch (e) {
    console.error('❌ 資料庫初始化失敗:', (e as Error).message);
  }
}
