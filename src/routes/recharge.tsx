import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet, TrendingUp, CheckCircle2, Clock, Eye, Zap, ListTodo,
  FileText, Upload, XCircle, RefreshCw, ShieldAlert,
  Search, RotateCcw, ChevronLeft, ChevronRight,
  Building2, Plus, ArrowUpDown, ArrowUp, ArrowDown,
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
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { RechargeModal } from "@/components/RechargeModal";
import { TaskDetailDrawer, type DetailTaskInfo } from "@/components/TaskDetailDrawer";
import { UploadPaymentModal, type PaymentTaskInfo, type UploadMode } from "@/components/UploadPaymentModal";
import { CancelOrderModal, type CancelTaskInfo } from "@/components/CancelOrderModal";
import { SpecialPaymentModal, type SpecialPaymentTaskInfo } from "@/components/SpecialPaymentModal";

export const Route = createFileRoute("/recharge")({ component: RechargePage });

// ── Data (synced with workbench) ────────────────────────────────────────────

const regularStepLabels = ["客户提交申请", "米播审核", "米播进行账户充值", "充值完成"];
const specialStepLabels = ["客户提交特批申请", "米播评估", "特批通过", "充值完成", "客户上传付款凭证"];

const regularStepDescs = [
  "客户已填写充值信息并提交充值申请",
  "米播正在审核充值信息、账户信息及金额信息",
  "米播审核通过，进行内部财务确认、付款及账户充值处理",
  "米播已完成账户充值，客户账户余额已更新",
];
const specialStepDescs = [
  "客户已提交特批充值申请，说明特批原因及承诺付款安排",
  "米播正在评估特批申请",
  "特批申请已通过，米播可先行处理充值",
  "米播已完成客户账户充值",
  "客户上传付款凭证，待财务确认到账",
];

const nodeStatusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  draft: { label: "草稿", className: "border-gray-200 bg-gray-50 text-gray-500", icon: <FileText className="h-3 w-3" /> },
  pending_audit: { label: "米播审核中", className: "border-blue-200 bg-blue-50 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  audit_approved: { label: "米播审核中", className: "border-blue-200 bg-blue-50 text-blue-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  audit_rejected: { label: "已驳回", className: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  finance_confirm: { label: "米播进行账户充值中", className: "border-sky-200 bg-sky-50 text-sky-700", icon: <RefreshCw className="h-3 w-3" /> },
  transferring: { label: "米播进行账户充值中", className: "border-primary/30 bg-primary/10 text-primary", icon: <RefreshCw className="h-3 w-3" /> },
  completed: { label: "已完成", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  transfer_error: { label: "异常", className: "border-red-200 bg-red-50 text-red-700", icon: <ShieldAlert className="h-3 w-3" /> },
  sp_submitted: { label: "米播评估中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Clock className="h-3 w-3" /> },
  sp_evaluating: { label: "米播评估中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Zap className="h-3 w-3" /> },
  sp_approved: { label: "特批处理中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  sp_completed: { label: "米播进行账户充值中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  sp_payment_pending: { label: "客户上传付款凭证中", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Upload className="h-3 w-3" /> },
  sp_payment_uploaded: { label: "付款凭证确认中", className: "border-blue-200 bg-blue-50 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  sp_payment_rejected: { label: "已驳回", className: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  sp_rejected: { label: "已驳回", className: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-3 w-3" /> },
};

const accountTypeClass: Record<string, string> = {
  "主账户": "border-blue-200 bg-blue-50 text-blue-700",
  "投放账户": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "运营账户": "border-purple-200 bg-purple-50 text-purple-700",
  "品牌账户": "border-amber-200 bg-amber-50 text-amber-700",
};

interface Task {
  id: string; account: string; accountId: string; subject: string;
  amount: string; payableAmount: string; discount: string;
  node: string; rechargeType: "regular" | "special"; isDraft?: boolean;
  accountType?: string; step: number; totalSteps: number;
  time: string; purpose: string; orderCompleted: boolean;
  paymentReceipt?: string; financeConfirmed?: boolean; paymentStatus?: string;
  paymentAmount?: string; paymentTime?: string; paymentAccountName?: string;
  paymentBank?: string;
}

const allTasks: Task[] = [
  // Regular recharge — various states
  { id: "RC-2026-07012", account: "云岚品牌中心", accountId: "ST-10086101", subject: "上海云岚科技有限公司", accountType: "主账户", amount: "¥200,000.00", payableAmount: "¥196,000.00", discount: "98 折", node: "pending_audit", rechargeType: "regular", step: 2, totalSteps: 4, time: "2026-07-15 14:20", purpose: "达人采买", paymentReceipt: "客户回单_20260715.pdf", paymentAmount: "¥196,000.00", paymentTime: "2026-07-15 14:20", paymentAccountName: "上海云岚科技有限公司", financeConfirmed: false, orderCompleted: false },
  { id: "RC-2026-07011", account: "云岚效果投放", accountId: "ST-10086102", subject: "上海云岚科技有限公司", accountType: "投放账户", amount: "¥150,000.00", payableAmount: "¥147,000.00", discount: "98 折", node: "finance_confirm", rechargeType: "regular", step: 3, totalSteps: 4, time: "2026-07-14 09:15", purpose: "广告投放", paymentReceipt: "客户回单_20260714.pdf", paymentAmount: "¥147,000.00", paymentTime: "2026-07-14 09:15", paymentAccountName: "上海云岚科技有限公司", financeConfirmed: false, orderCompleted: false },
  { id: "RC-2026-07010", account: "云岚内容增长", accountId: "ST-10086103", subject: "上海云岚科技有限公司", accountType: "运营账户", amount: "¥80,000.00", payableAmount: "¥78,400.00", discount: "98 折", node: "completed", rechargeType: "regular", step: 4, totalSteps: 4, time: "2026-07-13 16:30", purpose: "助推投流", paymentReceipt: "回单_20260713.pdf", financeConfirmed: true, orderCompleted: true },
  { id: "RC-2026-07009", account: "云岚品牌中心", accountId: "ST-10086101", subject: "上海云岚科技有限公司", accountType: "主账户", amount: "¥50,000.00", payableAmount: "¥49,000.00", discount: "98 折", node: "finance_confirm", rechargeType: "regular", step: 3, totalSteps: 4, time: "2026-07-12 10:45", purpose: "达人采买", paymentReceipt: "回单_20260712.pdf", financeConfirmed: true, orderCompleted: false },
  { id: "RC-2026-07008", account: "云岚品牌中心", accountId: "ST-10086101", subject: "上海云岚科技有限公司", accountType: "主账户", amount: "¥30,000.00", payableAmount: "¥29,400.00", discount: "98 折", node: "audit_rejected", rechargeType: "regular", step: 2, totalSteps: 4, time: "2026-07-12 08:00", purpose: "其他", paymentReceipt: "回单_20260712.pdf", orderCompleted: false, paymentAmount: "¥29,400.00", paymentTime: "2026-07-12 08:00", paymentAccountName: "上海云岚科技有限公司", financeConfirmed: false },
  // Draft — regular
  { id: "RC-2026-07006", account: "云岚品牌中心", accountId: "ST-10086101", subject: "上海云岚科技有限公司", accountType: "主账户", isDraft: true, amount: "¥100,000.00", payableAmount: "¥98,000.00", discount: "98 折", node: "draft", rechargeType: "regular", step: 0, totalSteps: 4, time: "2026-07-15 18:30", purpose: "达人采买", orderCompleted: false },
  // Special recharge — various states
  { id: "RC-2026-07005", account: "云岚达人合作", accountId: "ST-10086105", subject: "上海云岚科技有限公司", accountType: "品牌账户", amount: "¥40,000.00", payableAmount: "¥39,200.00", discount: "98 折", node: "sp_payment_pending", rechargeType: "special", step: 5, totalSteps: 5, time: "2026-07-15 11:00", purpose: "广告投放", orderCompleted: false },
  { id: "RC-2026-07004", account: "云岚新品推广", accountId: "ST-10086104", subject: "上海云岚科技有限公司", accountType: "投放账户", amount: "¥80,000.00", payableAmount: "¥78,400.00", discount: "98 折", node: "sp_payment_uploaded", rechargeType: "special", step: 5, totalSteps: 5, time: "2026-07-14 15:00", purpose: "达人采买", paymentReceipt: "特批付款回单_20260714.pdf", financeConfirmed: false, orderCompleted: false },
  { id: "RC-2026-07003", account: "云岚内容增长", accountId: "ST-10086103", subject: "上海云岚科技有限公司", accountType: "运营账户", amount: "¥120,000.00", payableAmount: "¥117,600.00", discount: "98 折", node: "sp_evaluating", rechargeType: "special", step: 2, totalSteps: 5, time: "2026-07-14 10:30", purpose: "助推投流", orderCompleted: false },
  { id: "RC-2026-07002", account: "云岚效果投放", accountId: "ST-10086102", subject: "上海云岚科技有限公司", accountType: "投放账户", amount: "¥60,000.00", payableAmount: "¥58,800.00", discount: "98 折", node: "sp_payment_rejected", rechargeType: "special", step: 5, totalSteps: 5, time: "2026-07-13 14:00", purpose: "广告投放", paymentReceipt: "特批回单_20260713.pdf", paymentStatus: "error", financeConfirmed: false, orderCompleted: false },
  { id: "RC-2026-07001", account: "云岚品牌中心", accountId: "ST-10086101", subject: "上海云岚科技有限公司", accountType: "主账户", amount: "¥90,000.00", payableAmount: "¥88,200.00", discount: "98 折", node: "sp_approved", rechargeType: "special", step: 3, totalSteps: 5, time: "2026-07-12 09:00", purpose: "达人采买", orderCompleted: false },
  // Draft — special
  { id: "RC-2026-07007", account: "云岚品牌中心", accountId: "ST-10086101", subject: "上海云岚科技有限公司", accountType: "主账户", isDraft: true, amount: "¥70,000.00", payableAmount: "¥68,600.00", discount: "98 折", node: "draft", rechargeType: "special", step: 0, totalSteps: 5, time: "2026-07-13 20:00", purpose: "广告投放", orderCompleted: false },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function isInAudit(task: Task): boolean { return task.step >= 2; }

type PaymentInfo = { statusLabel: string; statusClass: string; receiptFile?: string; actionLabel?: string; actionMode?: UploadMode; isError?: boolean };

function getPaymentInfo(task: Task): PaymentInfo {
  const hasReceipt = !!task.paymentReceipt;
  const isConfirmed = task.financeConfirmed;
  if (task.rechargeType === "special") {
    if (task.paymentStatus === "error") return { statusLabel: "凭证异常", statusClass: "border-red-200 bg-red-50 text-red-700", actionLabel: "重新上传", actionMode: "reupload_error", isError: true };
    if (isConfirmed) return { statusLabel: "已确认到账", statusClass: "border-emerald-200 bg-emerald-50 text-emerald-700", receiptFile: task.paymentReceipt };
    if (hasReceipt) return { statusLabel: "待财务确认到账", statusClass: "border-blue-200 bg-blue-50 text-blue-700", receiptFile: task.paymentReceipt };
    if (task.step >= 4) return { statusLabel: "待上传付款凭证", statusClass: "border-amber-200 bg-amber-50 text-amber-700", actionLabel: "上传凭证", actionMode: "supplement" };
    return { statusLabel: "—", statusClass: "border-gray-200 bg-gray-50 text-gray-500" };
  }
  if (task.paymentStatus === "error") return { statusLabel: "凭证异常", statusClass: "border-red-200 bg-red-50 text-red-700", actionLabel: "重新上传", actionMode: "reupload_error", isError: true };
  if (isConfirmed) return { statusLabel: "已确认到账", statusClass: "border-emerald-200 bg-emerald-50 text-emerald-700", receiptFile: task.paymentReceipt };
  if (hasReceipt) return { statusLabel: "已上传凭证", statusClass: "border-blue-200 bg-blue-50 text-blue-700", receiptFile: task.paymentReceipt };
  return { statusLabel: "待上传凭证", statusClass: "border-amber-200 bg-amber-50 text-amber-700", actionLabel: "上传凭证", actionMode: "upload" };
}

function getOrderCompleted(task: Task): boolean {
  if (task.rechargeType === "special") return task.step >= task.totalSteps && !!task.financeConfirmed;
  return task.step >= task.totalSteps;
}

function canCancelOrder(task: Task): boolean {
  if (task.isDraft) return true;
  if (task.financeConfirmed) return false;
  if (task.step >= 3 && task.rechargeType === "regular") return false;
  if (task.step >= 3 && task.rechargeType === "special") return false;
  return true;
}

// ── Component ──────────────────────────────────────────────────────────────

function RechargePage() {
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTask, setUploadTask] = useState<Task | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("upload");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTask, setCancelTask] = useState<Task | null>(null);
  const [specialPaymentOpen, setSpecialPaymentOpen] = useState(false);
  const [specialPaymentTask, setSpecialPaymentTask] = useState<SpecialPaymentTaskInfo | null>(null);
  const [sortAsc, setSortAsc] = useState(false); // default: desc
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filterId, setFilterId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterNode, setFilterNode] = useState("");
  const [filterPayStatus, setFilterPayStatus] = useState("");
  const [filterOrder, setFilterOrder] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");

  const filteredTasks = allTasks.filter(t => {
    if (filterId && !t.id.includes(filterId)) return false;
    if (filterType && t.rechargeType !== filterType) return false;
    // Current node filter — grouped stages
    if (filterNode) {
      const isDraft = t.isDraft;
      const isSpecial = t.rechargeType === "special";
      const isErrorNode = t.node === "transfer_error" || t.node === "audit_rejected" || t.node === "sp_rejected" || t.node === "sp_payment_rejected";
      const match = (() => {
        switch (filterNode) {
          case "draft": return isDraft;
          case "pending_processing": return !isDraft && t.step >= 1 && t.step <= 2 && !isErrorNode;
          case "recharging": return !isDraft && t.step >= 3 && (!isSpecial || t.step < 5) && !isErrorNode && !(isSpecial && t.step >= 5);
          case "awaiting_payment": return isSpecial && !isDraft && (t.step >= 5 || (t.step >= 4 && !t.financeConfirmed));
          case "completed": return getOrderCompleted(t);
          case "error": return isErrorNode;
          default: return true;
        }
      })();
      if (!match) return false;
    }
    // Payment receipt status filter
    if (filterPayStatus) {
      const hasReceipt = !!t.paymentReceipt;
      const isConfirmed = t.financeConfirmed;
      const isError = t.paymentStatus === "error";
      const isSpecial = t.rechargeType === "special";
      const match = (() => {
        switch (filterPayStatus) {
          case "pending_upload": return !hasReceipt && !isError && !t.isDraft && (!isSpecial || t.step >= 5);
          case "uploaded_pending": return hasReceipt && !isConfirmed && !isError;
          case "confirmed": return isConfirmed;
          case "rejected": return isError;
          case "not_required": return isSpecial && !t.isDraft && t.step < 5 && !hasReceipt;
          default: return true;
        }
      })();
      if (!match) return false;
    }
    if (filterOrder === "completed" && !getOrderCompleted(t)) return false;
    if (filterOrder === "uncompleted" && getOrderCompleted(t)) return false;
    if (filterOrder === "cancelled") return false;
    if (filterPurpose && t.purpose !== filterPurpose) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.isDraft && !b.isDraft) return 1;
    if (!a.isDraft && b.isDraft) return -1;
    return sortAsc ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time);
  });

  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / pageSize));
  const pagedTasks = sortedTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetPage = (fn?: () => void) => { setCurrentPage(1); fn?.(); };

  const handleSortToggle = () => { setSortAsc(!sortAsc); setCurrentPage(1); };

  // Build page numbers with ellipsis
  const pageNumbers: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push("ellipsis");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pageNumbers.push(i);
    if (currentPage < totalPages - 2) pageNumbers.push("ellipsis");
    pageNumbers.push(totalPages);
  }

  const buildDetailTaskInfo = (t: Task | null): DetailTaskInfo | null => {
    if (!t) return null;
    const node = nodeStatusMap[t.node];
    return { id: t.id, account: t.account, accountId: t.accountId, amount: t.amount, payableAmount: t.payableAmount, discount: t.discount, node: t.node, nodeLabel: node?.label ?? "", nodeClassName: node?.className ?? "", handler: "", statusDescription: "", time: t.time, rechargeType: t.rechargeType, step: t.step, totalSteps: t.totalSteps, isDraft: t.isDraft, paymentStatus: t.paymentStatus, paymentAmount: t.paymentAmount, paymentTime: t.paymentTime, paymentAccountName: t.paymentAccountName, paymentBank: t.paymentBank, paymentReceipt: t.paymentReceipt, financeConfirmed: t.financeConfirmed, financeConfirmedTime: (t as any).financeConfirmedTime, errorReason: (t as any).errorReason, errorDescription: (t as any).errorDescription };
  };

  const buildPaymentTaskInfo = (t: Task | null): PaymentTaskInfo | null => {
    if (!t) return null;
    return { id: t.id, rechargeType: t.rechargeType, account: t.account, payableAmount: t.payableAmount, subject: t.subject };
  };

  const buildCancelTaskInfo = (t: Task | null): CancelTaskInfo | null => {
    if (!t) return null;
    const node = nodeStatusMap[t.node];
    return { id: t.id, rechargeType: t.rechargeType, account: t.account, amount: t.amount, payableAmount: t.payableAmount, nodeLabel: node?.label ?? "" };
  };

  const handleUploadPayment = useCallback((task: Task, mode: UploadMode) => { setUploadTask(task); setUploadMode(mode); setUploadOpen(true); }, []);

  const handleSpecialPayment = useCallback((task: Task) => {
    setSpecialPaymentTask({
      id: task.id, account: task.account, accountId: task.accountId ?? "",
      subject: task.subject ?? "", amount: task.amount, payableAmount: task.payableAmount,
      discount: task.discount ?? "98 折", rechargeType: "special" as const,
      node: task.node, step: task.step, totalSteps: task.totalSteps,
      customerName: "上海云岚科技有限公司", paymentReceipt: task.paymentReceipt, paymentStatus: task.paymentStatus,
    });
    setSpecialPaymentOpen(true);
  }, []);

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">充值任务</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看全部充值任务、处理进度及付款凭证状态</p>
        </div>
        <Button onClick={() => setRechargeModalOpen(true)} className="gap-2"><Plus className="h-4 w-4" />发起充值</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "进行中任务", value: "5 笔", icon: ListTodo, accent: "bg-blue-50 text-blue-600" },
          { label: "待处理任务", value: "2 笔", icon: Zap, accent: "bg-amber-50 text-amber-600" },
          { label: "本月充值总额", value: "¥380,000.00", icon: TrendingUp, accent: "bg-emerald-50 text-emerald-600" },
          { label: "异常任务", value: "0 笔", icon: CheckCircle2, accent: "bg-gray-50 text-gray-400" },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-border/60 bg-card p-3.5">
            <div className="flex items-center gap-2"><div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.accent}`}><item.icon className="h-3.5 w-3.5" /></div><span className="text-xs text-muted-foreground">{item.label}</span></div>
            <p className="mt-1.5 text-lg font-bold tracking-tight text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="充值单号" value={filterId} onChange={e => setFilterId(e.target.value)} className="h-9 w-36 text-sm" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="充值处理方式" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="regular">常规充值</SelectItem>
            <SelectItem value="special">特批充值</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterNode} onValueChange={setFilterNode}>
          <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="当前节点" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="draft">草稿 / 尚未提交</SelectItem>
            <SelectItem value="pending_processing">待米播处理</SelectItem>
            <SelectItem value="recharging">充值处理中</SelectItem>
            <SelectItem value="awaiting_payment">待客户上传付款凭证</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="error">异常 / 已驳回</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPayStatus} onValueChange={setFilterPayStatus}>
          <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="付款凭证状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="pending_upload">待上传凭证</SelectItem>
            <SelectItem value="uploaded_pending">已上传待确认</SelectItem>
            <SelectItem value="confirmed">已确认到账</SelectItem>
            <SelectItem value="rejected">凭证被驳回</SelectItem>
            <SelectItem value="not_required">暂不需要上传</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterOrder} onValueChange={setFilterOrder}>
          <SelectTrigger className="h-9 w-28 text-sm"><SelectValue placeholder="订单状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="uncompleted">未完成</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPurpose} onValueChange={setFilterPurpose}>
          <SelectTrigger className="h-9 w-28 text-sm"><SelectValue placeholder="充值用途" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="达人采买">达人采买</SelectItem>
            <SelectItem value="广告投放">广告投放</SelectItem>
            <SelectItem value="助推投流">助推投流</SelectItem>
            <SelectItem value="其他">其他</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-9 gap-1.5" onClick={() => setCurrentPage(1)}><Search className="h-3.5 w-3.5" />查询</Button>
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-sm" onClick={() => { setFilterId(""); setFilterType(""); setFilterNode(""); setFilterPayStatus(""); setFilterOrder(""); setFilterPurpose(""); setCurrentPage(1); }}>
          <RotateCcw className="h-3.5 w-3.5" />重置
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap text-sm font-semibold min-w-[120px]">充值单号</TableHead>
                <TableHead className="whitespace-nowrap text-sm font-semibold min-w-[110px]">充值处理方式</TableHead>
                <TableHead className="whitespace-nowrap text-sm font-semibold min-w-[180px]">账户信息</TableHead>
                <TableHead className="whitespace-nowrap text-sm font-semibold min-w-[150px]">金额信息</TableHead>
                <TableHead className="whitespace-nowrap text-sm font-semibold min-w-[190px]">当前节点</TableHead>
                <TableHead className="whitespace-nowrap text-sm font-semibold">充值用途</TableHead>
                <TableHead className="whitespace-nowrap text-sm font-semibold">订单状态</TableHead>
                <TableHead
                  className="whitespace-nowrap text-sm font-semibold cursor-pointer select-none hover:text-primary transition-colors"
                  onClick={handleSortToggle}
                  title="按提交时间排序"
                >
                  提交时间{sortAsc ? <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-primary" /> : <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-primary" />}
                </TableHead>
                <TableHead className="whitespace-nowrap text-sm font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedTasks.map(task => {
                const node = nodeStatusMap[task.node];
                const isSpecial = task.rechargeType === "special";
                const isCompleted = getOrderCompleted(task);
                const isError = task.node === "transfer_error" || task.node === "audit_rejected" || task.node === "sp_rejected" || task.node === "sp_payment_rejected";
                const stepLabels = isSpecial ? specialStepLabels : regularStepLabels;
                const payInfo = getPaymentInfo(task);

                return (
                  <TableRow key={task.id}>
                    {/* 充值单号 */}
                    <TableCell className="whitespace-nowrap py-3">
                      {task.isDraft ? (
                        <span className="text-sm text-muted-foreground">——</span>
                      ) : (
                        <button className="font-mono text-sm font-semibold text-primary hover:underline" onClick={() => { setDetailTask(task); setDetailDrawerOpen(true); }}>
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
                    <TableCell className="py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge className="h-4 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700">星图</Badge>
                          <span className="text-sm font-semibold text-foreground">{task.account}</span>
                          {task.accountType && <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[task.accountType] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>{task.accountType}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">账户 ID：{task.accountId}</p>
                        <p className="text-xs text-muted-foreground">主体：{task.subject}</p>
                      </div>
                    </TableCell>
                    {/* 金额信息 */}
                    <TableCell className="py-3">
                      <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">充值金额</span>
                          <span className="font-medium text-foreground">{task.amount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">折扣</span>
                          <Badge className="h-4 border-emerald-200 bg-emerald-50 px-1 text-[10px] text-emerald-700">{task.discount}</Badge>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/40 pt-1 text-xs">
                          <span className="text-muted-foreground">实付金额</span>
                          <span className="text-sm font-bold text-primary">{task.payableAmount}</span>
                        </div>
                      </div>
                    </TableCell>
                    {/* 当前节点 */}
                    <TableCell className="py-3">
                      <div className="space-y-1.5">
                        <Badge variant="outline" className={`gap-1 text-xs ${node.className}`}>{node.icon}{node.label}</Badge>
                        <div className="flex items-center gap-0.5">
                          {stepLabels.map((sl, i) => {
                            const sn = i + 1;
                            let segClass = "bg-muted";
                            if (task.isDraft) { segClass = "bg-muted"; }
                            else if (sn < task.step) segClass = "bg-emerald-400";
                            else if (sn === task.step) segClass = isError ? "bg-red-500" : isSpecial ? "bg-amber-500" : "bg-primary";
                            if (!task.isDraft && isCompleted && sn >= task.step) segClass = "bg-emerald-500";
                            const tip = isSpecial ? specialStepDescs[i] : regularStepDescs[i];
                            return (
                              <div key={sl} className="group relative flex-1" title={sl}>
                                <div className={`h-1.5 w-full rounded-full ${segClass}`} />
                                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">{tip}</span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {task.isDraft ? "草稿｜尚未提交" : `第 ${task.step}/${task.totalSteps} 步${isError ? `｜${node.label}` : isCompleted ? (isSpecial ? `｜客户上传付款凭证完成` : `｜充值完成`) : `｜${node.label}${task.step >= 4 && isSpecial && !task.paymentReceipt ? "，待客户上传付款凭证" : ""}`}`}
                        </p>
                      </div>
                    </TableCell>
                    {/* 充值用途 */}
                    <TableCell className="whitespace-nowrap py-3">
                      <Badge variant="outline" className="border-border text-xs font-normal text-muted-foreground">{task.purpose}</Badge>
                    </TableCell>
                    {/* 订单状态 */}
                    <TableCell className="whitespace-nowrap py-3">
                      {isCompleted ? (
                        <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700"><CheckCircle2 className="h-3 w-3" />已完成</Badge>
                      ) : (
                        <Badge className="gap-1 border-amber-200 bg-amber-50 text-xs text-amber-700"><Clock className="h-3 w-3" />未完成</Badge>
                      )}
                    </TableCell>
                    {/* 提交时间 */}
                    <TableCell className="whitespace-nowrap py-3">
                      <span className="text-xs text-muted-foreground">{task.time}</span>
                    </TableCell>
                    {/* 操作 */}
                    <TableCell className="py-2">
                      <div className="flex flex-col gap-1">
                        {/* Row 1: 继续提交 */}
                        {task.isDraft ? (
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs border-primary/30 bg-sapphire-subtle text-primary hover:bg-sapphire-muted w-full justify-center" onClick={() => setRechargeModalOpen(true)}>
                            <Upload className="h-3 w-3" />继续提交
                          </Button>
                        ) : (
                          <div className="group relative">
                            <Button size="sm" variant="ghost" disabled className="h-7 gap-1 text-xs w-full justify-center">继续提交</Button>
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">该充值申请已提交，暂不可继续编辑</span>
                          </div>
                        )}
                        {/* Row 2: 提交付款凭证 — only for 特批 */}
                        {isSpecial && (
                          !task.isDraft && !task.financeConfirmed && (payInfo.actionMode === "upload" || payInfo.actionMode === "supplement" || payInfo.actionMode === "reupload_error") ? (
                            <Button size="sm" variant="outline" className={`h-7 gap-1 text-xs w-full justify-center ${payInfo.actionMode === "reupload_error" ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-primary/30 bg-sapphire-subtle text-primary hover:bg-sapphire-muted"}`} onClick={() => handleSpecialPayment(task)}>
                              <Upload className="h-3 w-3" />{payInfo.actionMode === "reupload_error" ? "重新提交付款凭证" : "提交付款凭证"}
                            </Button>
                          ) : (
                            <div className="group relative">
                              <Button size="sm" variant="ghost" disabled className="h-7 gap-1 text-xs w-full justify-center">
                                {payInfo.actionMode === "reupload_error" ? "重新提交付款凭证" : "提交付款凭证"}
                              </Button>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">当前状态暂不支持提交付款凭证</span>
                            </div>
                          )
                        )}
                        {/* Row 3: 查看详情 */}
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground w-full justify-center" onClick={() => { setDetailTask(task); setDetailDrawerOpen(true); }}>
                          <Eye className="h-3 w-3" />查看详情
                        </Button>
                        {/* Row 4: … */}
                        <Popover>
                          <PopoverTrigger asChild><Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground w-full justify-center tracking-widest">…</Button></PopoverTrigger>
                          <PopoverContent align="end" className="w-40 p-1.5">
                            {canCancelOrder(task) ? (
                              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => { setCancelTask(task); setCancelOpen(true); }}>
                                <XCircle className="h-3.5 w-3.5" />取消订单
                              </button>
                            ) : (
                              <div className="group relative">
                                <button disabled className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground/40"><XCircle className="h-3.5 w-3.5" />取消订单</button>
                                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">当前订单已进入处理流程，暂不可取消</span>
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
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">共 {sortedTasks.length} 条</span>
        <div className="flex items-center gap-3">
          {/* Page size selector */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>每页</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-[80px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 条</SelectItem>
                <SelectItem value="20">20 条</SelectItem>
                <SelectItem value="50">50 条</SelectItem>
                <SelectItem value="100">100 条</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />上一页
            </Button>
            {pageNumbers.map((p, i) =>
              p === "ellipsis" ? (
                <span key={`e${i}`} className="px-1 text-sm text-muted-foreground">…</span>
              ) : (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  className={`h-8 w-8 text-sm font-semibold ${p === currentPage ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </Button>
              ),
            )}
            <Button variant="outline" size="sm" className="h-8 gap-1 text-sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              下一页<ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <RechargeModal open={rechargeModalOpen} onOpenChange={setRechargeModalOpen} />
      <TaskDetailDrawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} task={buildDetailTaskInfo(detailTask)} />
      <UploadPaymentModal open={uploadOpen} onOpenChange={setUploadOpen} task={buildPaymentTaskInfo(uploadTask)} mode={uploadMode} />
      <CancelOrderModal open={cancelOpen} onOpenChange={setCancelOpen} task={buildCancelTaskInfo(cancelTask)} />
      <SpecialPaymentModal open={specialPaymentOpen} onOpenChange={setSpecialPaymentOpen} task={specialPaymentTask} />
    </div>
  );
}
