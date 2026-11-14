import { Link } from "wouter";
import {
  ArrowRight,
  Building2,
  Cpu,
  Flame,
  HeartHandshake,
  Mail,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const LINE_FRIEND_URL = "https://line.me/R/ti/p/@rokaizumi";
const CONTACT_EMAIL = "info@rokaizumi-tw.jp";

const BUSINESSES = [
  {
    icon: Cpu,
    title: "林博AI（AI研究開発・DXコンサルティング）",
    desc: "ABC_YPCloud 日本向けAIブレインの研究開発と、企業向けAI戦略・デジタル変革のコンサルティング。林吟芝博士がプロジェクトを主導しています。",
    href: "/linbo-ai",
    external: true,
    linkLabel: "林博AIについて",
  },
  {
    icon: Flame,
    title: "手作りキャンドルの製造・販売",
    desc: "大阪で手作りするキャンドル「ROKA IZUMI」を、オーストラリアのお客様へ販売しています（20種類から5個・A$99、送料込み）。",
    href: "/candles/",
    external: true,
    linkLabel: "キャンドルを見る",
  },
  {
    icon: ShoppingBag,
    title: "日本厳選商品の越境販売",
    desc: "LINEショップ「ROKA IZUMI｜日本厳選商店」を通じて、日本の生活用品・食品等を台湾のお客様へお届けしています。",
    href: "/line-shop/",
    external: true,
    linkLabel: "LINEショップを見る",
  },
  {
    icon: HeartHandshake,
    title: "介護用品の輸出・販売",
    desc: "日本の介護用品・生活支援用品を選定し、台湾のご家庭・施設へお届けしています（取扱い12分類・約250点）。",
    href: "/care",
    external: false,
    linkLabel: "介護用品のご案内",
  },
  {
    icon: PackageCheck,
    title: "卸売",
    desc: "山田化学・KOKUBO等の日本製品の卸売カタログを取り扱っています。",
    href: "/ag",
    external: false,
    linkLabel: "卸売カタログを見る",
  },
] as const;

const PROFILE_ROWS = [
  { label: "商号", value: "ろかいずみ合同会社" },
  { label: "法人番号", value: "3120003031622" },
  { label: "代表社員", value: "羅暐婷" },
  {
    label: "所在地",
    value: "大阪市淀川区西中島六丁目10番1号 ストークマンション西中島5階",
  },
  { label: "設立", value: "2026年1月5日" },
  {
    label: "資本金",
    value: "¥5,000,000（増資手続き中：完了後に ¥16,000,000 へ更新）",
  },
  { label: "営業時間", value: "月曜日–金曜日 10:00–16:00" },
  {
    label: "お問い合わせ",
    value: "info@rokaizumi-tw.jp／LINE公式アカウント @rokaizumi",
  },
] as const;

export default function About() {
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
              <Building2 className="h-5 w-5" aria-hidden="true" />
              会社案内｜About
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl leading-snug font-extrabold sm:text-4xl lg:text-[2.75rem]">
              ろかいずみ合同会社について
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sky-100/90 sm:text-base">
              ろかいずみ合同会社は、大阪市淀川区を拠点とする合同会社です。AIの研究開発とコンサルティング、日本の商品の越境販売を軸に事業を行っています。
            </p>
          </div>
        </section>

        {/* 事業内容 */}
        <section
          aria-label="事業内容"
          className="container mx-auto px-4 py-12 sm:py-16"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            事業内容
          </h2>
          <p className="mt-1 text-sm text-slate-500">Our Businesses</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BUSINESSES.map(b => {
              const inner = (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#014488] text-white">
                    <b.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-base font-extrabold text-slate-900 sm:text-lg">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {b.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#014488]">
                    {b.linkLabel}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </>
              );
              const cls =
                "group block rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg";
              return b.external ? (
                <a key={b.title} href={b.href} className={cls}>
                  {inner}
                </a>
              ) : (
                <Link key={b.title} href={b.href} className={cls}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        {/* 会社概要 */}
        <section
          aria-label="会社概要"
          className="container mx-auto px-4 pb-12 sm:pb-16"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            会社概要
          </h2>
          <p className="mt-1 text-sm text-slate-500">Company Profile</p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm sm:text-base">
              <tbody>
                {PROFILE_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i > 0 ? "border-t border-sky-100" : ""}
                  >
                    <th className="w-36 bg-[#f0f7fe] px-5 py-4 align-top font-extrabold text-slate-900 sm:w-48">
                      {row.label}
                    </th>
                    <td className="px-5 py-4 leading-relaxed text-slate-700">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* お問い合わせ */}
        <section
          aria-label="お問い合わせ"
          className="container mx-auto px-4 pb-14 sm:pb-20"
        >
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-sky-100 sm:p-10">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              お問い合わせ
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              事業・商品に関するお問い合わせは、メールまたは LINE
              公式アカウントよりお願いいたします。
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/care"
                className="inline-flex items-center gap-2 rounded-xl bg-[#014488] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition hover:bg-[#013873] sm:text-base"
              >
                商品を見る{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={LINE_FRIEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#06C755] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#05A948] sm:text-base"
              >
                LINEで問い合わせ
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-5 py-3 text-sm font-bold text-[#014488] transition hover:bg-sky-50 sm:text-base"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                メールで問い合わせ
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
