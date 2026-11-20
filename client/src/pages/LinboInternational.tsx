import { PortalNavigation } from "@/components/PortalNavigation";
import { SiteFooter } from "@/components/SiteFooter";

const copy = {
  cn: {
    name: "林吟芝博士", headline: "企业 AI 战略与数字转型顾问",
    intro: "结合跨行业经营、机房运维与经济学研究，协助企业设计可衡量、可管理的 AI 工作流程。",
    jump: "查看 ABC_YPCloud 日本研发进度",
    strengths: ["核心优势", "跨行业经营与跨境商务", "企业级 AI 架构、模型路由和用量治理", "数字资产制度研究、成本与风险管理"],
    progress: "日本 AI 大脑研发方向与进度",
    brain: "在用户授权下整理可搜索的记忆，从同一入口协调多个工具，并设计权限、导出与删除机制。先验证会议、决议、跟进和回复这条工作流程。",
    stages: ["已有部分基础服务的更新与健康检查记录。", "已梳理设备角色、任务分工和本地与云端协作架构。", "端到端演示、任务成效、装置相容性与日本试点仍待验证。"],
    projects: ["项目与应用", "企业资安与 AI 治理", "日本商品跨境运营与品牌开发", "直播共创、餐饮运营、日文培训与数字资产研究"],
    contact: "联系林博",
  },
  ja: {
    name: "林吟芝 博士", headline: "企業向けAI戦略・デジタル変革アドバイザー",
    intro: "事業運営、データセンター運用、経済学の知見を生かし、成果とコストを測定できるAI業務フローを設計します。",
    jump: "ABC_YPCloudの日本での研究開発を見る",
    strengths: ["専門分野", "複数業界での事業運営と越境ビジネス", "企業向けAI基盤、モデルの振り分け、利用量管理", "デジタル資産の制度研究、コスト・リスク管理"],
    progress: "日本向けAIブレインの開発方針と進捗",
    brain: "利用者の許可に基づいて検索可能な記憶を整理し、複数のツールを一つの窓口から利用できるようにします。権限管理、エクスポート、削除を設計し、まず会議から決定事項の追跡、返信までの流れを検証します。",
    stages: ["一部の基盤サービスで更新と稼働確認の記録があります。", "端末の役割、タスク分担、ローカルとクラウドの連携を設計しています。", "一連の動作デモ、タスクの成果、端末の互換性、日本での実証は今後の検証項目です。"],
    projects: ["プロジェクトと活用分野", "企業のセキュリティとAIガバナンス", "日本商品の越境販売とブランド開発", "ライブ制作、飲食店運営、日本語研修、デジタル資産の研究"],
    contact: "お問い合わせ",
  },
  en: {
    name: "Dr. Lin Yin-Chih", headline: "Enterprise AI strategy and digital transformation",
    intro: "Dr. Lin draws on business operations, data center management, and economics to design AI workflows with measurable results and manageable costs.",
    jump: "See ABC_YPCloud’s R&D progress in Japan",
    strengths: ["Areas of expertise", "Cross-industry operations and cross-border commerce", "Enterprise AI infrastructure, model routing, and usage controls", "Digital asset research, cost analysis, and risk management"],
    progress: "AI brain R&D direction and progress in Japan",
    brain: "With user authorization, ABC_YPCloud aims to organize searchable memory, coordinate tools through one interface, and let users manage access, export data, and delete it. The first workflow to validate follows a meeting from decisions through follow-up and replies.",
    stages: ["Some infrastructure services have documented updates and health checks.", "Device roles, task coordination, and hybrid local and cloud architecture have been outlined.", "End-to-end demos, task outcomes, device compatibility, and a pilot in Japan still need validation."],
    projects: ["Projects and applications", "Enterprise security and AI governance", "Cross-border operations for Japanese products and brand development", "Live production, restaurant operations, Japanese training, and digital asset research"],
    contact: "Contact Dr. Lin",
  },
};

const heroGlow =
  "radial-gradient(60% 80% at 85% 0%, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0) 55%), radial-gradient(50% 60% at 0% 100%, rgba(129,140,248,0.18) 0%, rgba(129,140,248,0) 55%)";
const gridLines =
  "linear-gradient(rgba(56,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,130,246,0.08) 1px, transparent 1px)";

export function LinboInternational({ language }: { language: keyof typeof copy }) {
  const c = copy[language];
  return (
    <div className="min-h-screen bg-[#050B18] text-[#E6EEF7]">
      <PortalNavigation />
      <main>
        <header className="relative overflow-hidden bg-[#050B18] px-5 py-14 text-white">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: heroGlow }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: gridLines, backgroundSize: "26px 26px" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl">
            <p className="flex items-center gap-2 font-mono text-sm font-semibold tracking-[0.22em] text-[#7DD3FC]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_10px_#22D3EE]" aria-hidden="true" />
              LINBO AI — ENTERPRISE AI
            </p>
            <h1 className="mt-4 text-4xl font-bold sm:text-6xl">{c.name}</h1>
            <p className="mt-3 bg-gradient-to-r from-[#22D3EE] to-[#A5B4FC] bg-clip-text text-xl font-bold text-transparent">{c.headline}</p>
            <p className="mt-4 max-w-2xl leading-7 text-[#A9BED6]">{c.intro}</p>
            <a href="#abp-c" className="mt-6 inline-block rounded-full bg-[#22D3EE] px-5 py-3 font-semibold text-[#04222E] hover:bg-white">{c.jump}</a>
            <div className="mt-8 flex flex-wrap gap-2 font-mono text-[11px]">
              {["AI AGENT", "MODEL ROUTING", "TOKEN GOVERNANCE", "DX"].map(tag => (
                <span key={tag} className="rounded-md border border-[#1D3458] px-2.5 py-1.5 text-[#8FB8DD]">{tag}</span>
              ))}
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-6xl space-y-8 px-5 py-10">
          <section className="rounded-2xl border border-[#1D3458] bg-[#0B1A2E] p-6">
            <p className="font-mono text-xs tracking-[0.2em] text-slate-500">{"// EXPERTISE"}</p>
            <h2 className="mt-2 text-2xl font-bold">{c.strengths[0]}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {c.strengths.slice(1).map(item => (
                <article key={item} className="rounded-xl bg-white/[0.04] p-4">
                  <p className="font-semibold leading-7">{item}</p>
                </article>
              ))}
            </div>
          </section>
          <section id="abp-c" className="scroll-mt-4 rounded-2xl border border-[#23507A] bg-gradient-to-br from-[#0A2547] to-[#071426] p-6">
            <p className="font-mono text-xs tracking-[0.2em] text-[#7DD3FC]">{"// ABC_YPCLOUD R&D"}</p>
            <h2 className="mt-2 text-2xl font-bold">ABC_YPCloud</h2>
            <h3 className="mt-2 text-lg font-semibold text-cyan-100">{c.progress}</h3>
            <p className="mt-3 max-w-3xl leading-7 text-[#B9CCE2]">{c.brain}</p>
            <ol className="mt-5 grid gap-3 md:grid-cols-3">
              {c.stages.map((item, i) => (
                <li key={item} className="rounded-xl bg-white/[0.04] p-4 leading-6 text-[#B9CCE2]">
                  <span className="mb-2 block font-mono text-sm font-bold text-[#22D3EE]">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
          </section>
          <section className="rounded-2xl border border-[#1D3458] bg-[#0B1A2E] p-6">
            <p className="font-mono text-xs tracking-[0.2em] text-slate-500">{"// PROJECTS"}</p>
            <h2 className="mt-2 text-2xl font-bold">{c.projects[0]}</h2>
            <ul className="mt-5 grid gap-3 md:grid-cols-3">
              {c.projects.slice(1).map(item => (
                <li key={item} className="rounded-xl bg-white/[0.04] p-4 font-semibold leading-7">{item}</li>
              ))}
            </ul>
            <a href="mailto:cia8885@gmail.com" className="mt-6 inline-block rounded-full bg-[#22D3EE] px-5 py-3 font-semibold text-[#04222E] hover:bg-white">{c.contact}</a>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
