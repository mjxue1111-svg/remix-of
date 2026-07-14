import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet, TrendingUp, TrendingDown, Download, RotateCcw, Search,
  CheckCircle2, Clock, Eye, Zap, Layers, BarChart3, Snowflake,
  ChevronRight, Filter, ArrowUp, ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

const ledgerData = [
  { time: "2026-07-10 15:20", account: "云岚品牌中心", accountId: "ST-10086101", type: "充值", typeKey: "recharge", amount: "+¥50,000.00", balance: "¥286,500.00", rechargeId: "RC-2026-07001", platformId: "XT202607100001", notes: "米播充值到账" },
  { time: "2026-07-10 16:10", account: "云岚品牌中心", accountId: "ST-10086101", type: "消耗", typeKey: "spend", amount: "-¥8,000.00", balance: "¥278,500.00", rechargeId: "—", platformId: "XT202607100002", notes: "达人采买消耗" },
  { time: "2026-07-09 18:30", account: "云岚效果投放", accountId: "ST-10086102", type: "冻结", typeKey: "freeze", amount: "-¥20,000.00", balance: "¥142,300.00", rechargeId: "—", platformId: "XT202607090008", notes: "订单冻结" },
  { time: "2026-07-09 19:10", account: "云岚效果投放", accountId: "ST-10086102", type: "解冻", typeKey: "unfreeze", amount: "+¥5,000.00", balance: "¥147,300.00", rechargeId: "—", platformId: "XT202607090009", notes: "撤单解冻返还" },
  { time: "2026-07-09 17:10", account: "云岚内容增长", accountId: "ST-10086103", type: "充值", typeKey: "recharge", amount: "+¥30,000.00", balance: "¥58,200.00", rechargeId: "RC-2026-07003", platformId: "XT20260709001", notes: "充值到账" },
  { time: "2026-07-09 18:20", account: "云岚内容增长", accountId: "ST-10086103", type: "消耗", typeKey: "spend", amount: "-¥5,000.00", balance: "¥53,200.00", rechargeId: "—", platformId: "XT20260709002", notes: "广告投放消耗" },
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

const recentRecharges = [
  { id: "RC-2026-07001", account: "云岚品牌中心", type: "常规充值", amount: "¥50,000.00", paidAmount: "¥49,000.00", node: "平台转账", order: "未完成" },
  { id: "RC-2026-07003", account: "云岚内容增长", type: "常规充值", amount: "¥30,000.00", paidAmount: "¥29,400.00", node: "充值完成", order: "已完成" },
  { id: "RC-2026-07005", account: "云岚品牌中心", type: "特批充值", amount: "¥40,000.00", paidAmount: "¥39,200.00", node: "充值完成", order: "未完成" },
];

// ── Trend chart (simplified bar) ───────────────────────────────────────────

function TrendChart() {
  const days = ["7/5","7/8","7/11","7/14","7/17","7/20","7/23","7/26","7/29","8/1","8/4","8/7"];
  const rechargeData = [30,45,20,50,80,35,60,40,25,55,70,50];
  const spendData = [25,35,40,20,55,30,45,35,20,40,60,32];
  const max = 90;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-primary" /><span className="text-xs text-muted-foreground">充值</span></div>
        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-amber-400" /><span className="text-xs text-muted-foreground">消耗</span></div>
      </div>
      <div className="flex items-end gap-1.5 h-32">
        {days.map((d, i) => (
          <div key={d} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className="w-full bg-amber-400 rounded-t-sm" style={{ height: `${(spendData[i]/max)*60}px` }} />
              <div className="w-full bg-primary rounded-t-sm" style={{ height: `${(rechargeData[i]/max)*60}px` }} />
            </div>
            <span className="text-[9px] text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

function DashboardPage() {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [filterType, setFilterType] = useState("");
  const [filterId, setFilterId] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const filteredLedger = ledgerData.filter(r => {
    if (selectedAccount !== "all" && r.accountId !== selectedAccount) return false;
    if (filterType && r.typeKey !== filterType) return false;
    if (filterId && r.rechargeId !== filterId) return false;
    return true;
  });

  return (
    <div className="space-y-6 p-6">
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

      {/* Account selector */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-foreground">查看账户：</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedAccount("all")}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${selectedAccount === "all" ? "border-primary bg-sapphire-subtle text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}
              >全部账户</button>
              {accounts.map(a => (
                <button
                  key={a.accountId}
                  onClick={() => setSelectedAccount(a.accountId)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${selectedAccount === a.accountId ? "border-primary bg-sapphire-subtle text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}
                >{a.name}｜{a.accountType}</button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">当前数据汇总展示客户名下所有已绑定账户，切换账户后可查看单账户余额与流水。</p>
        </CardContent>
      </Card>

      {/* Fund overview cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "账户总余额", value: "¥487,000.00", sub: "已汇总 3 个账户", icon: Wallet, accent: "bg-primary" },
          { label: "可用余额", value: "¥467,000.00", sub: "可用于充值后消耗", icon: TrendingUp, accent: "bg-emerald-500" },
          { label: "冻结金额", value: "¥20,000.00", sub: "订单冻结中", icon: Snowflake, accent: "bg-amber-400" },
          { label: "本月充值", value: "¥200,000.00", sub: "本月成功充值 3 笔", icon: TrendingUp, accent: "bg-emerald-500" },
          { label: "本月消耗", value: "¥156,800.00", sub: "本月账户消耗汇总", icon: TrendingDown, accent: "bg-rose-500" },
        ].map(c => (
          <Card key={c.label} className="overflow-hidden border-border/60 shadow-sm">
            <div className={`h-1 w-full ${c.accent}`} />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1"><div className={`flex h-6 w-6 items-center justify-center rounded-md ${c.accent} text-white`}><c.icon className="h-3 w-3" /></div><span className="text-xs text-muted-foreground">{c.label}</span></div>
              <p className="text-xl font-bold text-foreground">{c.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{selectedAccount === "all" ? "全部账户汇总" : "当前账户数据"}{c.sub && ` · ${c.sub}`}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account balance breakdown */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">账户余额拆分</CardTitle>
          <CardDescription>按账户查看余额、充值与消耗情况</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold min-w-[180px]">账户信息</TableHead>
                <TableHead className="text-xs font-semibold text-right">当前余额</TableHead>
                <TableHead className="text-xs font-semibold text-right">可用余额</TableHead>
                <TableHead className="text-xs font-semibold text-right">冻结金额</TableHead>
                <TableHead className="text-xs font-semibold text-right">本月充值</TableHead>
                <TableHead className="text-xs font-semibold text-right">本月消耗</TableHead>
                <TableHead className="text-xs font-semibold">更新时间</TableHead>
                <TableHead className="text-xs font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(a => (
                <TableRow key={a.accountId}>
                  <TableCell className="py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1"><Badge className="h-3.5 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[9px] text-blue-700">星图</Badge><span className="text-xs font-semibold">{a.name}</span><Badge className={`h-3.5 px-1 text-[9px] ${accountTypeClass[a.accountType] ?? ""}`}>{a.accountType}</Badge></div>
                      <p className="text-[10px] text-muted-foreground">ID：{a.accountId}</p>
                      <p className="text-[10px] text-muted-foreground">主体：{a.subject}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold">{a.balance}</TableCell>
                  <TableCell className="text-right text-xs">{a.available}</TableCell>
                  <TableCell className="text-right text-xs text-amber-600">{a.frozen}</TableCell>
                  <TableCell className="text-right text-xs text-emerald-600">{a.monthlyRecharge}</TableCell>
                  <TableCell className="text-right text-xs text-amber-600">{a.monthlySpend}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{a.updatedAt}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary" onClick={() => setSelectedAccount(a.accountId)}>
                      <Eye className="mr-1 h-2.5 w-2.5" />查看流水
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trend chart */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">近 30 日资金趋势</CardTitle>
          <CardDescription>展示充值、消耗与余额变化趋势</CardDescription>
        </CardHeader>
        <CardContent><TrendChart /></CardContent>
      </Card>

      {/* Transaction ledger */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">流水明细</CardTitle>
          <CardDescription>查看充值、消耗、退款、冻结、解冻等资金变化记录</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" className="h-9 w-36 text-xs" placeholder="开始" />
            <span className="text-xs text-muted-foreground">至</span>
            <Input type="date" className="h-9 w-36 text-xs" placeholder="结束" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 w-24 text-xs"><SelectValue placeholder="流水类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(typeConfig).map(([k]) => (<SelectItem key={k} value={k}>{k === "recharge" ? "充值" : k === "spend" ? "消耗" : k === "transfer_in" ? "转入" : k === "transfer_out" ? "转出" : k === "refund" ? "退款" : k === "freeze" ? "冻结" : "解冻"}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input className="h-9 w-32 text-xs" placeholder="充值单号" value={filterId} onChange={e => setFilterId(e.target.value)} />
            <Button size="sm" className="h-9 gap-1"><Search className="h-3.5 w-3.5" />查询</Button>
            <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs" onClick={() => { setFilterType(""); setFilterId(""); }}><RotateCcw className="h-3.5 w-3.5" />重置</Button>
          </div>

          {/* Ledger table */}
          {filteredLedger.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold whitespace-nowrap">流水时间</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">账户信息</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">流水类型</TableHead>
                  <TableHead className="text-xs font-semibold text-right whitespace-nowrap">变动金额</TableHead>
                  <TableHead className="text-xs font-semibold text-right whitespace-nowrap">账户余额</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">关联充值单</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">平台流水号</TableHead>
                  <TableHead className="text-xs font-semibold whitespace-nowrap">备注</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLedger.map((row, i) => {
                  const cfg = typeConfig[row.typeKey] ?? typeConfig.spend;
                  const isPositive = row.amount.startsWith("+");
                  return (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{row.time}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-xs font-medium">{row.account}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">{row.accountId}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap"><Badge className={`text-[10px] ${cfg.className}`}>{row.type}</Badge></TableCell>
                      <TableCell className={`text-right text-xs font-semibold whitespace-nowrap ${isPositive ? "text-emerald-600" : "text-red-500"}`}>{row.amount}</TableCell>
                      <TableCell className="text-right text-xs font-medium whitespace-nowrap">{row.balance}</TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{row.rechargeId}</TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{row.platformId}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{row.notes}</TableCell>
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
        </CardContent>
      </Card>

      {/* Recent recharges */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">最近充值记录</CardTitle>
          <CardDescription>近期充值任务及处理状态</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold">充值单号</TableHead>
                <TableHead className="text-xs font-semibold">账户</TableHead>
                <TableHead className="text-xs font-semibold">类型</TableHead>
                <TableHead className="text-xs font-semibold text-right">充值金额</TableHead>
                <TableHead className="text-xs font-semibold text-right">实付金额</TableHead>
                <TableHead className="text-xs font-semibold">当前节点</TableHead>
                <TableHead className="text-xs font-semibold">订单状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRecharges.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-medium text-primary">{r.id}</TableCell>
                  <TableCell className="text-xs">{r.account}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${r.type === "特批充值" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>{r.type}</Badge></TableCell>
                  <TableCell className="text-right text-xs font-semibold">{r.amount}</TableCell>
                  <TableCell className="text-right text-xs font-semibold text-primary">{r.paidAmount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.node}</TableCell>
                  <TableCell>{r.order === "已完成" ? <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"><CheckCircle2 className="h-2.5 w-2.5" />已完成</Badge> : <Badge className="gap-1 border-amber-200 bg-amber-50 text-[10px] text-amber-700"><Clock className="h-2.5 w-2.5" />未完成</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Data update time */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>数据更新时间：2026-07-10 14:32</span>
        <span>余额及流水数据以平台同步结果为准</span>
      </div>
    </div>
  );
}

