import { Link } from "wouter";
import {
  ArrowRight,
  Building2,
  Cpu,
  Flame,
  HeartHandshake,
  Mail,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const LINE_FRIEND_URL = "https://line.me/R/ti/p/@rokaizumi";
const CONTACT_EMAIL = "info@rokaizumi-tw.jp";

const MAIN_BUSINESSES = [
  {
    icon: Cpu,
    color: "#014488",
    title: "林博AI",
    subtitle: "企業 AI 顧問與研發",
    desc: "ABC_YPCloud 日本向けAIブレインの研究開発／企業向けAI戦略・DXコンサルティング（林吟芝博士主導）",
    href: "/linbo-ai",
    linkLabel: "林博AIについて",
  },
  {
    icon: Flame,
    color: "#C0562F",
    title: "手作りキャンドル ROKA IZUMI",
    subtitle: "手工蠟燭・澳洲販售",
    desc: "大阪で手作りするキャンドルをオーストラリアへ。20種類から5個選んで A$99（送料込み）、カード決済対応",
    href: "/candles/",
    linkLabel: "キャンドルを見る",
  },
] as const;

const COMPANY_ROWS = [
  { label: "商号", value: "ろかいずみ合同会社" },
  { label: "法人番号", value: "3120003031622" },
  { label: "代表社員", value: "羅暐婷" },
  {
    label: "所在地",
    value: "大阪市淀川区西中島六丁目10番1号 ストークマンション西中島5階",
  },
  { label: "資本金", value: "¥5,000,000" },
  { label: "営業時間", value: "月曜日–金曜日 10:00–16:00" },
  {
    label: "お問い合わせ",
    value: `${CONTACT_EMAIL}・LINE @rokaizumi`,
  },
  {
    label: "事業内容",
    value:
      "AI研究開発・DXコンサルティング、手作りキャンドルの製造・販売、日本商品の越境販売・購入代行、卸売",
  },
] as const;

export function PortalHome() {
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
            <p className="text-sm font-bold tracking-widest text-sky-200 sm:text-base">
              ろかいずみ合同会社（ROKA IZUMI LLC）
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl leading-snug font-extrabold sm:text-4xl lg:text-[2.75rem]">
              日本の商品と産業を、AIとブロックチェーンでつなぐ
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sky-100/90 sm:text-base">
              大阪を拠点に、AI研究開発と日本商品の越境販売を行う合同会社です。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#business"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#014488] shadow-lg shadow-sky-900/30 transition hover:bg-sky-50 sm:text-base"
              >
                事業内容を見る{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 sm:text-base"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                お問い合わせ
              </a>
            </div>
          </div>
        </section>

        {/* 事業内容 */}
        <section
          id="business"
          aria-label="事業内容"
          className="container scroll-mt-24 mx-auto px-4 py-12 sm:py-16"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            事業内容
          </h2>
          <p className="mt-1 text-sm text-slate-500">我們的業務</p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {MAIN_BUSINESSES.map(b => (
              <a
                key={b.href}
                href={b.href}
                className="group flex flex-col rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-900/10"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: b.color }}
                >
                  <b.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900 sm:text-xl">
                  {b.title}
                </h3>
                <p className="mt-0.5 text-xs font-bold text-slate-400">
                  {b.subtitle}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {b.desc}
                </p>
                <span
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold"
                  style={{ color: b.color }}
                >
                  {b.linkLabel}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </a>
            ))}

            {/* LINEショップ（カード内に LINE 友だち追加リンクがあるため、全面リンクはオーバーレイ方式） */}
            <div className="group relative flex flex-col rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-900/10">
              <a
                href="/line-shop/"
                aria-label="LINEショップ「ROKA IZUMI｜日本厳選商店」を見る"
                className="absolute inset-0 rounded-2xl"
              />
              <div className="pointer-events-none flex flex-1 flex-col">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#06C755] text-white">
                  <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900 sm:text-xl">
                  LINEショップ「ROKA IZUMI｜日本厳選商店」
                </h3>
                <p className="mt-0.5 text-xs font-bold text-slate-400">
                  日本嚴選・代購
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                  ドン・キホーテ、コストコ等の日本商品を台湾のお客様へ。購入代行・厳選販売
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#06C755]">
                  ショップを見る
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <a
                href={LINE_FRIEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#06C755]/10 px-3 py-2 text-xs font-bold text-[#04953F] transition hover:bg-[#06C755]/20"
              >
                LINE公式アカウント @rokaizumi
              </a>
            </div>
          </div>

          {/* その他の入口 */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0ABAB5] text-white">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-base font-extrabold text-slate-900 sm:text-lg">
                卸売・B2B
              </h3>
              <p className="mt-0.5 text-xs font-bold text-slate-400">
                批發・企業採購
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/ag"
                  className="rounded-lg bg-[#0ABAB5]/10 px-3 py-2 text-sm font-bold text-[#087F7B] transition hover:bg-[#0ABAB5]/20"
                >
                  山田化學
                </Link>
                <Link
                  href="/koku"
                  className="rounded-lg bg-[#DC2626]/10 px-3 py-2 text-sm font-bold text-[#B91C1C] transition hover:bg-[#DC2626]/20"
                >
                  KOKUBO
                </Link>
                <Link
                  href="/b2b"
                  className="rounded-lg border border-[#E26D5C] px-3 py-2 text-sm font-bold text-[#E26D5C] transition hover:bg-[#E26D5C]/10"
                >
                  企業採購
                </Link>
              </div>
            </div>

            <Link
              href="/products?category=care"
              className="group block rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#014488] text-white">
                <HeartHandshake className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-base font-extrabold text-slate-900 sm:text-lg">
                職人厳選 介護用品
              </h3>
              <p className="mt-0.5 text-xs font-bold text-slate-400">
                嚴選介護用品
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#014488]">
                商品を見る
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>

            <Link
              href="/women"
              className="group block rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C49A5E] text-white">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-base font-extrabold text-slate-900 sm:text-lg">
                女性向けセレクション
              </h3>
              <p className="mt-0.5 text-xs font-bold text-slate-400">
                屬於女人的方向
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#A87F45]">
                商品を見る
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>
        </section>

        {/* 会社概要 */}
        <section
          id="company"
          aria-label="会社概要"
          className="container scroll-mt-24 mx-auto px-4 pb-12 sm:pb-16"
        >
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sky-100 sm:p-10">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              会社概要
            </h2>
            <p className="mt-1 text-sm text-slate-500">公司資料</p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-sky-100">
              <table className="w-full text-left text-sm sm:text-base">
                <tbody>
                  {COMPANY_ROWS.map((row, i) => (
                    <tr
                      key={row.label}
                      className={i % 2 === 0 ? "bg-[#f0f7fe]" : "bg-white"}
                    >
                      <th
                        scope="row"
                        className="w-32 shrink-0 px-4 py-3 align-top font-bold text-[#014488] sm:w-44 sm:px-5"
                      >
                        {row.label}
                      </th>
                      <td className="px-4 py-3 leading-relaxed text-slate-700 sm:px-5">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              事業・商品に関するご相談は、メールまたは LINE
              公式アカウントからお気軽にご連絡ください。
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#014488] shadow-lg shadow-sky-900/30 transition hover:bg-sky-50"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={LINE_FRIEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#06C755] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#05A948]"
              >
                LINE公式アカウント @rokaizumi
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default PortalHome;
