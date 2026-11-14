import { Link } from "wouter";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  CreditCard,
  HeartHandshake,
  Mail,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const LINE_FRIEND_URL = "https://line.me/R/ti/p/@rokaizumi";
const CONTACT_EMAIL = "info@rokaizumi-tw.jp";
const CARE_LIST_URL = "/products?category=care";

const CATEGORIES = [
  { name: "銀髮親子", count: 38 },
  { name: "拐杖", count: 20 },
  { name: "助行器", count: 20 },
  { name: "介護鞋", count: 20 },
  { name: "輪椅移位", count: 20 },
  { name: "入浴用品", count: 20 },
  { name: "如廁照護", count: 20 },
  { name: "成人紙尿褲", count: 20 },
  { name: "介護床寢具", count: 20 },
  { name: "防褥瘡", count: 20 },
  { name: "安全扶手", count: 20 },
  { name: "餐具圍兜", count: 20 },
] as const;

const SERVICES = [
  {
    title: "依情境分類整理",
    desc: "日本國內流通的介護・生活支援商品，依使用情境分類整理，商品頁標示規格與價格，先看懂再下單。",
  },
  {
    title: "先諮詢，再選品",
    desc: "不確定長輩適合哪一類，先用 LINE 或 email 說明使用情境，我們協助對照分類選品。",
  },
  {
    title: "家庭與機構都可洽詢",
    desc: "家庭自用與機構批量採購都可洽詢；批量採購另走 B2B 詢價。",
  },
] as const;

const STEPS = [
  {
    icon: Search,
    title: "選品或詢價",
    desc: "從商品頁選購，或用 LINE／email 告訴我們需求。",
  },
  {
    icon: ClipboardList,
    title: "確認報價",
    desc: "確認商品、數量與國際運費報價。",
  },
  {
    icon: CreditCard,
    title: "線上付款",
    desc: "報價確認後，再線上付款。",
  },
  {
    icon: Truck,
    title: "日本寄出・配送到台灣",
    desc: "從日本寄出、配送到台灣。詳細條件以商品頁與特定商取引法頁面為準。",
  },
] as const;

const FAQS = [
  {
    q: "配送範圍？",
    a: "以台灣為主，下單／詢價時會再確認配送地址與條件。",
  },
  {
    q: "運費怎麼算？",
    a: "依商品與數量報價，確認後才付款。",
  },
  {
    q: "可以先諮詢再買嗎？",
    a: `可以。LINE 公式アカウント @rokaizumi 或 email ${CONTACT_EMAIL}，說明使用情境即可。`,
  },
  {
    q: "退換貨？",
    a: "依官網特定商取引法頁面標示辦理；商品保固依各商品頁標示。",
  },
] as const;

export function Care() {
  return (
    <div className="min-h-screen bg-[#f5fafe] scroll-smooth">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#001f52] via-[#013873] to-[#0b6fb3] text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(60% 80% at 78% 18%, rgba(35,167,229,0.35) 0%, rgba(35,167,229,0) 70%), radial-gradient(45% 60% at 12% 85%, rgba(96,165,250,0.25) 0%, rgba(96,165,250,0) 70%)",
            }}
          />
          <div className="relative container mx-auto px-4 py-14 sm:py-20">
            <p className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-sky-200 sm:text-base">
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
              ろかいずみ合同会社｜介護用品・福祉用具の輸出入及び販売
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl leading-snug font-extrabold sm:text-4xl lg:text-[2.75rem]">
              職人厳選介護用品
              <br className="hidden sm:block" />
              日本の介護用品を、台湾のご家庭と施設へ
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sky-100/90 sm:text-base">
              ろかいずみ合同会社は大阪を拠点とし、日本の介護用品・福祉用具を選定して台湾へ輸出・販売しています。在宅介護のご家庭から施設まで、用途に合わせた商品をご案内します。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#categories"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#014488] shadow-lg shadow-sky-900/30 transition hover:bg-sky-50 sm:text-base"
              >
                商品を見る{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={LINE_FRIEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#06C755] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#05A948] sm:text-base"
              >
                LINEで相談する
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 sm:text-base"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                メールで問い合わせ
              </a>
            </div>
          </div>
        </section>

        {/* 取扱分類 */}
        <section
          id="categories"
          aria-label="取扱分類"
          className="container scroll-mt-24 mx-auto px-4 py-12 sm:py-16"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            取扱分類
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            經銷分類・全 12 分類、約 258 品項
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                href={CARE_LIST_URL}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span>
                  <span className="block text-base font-extrabold text-slate-900 sm:text-lg">
                    {cat.name}
                  </span>
                  <span className="mt-0.5 block text-xs font-bold text-slate-400">
                    約 {cat.count} 品項
                  </span>
                </span>
                <ArrowRight
                  className="h-5 w-5 shrink-0 text-[#014488] transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            點選分類會前往介護用品商品列表，可在列表頁再依分類勾選篩選。
          </p>
        </section>

        {/* 選品與服務 */}
        <section
          aria-label="選品與服務"
          className="container mx-auto px-4 pb-12 sm:pb-16"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            選品與服務
          </h2>
          <p className="mt-1 text-sm text-slate-500">選定とサポート</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {SERVICES.map(s => (
              <div
                key={s.title}
                className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#014488] text-white">
                  <PackageCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-extrabold text-slate-900 sm:text-lg">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 購買流程 */}
        <section
          aria-label="購買流程"
          className="container mx-auto px-4 pb-12 sm:pb-16"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            購買流程
          </h2>
          <p className="mt-1 text-sm text-slate-500">購入の流れ</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b6fb3] text-white">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-2xl font-extrabold text-sky-200">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-extrabold text-slate-900 sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 法人・施設向け */}
        <section
          aria-label="法人・施設向け"
          className="container mx-auto px-4 pb-12 sm:pb-16"
        >
          <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sky-100 sm:p-10 lg:flex-row lg:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0ABAB5] text-white">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                法人・施設向け（B2B）
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                台灣介護機構、經銷商的批量採購，可透過企業採購頁面或 email
                詢價，我們會依品項與數量回覆報價。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/b2b"
                className="inline-flex items-center gap-2 rounded-xl bg-[#014488] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#013873]"
              >
                企業採購・B2B{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-200 px-5 py-3 text-sm font-bold text-[#014488] transition hover:bg-sky-50"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email 詢價
              </a>
            </div>
          </div>
        </section>

        {/* 常見問題 */}
        <section
          aria-label="常見問題"
          className="container mx-auto px-4 pb-12 sm:pb-16"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            常見問題
          </h2>
          <p className="mt-1 text-sm text-slate-500">よくある質問</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {FAQS.map(f => (
              <div
                key={f.q}
                className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"
              >
                <h3 className="text-base font-extrabold text-[#014488] sm:text-lg">
                  Q. {f.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* お問い合わせ */}
        <section
          aria-label="お問い合わせ"
          className="container mx-auto px-4 pb-14 sm:pb-20"
        >
          <div className="rounded-3xl bg-gradient-to-br from-[#001f52] to-[#0b6fb3] p-8 text-center text-white sm:p-10">
            <h2 className="text-xl font-extrabold sm:text-2xl">お問い合わせ</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-sky-100/90">
              介護用品の選定・購入に関するご相談は、LINE
              公式アカウントまたはメールからお気軽にご連絡ください。
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={LINE_FRIEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#06C755] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#05A948]"
              >
                LINE公式アカウント @rokaizumi
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#014488] shadow-lg shadow-sky-900/30 transition hover:bg-sky-50"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {CONTACT_EMAIL}
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                トップページに戻る
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default Care;
