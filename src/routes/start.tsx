import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  ReceiptText,
  BarChart3,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "开始 · 米线云充值协同服务平台" },
      {
        name: "description",
        content:
          "米线云是面向客户与代理商的充值协同服务平台，统一管理客户账户、充值申请、付款凭证、充值进度与余额流水。",
      },
      { property: "og:title", content: "米线云 · 充值协同服务平台" },
      {
        property: "og:description",
        content: "客户与代理商在线充值协同，提升处理效率与资金信息透明度",
      },
    ],
  }),
  component: PortalHome,
});

function PortalHome() {
  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-portal">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-gradient-brand-soft blur-3xl animate-drift-1"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/3 h-[480px] w-[480px] rounded-full bg-gradient-brand-soft blur-3xl animate-drift-2"
      />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" className="text-foreground/80">
              登录
            </Button>
          </Link>
          <Link to="/login">
            <Button className="bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95">
              注册
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-16 lg:pt-24">
        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            客户 / 代理商协同 · 账户充值 · 余额流水 · 凭证留痕
          </span>

          <h1 className="mt-7 text-balance text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            <span className="text-gradient-brand">米线云</span>
            <span className="mt-3 block text-3xl font-semibold text-foreground/90 sm:text-4xl lg:text-5xl">
              充值协同服务平台
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            统一管理客户账户、充值申请、付款凭证、充值进度与余额流水。帮助客户与代理商在线完成充值协同，提升充值处理效率与资金信息透明度。
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/">
              <Button
                size="lg"
                className="h-12 bg-gradient-brand px-7 text-base font-semibold text-primary-foreground shadow-brand hover:shadow-glow hover:opacity-95"
              >
                进入工作台
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-12 px-7 text-base">
                了解功能
              </Button>
            </a>
          </div>
        </div>

        {/* ── Features ─────────────────────────────────────── */}
        <section id="features" className="mt-24 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6 shadow-card-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-brand"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-brand">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* ── Roles ────────────────────────────────────────── */}
        <section className="mt-20 rounded-3xl border border-border bg-card/60 p-8 backdrop-blur sm:p-10">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            两类角色，一套协同
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            客户与代理商在同一平台内完成充值申请、处理进度同步与资金记录查看。
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ROLES.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl border border-border bg-background/60 p-5"
              >
                <div className="text-xs font-medium uppercase tracking-wider text-primary">
                  {r.tag}
                </div>
                <div className="mt-2 text-lg font-semibold text-foreground">{r.name}</div>
                <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border bg-background/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={20} showWordmark={false} />
            <span>© {new Date().getFullYear()} 米线云 · 充值协同服务平台</span>
          </div>
          <div>让每一次充值都可追溯</div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: Wallet,
    title: "账户统一管理",
    desc: "集中管理客户名下账户与资金状态，降低多账户协同成本。",
  },
  {
    icon: ReceiptText,
    title: "充值高效流转",
    desc: "打通申请、付款、确认与处理节点，让充值过程更透明、更有序。",
  },
  {
    icon: ShieldCheck,
    title: "过程清晰可追踪",
    desc: "关键凭证、状态节点与操作记录全程留痕，便于查询与复核。",
  },
  {
    icon: BarChart3,
    title: "资金数据可视化",
    desc: "汇总余额、充值与流水数据，为客户提供清晰的资金视图。",
  },
];

const ROLES = [
  {
    tag: "CUSTOMER",
    name: "客户",
    desc: "发起充值申请，查看付款信息，上传付款凭证，跟踪充值进度，并查看账户余额与流水。",
  },
  {
    tag: "AGENT",
    name: "代理商",
    desc: "审核客户充值申请，确认账户与金额信息，跟进财务到账及平台充值处理，维护充值结果与流水记录。",
  },
];
