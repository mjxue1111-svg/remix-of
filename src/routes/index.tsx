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
import { AddAccountModal, type AddAccountInitialData } from "@/components/AddAccountModal";
import { TaskDetailDrawer, type DetailTaskInfo } from "@/components/TaskDetailDrawer";
import { UploadPaymentModal, type PaymentTaskInfo, type UploadMode } from "@/components/UploadPaymentModal";
import { VoucherUploadModalLazy, type SpecialPaymentTaskInfo } from "@/components/semi/VoucherUploadModalLazy";
import { CancelOrderModal, type CancelTaskInfo } from "@/components/CancelOrderModal";
import { CancelCompletedOrderModal, type CancelCompletedTaskInfo } from "@/components/CancelCompletedOrderModal";
import { RefundRequestModal, type RefundTaskInfo } from "@/components/RefundRequestModal";
import { AccountLedgerDrawer, type LedgerAccountInfo } from "@/components/AccountLedgerDrawer";
import { AccountDetailDrawer, type DetailAccountInfo } from "@/components/AccountDetailDrawer";
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

// Customer-facing 4-step flow: 客户提交申请 → 米播审核 → 米播进行账户充值 → 充值完成
const regularStepLabels = ["客户提交申请", "米播审核", "米播进行账户充值", "充值完成"];
const specialStepLabels = ["客户提交特批申请", "米播评估", "特批通过", "充值完成", "客户上传付款凭证"];

const regularStepDescs = [
  "客户已填写充值信息并提交充值申请",
  "米播正在审核充值信息、账户信息及付款凭证",
  "米播审核通过，正在进行账户充值处理",
  "米播正在完成账户充值",
];
const regularStepDescsCompleted = [
  "客户已填写充值信息并提交充值申请",
  "米播已完成审核",
  "米播已完成账户充值处理",
  "米播已完成账户充值，客户账户余额已更新",
];
const regularStepDescsPending = [
  "客户将填写充值信息并提交充值申请",
  "米播将审核充值信息、账户信息及金额信息",
  "米播审核通过后将进行账户充值处理",
  "充值完成后，客户账户余额将更新",
];
const specialStepDescs = [
  "客户已提交特批充值申请，说明特批原因及承诺付款安排",
  "米播正在评估特批申请",
  "米播正在处理特批申请",
  "米播正在进行账户充值处理",
  "请上传付款凭证以完成补款确认",
];
const specialStepDescsCompleted = [
  "客户已提交特批充值申请，说明特批原因及承诺付款安排",
  "米播已完成特批评估",
  "特批申请已通过，米播可先行处理充值",
  "米播已完成客户账户充值",
  "客户已上传付款凭证，财务已确认到账",
];
const specialStepDescsPending = [
  "客户将提交特批充值申请",
  "米播将评估账户、金额、付款安排及业务情况",
  "待米播评估通过后进入特批处理",
  "待特批通过后进行账户充值处理",
  "客户需按承诺时间付款并上传凭证",
];

const nodeStatusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  // Draft
  draft: { label: "草稿", className: "border-gray-200 bg-gray-50 text-gray-500", icon: <FileText className="h-3 w-3" /> },
  // Regular recharge nodes (customer-facing, active states use "中")
  pending_audit: { label: "米播审核中", className: "border-blue-200 bg-blue-50 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  audit_approved: { label: "米播审核中", className: "border-blue-200 bg-blue-50 text-blue-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  audit_rejected: { label: "已驳回", className: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  finance_confirm: { label: "米播进行账户充值中", className: "border-sky-200 bg-sky-50 text-sky-700", icon: <RefreshCw className="h-3 w-3" /> },
  transferring: { label: "米播进行账户充值中", className: "border-primary/30 bg-primary/10 text-primary", icon: <RefreshCw className="h-3 w-3" /> },
  completed: { label: "已完成", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  transfer_error: { label: "充值失败", className: "border-red-200 bg-red-50 text-red-700", icon: <ShieldAlert className="h-3 w-3" /> },
  // Special recharge nodes
  sp_submitted: { label: "米播评估中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Clock className="h-3 w-3" /> },
  sp_evaluating: { label: "米播评估中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Zap className="h-3 w-3" /> },
  sp_approved: { label: "特批处理中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  sp_completed: { label: "米播进行账户充值中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  sp_payment_pending: { label: "客户上传付款凭证中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Upload className="h-3 w-3" /> },
  sp_payment_uploaded: { label: "付款凭证确认中", className: "border-blue-200 bg-blue-50 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  sp_payment_rejected: { label: "已驳回", className: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  sp_rejected: { label: "已驳回", className: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-3 w-3" /> },
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
  isDraft?: boolean;
  accountType?: string;
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

// ── Rejection helpers ──────────────────────────────────────────────────────
function isPaymentRejected(task: Task): boolean {
  if (task.rechargeType === "special") {
    return task.node === "sp_payment_rejected" || (task.paymentStatus === "error" && task.step >= 5);
  }
  return task.paymentStatus === "error" && task.node === "audit_rejected";
}

function getRejectHoverTip(task: Task): string {
  if (task.rechargeType === "special" && isPaymentRejected(task)) {
    return "补款凭证被驳回，请重新上传";
  }
  if (task.rechargeType === "regular" && isPaymentRejected(task)) {
    return "付款凭证被驳回，请重新上传";
  }
  if (task.node === "audit_rejected") {
    return "申请已驳回，请查看原因";
  }
  if (task.node === "sp_rejected") {
    return "特批申请已驳回，请查看原因";
  }
  if (task.node === "transfer_error") {
    return "充值处理失败，可申请退款";
  }
  return "已驳回";
}

function getCurrentStepDesc(task: Task): string {
  const isSpecial = task.rechargeType === "special";
  const stepIdx = task.step - 1;
  const isError = task.node === "transfer_error" || task.node === "audit_rejected" || task.node === "sp_rejected" || task.node === "sp_payment_rejected";
  const isCompleted = getOrderCompleted(task);

  if (task.isDraft) return "草稿，尚未正式提交";
  if (isCompleted) {
    if (isSpecial && task.financeConfirmed) return "付款凭证已确认，订单已完成";
    return isSpecial ? "米播已完成客户账户充值，请上传付款凭证" : "米播已完成账户充值，客户账户余额已更新";
  }
  if (isError) return getRejectHoverTip(task);

  if (isSpecial && task.step === 5 && task.paymentReceipt && task.node === "sp_payment_uploaded") {
    return "付款凭证已提交，米播正在确认到账";
  }

  return isSpecial ? specialStepDescs[stepIdx] : regularStepDescs[stepIdx];
}

function getOrderCompleted(task: Task): boolean {
  const atFinalStep = task.step >= task.totalSteps;
  if (task.rechargeType === "special") return atFinalStep && !!task.financeConfirmed;
  return atFinalStep;
}

function canCancelOrder(task: Task): boolean {
  return task.isDraft === true || getOrderCompleted(task);
}

// 仅"充值失败"（transfer_error）状态的订单可申请退款：常规充值第 3 步、特批充值第 4 步执行充值时失败
function canRefund(task: Task): boolean {
  return !task.isDraft && task.node === "transfer_error";
}

function getStepTooltip(task: Task, index: number, isSpecial: boolean): string {
  const hasReceipt = !!task.paymentReceipt;
  const stepNum = index + 1;

  if (isSpecial) {
    const tips = [
      "客户已提交特批充值申请",
      "米播正在评估账户、金额、付款安排及业务情况",
      "特批申请已通过，米播可先行处理充值",
      "米播已完成客户账户充值",
      stepNum === 5 && task.step >= 5 && task.financeConfirmed
        ? "客户已上传付款凭证，财务已确认到账"
        : stepNum === 5 && task.step >= 4 && hasReceipt && !task.financeConfirmed
          ? "客户已上传付款凭证，等待财务确认到账"
          : stepNum === 5 && task.step >= 4 && !hasReceipt
            ? "客户需按承诺时间付款并上传凭证"
            : "客户上传付款凭证，待财务确认",
    ];
    return tips[index] || "";
  }

  // Regular recharge tips (4 steps)
  const tips = [
    hasReceipt
      ? "客户已提交充值申请并上传付款凭证"
      : "客户已提交充值申请",
    task.step >= 2
      ? "米播已完成审核"
      : "米播正在审核充值信息、账户及金额",
    task.step >= 3
      ? "米播已完成内部财务确认、付款及账户充值处理"
      : "米播审核通过后进行内部财务确认、付款及账户充值",
    stepNum === 4 && task.step >= 4
      ? "充值已完成，可查看账户余额和流水"
      : "米播完成充值后，账户余额将自动更新",
  ];
  return tips[index] || "";
}

const tasks: Task[] = [
  // Row 0: Draft — pinned top
  {
    id: "RC-2026-07006", account: "云岚品牌中心", accountType: "主账户", accountId: "ST-10086101", subject: "上海云岚科技有限公司",
    amount: "¥100,000.00", payableAmount: "¥98,000.00", discount: "98 折",
    node: "draft", rechargeType: "regular", isDraft: true,
    handler: "—", statusDescription: "草稿，尚未正式提交",
    step: 0, totalSteps: 4, time: "2026-07-10 15:20", purpose: "达人采买", orderCompleted: false,
  },
  // Row 1: Regular, submitted, pending audit
  {
    id: "RC-2026-07001", account: "云岚效果投放", accountType: "投放账户", accountId: "ST-10086102", subject: "上海云岚科技有限公司",
    amount: "¥120,000.00", payableAmount: "¥117,600.00", discount: "98 折",
    node: "pending_audit", rechargeType: "regular",
    handler: "米播平台媒介", statusDescription: "客户已提交充值申请，等待米播审核",
    step: 2, totalSteps: 4, time: "2026-07-10 11:15", purpose: "广告投放",
    paymentReceipt: "客户回单_20260710.pdf", paymentAmount: "¥117,600.00", paymentTime: "2026-07-10 11:15", paymentAccountName: "上海云岚科技有限公司",
    financeConfirmed: false, orderCompleted: false,
  },
  // Row 2: Special, completed, no receipt → order not complete
  {
    id: "RC-2026-07005", account: "云岚达人合作", accountType: "品牌账户", accountId: "ST-10086105", subject: "上海云岚科技有限公司",
    amount: "¥40,000.00", payableAmount: "¥39,200.00", discount: "98 折",
    node: "sp_payment_pending", rechargeType: "special",
    handler: "—", statusDescription: "充值已完成，等待客户按承诺时间付款并上传凭证",
    step: 5, totalSteps: 5, time: "2026-07-08 18:30", purpose: "广告投放", orderCompleted: false,
  },
  // Row 3: Regular, transfer failed at step 3 → 充值失败，可申请退款
  {
    id: "RC-2026-07020", account: "云岚内容增长", accountType: "运营账户", accountId: "ST-10086103", subject: "上海云岚科技有限公司",
    amount: "¥60,000.00", payableAmount: "¥58,800.00", discount: "98 折",
    node: "transfer_error", rechargeType: "regular",
    handler: "米播平台媒介", statusDescription: "充值处理失败，可申请退款",
    step: 3, totalSteps: 4, time: "2026-07-09 10:20", purpose: "达人采买", orderCompleted: false,
  },
  // Row 4: Regular, completed → 充值完成
  {
    id: "RC-2026-07010", account: "云岚内容增长", accountType: "运营账户", accountId: "ST-10086103", subject: "上海云岚科技有限公司",
    amount: "¥80,000.00", payableAmount: "¥78,400.00", discount: "98 折",
    node: "completed", rechargeType: "regular",
    handler: "—", statusDescription: "米播已完成账户充值，客户账户余额已更新",
    step: 4, totalSteps: 4, time: "2026-07-13 16:30", purpose: "助推投流",
    paymentReceipt: "回单_20260713.pdf", financeConfirmed: true, orderCompleted: true,
  },
];

const taskSummary = [
  { label: "进行中任务", value: "5 笔", icon: ListTodo, accent: "bg-blue-50 text-blue-600" },
  { label: "待处理任务", value: "2 笔", icon: Zap, accent: "bg-amber-50 text-amber-600" },
  { label: "本月充值总额", value: "¥380,000.00", icon: TrendingUp, accent: "bg-emerald-50 text-emerald-600" },
  { label: "异常任务", value: "1 笔", icon: ShieldAlert, accent: "bg-red-50 text-red-600" },
];

const accounts = [
  {
    name: "云岚品牌中心", accountType: "主账户",
    accountId: "ST-10086101",
    subject: "上海云岚科技有限公司",
    balance: "¥286,500.00",
    monthlyRecharge: "¥100,000.00",
    monthlySpend: "¥68,000.00",
    status: "正常",
    updatedAt: "2026-07-10 14:32",
    directClientId: "DK-77015",
    contactName: "李明", contactPhone: "17388884451", contactEmail: "shu.yan@yunlan.com",
    proofType: "bank" as const, proofBankName: "招商银行股份有限公司上海张江支行", proofBankCard: "6225888899990001", proofAuthAccountId: "",
    materialFiles: [
      { name: "营业执照_云岚品牌中心.pdf", sizeKB: 764 },
      { name: "品牌LOGO.png", sizeKB: 210 },
    ],
  },
  {
    name: "云岚效果投放", accountType: "投放账户",
    accountId: "ST-10086102",
    subject: "上海云岚科技有限公司",
    balance: "¥142,300.00",
    monthlyRecharge: "¥80,000.00",
    monthlySpend: "¥56,800.00",
    status: "正常",
    updatedAt: "2026-07-10 14:15",
    directClientId: "DK-77016",
    contactName: "赵蕾", contactPhone: "13911112222", contactEmail: "zhaolei@yunlan.com",
    proofType: "auth" as const, proofBankName: "", proofBankCard: "", proofAuthAccountId: "ST-90021078",
    materialFiles: [
      { name: "账户授权书_云岚效果投放.pdf", sizeKB: 528 },
    ],
  },
  {
    name: "云岚内容增长", accountType: "运营账户",
    accountId: "ST-10086103",
    subject: "上海云岚科技有限公司",
    balance: "¥58,200.00",
    monthlyRecharge: "¥20,000.00",
    monthlySpend: "¥32,000.00",
    status: "正常",
    updatedAt: "2026-07-10 13:58",
    directClientId: "DK-77017",
    contactName: "孙昊", contactPhone: "18600003333", contactEmail: "sunhao@yunlan.com",
    proofType: "bank" as const, proofBankName: "招商银行股份有限公司上海张江支行", proofBankCard: "6225888899990002", proofAuthAccountId: "",
    materialFiles: [
      { name: "营业执照_云岚内容增长.pdf", sizeKB: 701 },
      { name: "软著证书.pdf", sizeKB: 389 },
    ],
  },
  {
    name: "云岚效果推广", accountType: "投放账户",
    accountId: "ST-10086107",
    subject: "上海云岚科技有限公司",
    balance: "",
    monthlyRecharge: "",
    monthlySpend: "",
    status: "审核驳回",
    updatedAt: "",
    rejectReason: "账户证明材料模糊，无法核实开户信息，请重新上传清晰的证明材料。",
    draftData: {
      subject: "上海云岚科技有限公司",
      directClientId: "DK-88213",
      contactName: "王芳",
      contactPhone: "13800001234",
      contactEmail: "wangfang@yunlan.com",
      proofType: "bank" as const,
      proofBankName: "招商银行股份有限公司上海张江支行",
      proofBankCard: "6225888899990099",
      proofAuthAccountId: "",
      existingFiles: [
        { name: "营业执照_云岚效果推广.pdf", sizeKB: 812 },
        { name: "品牌LOGO.png", sizeKB: 156 },
      ],
    },
  },
  {
    name: "云岚直播推广", accountType: "投放账户",
    accountId: "ST-10086106",
    subject: "上海云岚科技有限公司",
    balance: "",
    monthlyRecharge: "",
    monthlySpend: "",
    status: "待审核",
    updatedAt: "",
  },
];

const accountTypeClass: Record<string, string> = {
  "主账户": "border-blue-200 bg-blue-50 text-blue-700",
  "投放账户": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "运营账户": "border-purple-200 bg-purple-50 text-purple-700",
  "品牌账户": "border-amber-200 bg-amber-50 text-amber-700",
};

const accountStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  "正常": {
    label: "正常",
    variant: "outline",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "待审核": {
    label: "待审核",
    variant: "outline",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  "审核驳回": {
    label: "审核驳回",
    variant: "outline",
    className: "border-red-200 bg-red-50 text-red-700",
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

const balanceBreakdown = [
  { account: "云岚品牌中心", amount: "¥286,500.00" },
  { account: "云岚效果投放", amount: "¥142,300.00" },
  { account: "云岚内容增长", amount: "¥58,200.00" },
];

const rechargeBreakdown = [
  { account: "云岚品牌中心", amount: "¥100,000.00" },
  { account: "云岚效果投放", amount: "¥80,000.00" },
  { account: "云岚内容增长", amount: "¥20,000.00" },
];

const spendBreakdown = [
  { account: "云岚品牌中心", amount: "¥68,000.00" },
  { account: "云岚效果投放", amount: "¥56,800.00" },
  { account: "云岚内容增长", amount: "¥32,000.00" },
];

const taskBreakdown = [
  { label: "待上传凭证", count: "1 笔", color: "text-amber-600" },
  { label: "到账异常", count: "0 笔", color: "text-muted-foreground" },
  { label: "平台处理中", count: "1 笔", color: "text-blue-600" },
];

function WelcomeSection({ onRecharge, onAddAccount }: { onRecharge: () => void; onAddAccount: () => void }) {
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
        <div className="flex shrink-0 flex-col gap-2.5 sm:items-end">
          <Badge className="w-fit border-white/20 bg-white/15 text-white hover:bg-white/20">
            账户状态正常
          </Badge>
          <Button
            onClick={onAddAccount}
            className="bg-white text-primary shadow-md hover:bg-white/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            新增账户
          </Button>
          <Button
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
  onRecharge,
  onCancelOrder,
  onCancelCompletedOrder,
  onContinueSubmit,
  onSpecialPayment,
  onRefundRequest,
}: {
  onViewDetail: (task: Task) => void;
  onUploadPayment: (task: Task, mode: UploadMode) => void;
  onRecharge: () => void;
  onCancelOrder: (task: Task) => void;
  onCancelCompletedOrder: (task: Task) => void;
  onContinueSubmit: (task: Task) => void;
  onSpecialPayment: (task: Task) => void;
  onRefundRequest: (task: Task) => void;
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
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <Button size="sm" className="gap-1.5" onClick={onRecharge}>
              <Wallet className="h-3.5 w-3.5" />发起充值
            </Button>
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
                <TableHead className="whitespace-nowrap font-semibold min-w-[130px]">充值单号</TableHead>
                <TableHead className="whitespace-nowrap font-semibold min-w-[100px]">充值处理方式</TableHead>
                <TableHead className="whitespace-nowrap font-semibold min-w-[170px]">账户信息</TableHead>
                <TableHead className="whitespace-nowrap font-semibold min-w-[160px]">金额信息</TableHead>
                <TableHead className="whitespace-nowrap font-semibold min-w-[190px]">当前节点</TableHead>
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
                const isCompleted = getOrderCompleted(task);
                const isError = task.node === "transfer_error" || task.node === "audit_rejected" || task.node === "sp_rejected" || task.node === "sp_payment_rejected";
                const stepLabels = isSpecial ? specialStepLabels : regularStepLabels;

                return (
                  <TableRow key={task.id}>
                    {/* 充值单号 */}
                    <TableCell className="whitespace-nowrap py-3">
                      {task.isDraft ? (
                        <span className="text-sm text-muted-foreground">——</span>
                      ) : (
                        <button
                          className="font-mono text-sm font-semibold text-primary hover:underline"
                          onClick={() => onViewDetail(task)}
                        >
                          {task.id}
                        </button>
                      )}
                    </TableCell>
                    {/* 充值处理方式 */}
                    <TableCell className="whitespace-nowrap py-3">
                      {isSpecial ? (
                        <Badge className="gap-1 border-amber-200 bg-amber-50 text-xs text-amber-700"><Zap className="h-3 w-3" />特批充值</Badge>
                      ) : (
                        <Badge className="gap-1 border-blue-200 bg-blue-50 text-xs text-blue-700"><Wallet className="h-3 w-3" />常规充值</Badge>
                      )}
                    </TableCell>

                    {/* 账户信息 */}
                    <TableCell className="whitespace-nowrap py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge className="h-4 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700">星图</Badge>
                          <span className="text-sm font-semibold text-foreground">{task.account}</span>
                          {task.accountType && (
                            <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[task.accountType] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>{task.accountType}</Badge>
                          )}
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
                            if (task.isDraft) { segClass = "bg-muted"; }
                            else if (stepNum < task.step) segClass = "bg-emerald-400";
                            else if (stepNum === task.step) segClass = isError ? "bg-red-500" : isSpecial ? "bg-amber-500" : "bg-primary";
                            if (!task.isDraft && isCompleted && stepNum >= task.step) segClass = "bg-emerald-500";
                            const tip = stepNum < task.step
                              ? (isSpecial ? specialStepDescsCompleted[i] : regularStepDescsCompleted[i])
                              : stepNum > task.step
                                ? (isSpecial ? specialStepDescsPending[i] : regularStepDescsPending[i])
                                : getCurrentStepDesc(task);
                            return (
                              <div key={stepLabel} className="group relative flex-1" title={stepLabel}>
                                <div className={`h-1.5 w-full rounded-full ${segClass}`} />
                                <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-[10px] leading-snug text-background shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
                                  {tip}
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className={`text-[11px] font-medium ${isError ? "text-destructive" : isCompleted ? "text-emerald-600" : task.isDraft ? "text-muted-foreground" : "text-muted-foreground"}`}>
                          {task.isDraft ? "草稿｜尚未提交" : `第 ${task.step}/${task.totalSteps} 步｜${getCurrentStepDesc(task)}`}
                        </p>
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
                    <TableCell className="py-2">
                      <div className="flex flex-col gap-1">
                        {/* 草稿：继续提交 */}
                        {task.isDraft && (
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs border-primary/30 bg-sapphire-subtle text-primary hover:bg-sapphire-muted w-full justify-center" onClick={() => onContinueSubmit(task)}>
                            <Upload className="h-3 w-3" />继续提交
                          </Button>
                        )}
                        {/* 特批充值未完成（非充值失败）：继续上传凭证 */}
                        {!task.isDraft && isSpecial && !isCompleted && task.node !== "transfer_error" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs w-full justify-center border-primary/30 bg-sapphire-subtle text-primary hover:bg-sapphire-muted"
                            onClick={() => onSpecialPayment(task)}
                          >
                            <Upload className="h-3 w-3" />继续上传凭证
                          </Button>
                        )}
                        {/* 充值失败（常规/特批）：退款申请 */}
                        {canRefund(task) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs w-full justify-center border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                            onClick={() => onRefundRequest(task)}
                          >
                            退款申请
                          </Button>
                        )}
                        {/* 查看详情 — 始终展示 */}
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground w-full justify-center" onClick={() => onViewDetail(task)}>
                          <Eye className="h-3 w-3" />查看详情
                        </Button>
                        {/* 取消订单 — 仅草稿 / 充值完成状态可用 */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground w-full justify-center tracking-widest">…</Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-40 p-1.5">
                            {canCancelOrder(task) ? (
                              <button
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                onClick={() => (isCompleted ? onCancelCompletedOrder(task) : onCancelOrder(task))}
                              >
                                <XCircle className="h-3.5 w-3.5" />取消订单
                              </button>
                            ) : (
                              <div className="group relative">
                                <button disabled className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground/40">
                                  <XCircle className="h-3.5 w-3.5" />取消订单
                                </button>
                                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">当前订单已进入米播处理流程，暂不可取消</span>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
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

function AccountOverview({ onRecharge, onAddAccount, onReEditAccount, onViewLedger, onViewDetail }: {
  onRecharge: () => void; onAddAccount: () => void; onReEditAccount: (account: typeof accounts[0]) => void;
  onViewLedger: (account: typeof accounts[0]) => void;
  onViewDetail: (account: typeof accounts[0]) => void;
}) {
  const approvedAccounts = accounts.filter(a => a.status === "正常");
  const totalBalance = approvedAccounts.reduce((sum, a) => {
    const val = parseFloat(a.balance.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const latestUpdate = approvedAccounts.reduce((latest, a) => {
    return a.updatedAt > latest ? a.updatedAt : latest;
  }, "");

  const accountSummary = [
    { label: "已绑定账户", value: `${approvedAccounts.length} 个`, icon: Layers },
    { label: "可充值账户", value: `${approvedAccounts.length} 个`, icon: CheckCircle2 },
    { label: "账户总余额", value: `¥${totalBalance.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet },
    { label: "最近更新时间", value: latestUpdate || "—", icon: Clock4 },
  ];

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
                <TableHead className="whitespace-nowrap font-semibold w-[240px]">账户信息</TableHead>
                <TableHead className="whitespace-nowrap font-semibold w-[240px]">资金情况</TableHead>
                <TableHead className="whitespace-nowrap font-semibold w-[96px]">账户状态</TableHead>
                <TableHead className="whitespace-nowrap font-semibold w-[140px]">余额更新时间</TableHead>
                <TableHead className="whitespace-nowrap font-semibold w-[120px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => {
                const statusCfg = accountStatusMap[account.status] ?? accountStatusMap["正常"];
                const isAbnormal = account.status === "异常" || account.status === "不可充值";
                const isPendingReview = account.status === "待审核";
                const isRejected = account.status === "审核驳回";
                const isUnderReview = isPendingReview || isRejected;
                const canRecharge = !isAbnormal && !isUnderReview;
                return (
                  <TableRow key={account.accountId} className="align-middle">
                    {/* 账户信息 */}
                    <TableCell className="py-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Badge className="h-4 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700">星图</Badge>
                          <span className="text-sm font-semibold text-foreground">{account.name}</span>
                          {(account as any).accountType && (
                            <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[(account as any).accountType] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>{(account as any).accountType}</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">账户 ID：{account.accountId}</p>
                        <p className="text-[11px] text-muted-foreground">主体：{account.subject}</p>
                      </div>
                    </TableCell>
                    {/* 资金情况 — 待审核/驳回时显示"米播审核中" */}
                    <TableCell className="py-2.5">
                      {isUnderReview ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock4 className="h-4 w-4" />
                            <span className="text-sm font-medium">米播审核中</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">当前余额</span>
                            <span className="text-sm font-bold text-foreground">{account.balance}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">本月充值</span>
                            <span className="text-sm font-medium text-emerald-600">{account.monthlyRecharge}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">本月消耗</span>
                            <span className="text-sm font-medium text-amber-600">{account.monthlySpend}</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    {/* 账户状态 */}
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={statusCfg.variant} className={`gap-1 text-xs ${statusCfg.className}`}>
                        {account.status === "正常" && <CheckCircle2 className="h-3 w-3" />}
                        {account.status === "待审核" && <Clock4 className="h-3 w-3" />}
                        {account.status === "审核驳回" && <XCircle className="h-3 w-3" />}
                        {account.status === "异常" && <ShieldAlert className="h-3 w-3" />}
                        {account.status === "不可充值" && <Ban className="h-3 w-3" />}
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    {/* 余额更新时间 */}
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {isUnderReview ? "米播审核中" : account.updatedAt}
                    </TableCell>
                    {/* 操作 */}
                    <TableCell className="py-1.5">
                      <div className="flex flex-col gap-1">
                        {/* 发起充值 */}
                        {canRecharge ? (
                          <Button variant="outline" size="sm" onClick={onRecharge} className="h-7 border-primary/30 bg-sapphire-subtle text-xs text-primary hover:bg-sapphire-muted w-full justify-center">
                            <Wallet className="mr-1 h-3 w-3" />发起充值
                          </Button>
                        ) : isUnderReview ? (
                          <div className="group relative w-full">
                            <Button variant="ghost" size="sm" disabled className="h-7 text-xs text-muted-foreground w-full justify-center">发起充值</Button>
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">
                              当前账户正在米播审核中，审核通过后方可操作。
                            </span>
                          </div>
                        ) : (
                          <div className="group relative w-full">
                            <Button variant="ghost" size="sm" disabled className="h-7 text-xs text-muted-foreground w-full justify-center">发起充值</Button>
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">
                              当前账户暂不可充值，请查看详情
                            </span>
                          </div>
                        )}
                        {/* 查看流水 */}
                        {isUnderReview ? (
                          <div className="group relative w-full">
                            <Button variant="ghost" size="sm" disabled className="h-7 text-xs text-muted-foreground w-full justify-center">
                              <FileText className="mr-1 h-3 w-3" />查看流水
                            </Button>
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">
                              当前账户正在米播审核中，审核通过后方可操作。
                            </span>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground w-full justify-center" onClick={() => onViewLedger(account)}>
                            <FileText className="mr-1 h-3 w-3" />查看流水
                          </Button>
                        )}
                        {/* 详情 */}
                        {isUnderReview ? (
                          <div className="group relative w-full">
                            <Button variant="ghost" size="sm" disabled className="h-7 text-xs text-muted-foreground w-full justify-center">
                              <Eye className="mr-1 h-3 w-3" />详情
                            </Button>
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">
                              当前账户正在米播审核中，审核通过后方可操作。
                            </span>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground w-full justify-center" onClick={() => onViewDetail(account)}>
                            <Eye className="mr-1 h-3 w-3" />详情
                          </Button>
                        )}
                        {/* 重新编辑 — 仅审核驳回时显示，回到原始编辑弹窗并保留已填写内容 */}
                        {isRejected && (
                          <Button variant="outline" size="sm" className="h-7 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs w-full justify-center" onClick={() => onReEditAccount(account)}>
                            <RefreshCw className="mr-1 h-3 w-3" />重新编辑
                          </Button>
                        )}
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
  const [addAccountInitialData, setAddAccountInitialData] = useState<AddAccountInitialData | undefined>(undefined);
  const [uploadPaymentOpen, setUploadPaymentOpen] = useState(false);
  const [uploadTask, setUploadTask] = useState<Task | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("upload");
  const [specialPaymentOpen, setSpecialPaymentOpen] = useState(false);
  const [specialPaymentTask, setSpecialPaymentTask] = useState<SpecialPaymentTaskInfo | null>(null);
  const [cancelOrderOpen, setCancelOrderOpen] = useState(false);
  const [cancelTask, setCancelTask] = useState<Task | null>(null);
  const [cancelCompletedOpen, setCancelCompletedOpen] = useState(false);
  const [cancelCompletedTask, setCancelCompletedTask] = useState<Task | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundTask, setRefundTask] = useState<Task | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerAccount, setLedgerAccount] = useState<typeof accounts[0] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAccount, setDetailAccount] = useState<typeof accounts[0] | null>(null);

  const handleRecharge = () => setRechargeModalOpen(true);
  const handleAddAccount = () => {
    setAddAccountInitialData(undefined);
    setAddAccountModalOpen(true);
  };

  const handleReEditAccount = (account: typeof accounts[0]) => {
    const draft = (account as any).draftData;
    setAddAccountInitialData({
      subject: draft?.subject ?? account.subject,
      directClientId: draft?.directClientId ?? "",
      contactName: draft?.contactName ?? "",
      contactPhone: draft?.contactPhone ?? "",
      contactEmail: draft?.contactEmail ?? "",
      proofType: draft?.proofType ?? "",
      proofBankName: draft?.proofBankName ?? "",
      proofBankCard: draft?.proofBankCard ?? "",
      proofAuthAccountId: draft?.proofAuthAccountId ?? "",
      existingFiles: draft?.existingFiles ?? [],
      rejectReason: (account as any).rejectReason,
    });
    setAddAccountModalOpen(true);
  };

  const handleViewDetail = useCallback((task: Task) => {
    setDetailTask(task);
    setDetailDrawerOpen(true);
  }, []);

  const handleUploadPayment = useCallback((task: Task, mode: UploadMode) => {
    setUploadTask(task);
    setUploadMode(mode);
    setUploadPaymentOpen(true);
  }, []);

  const handleSpecialPayment = useCallback((task: Task) => {
    setSpecialPaymentTask({
      id: task.id,
      account: task.account,
      accountId: task.accountId ?? "",
      subject: task.subject ?? "",
      amount: task.amount,
      payableAmount: task.payableAmount,
      discount: task.discount ?? "98 折",
      rechargeType: "special" as const,
      node: task.node,
      step: task.step,
      totalSteps: task.totalSteps,
      customerName: "上海云岚科技有限公司",
      paymentReceipt: task.paymentReceipt,
      paymentStatus: task.paymentStatus,
    });
    setSpecialPaymentOpen(true);
  }, []);

  const buildPaymentTaskInfo = (t: Task | null): PaymentTaskInfo | null => {
    if (!t) return null;
    return { id: t.id, rechargeType: t.rechargeType, account: t.account, payableAmount: t.payableAmount, subject: t.subject };
  };

  const buildCancelTaskInfo = (t: Task | null): CancelTaskInfo | null => {
    if (!t) return null;
    const node = nodeStatusMap[t.node];
    return { id: t.id, rechargeType: t.rechargeType, account: t.account, amount: t.amount, payableAmount: t.payableAmount, nodeLabel: node?.label ?? "" };
  };

  const buildCancelCompletedTaskInfo = (t: Task | null): CancelCompletedTaskInfo | null => {
    if (!t) return null;
    return { id: t.id };
  };

  const handleContinueSubmit = useCallback((task: Task) => {
    if (task.isDraft) { setRechargeModalOpen(true); return; }
    // For other states, open upload modal
    const mode: UploadMode = task.rechargeType === "special" && task.step >= task.totalSteps ? "supplement" : "upload";
    setUploadTask(task); setUploadMode(mode); setUploadPaymentOpen(true);
  }, []);

  const handleCancelOrder = useCallback((task: Task) => {
    setCancelTask(task);
    setCancelOrderOpen(true);
  }, []);

  const handleCancelCompletedOrder = useCallback((task: Task) => {
    setCancelCompletedTask(task);
    setCancelCompletedOpen(true);
  }, []);

  const handleRefundRequest = useCallback((task: Task) => {
    setRefundTask(task);
    setRefundOpen(true);
  }, []);

  const buildRefundTaskInfo = (t: Task | null): RefundTaskInfo | null => {
    if (!t) return null;
    return { id: t.id };
  };

  const handleViewLedger = useCallback((account: typeof accounts[0]) => {
    setLedgerAccount(account);
    setLedgerOpen(true);
  }, []);

  const handleViewAccountDetail = useCallback((account: typeof accounts[0]) => {
    setDetailAccount(account);
    setDetailOpen(true);
  }, []);

  const buildLedgerAccountInfo = (a: typeof accounts[0] | null): LedgerAccountInfo | null => {
    if (!a) return null;
    return { name: a.name, accountType: (a as any).accountType ?? "", accountId: a.accountId, subject: a.subject, balance: a.balance, updatedAt: a.updatedAt };
  };

  const buildDetailAccountInfo = (a: typeof accounts[0] | null): DetailAccountInfo | null => {
    if (!a) return null;
    return {
      name: a.name, accountType: (a as any).accountType ?? "", accountId: a.accountId, subject: a.subject,
      balance: a.balance, monthlyRecharge: a.monthlyRecharge, monthlySpend: a.monthlySpend, status: a.status, updatedAt: a.updatedAt,
      directClientId: (a as any).directClientId, contactName: (a as any).contactName, contactPhone: (a as any).contactPhone, contactEmail: (a as any).contactEmail,
      proofType: (a as any).proofType, proofBankName: (a as any).proofBankName, proofBankCard: (a as any).proofBankCard, proofAuthAccountId: (a as any).proofAuthAccountId,
      materialFiles: (a as any).materialFiles,
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
      rechargeType: t.rechargeType,
      step: t.step,
      totalSteps: t.totalSteps,
      isDraft: t.isDraft,
      paymentStatus: t.paymentStatus,
      paymentAmount: t.paymentAmount,
      paymentTime: t.paymentTime,
      paymentAccountName: t.paymentAccountName,
      paymentBank: t.paymentBank,
      paymentReceipt: t.paymentReceipt,
      financeConfirmed: t.financeConfirmed,
      financeConfirmedTime: t.financeConfirmedTime,
      errorReason: (t as any).errorReason,
      errorDescription: (t as any).errorDescription,
      transferStatus: t.transferStatus,
      transferId: t.transferId,
      transferCompletedTime: t.transferCompletedTime,
      transferErrorReason: t.transferErrorReason,
      transferSuggestion: t.transferSuggestion,
    };
  };

  return (
    <div className="space-y-6 p-6">
      <WelcomeSection onRecharge={handleRecharge} onAddAccount={handleAddAccount} />
      <StatsCards />

      <RechargeTasks onViewDetail={handleViewDetail} onUploadPayment={handleUploadPayment} onRecharge={handleRecharge} onCancelOrder={handleCancelOrder} onCancelCompletedOrder={handleCancelCompletedOrder} onContinueSubmit={handleContinueSubmit} onSpecialPayment={handleSpecialPayment} onRefundRequest={handleRefundRequest} />

      <AccountOverview onRecharge={handleRecharge} onAddAccount={handleAddAccount} onReEditAccount={handleReEditAccount} onViewLedger={handleViewLedger} onViewDetail={handleViewAccountDetail} />

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
        onOpenChange={(open) => {
          setAddAccountModalOpen(open);
          if (!open) setAddAccountInitialData(undefined);
        }}
        initialData={addAccountInitialData}
      />

      <UploadPaymentModal
        open={uploadPaymentOpen}
        onOpenChange={setUploadPaymentOpen}
        task={buildPaymentTaskInfo(uploadTask)}
        mode={uploadMode}
      />

      <VoucherUploadModalLazy
        open={specialPaymentOpen}
        onOpenChange={setSpecialPaymentOpen}
        task={specialPaymentTask}
      />


      <CancelOrderModal
        open={cancelOrderOpen}
        onOpenChange={setCancelOrderOpen}
        task={buildCancelTaskInfo(cancelTask)}
      />

      <CancelCompletedOrderModal
        open={cancelCompletedOpen}
        onOpenChange={setCancelCompletedOpen}
        task={buildCancelCompletedTaskInfo(cancelCompletedTask)}
      />

      <RefundRequestModal
        open={refundOpen}
        onOpenChange={setRefundOpen}
        task={buildRefundTaskInfo(refundTask)}
      />

      <AccountLedgerDrawer
        open={ledgerOpen}
        onOpenChange={setLedgerOpen}
        account={buildLedgerAccountInfo(ledgerAccount)}
      />

      <AccountDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        account={buildDetailAccountInfo(detailAccount)}
        onRecharge={handleRecharge}
        onViewLedger={() => {
          setDetailOpen(false);
          setTimeout(() => { setLedgerAccount(detailAccount); setLedgerOpen(true); }, 100);
        }}
      />
    </div>
  );
}
