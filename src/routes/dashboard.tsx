import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet, TrendingUp, TrendingDown, Download, RotateCcw, Search,
  CheckCircle2, Clock, Zap, Layers, BarChart3, Snowflake,
  Filter, Building2, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

// ── Data ───────────────────────────────────────────────────────────────────

const accounts = [
  { name: "云岚品牌中心", accountType: "主账户", accountId: "ST-10086101", subject: "上海云岚科技有限公司", balance: "¥286,500.00", available: "¥266,500.00", frozen: "¥20,000.00", monthlyRecharge: "¥100,000.00", monthlySpend: "¥68,000.00", updatedAt: "2026-07-10 14:32" },
  { name: "云岚效果投放", accountType: "投放账户", accountId: "ST-10086102", subject: "上海云岚科技有限公司", balance: "¥142,300.00", available: "¥142,300.00", frozen: "¥0.00", monthlyRecharge: "¥80,000.00", monthlySpend: "¥56,800.00", updatedAt: "2026-07-10 14:15" },
  { name: "云岚内容增长", accountType: "运营账户", accountId: "ST-10086103", subject: "上海云岚科技有限公司", balance: "¥58,200.00", available: "¥58,200.00", frozen: "¥0.00", monthlyRecharge: "¥20,000.00", monthlySpend: "¥32,000.00", updatedAt: "2026-07-10 13:58" },
];

const accountTypeClass: Record<string, string> = {
  "主账户": "border-blue-200 bg-blue-50 text-blue-700",
  "投放账户": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "运营账户": "border-purple-200 bg-purple-50 text-purple-700",
  "品牌账户": "border-amber-200 bg-amber-50 text-amber-700",
};

const allLedgerData = [
  { time: "2026-07-10 15:20", account: "云岚品牌中心", accountId: "ST-10086101", accountType: "主账户", type: "充值入账", typeKey: "recharge", amount: "+¥50,000.00", beforeBalance: "¥236,500.00", afterBalance: "¥286,500.00", rechargeId: "RC-2026-07001", notes: "常规充值入账" },
  { time: "2026-07-10 16:10", account: "云岚品牌中心", accountId: "ST-10086101", accountType: "主账户", type: "广告消耗", typeKey: "spend", amount: "-¥8,000.00", beforeBalance: "¥286,500.00", afterBalance: "¥278,500.00", rechargeId: "—", notes: "达人采买消耗" },
  { time: "2026-07-09 18:30", account: "云岚效果投放", accountId: "ST-10086102", accountType: "投放账户", type: "冻结", typeKey: "freeze", amount: "-¥20,000.00", beforeBalance: "¥162,300.00", afterBalance: "¥142,300.00", rechargeId: "—", notes: "订单冻结" },
  { time: "2026-07-09 19:10", account: "云岚效果投放", accountId: "ST-10086102", accountType: "投放账户", type: "解冻", typeKey: "unfreeze", amount: "+¥5,000.00", beforeBalance: "¥142,300.00", afterBalance: "¥147,300.00", rechargeId: "—", notes: "撤单解冻返还" },
  { time: "2026-07-09 17:10", account: "云岚内容增长", accountId: "ST-10086103", accountType: "运营账户", type: "充值入账", typeKey: "recharge", amount: "+¥30,000.00", beforeBalance: "¥28,200.00", afterBalance: "¥58,200.00", rechargeId: "RC-2026-07003", notes: "常规充值入账" },
  { time: "2026-07-09 18:20", account: "云岚内容增长", accountId: "ST-10086103", accountType: "运营账户", type: "广告消耗", typeKey: "spend", amount: "-¥5,000.00", beforeBalance: "¥58,200.00", afterBalance: "¥53,200.00", rechargeId: "—", notes: "广告投放消耗" },
  { time: "2026-07-08 14:00", account: "云岚品牌中心", accountId: "ST-10086101", accountType: "主账户", type: "充值入账", typeKey: "recharge", amount: "+¥100,000.00", beforeBalance: "¥136,500.00", afterBalance: "¥236,500.00", rechargeId: "RC-2026-07000", notes: "常规充值入账" },
  { time: "2026-07-08 20:30", account: "云岚品牌中心", accountId: "ST-10086101", accountType: "主账户", type: "助推消耗", typeKey: "spend", amount: "-¥12,000.00", beforeBalance: "¥248,500.00", afterBalance: "¥236,500.00", rechargeId: "—", notes: "助推投流消耗" },
  { time: "2026-07-07 10:00", account: "云岚效果投放", accountId: "ST-10086102", accountType: "投放账户", type: "退款", typeKey: "refund", amount: "+¥3,000.00", beforeBalance: "¥159,300.00", afterBalance: "¥162,300.00", rechargeId: "RC-2026-06001", notes: "充值退款" },
  { time: "2026-07-06 16:00", account: "云岚品牌中心", accountId: "ST-10086101", accountType: "主账户", type: "调整", typeKey: "transfer_in", amount: "+¥1,500.00", beforeBalance: "¥135,000.00", afterBalance: "¥136,500.00", rechargeId: "—", notes: "余额调整" },
];

const typeConfig: Record<string, { className: string }> = {
  recharge: { className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  spend: { className: "border-amber-200 bg-amber-50 text-amber-700" },
  transfer_in: { className: "border-blue-200 bg-blue-50 text-blue-700" },
  transfer_out: { className: "border-gray-200 bg-gray-50 text-gray-600" },
  refund: { className: "border-purple-200 bg-purple-50 text-purple-700" },
  freeze: { className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  unfreeze: { className: "border-cyan-200 bg-cyan-50 text-cyan-700" },
};

// ── Trend chart (dual bar + line, full-width) ──────────────────────────────

function TrendChart({ timeRange }: { timeRange: string }) {
  const days = timeRange === "30" ? ["7/5","7/8","7/11","7/14","7/17","7/20","7/23","7/26","7/29","8/1","8/4","8/7"]
    : timeRange === "60" ? ["6/15","6/22","6/29","7/6","7/13","7/20","7/27","8/3"]
    : timeRange === "90" ? ["5/10","5/25","6/9","6/23","7/7","7/21","8/4"]
    : timeRange === "180" ? ["2/1","3/1","4/1","5/1","6/1","7/1","8/1"]
    : ["1/1","2/1","3/1","4/1","5/1","6/1","7/1","8/1"];

  const rechargeData = days.map(() => Math.round(Math.random() * 40 + 20));
  const spendData = days.map(() => Math.round(Math.random() * 35 + 10));
  const balanceData = days.reduce<number[]>((acc, _, i) => {
    const prev = i === 0 ? 200 : acc[i - 1];
    acc.push(prev + rechargeData[i] - spendData[i]);
    return acc;
  }, []);
  const dataMax = Math.max(...rechargeData, ...spendData, ...balanceData) * 1.15;

  const totalRecharge = rechargeData.reduce((a, b) => a + b, 0);
  const totalSpend = spendData.reduce((a, b) => a + b, 0);
  const endBalance = balanceData[balanceData.length - 1];
  const netChange = endBalance - 200;

  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {/* Summary indicators on top */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "期间充值", value: `¥${totalRecharge}K`, color: "text-primary" },
          { label: "期间消耗", value: `¥${totalSpend}K`, color: "text-amber-600" },
          { label: "期末余额", value: `¥${endBalance}K`, color: "text-foreground" },
          { label: "净变化", value: `${netChange >= 0 ? "+" : ""}¥${netChange}K`, color: netChange >= 0 ? "text-emerald-600" : "text-red-500" },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-center">
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-base font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-primary" /><span className="text-xs text-muted-foreground">充值</span></div>
        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-amber-400" /><span className="text-xs text-muted-foreground">消耗</span></div>
        <div className="flex items-center gap-1.5"><div className="h-0.5 w-4 bg-emerald-500 rounded-full" /><span className="text-xs text-muted-foreground">余额趋势</span></div>
      </div>

      {/* Full-width SVG chart */}
      <svg viewBox="-60 -10 820 330" className="w-full" style={{ height: 320 }} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[1, 0.75, 0.5, 0.25, 0].map(pct => (
          <g key={`g-${pct}`}>
            <line x1="0" y1={pct * 280} x2="760" y2={pct * 280} stroke="oklch(0.9 0.01 260)" strokeWidth="1" />
            <text x="-8" y={pct * 280 + 4} textAnchor="end" className="text-[11px] fill-muted-foreground">{Math.round(dataMax * pct)}</text>
          </g>
        ))}

        {/* Bars */}
        {days.map((d, i) => {
          const barCenterX = (i / days.length) * 760 + (760 / days.length) / 2;
          const barW = Math.min(14, (760 / days.length) * 0.35);
          const gap = 4;
          const rH = (rechargeData[i] / dataMax) * 280;
          const sH = (spendData[i] / dataMax) * 280;
          return (
            <g key={d}>
              {/* Recharge bar - blue */}
              <rect
                x={barCenterX - barW - gap / 2}
                y={280 - rH}
                width={barW}
                height={rH}
                rx="3"
                fill="oklch(0.58 0.23 259)"
                opacity="0.88"
              />
              {/* Spend bar - orange */}
              <rect
                x={barCenterX + gap / 2}
                y={280 - sH}
                width={barW}
                height={sH}
                rx="3"
                fill="oklch(0.78 0.16 75)"
                opacity="0.82"
              />
            </g>
          );
        })}

        {/* Balance polyline */}
        <polyline
          points={balanceData.map((v, i) => {
            const x = (i / days.length) * 760 + (760 / days.length) / 2;
            const y = 280 - (v / dataMax) * 280;
            return `${x},${y}`;
          }).join(" ")}
          fill="none"
          stroke="oklch(0.66 0.16 155)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Balance dots */}
        {balanceData.map((v, i) => {
          const x = (i / days.length) * 760 + (760 / days.length) / 2;
          const y = 280 - (v / dataMax) * 280;
          return (
            <circle key={`bd-${i}`} cx={x} cy={y} r="3.5" fill="oklch(0.66 0.16 155)" stroke="white" strokeWidth="2" />
          );
        })}

        {/* X-axis labels */}
        {days.map((d, i) => (
          <text
            key={`xl-${i}`}
            x={(i / days.length) * 760 + (760 / days.length) / 2}
            y="300"
            textAnchor="middle"
            className="text-[11px] fill-muted-foreground"
          >{d}</text>
        ))}
      </svg>

      {/* Hover interaction layer */}
      <div className="relative flex" style={{ height: 32, marginTop: -24 }}>
        {days.map((d, i) => (
          <div
            key={d}
            className="relative flex-1 cursor-crosshair"
            onMouseEnter={() => setTooltipIdx(i)}
            onMouseLeave={() => setTooltipIdx(null)}
          >
            {tooltipIdx === i && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 rounded-lg border border-border bg-card px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none">
                <p className="text-[11px] font-semibold text-foreground mb-1">{d}</p>
                <div className="space-y-0.5">
                  <p className="text-[10px]"><span className="text-muted-foreground">充值：</span><span className="font-medium text-primary">¥{rechargeData[i]}K</span></p>
                  <p className="text-[10px]"><span className="text-muted-foreground">消耗：</span><span className="font-medium text-amber-600">¥{spendData[i]}K</span></p>
                  <p className="text-[10px]"><span className="text-muted-foreground">余额：</span><span className="font-medium text-emerald-600">¥{balanceData[i]}K</span></p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

function DashboardPage() {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [activeTab, setActiveTab] = useState<"ledger" | "trend">("ledger");
  const [timeRange, setTimeRange] = useState("30");
  const [filterType, setFilterType] = useState("");
  const [filterId, setFilterId] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [ledgerDetailOpen, setLedgerDetailOpen] = useState(false);
  const [ledgerDetailItem, setLedgerDetailItem] = useState<typeof allLedgerData[0] | null>(null);

  const selectedAcc = accounts.find(a => a.accountId === selectedAccount);
  const isAll = selectedAccount === "all";

  // Fund values based on selection
  const totalBalance = isAll ? "¥487,000.00" : selectedAcc?.balance ?? "¥0.00";
  const totalAvailable = isAll ? "¥467,000.00" : selectedAcc?.available ?? "¥0.00";
  const totalFrozen = isAll ? "¥20,000.00" : selectedAcc?.frozen ?? "¥0.00";
  const totalRecharge = isAll ? "¥200,000.00" : selectedAcc?.monthlyRecharge ?? "¥0.00";
  const totalSpend = isAll ? "¥156,800.00" : selectedAcc?.monthlySpend ?? "¥0.00";
  const accountCount = isAll ? 3 : 1;

  const currentScopeLabel = isAll ? "全部账户汇总" : `当前账户：${selectedAcc?.name}｜${selectedAcc?.accountType}`;
  const cardSubLabel = isAll ? `已汇总 ${accountCount} 个账户` : "当前账户数据";

  // Filter ledger
  const filteredLedger = allLedgerData.filter(r => {
    if (selectedAccount !== "all" && r.accountId !== selectedAccount) return false;
    if (filterType && r.typeKey !== filterType) return false;
    if (filterId && !r.rechargeId.includes(filterId)) return false;
    return true;
  });

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">余额流水看板</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看账户余额、充值记录、消耗流水及资金明细</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover open={exportOpen} onOpenChange={setExportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />导出流水</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-4">
              <p className="text-xs font-semibold mb-3">选择导出范围</p>
              <div className="space-y-2">
                <button className="w-full text-left text-xs px-3 py-2 rounded-md hover:bg-accent" onClick={() => setExportOpen(false)}>当前筛选结果</button>
                <button className="w-full text-left text-xs px-3 py-2 rounded-md hover:bg-accent" onClick={() => setExportOpen(false)}>全部账户本月流水</button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="sm" className="gap-2"><RotateCcw className="h-4 w-4" />刷新数据</Button>
        </div>
      </div>

      {/* ── Account Selector ─────────────────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            当前查看账户
          </CardTitle>
          <CardDescription>切换账户后，下方资金概览、流水明细和趋势图将同步更新</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedAccount("all")}
              className={`px-4 py-2 text-sm rounded-xl border-2 transition-all ${
                isAll ? "border-primary bg-sapphire-subtle text-primary font-semibold shadow-sm" : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >全部账户</button>
            {accounts.map(a => (
              <button
                key={a.accountId}
                onClick={() => setSelectedAccount(a.accountId)}
                className={`px-4 py-2 text-sm rounded-xl border-2 transition-all ${
                  selectedAccount === a.accountId ? "border-primary bg-sapphire-subtle text-primary font-semibold shadow-sm" : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {a.name}
                <Badge className={`ml-1.5 h-4 px-1 text-[10px] ${accountTypeClass[a.accountType] ?? ""}`}>{a.accountType}</Badge>
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground">{currentScopeLabel}</p>
        </CardContent>
      </Card>

      {/* ── Fund Overview Cards ──────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "账户总余额", value: totalBalance, icon: Wallet, accent: "bg-primary" },
          { label: "可用余额", value: totalAvailable, icon: TrendingUp, accent: "bg-emerald-500" },
          { label: "冻结金额", value: totalFrozen, icon: Snowflake, accent: "bg-amber-400" },
          { label: "本月充值", value: totalRecharge, icon: TrendingUp, accent: "bg-emerald-500" },
          { label: "本月消耗", value: totalSpend, icon: TrendingDown, accent: "bg-rose-500" },
        ].map(c => (
          <Card key={c.label} className="overflow-hidden border-border/60 shadow-sm">
            <div className={`h-1 w-full ${c.accent}`} />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${c.accent} text-white`}><c.icon className="h-3 w-3" /></div>
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{c.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{cardSubLabel}{isAll ? ` · 已汇总 ${accountCount} 个账户` : ""}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Data Tabs: Ledger / Trend ────────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-1 border-b border-border/40">
            <button
              onClick={() => setActiveTab("ledger")}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === "ledger" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >流水明细</button>
            <button
              onClick={() => setActiveTab("trend")}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === "trend" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >资金趋势</button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {activeTab === "ledger" ? (
            <div className="space-y-4">
              {/* Ledger filters */}
              <div className="flex flex-wrap items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="h-9 w-28 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="30">近 30 日</SelectItem>
                    <SelectItem value="60">近 60 日</SelectItem>
                    <SelectItem value="90">近 90 日</SelectItem>
                    <SelectItem value="180">近半年</SelectItem>
                    <SelectItem value="365">近一年</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-9 w-28 text-sm"><SelectValue placeholder="流水类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="recharge">充值入账</SelectItem>
                    <SelectItem value="spend">广告消耗</SelectItem>
                    <SelectItem value="freeze">冻结</SelectItem>
                    <SelectItem value="unfreeze">解冻</SelectItem>
                    <SelectItem value="refund">退款</SelectItem>
                    <SelectItem value="transfer_in">调整</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="h-9 w-36 text-sm" placeholder="关联单号" value={filterId} onChange={e => setFilterId(e.target.value)} />
                <Button size="sm" className="h-9 gap-1.5"><Search className="h-3.5 w-3.5" />查询</Button>
                <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-sm" onClick={() => { setFilterType(""); setFilterId(""); }}><RotateCcw className="h-3.5 w-3.5" />重置</Button>
              </div>

              {/* Ledger table */}
              {filteredLedger.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-sm font-semibold whitespace-nowrap min-w-[140px]">流水时间</TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap min-w-[150px]">账户信息</TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap min-w-[90px]">流水类型</TableHead>
                      <TableHead className="text-sm font-semibold text-right whitespace-nowrap min-w-[110px]">变动金额</TableHead>
                      <TableHead className="text-sm font-semibold text-right whitespace-nowrap min-w-[110px]">变动前余额</TableHead>
                      <TableHead className="text-sm font-semibold text-right whitespace-nowrap min-w-[110px]">变动后余额</TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap min-w-[120px]">关联单号</TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap min-w-[120px]">业务说明</TableHead>
                      <TableHead className="text-sm font-semibold whitespace-nowrap">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLedger.map((row, i) => {
                      const cfg = typeConfig[row.typeKey] ?? typeConfig.spend;
                      const isPositive = row.amount.startsWith("+");
                      return (
                        <TableRow key={i} className="h-14">
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{row.time}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-foreground">{row.account}</span>
                                {row.accountType && <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[row.accountType] ?? ""}`}>{row.accountType}</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">{row.accountId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap"><Badge className={`text-xs ${cfg.className}`}>{row.type}</Badge></TableCell>
                          <TableCell className={`text-right text-sm font-bold whitespace-nowrap ${isPositive ? "text-emerald-600" : "text-red-500"}`}>{row.amount}</TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">{row.beforeBalance}</TableCell>
                          <TableCell className="text-right text-sm font-semibold text-foreground whitespace-nowrap">{row.afterBalance}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{row.rechargeId}</TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{row.notes}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => { setLedgerDetailItem(row); setLedgerDetailOpen(true); }}>查看详情</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center py-12 text-muted-foreground">
                  <Search className="mb-3 h-10 w-10" />
                  <p className="text-sm font-medium">暂无流水记录</p>
                  <p className="mt-1 text-xs">当前筛选条件下暂无流水数据，请调整筛选条件后重试。</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => { setFilterType(""); setFilterId(""); }}>重置筛选</Button>
                </div>
              )}
              {/* Pagination */}
              {filteredLedger.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">共 {filteredLedger.length} 条记录</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Trend header */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {currentScopeLabel}｜{timeRange === "30" ? "近 30 日" : timeRange === "60" ? "近 60 日" : timeRange === "90" ? "近 90 日" : timeRange === "180" ? "近半年" : "近一年"}资金趋势
                </p>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="h-9 w-28 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">近 30 日</SelectItem>
                    <SelectItem value="60">近 60 日</SelectItem>
                    <SelectItem value="90">近 90 日</SelectItem>
                    <SelectItem value="180">近半年</SelectItem>
                    <SelectItem value="365">近一年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <TrendChart timeRange={timeRange} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ledger detail drawer */}
      <Sheet open={ledgerDetailOpen} onOpenChange={setLedgerDetailOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[600px]">
          <SheetHeader className="space-y-2 border-b border-border px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary"><BarChart3 className="h-3.5 w-3.5 text-white" /></div>
              <SheetTitle>流水详情</SheetTitle>
            </div>
            {ledgerDetailItem && (
              <p className="text-xs text-muted-foreground">
                {ledgerDetailItem.rechargeId !== "—" ? `关联单号：${ledgerDetailItem.rechargeId}` : "流水单号：FL-20260710-001"}
              </p>
            )}
          </SheetHeader>

          {ledgerDetailItem && (
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {/* Module 1: Basic Info */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <h4 className="mb-3 flex items-center gap-2 border-b border-border/60 pb-2.5 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />基础信息
                </h4>
                <div className="space-y-1.5">
                  <InfoRow label="流水时间" value={ledgerDetailItem.time} />
                  <InfoRow label="流水类型" value={ledgerDetailItem.type} />
                  <InfoRow label="流水状态" value="已完成" bold />
                  <InfoRow label="资金方向" value={ledgerDetailItem.amount.startsWith("+") ? "收入" : "支出"} />
                </div>
              </div>

              {/* Module 2: Account Info */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <h4 className="mb-3 flex items-center gap-2 border-b border-border/60 pb-2.5 text-sm font-semibold text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />账户信息
                </h4>
                <div className="space-y-1.5">
                  <InfoRow label="平台" value="星图" />
                  <InfoRow label="账户名称" value={ledgerDetailItem.account} bold />
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-muted-foreground">账户类型</span>
                    <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[ledgerDetailItem.accountType] ?? ""}`}>{ledgerDetailItem.accountType}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-muted-foreground">账户 ID</span>
                    <span className="font-mono text-xs text-foreground">{ledgerDetailItem.accountId}</span>
                  </div>
                  <InfoRow label="账户主体" value="上海云岚科技有限公司" />
                </div>
              </div>

              {/* Module 3: Amount Change */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <h4 className="mb-3 flex items-center gap-2 border-b border-border/60 pb-2.5 text-sm font-semibold text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />金额变动
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-muted-foreground">变动金额</span>
                    <span className={`text-lg font-bold ${ledgerDetailItem.amount.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>{ledgerDetailItem.amount}</span>
                  </div>
                  <InfoRow label="变动前余额" value={ledgerDetailItem.beforeBalance} />
                  <InfoRow label="变动后余额" value={ledgerDetailItem.afterBalance} bold />
                </div>
              </div>

              {/* Module 4: Business Info */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <h4 className="mb-3 flex items-center gap-2 border-b border-border/60 pb-2.5 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />业务关联信息
                </h4>
                <div className="space-y-1.5">
                  <InfoRow label="关联单号" value={ledgerDetailItem.rechargeId} mono />
                  <InfoRow label="业务说明" value={ledgerDetailItem.notes} />
                  {ledgerDetailItem.typeKey === "recharge" && (
                    <>
                      <InfoRow label="操作来源" value="充值任务" />
                      <InfoRow label="处理人" value="米播平台" />
                      <div className="rounded-lg bg-muted/50 p-2.5 mt-2">
                        <p className="text-xs text-muted-foreground">客户付款确认后完成账户充值入账</p>
                      </div>
                    </>
                  )}
                  {ledgerDetailItem.typeKey === "spend" && (
                    <>
                      <InfoRow label="操作来源" value="广告投放" />
                      <InfoRow label="处理系统" value="星图平台" />
                    </>
                  )}
                  {ledgerDetailItem.typeKey === "freeze" && (
                    <>
                      <InfoRow label="操作来源" value="订单冻结" />
                      <div className="rounded-lg bg-muted/50 p-2.5 mt-2">
                        <p className="text-xs text-muted-foreground">订单冻结，金额暂时不可用</p>
                      </div>
                    </>
                  )}
                  {ledgerDetailItem.typeKey === "unfreeze" && (
                    <>
                      <InfoRow label="操作来源" value="撤单解冻" />
                      <div className="rounded-lg bg-muted/50 p-2.5 mt-2">
                        <p className="text-xs text-muted-foreground">撤单解冻返还，金额已恢复可用</p>
                      </div>
                    </>
                  )}
                  {ledgerDetailItem.typeKey === "refund" && (
                    <>
                      <InfoRow label="操作来源" value="充值退款" />
                      <InfoRow label="原关联单号" value={ledgerDetailItem.rechargeId} mono />
                    </>
                  )}
                  {ledgerDetailItem.typeKey === "transfer_in" && (
                    <>
                      <InfoRow label="操作来源" value="余额调整" />
                      <InfoRow label="处理人" value="米播平台" />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setLedgerDetailOpen(false)}>关闭</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Data update time */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>数据更新时间：2026-07-10 14:32</span>
        <span>余额及流水数据以平台同步结果为准</span>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs ${bold ? "font-semibold text-foreground" : "text-foreground"} ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
