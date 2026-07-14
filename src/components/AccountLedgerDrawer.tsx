"use client";

import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Download, RotateCcw, Wallet, TrendingUp, TrendingDown,
  Clock4, ArrowDown, ArrowUp, X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LedgerAccountInfo {
  name: string;
  accountType: string;
  accountId: string;
  subject: string;
  balance: string;
  updatedAt: string;
}

interface AccountLedgerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: LedgerAccountInfo | null;
}

const accountTypeClass: Record<string, string> = {
  "主账户": "border-blue-200 bg-blue-50 text-blue-700",
  "投放账户": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "运营账户": "border-purple-200 bg-purple-50 text-purple-700",
  "品牌账户": "border-amber-200 bg-amber-50 text-amber-700",
};

// ── Data ───────────────────────────────────────────────────────────────────

const ledgerData = [
  { time: "2026-07-10 15:20", type: "充值", typeKey: "recharge", amount: "+¥50,000.00", balance: "¥286,500.00", rechargeId: "RC-2026-07001", platformId: "XT202607100001", notes: "米播充值到账" },
  { time: "2026-07-10 16:10", type: "消耗", typeKey: "spend", amount: "-¥8,000.00", balance: "¥278,500.00", rechargeId: "—", platformId: "XT202607100002", notes: "达人采买消耗" },
  { time: "2026-07-09 18:30", type: "冻结", typeKey: "freeze", amount: "-¥20,000.00", balance: "¥286,500.00", rechargeId: "—", platformId: "XT202607090008", notes: "订单冻结" },
  { time: "2026-07-09 19:10", type: "解冻", typeKey: "unfreeze", amount: "+¥5,000.00", balance: "¥291,500.00", rechargeId: "—", platformId: "XT202607090009", notes: "撤单解冻返还" },
];

const typeConfig: Record<string, { label: string; className: string }> = {
  recharge: { label: "充值", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  spend: { label: "消耗", className: "border-amber-200 bg-amber-50 text-amber-700" },
  transfer_in: { label: "转入", className: "border-blue-200 bg-blue-50 text-blue-700" },
  transfer_out: { label: "转出", className: "border-gray-200 bg-gray-50 text-gray-600" },
  refund: { label: "退款", className: "border-purple-200 bg-purple-50 text-purple-700" },
  freeze: { label: "冻结", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  unfreeze: { label: "解冻", className: "border-cyan-200 bg-cyan-50 text-cyan-700" },
};

// ── Component ──────────────────────────────────────────────────────────────

export function AccountLedgerDrawer({ open, onOpenChange, account }: AccountLedgerDrawerProps) {
  if (!account) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[720px]">
        {/* Header */}
        <SheetHeader className="space-y-3 border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-3.5 w-3.5 text-white" />
            </div>
            <SheetTitle>账户流水</SheetTitle>
          </div>
          {/* Account summary */}
          <div className="rounded-xl border border-border/60 bg-sapphire-subtle p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="h-4 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700">星图</Badge>
              <span className="text-sm font-semibold text-foreground">{account.name}</span>
              <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[account.accountType] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>{account.accountType}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-muted-foreground">账户 ID</span><p className="font-mono text-foreground">{account.accountId}</p></div>
              <div><span className="text-muted-foreground">账户主体</span><p className="text-foreground">{account.subject}</p></div>
              <div>
                <span className="text-muted-foreground">当前余额</span>
                <p className="text-xl font-bold text-foreground">{account.balance}</p>
              </div>
              <div><span className="text-muted-foreground">余额更新</span><p className="text-foreground">{account.updatedAt}</p></div>
            </div>
          </div>
        </SheetHeader>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-3">
          <Input type="date" className="h-9 w-36 text-xs" placeholder="开始日期" />
          <span className="text-xs text-muted-foreground">至</span>
          <Input type="date" className="h-9 w-36 text-xs" placeholder="结束日期" />
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="流水类型" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {Object.entries(typeConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
            </SelectContent>
          </Select>
          <Input className="h-9 w-32 text-xs" placeholder="充值单号" />
          <Button size="sm" className="h-9 gap-1"><Search className="h-3.5 w-3.5" />查询</Button>
          <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs"><RotateCcw className="h-3.5 w-3.5" />重置</Button>
          <div className="ml-auto">
            <Button variant="outline" size="sm" className="h-9 gap-1 text-xs"><Download className="h-3.5 w-3.5" />导出流水</Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {ledgerData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="whitespace-nowrap text-xs font-semibold">流水时间</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-semibold">流水类型</TableHead>
                  <TableHead className="whitespace-nowrap text-right text-xs font-semibold">变动金额</TableHead>
                  <TableHead className="whitespace-nowrap text-right text-xs font-semibold">账户余额</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-semibold">关联充值单</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-semibold">平台流水号</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-semibold">备注</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerData.map((row, i) => {
                  const cfg = typeConfig[row.typeKey] ?? typeConfig.spend;
                  const isPositive = row.amount.startsWith("+");
                  return (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{row.time}</TableCell>
                      <TableCell className="whitespace-nowrap"><Badge className={`gap-1 text-xs ${cfg.className}`}>{cfg.label}</Badge></TableCell>
                      <TableCell className={`whitespace-nowrap text-right text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>{row.amount}</TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs font-medium text-foreground">{row.balance}</TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">{row.rechargeId}</TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">{row.platformId}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{row.notes}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Wallet className="mb-3 h-10 w-10" />
              <p className="text-sm font-medium">暂无流水记录</p>
              <p className="mt-1 text-xs">该账户当前暂无可展示的流水数据。</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
