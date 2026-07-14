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
import { TaskDetailDrawer, type DetailTaskInfo } from "@/components/TaskDetailDrawer";
import { UploadPaymentModal, type PaymentTaskInfo, type UploadMode } from "@/components/UploadPaymentModal";
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

// Customer-facing 5-step flow: 提交申请 → 审核通过 → 财务确认 → 平台转账 → 充值完成
const regularStepLabels = ["提交申请", "审核通过", "财务确认", "平台转账", "充值完成"];
const specialStepLabels = ["提交特批申请", "米播评估", "特批通过", "充值完成"];

const regularStepDescs = [
  "客户已提交充值申请",
  "米播已完成账户与金额审核",
  "米播财务确认付款到账",
  "米播进行平台充值/账户划拨",
  "充值已完成，可查看账户余额",
];
const specialStepDescs = [
  "客户已提交特批充值申请",
  "米播正在评估特批申请",
  "特批申请已通过",
  "米播已完成特批充值处理",
];

const nodeStatusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  // Regular recharge nodes
  pending_audit: { label: "待审核", className: "border-blue-200 bg-blue-50 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  audit_approved: { label: "审核通过", className: "border-blue-200 bg-blue-50 text-blue-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  audit_rejected: { label: "审核驳回", className: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  finance_confirm: { label: "财务确认", className: "border-sky-200 bg-sky-50 text-sky-700", icon: <Upload className="h-3 w-3" /> },
  transferring: { label: "平台转账", className: "border-primary/30 bg-primary/10 text-primary", icon: <RefreshCw className="h-3 w-3" /> },
  completed: { label: "充值完成", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  transfer_error: { label: "转账异常", className: "border-red-200 bg-red-50 text-red-700", icon: <ShieldAlert className="h-3 w-3" /> },
  // Special recharge nodes
  sp_submitted: { label: "提交特批申请", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Clock className="h-3 w-3" /> },
  sp_evaluating: { label: "米播评估", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Zap className="h-3 w-3" /> },
  sp_approved: { label: "特批通过", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  sp_completed: { label: "充值完成", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  sp_rejected: { label: "特批未通过", className: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-3 w-3" /> },
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
  rechargeType: "regular" | "special";
  handler: string;
  statusDescription: string;
  step: number;
  totalSteps: number;
  time: string;
  purpose: string;
  orderCompleted: boolean;
  paymentStatus?: string;
  paymentAmount?: string;
  paymentTime?: string;
  paymentAccountName?: string;
  paymentBank?: string;
  paymentReceipt?: string;
  financeConfirmed?: boolean;
  financeConfirmedTime?: string;
  transferStatus?: string;
  transferId?: string;
  transferCompletedTime?: string;
  transferErrorReason?: string;
  transferSuggestion?: string;
  bankName?: string;
  bankAccount?: string;
}

type PaymentInfo = {
  statusLabel: string;
  statusClass: string;
  receiptFile?: string;
  actionLabel?: string;
  actionMode?: "upload" | "supplement" | "reupload_pre" | "reupload_post" | "reupload_error";
  isError?: boolean;
};

// In audit = step >= finance_confirm (step 3 for regular, step 2 for special)
function isInAudit(task: Task): boolean {
  if (task.rechargeType === "special") return task.step >= 2;
  return task.step >= 3;
}

function getPaymentInfo(task: Task): PaymentInfo {
  const hasReceipt = !!task.paymentReceipt;
  const isConfirmed = task.financeConfirmed;
  const inAudit = isInAudit(task);

  // Payment receipt error
  if (task.paymentStatus === "error")
    return { statusLabel: "凭证异常", statusClass: "border-red-200 bg-red-50 text-red-700", actionLabel: "重新上传", actionMode: "reupload_error", isError: true };
  if (isConfirmed)
    return { statusLabel: "已确认到账", statusClass: "border-emerald-200 bg-emerald-50 text-emerald-700", receiptFile: task.paymentReceipt, actionLabel: "申请重新上传", actionMode: "reupload_post" };
  if (hasReceipt && inAudit)
    return { statusLabel: "已进入审核", statusClass: "border-blue-200 bg-blue-50 text-blue-700", receiptFile: task.paymentReceipt, actionLabel: "申请重新上传", actionMode: "reupload_post" };
  if (hasReceipt)
    return { statusLabel: "已上传待确认", statusClass: "border-blue-200 bg-blue-50 text-blue-700", receiptFile: task.paymentReceipt, actionLabel: "重新上传", actionMode: "reupload_pre" };
  if (task.rechargeType === "special" && task.step >= task.totalSteps)
    return { statusLabel: "待上传凭证", statusClass: "border-amber-200 bg-amber-50 text-amber-700", actionLabel: "补传凭证", actionMode: "supplement" };
  return { statusLabel: "待上传凭证", statusClass: "border-amber-200 bg-amber-50 text-amber-700", actionLabel: "上传凭证", actionMode: "upload" };
}

function getOrderCompleted(task: Task): boolean {
  const atFinalStep = task.step >= task.totalSteps;
  if (task.rechargeType === "special") return atFinalStep && !!task.paymentReceipt;
  return atFinalStep;
}

function getStepTooltip(task: Task, index: number, isSpecial: boolean): string {
  const hasReceipt = !!task.paymentReceipt;
  const hasPaid = !!task.paymentReceipt;
  const stepNum = index + 1;

  if (isSpecial) {
    const tips = [
      "客户已提交特批充值申请",
      task.step >= 2 && task.node === "sp_rejected" ? "特批申请未通过，请查看详情" : "米播正在评估账户、金额、付款安排及业务情况",
      "特批申请已通过，米播将继续推进充值处理",
      stepNum === 4 && task.step >= 4 && !hasPaid
        ? "充值已完成，客户仍需按承诺时间付款并上传凭证"
        : stepNum === 4 && task.step >= 4 && hasPaid && !task.financeConfirmed
          ? "充值已完成，客户已上传付款凭证，等待米播确认"
          : stepNum === 4 && task.step >= 4 && task.financeConfirmed
            ? "充值已完成，付款凭证已确认到账"
            : "米播已完成特批充值处理",
    ];
    return tips[index] || "";
  }

  // Regular recharge tips
  const tips = [
    hasReceipt
      ? "客户已提交申请并上传付款凭证，等待米播审核"
      : "客户已提交申请，但付款凭证尚未上传",
    task.step >= 2
      ? "米播已完成账户、金额及申请信息审核"
      : "等待米播完成审核",
    task.paymentStatus === "error"
      ? "付款凭证存在异常，请查看详情并按要求重新上传"
      : hasReceipt
        ? "米播财务正在确认付款到账情况"
        : "等待客户上传付款凭证",
    "米播正在进行平台充值/账户划拨",
    stepNum === 5 && task.step >= 5
      ? "充值已完成，可查看账户余额和流水"
      : "充值完成后可查看账户余额",
  ];
  return tips[index] || "";
}

const tasks: Task[] = [
  // Row 1: Regular, paid, transferring
  {
    id: "RC-2026-07001", account: "云岚主账户", accountId: "ST-10086101", subject: "上海云岚科技有限公司",
    amount: "¥50,000.00", payableAmount: "¥49,000.00", discount: "98 折",
    node: "transferring", rechargeType: "regular",
    handler: "米播平台媒介", statusDescription: "财务已确认到账，正在进行平台转账处理",
    step: 4, totalSteps: 5, time: "2026-07-10 14:32", purpose: "达人采买", orderCompleted: false,
    paymentAmount: "¥49,000.00", paymentTime: "2026-07-10 15:05", paymentAccountName: "上海云岚科技有限公司",
    paymentBank: "招商银行上海分行", paymentReceipt: "回单_20260710.pdf",
    financeConfirmed: true, financeConfirmedTime: "2026-07-10 15:20", transferStatus: "处理中",
    bankName: "招商银行上海分行", bankAccount: "6222 **** **** 8888",
  },
  // Row 2: Regular, submitted, no receipt
  {
    id: "RC-2026-07002", account: "云岚投放账户 A", accountId: "ST-10086102", subject: "上海云岚科技有限公司",
    amount: "¥120,000.00", payableAmount: "¥117,600.00", discount: "98 折",
    node: "pending_audit", rechargeType: "regular",
    handler: "米播平台媒介", statusDescription: "客户已提交充值申请，等待上传付款凭证",
    step: 1, totalSteps: 5, time: "2026-07-10 11:15", purpose: "广告投放", orderCompleted: false,
  },
  // Row 3: Regular, completed
  {
    id: "RC-2026-07003", account: "云岚运营账户", accountId: "ST-10086103", subject: "上海云岚科技有限公司",
    amount: "¥30,000.00", payableAmount: "¥29,400.00", discount: "98 折",
    node: "completed", rechargeType: "regular",
    handler: "—", statusDescription: "充值已完成，资金已到云岚运营账户",
    step: 5, totalSteps: 5, time: "2026-07-09 16:48", purpose: "助推投流", orderCompleted: true,
    paymentAmount: "¥29,400.00", paymentTime: "2026-07-09 17:00", paymentAccountName: "上海云岚科技有限公司",
    paymentBank: "招商银行上海分行", paymentReceipt: "回单_20260709.pdf",
    financeConfirmed: true, financeConfirmedTime: "2026-07-09 17:05", transferStatus: "已完成",
    transferId: "XT20260709001", transferCompletedTime: "2026-07-09 17:10",
    bankName: "招商银行上海分行", bankAccount: "6222 **** **** 8888",
  },
  // Row 4: Special, uploaded pending, approved
  {
    id: "RC-2026-07004", account: "云岚投放账户 B", accountId: "ST-10086104", subject: "上海云岚科技有限公司",
    amount: "¥80,000.00", payableAmount: "¥78,400.00", discount: "98 折",
    node: "sp_approved", rechargeType: "special",
    handler: "米播", statusDescription: "特批已通过，客户已上传付款凭证，等待财务确认",
    step: 3, totalSteps: 4, time: "2026-07-10 10:20", purpose: "达人采买", orderCompleted: false,
    paymentAmount: "¥78,400.00", paymentTime: "2026-07-10 11:00", paymentAccountName: "上海云岚科技有限公司",
    paymentBank: "招商银行上海分行", paymentReceipt: "特批付款回单_20260710.pdf",
    financeConfirmed: false, bankName: "招商银行上海分行", bankAccount: "6222 **** **** 8888",
  },
  // Row 5: Special, completed, no receipt → order not complete
  {
    id: "RC-2026-07005", account: "云岚品牌账户", accountId: "ST-10086105", subject: "上海云岚科技有限公司",
    amount: "¥40,000.00", payableAmount: "¥39,200.00", discount: "98 折",
    node: "sp_completed", rechargeType: "special",
    handler: "—", statusDescription: "特批充值已完成，等待客户按承诺时间付款并上传凭证",
    step: 4, totalSteps: 4, time: "2026-07-08 18:30", purpose: "广告投放", orderCompleted: false,
  },
  // Row 6: Special, completed with receipt → order complete
  {
    id: "RC-2026-07006", account: "云岚品牌账户 C", accountId: "ST-10086106", subject: "上海云岚科技有限公司",
    amount: "¥60,000.00", payableAmount: "¥58,800.00", discount: "98 折",
    node: "sp_completed", rechargeType: "special",
    handler: "—", statusDescription: "特批充值已完成，客户已上传付款凭证",
    step: 4, totalSteps: 4, time: "2026-07-11 09:30", purpose: "广告投放", orderCompleted: true,
    paymentAmount: "¥58,800.00", paymentTime: "2026-07-11 10:00", paymentAccountName: "上海云岚科技有限公司",
    paymentBank: "招商银行上海分行", paymentReceipt: "特批回单_20260711.pdf",
    financeConfirmed: false, bankName: "招商银行上海分行", bankAccount: "6222 **** **** 8888",
  },
];

const taskSummary = [
  { label: "进行中任务", value: "5 笔", icon: ListTodo, accent: "bg-blue-50 text-blue-600" },
  { label: "待处理任务", value: "2 笔", icon: Zap, accent: "bg-amber-50 text-amber-600" },
  { label: "本月充值总额", value: "¥380,000.00", icon: TrendingUp, accent: "bg-emerald-50 text-emerald-600" },
  { label: "异常任务", value: "0 笔", icon: CheckCircle2, accent: "bg-gray-50 text-gray-400" },
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
  onViewDetail,
  onUploadPayment,
}: {
  onViewDetail: (task: Task) => void;
  onUploadPayment: (task: Task, mode: UploadMode) => void;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <ClipboardList className="h-3.5 w-3.5 text-white" />
              </div>
              <CardTitle className="text-base font-semibold">充值任务看板</CardTitle>
            </div>
            <CardDescription>查看最近充值任务及处理进度</CardDescription>
          </div>
          <div className="pt-2 sm:pt-0">
            <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
              <Link to="/recharge">查看全部<ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {taskSummary.map((item) => (
            <div key={item.label} className="rounded-xl border border-border/60 bg-sapphire-subtle p-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${item.accent}`}>
                  <item.icon className="h-3 w-3" />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="mt-1.5 text-lg font-bold tracking-tight text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap font-semibold min-w-[150px]">充值单信息</TableHead>
                <TableHead className="whitespace-nowrap font-semibold min-w-[170px]">账户信息</TableHead>
                <TableHead className="whitespace-nowrap font-semibold min-w-[160px]">金额信息</TableHead>
                <TableHead className="whitespace-nowrap font-semibold min-w-[190px]">当前节点</TableHead>
                <TableHead className="whitespace-nowrap font-semibold min-w-[200px]">付款信息</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">充值用途</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">订单状态</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">提交时间</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const node = nodeStatusMap[task.node];
                const isSpecial = task.rechargeType === "special";
                const isCompleted = task.step >= task.totalSteps && (task.node === "completed" || task.node === "sp_completed");
                const isError = task.node === "transfer_error" || task.node === "audit_rejected" || task.node === "sp_rejected";
                const stepLabels = isSpecial ? specialStepLabels : regularStepLabels;
                const payInfo = getPaymentInfo(task);

                return (
                  <TableRow key={task.id}>
                    {/* 充值单信息 */}
                    <TableCell className="whitespace-nowrap py-3">
                      <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 space-y-1.5">
                        <span className="font-mono text-sm font-semibold text-foreground">{task.id}</span>
                        <div>
                          {isSpecial ? (
                            <Badge className="gap-1 border-amber-200 bg-amber-50 text-xs text-amber-700"><Zap className="h-3 w-3" />特批充值</Badge>
                          ) : (
                            <Badge className="gap-1 border-blue-200 bg-blue-50 text-xs text-blue-700"><Wallet className="h-3 w-3" />常规充值</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* 账户信息 */}
                    <TableCell className="whitespace-nowrap py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge className="h-4 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700">星图</Badge>
                          <span className="text-sm font-semibold text-foreground">{task.account}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">账户 ID：{task.accountId}</p>
                        <p className="text-[11px] text-muted-foreground">主体：{task.subject}</p>
                      </div>
                    </TableCell>

                    {/* 金额信息 */}
                    <TableCell className="whitespace-nowrap py-3">
                      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-muted-foreground">充值金额</span>
                          <span className="font-semibold text-foreground">{task.amount}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                          <span className="text-muted-foreground">折扣</span>
                          <Badge className="h-4 gap-0.5 border-emerald-200 bg-emerald-50 px-1 text-[10px] text-emerald-700">{task.discount}</Badge>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-border/40 pt-1.5">
                          <span className="text-xs text-muted-foreground">实付金额</span>
                          <span className="text-sm font-bold text-primary">{task.payableAmount}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* 当前节点 */}
                    <TableCell className="whitespace-nowrap py-3">
                      <div className="space-y-2">
                        <Badge variant="outline" className={`gap-1 text-xs ${node.className}`}>{node.icon}{node.label}</Badge>
                        <div className="flex items-center gap-0.5">
                          {stepLabels.map((stepLabel, i) => {
                            const stepNum = i + 1;
                            let segClass = "bg-muted";
                            if (stepNum < task.step) segClass = "bg-emerald-400";
                            else if (stepNum === task.step) segClass = isError ? "bg-red-500" : isSpecial ? "bg-amber-500" : "bg-primary";
                            if (isCompleted && stepNum >= task.step) segClass = "bg-emerald-500";
                            const tip = getStepTooltip(task, i, isSpecial);
                            return (
                              <div key={stepLabel} className="group relative flex-1" title={stepLabel}>
                                <div className={`h-1.5 w-full rounded-full ${segClass}`} />
                                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] leading-relaxed text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">
                                  {tip}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className={`text-[11px] font-medium ${isError ? "text-destructive" : isCompleted ? "text-emerald-600" : "text-muted-foreground"}`}>
                          第 {task.step}/{task.totalSteps} 步{isError ? `｜${node.label}` : isCompleted ? `｜充值完成` : `｜${node.label}中`}
                        </p>
                      </div>
                    </TableCell>

                    {/* 付款信息 */}
                    <TableCell className="py-3">
                      <div className="rounded-lg border border-border/60 bg-white px-3 py-2.5 space-y-1.5 min-w-[140px]">
                        {/* Row 1: Status badge */}
                        <div className="flex items-center">
                          <Badge variant="outline" className={`gap-1 text-xs ${payInfo.statusClass}`}>{payInfo.statusLabel}</Badge>
                        </div>
                        {/* Row 2: File link (if exists) */}
                        {payInfo.receiptFile && (
                          <button className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                            <FileText className="h-3.5 w-3.5" />{payInfo.receiptFile}
                          </button>
                        )}
                        {/* Row 3: Primary action (only for upload/supplement/error) */}
                        {payInfo.actionLabel && payInfo.actionMode && (payInfo.isError || payInfo.actionMode === "upload" || payInfo.actionMode === "supplement") && (
                          <Button variant="outline" size="sm"
                            className={`h-7 gap-1 text-xs w-full ${payInfo.isError ? "border-red-200 text-red-600 hover:bg-red-50" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
                            onClick={() => onUploadPayment(task, payInfo.actionMode!)}>
                            <Upload className="h-3 w-3" />{payInfo.actionLabel}
                          </Button>
                        )}
                        {/* Row 3 alt: Weak re-upload link for non-error states with receipt */}
                        {payInfo.receiptFile && payInfo.actionMode && (payInfo.actionMode === "reupload_pre" || payInfo.actionMode === "reupload_post") && (
                          <button
                            className="text-[10px] text-muted-foreground hover:text-primary hover:underline transition-colors"
                            onClick={() => onUploadPayment(task, payInfo.actionMode!)}
                          >
                            上传内容有误？{payInfo.actionMode === "reupload_post" ? "申请重新上传" : "重新上传"}
                          </button>
                        )}
                      </div>
                    </TableCell>

                    {/* 充值用途 */}
                    <TableCell className="whitespace-nowrap py-4">
                      <Badge variant="outline" className="border-border text-xs font-normal text-muted-foreground">{task.purpose}</Badge>
                    </TableCell>

                    {/* 订单状态 */}
                    <TableCell className="whitespace-nowrap py-4">
                      {getOrderCompleted(task) ? (
                        <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700"><CheckCircle2 className="h-3 w-3" />已完成</Badge>
                      ) : (
                        <Badge className="gap-1 border-amber-200 bg-amber-50 text-xs text-amber-700"><Clock className="h-3 w-3" />未完成</Badge>
                      )}
                    </TableCell>

                    {/* 提交时间 */}
                    <TableCell className="whitespace-nowrap py-4">
                      <span className="text-xs text-muted-foreground">{task.time}</span>
                    </TableCell>

                    {/* 操作 */}
                    <TableCell className="whitespace-nowrap py-4">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => onViewDetail(task)}>
                        <Eye className="h-3 w-3" />查看详情
                      </Button>
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

function Index() {
  const navigate = useNavigate();
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);
  const [uploadPaymentOpen, setUploadPaymentOpen] = useState(false);
  const [uploadTask, setUploadTask] = useState<Task | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("upload");

  const handleRecharge = () => setRechargeModalOpen(true);
  const handleAddAccount = () => setAddAccountModalOpen(true);

  const handleViewDetail = useCallback((task: Task) => {
    setDetailTask(task);
    setDetailDrawerOpen(true);
  }, []);

  const handleUploadPayment = useCallback((task: Task, mode: UploadMode) => {
    setUploadTask(task);
    setUploadMode(mode);
    setUploadPaymentOpen(true);
  }, []);

  const buildPaymentTaskInfo = (t: Task | null): PaymentTaskInfo | null => {
    if (!t) return null;
    return { id: t.id, rechargeType: t.rechargeType, account: t.account, payableAmount: t.payableAmount, subject: t.subject };
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

  return (
    <div className="space-y-6 p-6">
      <WelcomeSection onRecharge={handleRecharge} />
      <StatsCards />

      <RechargeTasks onViewDetail={handleViewDetail} onUploadPayment={handleUploadPayment} />

      <AccountOverview onRecharge={handleRecharge} onAddAccount={handleAddAccount} />

      {/* ── Modals & Drawers ────────────────────────────── */}
      <RechargeModal
        open={rechargeModalOpen}
        onOpenChange={setRechargeModalOpen}
      />

      <TaskDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        task={buildDetailTaskInfo(detailTask)}
        onViewLedger={() => {
          setDetailDrawerOpen(false);
          navigate({ to: "/transaction-ledger" });
        }}
      />

      <AddAccountModal
        open={addAccountModalOpen}
        onOpenChange={setAddAccountModalOpen}
      />

      <UploadPaymentModal
        open={uploadPaymentOpen}
        onOpenChange={setUploadPaymentOpen}
        task={buildPaymentTaskInfo(uploadTask)}
        mode={uploadMode}
      />
    </div>
  );
}
