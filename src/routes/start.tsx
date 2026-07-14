import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Users, LineChart } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "开始 · 米线云达人营销协同系统" },
      {
        name: "description",
        content:
          "米线云是面向品牌客户、营销代理、MCN 与达人的一体化协同系统,统一管理线索、商机、立项、项目执行、订单合同、财务与人资。",
      },
      { property: "og:title", content: "米线云 · 达人营销协同系统" },
      {
        property: "og:description",
        content: "客户 · 代理 · MCN · 达人 四方协同的达人营销操作系统",
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
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            达人营销 · 客户 / 代理 / MCN / 达人 四方协同
          </span>

          <h1 className="mt-7 text-balance text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            <span className="text-gradient-brand">米线云</span>
            <span className="block mt-3 text-3xl font-semibold text-foreground/90 sm:text-4xl lg:text-5xl">
              达人营销协同系统
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            统一管理线索、商机、立项、项目执行、达人订单与合同、财务与人资。
            一套系统,把品牌、代理、MCN、达人串成一条高效协同的链路。
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login">
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

        <section className="mt-20 rounded-3xl border border-border bg-card/60 p-8 backdrop-blur sm:p-10">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            两类用户,一套协同
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            品牌客户与达人在同一平台协同,各自查看相关数据。
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {IDENTITIES.map((i) => (
              <div
                key={i.name}
                className="rounded-2xl border border-border bg-background/60 p-5"
              >
                <div className="text-xs font-medium uppercase tracking-wider text-primary">
                  {i.tag}
                </div>
                <div className="mt-2 text-lg font-semibold text-foreground">{i.name}</div>
                <p className="mt-2 text-sm text-muted-foreground">{i.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border bg-background/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={20} showWordmark={false} />
            <span>© {new Date().getFullYear()} 米线云 · 达人营销协同系统</span>
          </div>
          <div>专为达人营销链路而生</div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: Users,
    title: "客户销售一站式",
    desc: "线索 → 商机 → 客户 → 立项,完整漏斗与销售协同。",
  },
  {
    icon: Sparkles,
    title: "项目执行可视化",
    desc: "选号、客户项目工作台、达人订单与合同,流程清晰。",
  },
  {
    icon: LineChart,
    title: "财务与人资闭环",
    desc: "代理财务对账、人资绩效;客户/MCN/达人各自查看相关收支。",
  },
  {
    icon: ShieldCheck,
    title: "细粒度权限",
    desc: "组织 × 身份 × 角色 三维度授权,同一菜单按身份过滤数据范围。",
  },
];

const IDENTITIES = [
  { tag: "BRAND", name: "客户", desc: "查看本品牌的合同、立项、项目进展与财务对账。" },
  { tag: "CREATOR", name: "达人", desc: "查看本人的订单、合同与收益结算。" },
];