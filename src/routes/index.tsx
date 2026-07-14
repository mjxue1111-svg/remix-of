import { useState, useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  Building2,
  ChevronRight,
  Info,
  Plus,
  Eye,
  Layers,
  BarChart3,
  FileText,
  ShieldAlert,
  Ban,
  Clock4,
  ListTodo,
  Zap,
  Loader,
  ClipboardList,
  CreditCard,
  XCircle,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RechargeModal } from "@/components/RechargeModal";
import { AddAccountModal } from "@/components/AddAccountModal";
import { TaskProgressDrawer, type TaskInfo } from "@/components/TaskProgressDrawer";
import { UploadReceiptModal, type ReceiptTaskInfo } from "@/components/UploadReceiptModal";
import { TaskDetailDrawer, type DetailTaskInfo } from "@/components/TaskDetailDrawer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

export const Route = createFileRoute("/")({
  component: Index,
});

const nodeStatusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending_audit: {
    label: "待审核",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <Clock className="h-3 w-3" />,
  },
  audit_rejected: {
    label: "审核驳回",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: <XCircle className="h-3 w-3" />,
  },
  pending_payment: {
    label: "待打款",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <CreditCard className="h-3 w-3" />,
  },
  pending_confirm: {
    label: "待确认到账",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    icon: <Upload className="h-3 w-3" />,
  },
  transferring: {
    label: "平台转账中",
    className: "border-primary/30 bg-primary/10 text-primary",
    icon: <RefreshCw className="h-3 w-3 animate-spin" />,
  },
  completed: {
    label: "充值完成",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  transfer_error: {
    label: "到账异常",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: <ShieldAlert className="h-3 w-3" />,
  },
  cancelled: {
    label: "已取消",
    className: "border-gray-200 bg-gray-50 text-gray-500",
    icon: <XCircle className="h-3 w-3" />,
  },
};

interface Task {
  id: string;
  account: string;
  accountId: string;
  subject: string;
  amount: string;
  payableAmount: string;
  discount: string;
  node: string;
  handler: string;
  statusDescription: string;
  step: number;
  totalSteps: number;
  time: string;
  needsCustomer: boolean;
  // Payment info
  paymentAmount?: string;
  paymentTime?: string;
  paymentAccountName?: string;
  paymentBank?: string;
  paymentReceipt?: string;
  financeConfirmed?: boolean;
  financeConfirmedTime?: string;
  // Transfer info
  transferStatus?: string;
  transferId?: string;
  transferCompletedTime?: string;
  transferErrorReason?: string;
  transferSuggestion?: string;
  // Bank info for receipt
  bankName?: string;
  bankAccount?: string;
}

const tasks: Task[] = [
  {
    id: "RC-2026-07001",
    account: "云岚主账户",
    accountId: "ST-10086101",
    subject: "上海云岚科技有限公司",
    amount: "¥50,000.00",
    payableAmount: "¥49,000.00",
    discount: "98 折",
    node: "transferring",
    handler: "米播平台媒介",
    statusDescription: "财务已确认到账，正在进行平台转账处理",
    step: 5,
    totalSteps: 6,
    time: "2026-07-10 14:32",
    needsCustomer: false,
    paymentAmount: "¥49,000.00",
    paymentTime: "2026-07-10 15:05",
    paymentAccountName: "上海云岚科技有限公司",
    paymentBank: "招商银行上海分行",
    paymentReceipt: "回单_20260710.pdf",
    financeConfirmed: true,
    financeConfirmedTime: "2026-07-10 15:20",
    transferStatus: "处理中",
    bankName: "招商银行上海分行",
    bankAccount: "6222 **** **** 8888",
  },
  {
    id: "RC-2026-07002",
    account: "云岚投放账户 A",
    accountId: "ST-10086102",
    subject: "上海云岚科技有限公司",
    amount: "¥120,000.00",
    payableAmount: "¥117,600.00",
    discount: "98 折",
    node: "pending_confirm",
    handler: "米播财务",
    statusDescription: "客户已上传付款回单，等待米播财务确认到账",
    step: 4,
    totalSteps: 6,
    time: "2026-07-10 11:15",
    needsCustomer: false,
    paymentAmount: "¥117,600.00",
    paymentTime: "2026-07-10 11:50",
    paymentAccountName: "上海云岚科技有限公司",
    paymentBank: "招商银行上海分行",
    paymentReceipt: "回单_20260710_02.pdf",
    financeConfirmed: false,
    bankName: "招商银行上海分行",
    bankAccount: "6222 **** **** 8888",
  },
  {
    id: "RC-2026-07003",
    account: "云岚运营账户",
    accountId: "ST-10086103",
    subject: "上海云岚科技有限公司",
    amount: "¥30,000.00",
    payableAmount: "¥29,400.00",
    discount: "98 折",
    node: "completed",
    handler: "—",
    statusDescription: "充值已完成，资金已到云岚运营账户",
    step: 6,
    totalSteps: 6,
    time: "2026-07-09 16:48",
    needsCustomer: false,
    paymentAmount: "¥29,400.00",
    paymentTime: "2026-07-09 17:00",
    paymentAccountName: "上海云岚科技有限公司",
    paymentBank: "招商银行上海分行",
    paymentReceipt: "回单_20260709.pdf",
    financeConfirmed: true,
    financeConfirmedTime: "2026-07-09 17:05",
    transferStatus: "已完成",
    transferId: "XT20260709001",
    transferCompletedTime: "2026-07-09 17:10",
    bankName: "招商银行上海分行",
    bankAccount: "6222 **** **** 8888",
  },
];

const taskSummary = [
  {
    label: "进行中任务",
    value: "2 笔",
    icon: ListTodo,
    accent: "bg-blue-50 text-blue-600",
  },
  {
    label: "待我处理",
    value: "1 笔",
    icon: Zap,
    accent: "bg-amber-50 text-amber-600",
  },
  {
    label: "本月充值总额",
    value: "¥200,000.00",
    icon: TrendingUp,
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "异常任务",
    value: "0 笔",
    icon: CheckCircle2,
    accent: "bg-gray-50 text-gray-400",
  },
];

const accounts = [
  {
    name: "云岚主账户",
    accountId: "ST-10086101",
    subject: "上海云岚科技有限公司",
    balance: "¥286,500.00",
    monthlyRecharge: "¥100,000.00",
    monthlySpend: "¥68,000.00",
    status: "正常",
    updatedAt: "2026-07-10 14:32",
  },
  {
    name: "云岚投放账户 A",
    accountId: "ST-10086102",
    subject: "上海云岚科技有限公司",
    balance: "¥142,300.00",
    monthlyRecharge: "¥80,000.00",
    monthlySpend: "¥56,800.00",
    status: "正常",
    updatedAt: "2026-07-10 14:15",
  },
  {
    name: "云岚运营账户",
    accountId: "ST-10086103",
    subject: "上海云岚科技有限公司",
    balance: "¥58,200.00",
    monthlyRecharge: "¥20,000.00",
    monthlySpend: "¥32,000.00",
    status: "正常",
    updatedAt: "2026-07-10 13:58",
  },
];

const accountStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  "正常": {
    label: "正常",
    variant: "outline",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "审核中": {
    label: "审核中",
    variant: "secondary",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  "异常": {
    label: "异常",
    variant: "destructive",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  "不可充值": {
    label: "不可充值",
    variant: "secondary",
    className: "border-gray-200 bg-gray-50 text-gray-600",
  },
};

const accountSummary = [
  {
    label: "已绑定账户",
    value: "3 个",
    icon: Layers,
  },
  {
    label: "可充值账户",
    value: "3 个",
    icon: CheckCircle2,
  },
  {
    label: "账户总余额",
    value: "¥487,000.00",
    icon: Wallet,
  },
  {
    label: "最近更新时间",
    value: "2026-07-10 14:32",
    icon: Clock4,
  },
];

const balanceBreakdown = [
  { account: "云岚主账户", amount: "¥286,500.00" },
  { account: "云岚投放账户 A", amount: "¥142,300.00" },
  { account: "云岚运营账户", amount: "¥58,200.00" },
];

const rechargeBreakdown = [
  { account: "云岚主账户", amount: "¥100,000.00" },
  { account: "云岚投放账户 A", amount: "¥80,000.00" },
  { account: "云岚运营账户", amount: "¥20,000.00" },
];

const spendBreakdown = [
  { account: "云岚主账户", amount: "¥68,000.00" },
  { account: "云岚投放账户 A", amount: "¥56,800.00" },
  { account: "云岚运营账户", amount: "¥32,000.00" },
];

const taskBreakdown = [
  { label: "待上传凭证", count: "1 笔", color: "text-amber-600" },
  { label: "到账异常", count: "0 笔", color: "text-muted-foreground" },
  { label: "平台处理中", count: "1 笔", color: "text-blue-600" },
];

function WelcomeSection({ onRecharge }: { onRecharge: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-sapphire p-6 text-primary-foreground shadow-lg sm:p-8">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">上海云岚科技有限公司</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            欢迎回来，李明
          </h1>
          <p className="max-w-xl text-sm text-primary-foreground/90">
            这是您的企业充值工作台，可快速查看账户余额、充值进度与账户概览。
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          <Badge className="w-fit border-white/20 bg-white/15 text-white hover:bg-white/20">
            账户状态正常
          </Badge>
          <Button
            size="lg"
            onClick={onRecharge}
            className="bg-white text-primary shadow-md hover:bg-white/90"
          >
            <Wallet className="mr-2 h-4 w-4" />
            发起充值
          </Button>
        </div>
      </div>
      {/* Decorative circles */}
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/5" />
    </div>
  );
}

function StatsCards() {
  return (
    <section className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">账户资金总览</h2>
          <p className="text-xs text-muted-foreground">
            汇总展示当前客户名下所有已绑定账户的余额、充值、消耗及待处理任务。
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* ── Card 1: 账户总余额 ─────────────────────── */}
        <Popover>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
              <div className="h-1 w-full bg-primary" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">账户总余额</p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      ¥487,000.00
                    </p>
                    <p className="text-xs text-muted-foreground">已汇总 3 个账户</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                  <Eye className="h-3 w-3" />
                  查看明细
                </div>
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              账户余额拆分
            </p>
            <div className="space-y-2">
              {balanceBreakdown.map((b) => (
                <div key={b.account} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{b.account}</span>
                  <span className="text-sm font-semibold text-foreground">{b.amount}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">合计</span>
                  <span className="text-sm font-bold text-foreground">¥487,000.00</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              最近更新 2026-07-10 14:32
            </p>
          </PopoverContent>
        </Popover>

        {/* ── Card 2: 本月总充值 ────────────────────── */}
        <Popover>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
              <div className="h-1 w-full bg-emerald-500" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">本月总充值</p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      ¥200,000.00
                    </p>
                    <p className="text-xs text-muted-foreground">本月成功充值 3 笔</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
                  <Eye className="h-3 w-3" />
                  查看明细
                </div>
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              本月充值拆分
            </p>
            <div className="space-y-2">
              {rechargeBreakdown.map((b) => (
                <div key={b.account} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{b.account}</span>
                  <span className="text-sm font-semibold text-emerald-600">{b.amount}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">合计</span>
                  <span className="text-sm font-bold text-foreground">¥200,000.00</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* ── Card 3: 本月总消耗 ────────────────────── */}
        <Popover>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
              <div className="h-1 w-full bg-amber-500" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">本月总消耗</p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      ¥156,800.00
                    </p>
                    <p className="text-xs text-muted-foreground">已汇总 3 个账户</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-amber-600">
                  <Eye className="h-3 w-3" />
                  查看明细
                </div>
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              本月消耗拆分
            </p>
            <div className="space-y-2">
              {spendBreakdown.map((b) => (
                <div key={b.account} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{b.account}</span>
                  <span className="text-sm font-semibold text-amber-600">{b.amount}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">合计</span>
                  <span className="text-sm font-bold text-foreground">¥156,800.00</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* ── Card 4: 待处理充值任务 ────────────────── */}
        <Popover>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
              <div className="h-1 w-full bg-rose-500" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">待处理充值任务</p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      2 笔
                    </p>
                    <p className="text-xs text-muted-foreground">需客户处理 1 笔</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500 text-white">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-rose-600">
                  <Eye className="h-3 w-3" />
                  查看任务
                </div>
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              任务状态拆分
            </p>
            <div className="space-y-2">
              {taskBreakdown.map((t) => (
                <div key={t.label} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{t.label}</span>
                  <span className={`text-sm font-semibold ${t.color}`}>{t.count}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">合计</span>
                  <span className="text-sm font-bold text-foreground">2 笔</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
}

function RechargeTasks({
  onViewProgress,
  onUploadReceipt,
  onViewLedger,
  onViewDetail,
}: {
  onViewProgress: (task: Task) => void;
  onUploadReceipt: (task: Task) => void;
  onViewLedger: (task: Task) => void;
  onViewDetail: (task: Task) => void;
}) {
  // Determine operations per task status
  function getOperations(task: Task) {
    const node = task.node;
    switch (node) {
      case "pending_audit":
        // 客户无需操作，等待米播内部审核
        return { secondary: null, detail: true };
      case "audit_rejected":
        // 修改申请（主操作）+ 查看原因（次操作）
        return {
          primary: { label: "修改申请", icon: <FileText className="h-3 w-3" />, highlight: true },
          secondary: { label: "查看原因", icon: <ShieldAlert className="h-3 w-3" />, highlight: false, danger: true },
          detail: true,
        };
      case "pending_payment":
        // 上传回单（主操作）+ 查看收款信息（次操作）
        return {
          primary: { label: "上传回单", icon: <Upload className="h-3 w-3" />, highlight: true, isUpload: true },
          secondary: { label: "收款信息", icon: <Search className="h-3 w-3" />, highlight: false },
          detail: true,
        };
      case "pending_confirm":
        // 客户已上传回单，等待财务确认
        return {
          primary: { label: "查看回单", icon: <Eye className="h-3 w-3" />, highlight: false },
          detail: true,
        };
      case "transferring":
        // 客户无需操作，等待平台转账完成
        return {
          primary: { label: "查看进度", icon: <ArrowUpRight className="h-3 w-3" />, isProgress: true },
          detail: true,
        };
      case "completed":
        // 查看流水优先级更高
        return {
          primary: { label: "查看流水", icon: <FileText className="h-3 w-3" />, isLedger: true },
          detail: true,
        };
      case "transfer_error":
        // 补充回单（主操作，橙色/红色强调）+ 查看原因（次操作）
        return {
          primary: { label: "补充回单", icon: <Upload className="h-3 w-3" />, highlight: true, danger: true, isUpload: true },
          secondary: { label: "查看原因", icon: <ShieldAlert className="h-3 w-3" />, danger: true },
          detail: true,
        };
      case "cancelled":
        return { secondary: null, detail: true };
      default:
        return { detail: true };
    }
  }

  return (
    <Card className="border-border/60 shadow-sm">
      {/* ── Header ─────────────────────────────────────── */}
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <ClipboardList className="h-3.5 w-3.5 text-white" />
              </div>
              <CardTitle className="text-base font-semibold">充值任务看板</CardTitle>
            </div>
            <CardDescription>最近充值任务及待处理事项</CardDescription>
          </div>
          <div className="pt-2 sm:pt-0">
            <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
              <Link to="/recharge">
                查看全部
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6">
        {/* ── Summary Cards ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {taskSummary.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/60 bg-sapphire-subtle p-4"
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.accent}`}>
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Divider ──────────────────────────────────── */}
        <div className="border-t border-border" />

        {/* ── Table ────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap font-semibold">充值单号</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">星图账户</TableHead>
                <TableHead className="whitespace-nowrap text-right font-semibold">充值金额</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">当前节点</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">待处理方</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">提交时间</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const node = nodeStatusMap[task.node];
                const isCompleted = task.node === "completed";
                const isError = task.node === "transfer_error";
                const ops = getOperations(task);

                return (
                  <TableRow key={task.id} className="h-16">
                    {/* 充值单号 + 进度条 */}
                    <TableCell className="whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">{task.id}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : isError
                                    ? "bg-red-500"
                                    : "bg-primary"
                              }`}
                              style={{ width: `${(task.step / task.totalSteps) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            第 {task.step}/{task.totalSteps} 步
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    {/* 星图账户 */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-border">
                          <AvatarFallback className="bg-sapphire-muted text-[10px] font-medium text-primary">
                            {task.account.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.account}</span>
                      </div>
                    </TableCell>
                    {/* 充值金额 */}
                    <TableCell className="whitespace-nowrap text-right font-semibold text-foreground">
                      {task.amount}
                    </TableCell>
                    {/* 当前节点 */}
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={`gap-1 text-xs ${node.className}`}
                      >
                        {node.icon}
                        {node.label}
                      </Badge>
                    </TableCell>
                    {/* 待处理方 */}
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {task.handler}
                    </TableCell>
                    {/* 提交时间 */}
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {task.time}
                    </TableCell>
                    {/* 操作 */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Primary action */}
                        {ops.primary && (
                          <Button
                            size="sm"
                            variant={ops.primary.highlight ? "default" : "ghost"}
                            className={`h-7 gap-1 text-xs ${
                              ops.primary.highlight
                                ? ops.primary.danger
                                  ? "bg-amber-600 hover:bg-amber-700"
                                  : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                                : ops.primary.danger
                                  ? "text-destructive hover:text-destructive"
                                  : "text-primary hover:text-primary"
                            }`}
                            onClick={() => {
                              if (ops.primary?.isProgress) onViewProgress(task);
                              else if (ops.primary?.isUpload) onUploadReceipt(task);
                              else if (ops.primary?.isLedger) onViewLedger(task);
                            }}
                          >
                            {ops.primary.icon}
                            {ops.primary.label}
                          </Button>
                        )}
                        {/* Secondary action */}
                        {ops.secondary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 gap-1 text-xs ${
                              ops.secondary.danger
                                ? "text-destructive hover:text-destructive"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {ops.secondary.icon}
                            {ops.secondary.label}
                          </Button>
                        )}
                        {/* Detail button - always present */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => onViewDetail(task)}
                        >
                          <Eye className="h-3 w-3" />
                          查看详情
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountOverview({ onRecharge, onAddAccount }: { onRecharge: () => void; onAddAccount: () => void }) {
  return (
    <Card className="border-border/60 shadow-sm">
      {/* ── Header ─────────────────────────────────────── */}
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-3.5 w-3.5 text-white" />
              </div>
              <CardTitle className="text-base font-semibold">星图账户概览</CardTitle>
            </div>
            <CardDescription>已绑定星图账户及资金状态</CardDescription>
          </div>
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onAddAccount}>
              <Plus className="h-3.5 w-3.5" />
              新增账户
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
              查看全部
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6">
        {/* ── Summary Cards ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {accountSummary.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/60 bg-sapphire-subtle p-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sapphire-muted">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Divider ──────────────────────────────────── */}
        <div className="border-t border-border" />

        {/* ── Table ────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap font-semibold">账户名称</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">星图账户 ID</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">账户主体</TableHead>
                <TableHead className="whitespace-nowrap text-right font-semibold">当前余额</TableHead>
                <TableHead className="whitespace-nowrap text-right font-semibold">本月充值</TableHead>
                <TableHead className="whitespace-nowrap text-right font-semibold">本月消耗</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">账户状态</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">余额更新时间</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => {
                const statusCfg = accountStatusMap[account.status] ?? accountStatusMap["正常"];
                const isAbnormal = account.status === "异常" || account.status === "不可充值";
                return (
                  <TableRow key={account.accountId} className="h-16">
                    {/* 账户名称 */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="bg-sapphire-muted text-xs font-medium text-primary">
                            {account.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{account.name}</span>
                      </div>
                    </TableCell>
                    {/* 星图账户 ID */}
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {account.accountId}
                    </TableCell>
                    {/* 账户主体 */}
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {account.subject}
                    </TableCell>
                    {/* 当前余额 */}
                    <TableCell className="whitespace-nowrap text-right font-semibold text-foreground">
                      {account.balance}
                    </TableCell>
                    {/* 本月充值 */}
                    <TableCell className="whitespace-nowrap text-right text-sm text-emerald-600">
                      {account.monthlyRecharge}
                    </TableCell>
                    {/* 本月消耗 */}
                    <TableCell className="whitespace-nowrap text-right text-sm text-amber-600">
                      {account.monthlySpend}
                    </TableCell>
                    {/* 账户状态 */}
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={statusCfg.variant} className={`gap-1 text-xs ${statusCfg.className} hover:${statusCfg.className}`}>
                        {account.status === "正常" && <CheckCircle2 className="h-3 w-3" />}
                        {account.status === "审核中" && <Clock4 className="h-3 w-3" />}
                        {account.status === "异常" && <ShieldAlert className="h-3 w-3" />}
                        {account.status === "不可充值" && <Ban className="h-3 w-3" />}
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    {/* 余额更新时间 */}
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {account.updatedAt}
                    </TableCell>
                    {/* 操作 */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isAbnormal ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-7 text-xs text-muted-foreground"
                          >
                            <Ban className="mr-1 h-3 w-3" />
                            发起充值
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onRecharge}
                            className="h-7 border-primary/30 bg-sapphire-subtle text-xs text-primary hover:bg-sapphire-muted"
                          >
                            <Wallet className="mr-1 h-3 w-3" />
                            发起充值
                          </Button>
                        )}
                        {isAbnormal ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive"
                          >
                            <ShieldAlert className="mr-1 h-3 w-3" />
                            查看原因
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <FileText className="mr-1 h-3 w-3" />
                            查看流水
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          详情
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function OperationTips() {
  const steps = [
    "提交申请",
    "审核通过",
    "打款上传回单",
    "财务确认",
    "平台转账",
    "充值完成",
  ];

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">操作提示</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">充值流程</p>
          <div className="relative space-y-2 pl-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sapphire-muted text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <span className="text-sm text-muted-foreground">{step}</span>
                {index < steps.length - 1 && (
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-border" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">到账时间提醒</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                下午 5 点后提交的充值申请，财务确认及平台转账可能顺延至下一个工作日处理，请提前安排充值时间。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Index() {
  const navigate = useNavigate();
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);

  // Drawer / Modal states
  const [progressDrawerOpen, setProgressDrawerOpen] = useState(false);
  const [progressTask, setProgressTask] = useState<Task | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTask, setUploadTask] = useState<Task | null>(null);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);

  const handleRecharge = () => setRechargeModalOpen(true);
  const handleAddAccount = () => setAddAccountModalOpen(true);

  // Callbacks for task operations
  const handleViewProgress = useCallback((task: Task) => {
    setProgressTask(task);
    setProgressDrawerOpen(true);
  }, []);

  const handleUploadReceipt = useCallback((task: Task) => {
    setUploadTask(task);
    setUploadModalOpen(true);
  }, []);

  const handleViewLedger = useCallback((_task: Task) => {
    navigate({ to: "/transaction-ledger" });
  }, [navigate]);

  const handleViewDetail = useCallback((task: Task) => {
    setDetailTask(task);
    setDetailDrawerOpen(true);
  }, []);

  // Build drawer/modal info from selected task
  const buildProgressTaskInfo = (t: Task | null): TaskInfo | null => {
    if (!t) return null;
    const node = nodeStatusMap[t.node];
    return {
      id: t.id,
      account: t.account,
      amount: t.amount,
      node: t.node,
      nodeLabel: node?.label ?? "",
      nodeClassName: node?.className ?? "",
      handler: t.handler,
      step: t.step,
    };
  };

  const buildDetailTaskInfo = (t: Task | null): DetailTaskInfo | null => {
    if (!t) return null;
    const node = nodeStatusMap[t.node];
    return {
      id: t.id,
      account: t.account,
      accountId: t.accountId,
      amount: t.amount,
      payableAmount: t.payableAmount,
      discount: t.discount,
      node: t.node,
      nodeLabel: node?.label ?? "",
      nodeClassName: node?.className ?? "",
      handler: t.handler,
      statusDescription: t.statusDescription,
      time: t.time,
      paymentAmount: t.paymentAmount,
      paymentTime: t.paymentTime,
      paymentAccountName: t.paymentAccountName,
      paymentBank: t.paymentBank,
      paymentReceipt: t.paymentReceipt,
      financeConfirmed: t.financeConfirmed,
      financeConfirmedTime: t.financeConfirmedTime,
      transferStatus: t.transferStatus,
      transferId: t.transferId,
      transferCompletedTime: t.transferCompletedTime,
      transferErrorReason: t.transferErrorReason,
      transferSuggestion: t.transferSuggestion,
    };
  };

  const buildReceiptTaskInfo = (t: Task | null): ReceiptTaskInfo | null => {
    if (!t) return null;
    return {
      id: t.id,
      account: t.account,
      amount: t.amount,
      subject: t.subject,
      bankName: t.bankName ?? "",
      bankAccount: t.bankAccount ?? "",
      payableAmount: t.payableAmount,
    };
  };

  return (
    <div className="space-y-6 p-6">
      <WelcomeSection onRecharge={handleRecharge} />
      <StatsCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RechargeTasks
            onViewProgress={handleViewProgress}
            onUploadReceipt={handleUploadReceipt}
            onViewLedger={handleViewLedger}
            onViewDetail={handleViewDetail}
          />
        </div>
        <div>
          <OperationTips />
        </div>
      </div>

      <AccountOverview onRecharge={handleRecharge} onAddAccount={handleAddAccount} />

      {/* ── Modals & Drawers ────────────────────────────── */}
      <RechargeModal
        open={rechargeModalOpen}
        onOpenChange={setRechargeModalOpen}
      />

      <TaskProgressDrawer
        open={progressDrawerOpen}
        onOpenChange={setProgressDrawerOpen}
        task={buildProgressTaskInfo(progressTask)}
        onViewDetail={() => {
          setProgressDrawerOpen(false);
          if (progressTask) handleViewDetail(progressTask);
        }}
      />

      <UploadReceiptModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        task={buildReceiptTaskInfo(uploadTask)}
      />

      <TaskDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        task={buildDetailTaskInfo(detailTask)}
        onViewProgress={() => {
          setDetailDrawerOpen(false);
          if (detailTask) {
            setTimeout(() => handleViewProgress(detailTask), 100);
          }
        }}
        onViewLedger={() => {
          setDetailDrawerOpen(false);
          navigate({ to: "/transaction-ledger" });
        }}
        onUploadReceipt={() => {
          setDetailDrawerOpen(false);
          if (detailTask) {
            setTimeout(() => handleUploadReceipt(detailTask), 100);
          }
        }}
      />

      <AddAccountModal
        open={addAccountModalOpen}
        onOpenChange={setAddAccountModalOpen}
      />
    </div>
  );
}
