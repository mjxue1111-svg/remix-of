import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock4,
  Search,
  Download,
  Filter,
  ChevronDown,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/transaction-ledger")({
  component: TransactionLedgerPage,
});

// ── Data ───────────────────────────────────────────────────────────────────

const transactions = [
  {
    time: "2026-07-09 17:10",
    type: "充值",
    typeKey: "recharge",
    amount: "+¥30,000.00",
    account: "云岚内容增长",
    rechargeId: "RC-2026-07003",
    platformId: "XT20260709001",
    notes: "充值到账",
  },
  {
    time: "2026-07-09 18:20",
    type: "消耗",
    typeKey: "spend",
    amount: "-¥5,000.00",
    account: "云岚内容增长",
    rechargeId: "RC-2026-07003",
    platformId: "XT20260709002",
    notes: "达人采买消耗",
  },
  {
    time: "2026-07-10 09:15",
    type: "消耗",
    typeKey: "spend",
    amount: "-¥12,000.00",
    account: "云岚内容增长",
    rechargeId: "RC-2026-07003",
    platformId: "XT20260710001",
    notes: "广告投放消耗",
  },
  {
    time: "2026-07-10 11:40",
    type: "转入",
    typeKey: "transfer_in",
    amount: "+¥8,000.00",
    account: "云岚内容增长",
    rechargeId: "RC-2026-07003",
    platformId: "XT20260710002",
    notes: "账户间转入",
  },
  {
    time: "2026-07-10 14:05",
    type: "消耗",
    typeKey: "spend",
    amount: "-¥15,000.00",
    account: "云岚内容增长",
    rechargeId: "RC-2026-07003",
    platformId: "XT20260710003",
    notes: "助推投流消耗",
  },
];

const typeConfig: Record<string, { className: string; icon: React.ReactNode }> = {
  recharge: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <Plus className="h-3 w-3" />,
  },
  spend: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <Minus className="h-3 w-3" />,
  },
  transfer_in: {
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <ArrowDownRight className="h-3 w-3" />,
  },
  transfer_out: {
    className: "border-gray-200 bg-gray-50 text-gray-600",
    icon: <ArrowUpRight className="h-3 w-3" />,
  },
  refund: {
    className: "border-purple-200 bg-purple-50 text-purple-700",
    icon: <RotateCcw className="h-3 w-3" />,
  },
};

const filterCard = {
  account: "云岚内容增长",
  accountId: "ST-10086103",
  rechargeId: "RC-2026-07003",
  amount: "¥30,000.00",
};

const balanceCards = [
  { label: "当前账户余额", value: "¥58,200.00", icon: Wallet, accent: "bg-primary" },
  { label: "本月充值金额", value: "¥20,000.00", icon: TrendingUp, accent: "bg-emerald-500" },
  { label: "本月消耗金额", value: "¥32,000.00", icon: TrendingDown, accent: "bg-amber-500" },
  { label: "最近更新时间", value: "2026-07-10 14:32", icon: Clock4, accent: "bg-sapphire-muted" },
];

// ── Component ──────────────────────────────────────────────────────────────

function TransactionLedgerPage() {
  const [timeRange, setTimeRange] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");

  return (
    <div className="space-y-6 p-6">
      {/* ── Back Link ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">余额流水看板</span>
      </div>

      {/* ── Page Title ────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">余额流水看板</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          关联充值单 {filterCard.rechargeId} · 云岚内容增长流水明细
        </p>
      </div>

      {/* ── Filter Card ───────────────────────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">关联充值单：</span>
            <span className="font-mono text-sm text-foreground">{filterCard.rechargeId}</span>
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>星图账户：</span>
            <span className="font-medium text-foreground">{filterCard.account}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>账户 ID：</span>
            <span className="font-mono text-xs">{filterCard.accountId}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>充值金额：</span>
            <span className="font-semibold text-foreground">{filterCard.amount}</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Balance Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {balanceCards.map((card) => (
          <Card key={card.label} className="overflow-hidden border-border/60 shadow-sm">
            <div className={`h-1 w-full ${card.accent}`} />
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.accent} text-white`}>
                  <card.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className="mt-2 text-lg font-bold tracking-tight text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters Bar ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">筛选</span>
        </div>
        <Input
          type="date"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="h-9 w-40 text-xs"
          placeholder="开始日期"
        />
        <span className="text-xs text-muted-foreground">至</span>
        <Input
          type="date"
          className="h-9 w-40 text-xs"
          placeholder="结束日期"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-32 text-xs">
            <SelectValue placeholder="流水类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="recharge">充值</SelectItem>
            <SelectItem value="spend">消耗</SelectItem>
            <SelectItem value="transfer_in">转入</SelectItem>
            <SelectItem value="transfer_out">转出</SelectItem>
            <SelectItem value="refund">退款</SelectItem>
          </SelectContent>
        </Select>
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="h-9 w-36 text-xs">
            <SelectValue placeholder="星图账户" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部账户</SelectItem>
            <SelectItem value="ST-10086101">云岚品牌中心</SelectItem>
            <SelectItem value="ST-10086102">云岚效果投放</SelectItem>
            <SelectItem value="ST-10086103">云岚内容增长</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-9 gap-1.5">
          <Search className="h-3.5 w-3.5" />
          查询
        </Button>
        <div className="ml-auto">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Download className="h-3.5 w-3.5" />
            导出
          </Button>
        </div>
      </div>

      {/* ── Transaction Table ─────────────────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap font-semibold">流水时间</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">流水类型</TableHead>
                <TableHead className="whitespace-nowrap text-right font-semibold">金额</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">星图账户</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">对应充值单</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">平台流水号</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">备注</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx, i) => {
                const cfg = typeConfig[tx.typeKey] ?? typeConfig.spend;
                const isPositive = tx.amount.startsWith("+");
                return (
                  <TableRow key={i} className="h-14">
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {tx.time}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className={`gap-1 text-xs ${cfg.className}`}>
                        {cfg.icon}
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`whitespace-nowrap text-right font-semibold ${
                        isPositive ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {tx.amount}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{tx.account}</TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {tx.rechargeId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {tx.platformId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {tx.notes}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
