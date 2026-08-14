"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  User,
  Building2,
  Wallet,
  Upload,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  CreditCard,
  XCircle,
  Loader,
  Image as ImageIcon,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DetailTaskInfo {
  id: string;
  account: string;
  accountId: string;
  amount: string;
  payableAmount: string;
  discount: string;
  node: string;
  nodeLabel: string;
  nodeClassName: string;
  handler: string;
  statusDescription: string;
  time: string;
  rechargeType: "regular" | "special";
  step: number;
  totalSteps: number;
  isDraft?: boolean;
  // Payment info
  paymentStatus?: string;
  paymentAmount?: string;
  paymentTime?: string;
  paymentAccountName?: string;
  paymentBank?: string;
  paymentReceipt?: string;
  financeConfirmed?: boolean;
  financeConfirmedTime?: string;
  errorReason?: string;
  errorDescription?: string;
  // Platform transfer info
  transferStatus?: string;
  transferId?: string;
  transferCompletedTime?: string;
  transferErrorReason?: string;
  transferSuggestion?: string;
  transferScreenshot?: string;
}

interface TaskDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: DetailTaskInfo | null;
  onViewLedger?: () => void;
}

// ── Progress node types ────────────────────────────────────────────────────

type NodeStatus = "completed" | "active" | "pending" | "rejected" | "error";

interface ProgressNode {
  name: string;
  status: NodeStatus;
  handlerName: string;
  handlerRole: string;
  handlerInitial: string;
  time: string;
  description: string;
  rejectionReasons?: string[];
  rejectionNote?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const statusConfig: Record<NodeStatus, { dot: string; badge: string; label: string }> = {
  completed: { dot: "border-emerald-500 bg-emerald-50", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", label: "已完成" },
  active: { dot: "border-blue-500 bg-blue-50", badge: "border-blue-200 bg-blue-50 text-blue-700", label: "进行中" },
  pending: { dot: "border-gray-300 bg-gray-50", badge: "border-gray-200 bg-gray-50 text-gray-500", label: "未完成" },
  rejected: { dot: "border-red-500 bg-red-50", badge: "border-red-200 bg-red-50 text-red-700", label: "已驳回" },
  error: { dot: "border-red-500 bg-red-50", badge: "border-red-200 bg-red-50 text-red-700", label: "异常" },
};

function getRegularNodes(task: DetailTaskInfo): ProgressNode[] {
  const s = task.isDraft ? 0 : task.step;
  const isRejected = task.node === "audit_rejected";
  const isTransferError = task.node === "transfer_error";

  return [
    {
      name: "客户提交申请",
      status: task.isDraft ? "pending" : s >= 1 ? "completed" : "active",
      handlerName: "李明",
      handlerRole: "客户",
      handlerInitial: "李",
      time: task.isDraft ? "—" : task.time,
      description: task.isDraft
        ? "客户已保存充值申请草稿，尚未正式提交。"
        : `客户已提交充值申请，充值金额 ${task.amount}，客户应付金额 ${task.payableAmount}。`,
    },
    {
      name: "米播审核",
      status: isRejected ? "rejected" : s > 2 ? "completed" : s === 2 ? "active" : "pending",
      handlerName: "赵航",
      handlerRole: "米播平台",
      handlerInitial: "赵",
      time: s >= 2 ? "2026-07-10 14:40" : "—",
      description: isRejected
        ? "米播审核未通过，请查看驳回原因并修改后重新提交。"
        : s > 2
          ? "米播已核对客户信息、账户信息、充值金额、付款信息及凭证。"
          : s === 2
            ? "米播正在审核客户提交的充值申请信息。"
            : "等待米播审核客户信息、账户信息及金额信息。",
      rejectionReasons: isRejected ? ["信息不一致", "凭证问题"] : undefined,
      rejectionNote: isRejected ? "请核对账户主体信息并重新上传清晰凭证。" : undefined,
    },
    {
      name: "米播进行账户充值",
      status: isTransferError ? "error" : s > 3 ? "completed" : s === 3 ? "active" : "pending",
      handlerName: "赵航",
      handlerRole: "米播平台",
      handlerInitial: "赵",
      time: s >= 3 ? "2026-07-10 15:20" : "—",
      description: isTransferError
        ? "账户充值处理出现异常，请联系米播平台处理。"
        : s > 3
          ? "米播已完成内部财务确认、平台付款、到账核验及账户充值等操作。"
          : s === 3
            ? "米播正在进行账户充值处理，包含内部财务确认、平台付款、到账核验及账户充值等操作。"
            : "等待米播完成内部财务确认、付款及账户充值处理。",
    },
    {
      name: "充值完成",
      status: s >= 4 ? "completed" : "pending",
      handlerName: "系统",
      handlerRole: "系统",
      handlerInitial: "系",
      time: s >= 4 ? "2026-07-10 16:30" : "—",
      description: s >= 4
        ? "账户充值已完成，订单状态更新为已完成，客户账户余额已更新。"
        : "等待米播完成充值处理。",
    },
  ];
}

function getSpecialNodes(task: DetailTaskInfo): ProgressNode[] {
  const s = task.isDraft ? 0 : task.step;
  const hasReceipt = !!task.paymentReceipt;
  const isRejected = task.node === "sp_rejected";
  const isPaymentRejected = task.node === "sp_payment_rejected" || task.paymentStatus === "error";

  return [
    {
      name: "客户提交特批申请",
      status: task.isDraft ? "pending" : s >= 1 ? "completed" : "active",
      handlerName: "李明",
      handlerRole: "客户",
      handlerInitial: "李",
      time: task.isDraft ? "—" : task.time,
      description: task.isDraft
        ? "客户已保存特批充值申请草稿，尚未正式提交。"
        : `客户提交特批充值申请，充值金额 ${task.amount}，客户应付金额 ${task.payableAmount}。`,
    },
    {
      name: "米播评估",
      status: isRejected ? "rejected" : s > 2 ? "completed" : s === 2 ? "active" : "pending",
      handlerName: "赵航",
      handlerRole: "米播平台",
      handlerInitial: "赵",
      time: s >= 2 ? "2026-07-10 09:00" : "—",
      description: isRejected
        ? "米播评估未通过，请查看原因。"
        : s > 2
          ? "米播已评估客户投放需求、账户状态、金额及特批风险。"
          : s === 2
            ? "米播正在评估账户、金额、付款安排及业务情况。"
            : "等待米播评估特批申请。",
      rejectionReasons: isRejected ? ["业务不符", "风险较高"] : undefined,
      rejectionNote: isRejected ? "当前业务情况暂不支持特批充值。" : undefined,
    },
    {
      name: "特批通过",
      status: s > 3 ? "completed" : s === 3 ? "active" : "pending",
      handlerName: "董老师",
      handlerRole: "审批人",
      handlerInitial: "董",
      time: s >= 3 ? "2026-07-10 15:00" : "—",
      description: s > 3
        ? "特批申请已通过，米播可先行处理充值。"
        : s === 3
          ? "特批申请已通过，米播可先行处理充值。"
          : "等待米播评估通过后，方可进行充值处理。",
    },
    {
      name: "充值完成",
      status: s > 4 ? "completed" : s === 4 ? "active" : "pending",
      handlerName: "赵航",
      handlerRole: "米播平台",
      handlerInitial: "赵",
      time: s >= 4 ? "2026-07-10 17:00" : "—",
      description: s > 4
        ? "米播已先行完成客户账户充值，等待客户完成付款并上传付款凭证。此时订单尚未完成。"
        : s === 4
          ? "米播正在处理客户账户充值。"
          : "米播通过后将进行账户充值处理。",
    },
    {
      name: "客户上传付款凭证",
      status: isPaymentRejected
        ? "rejected"
        : task.financeConfirmed
          ? "completed"
          : hasReceipt
            ? "active"
            : s >= 4
              ? "active"
              : "pending",
      handlerName: "李明",
      handlerRole: "客户",
      handlerInitial: "李",
      time: s >= 5 && hasReceipt ? "2026-07-11 10:00" : "—",
      description: isPaymentRejected
        ? "付款凭证被驳回，请重新上传清晰完整的银行回单。"
        : task.financeConfirmed
          ? "财务已确认客户款项到账，订单状态更新为已完成。"
          : hasReceipt
            ? "客户已上传付款凭证，等待米播财务确认到账。"
            : s >= 4
              ? "客户需完成对公付款并上传付款凭证。"
              : "等待充值完成后，客户需付款并上传凭证。",
      rejectionReasons: isPaymentRejected ? ["付款凭证不清晰", "付款主体不一致"] : undefined,
      rejectionNote: isPaymentRejected ? "请重新上传完整银行回单，并确认付款主体与客户主体一致。" : undefined,
    },
  ];
}

function getDraftNodes(task: DetailTaskInfo): ProgressNode[] {
  const isSpecial = task.rechargeType === "special";
  const nodes = isSpecial ? getSpecialNodes(task) : getRegularNodes(task);
  // Override first node for draft
  nodes[0] = {
    name: "保存草稿",
    status: "completed",
    handlerName: "李明",
    handlerRole: "客户",
    handlerInitial: "李",
    time: task.time,
    description: isSpecial
      ? "客户保存特批充值申请草稿，尚未正式提交。"
      : "客户保存充值申请草稿，尚未正式提交。",
  };
  return nodes;
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-2.5">
        {icon}
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs ${bold ? "font-semibold text-foreground" : "text-foreground"} ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function TaskDetailDrawer({
  open,
  onOpenChange,
  task,
  onViewLedger,
}: TaskDetailDrawerProps) {
  if (!task) return null;

  const getNodes = (t: DetailTaskInfo): ProgressNode[] => {
    if (t.isDraft) return getDraftNodes(t);
    if (t.rechargeType === "special") return getSpecialNodes(t);
    return getRegularNodes(t);
  };

  const nodes = getNodes(task);
  const isCompleted = task.node === "completed" || (task.rechargeType === "special" && task.step >= task.totalSteps && task.financeConfirmed);
  const isError = task.node === "transfer_error";
  const isPendingAudit = task.node === "pending_audit";
  const isAuditRejected = task.node === "audit_rejected";

  const footerAction = () => {
    if (isCompleted) return { label: "查看流水", icon: <FileText className="h-4 w-4" />, onClick: onViewLedger };
    if (isAuditRejected) return { label: "修改申请", icon: <FileText className="h-4 w-4" />, onClick: () => {} };
    return null;
  };

  const action = footerAction();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[600px]"
      >
        {/* ── Header ─────────────────────────────────── */}
        <SheetHeader className="space-y-3 border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-3.5 w-3.5 text-white" />
              </div>
              <SheetTitle>充值详情</SheetTitle>
            </div>
            <Badge variant="outline" className={`gap-1 text-xs ${task.nodeClassName}`}>
              {task.node === "transferring" && <RefreshCw className="h-3 w-3 animate-spin" />}
              {task.node === "completed" && <CheckCircle2 className="h-3 w-3" />}
              {task.node === "pending_audit" && <Clock className="h-3 w-3" />}
              {task.node === "pending_payment" && <CreditCard className="h-3 w-3" />}
              {task.node === "pending_confirm" && <Upload className="h-3 w-3" />}
              {task.node === "transfer_error" && <ShieldAlert className="h-3 w-3" />}
              {task.node === "audit_rejected" && <XCircle className="h-3 w-3" />}
              {task.nodeLabel}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {/* Section 1: Account Info */}
          <SectionCard
            title="充值账户信息"
            icon={<Building2 className="h-4 w-4 text-primary" />}
          >
            <InfoRow label="充值单号" value={task.id} mono />
            <InfoRow label="星图账户" value={task.account} />
            <InfoRow label="星图账户 ID" value={task.accountId} mono />
            <InfoRow label="充值金额" value={task.amount} bold />
            <InfoRow label="应付金额" value={task.payableAmount} bold />
            <InfoRow label="折扣" value={task.discount} />
            <InfoRow label="提交时间" value={task.time} />
          </SectionCard>

          {/* Section 2: Current Status */}
          <SectionCard
            title="当前状态"
            icon={isError ? <AlertCircle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-primary" />}
          >
            <InfoRow label="当前节点" value={task.nodeLabel} bold />
            <InfoRow label="待处理方" value={task.handler} />
            <div className="mt-2 rounded-lg bg-muted/50 p-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {task.statusDescription}
              </p>
            </div>
          </SectionCard>

          {/* Section 3: Payment Receipt Info */}
          {(() => {
            const isSpecial = task.rechargeType === "special";
            const isDraft = task.isDraft;
            const isPaymentError = task.paymentStatus === "error";
            const hasReceipt = !!task.paymentReceipt;
            const isFinanceConfirmed = task.financeConfirmed;

            // ── Determine if payment info should be present ─────
            // Regular: payment submitted with application → always present once submitted (step >= 2)
            // Special: payment only required at step 5 (客户上传付款凭证)
            const paymentRequired = isSpecial
              ? (task.step >= 5 || hasReceipt) // special: step 5+ or receipt exists
              : (!isDraft && task.step >= 2);  // regular: submitted means payment exists

            const payStatusLabel = isDraft ? "待上传凭证"
              : isPaymentError ? "凭证被驳回"
              : isFinanceConfirmed ? "已确认到账"
              : isSpecial && !hasReceipt && task.step < 5 ? "待上传凭证"
              : isSpecial && hasReceipt && !isFinanceConfirmed ? "已上传待确认"
              : !isSpecial && task.step >= 3 && isFinanceConfirmed ? "已确认到账"
              : !isSpecial && task.step >= 2 ? "已上传待审核"
              : hasReceipt ? "已上传待确认"
              : "待上传凭证";

            const payStatusClass = isPaymentError ? "border-red-200 bg-red-50 text-red-700"
              : isFinanceConfirmed || (!isSpecial && task.step >= 3) ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : paymentRequired ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-amber-200 bg-amber-50 text-amber-700";

            const receiptLabel = paymentRequired && !hasReceipt && !isSpecial
              ? "客户回单.pdf" // regular: payment submitted with app, implied receipt
              : task.paymentReceipt || null;

            const payAccount = paymentRequired && !task.paymentAccountName && !isSpecial
              ? "上海云岚科技有限公司" // regular: implied from customer
              : task.paymentAccountName || null;

            const payAmount = paymentRequired && !task.paymentAmount
              ? task.payableAmount // fallback to payable
              : task.paymentAmount || null;

            const uploadTime = paymentRequired && !task.paymentTime && !isSpecial
              ? task.time // use submission time
              : task.paymentTime || null;

            const financeConfirmLabel = isDraft ? "未开始"
              : isFinanceConfirmed ? "已确认到账"
              : isSpecial && !hasReceipt ? "未开始"
              : !isSpecial && task.step >= 2 && !isFinanceConfirmed ? "待米播审核"
              : hasReceipt && !isFinanceConfirmed ? "待确认到账"
              : "—";

            return (
              <SectionCard
                title="付款凭证信息"
                icon={<FileText className="h-4 w-4 text-primary" />}
              >
                {/* Payment status */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">付款状态</span>
                  <Badge className={`gap-1 text-xs ${payStatusClass}`}>{payStatusLabel}</Badge>
                  {isSpecial && !hasReceipt && task.step >= 4 && task.step < 5 && (
                    <span className="text-[11px] text-muted-foreground">（特批充值，充值已完成，待客户付款）</span>
                  )}
                  {isSpecial && !hasReceipt && task.step >= 5 && (
                    <span className="text-[11px] text-muted-foreground">（请完成付款并上传凭证）</span>
                  )}
                </div>

                {/* Receipt file */}
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-muted-foreground">付款凭证</span>
                  {receiptLabel ? (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                      <Eye className="mr-1 h-3 w-3" />
                      {receiptLabel}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">未上传</span>
                  )}
                </div>

                <InfoRow label="付款主体" value={payAccount || "—"} />
                <InfoRow label={isSpecial && !hasReceipt ? "客户应付金额" : "客户填写付款金额"} value={payAmount || "—"} bold />

                <InfoRow label="上传时间" value={uploadTime || "—"} />

                <InfoRow label="财务确认状态" value={financeConfirmLabel} bold />
                <InfoRow label="财务确认时间" value={task.financeConfirmedTime || "—"} />

                {/* Rejection details */}
                {isPaymentError && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3">
                    <p className="text-xs font-medium text-red-700">驳回原因</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(task.errorReason || "付款凭证不清晰、付款主体不一致").split("、").map((r, i) => (
                        <Badge key={i} className="border-red-200 bg-red-50 text-xs text-red-700">{r.trim()}</Badge>
                      ))}
                    </div>
                    {task.errorDescription && (
                      <p className="mt-2 text-xs text-red-600/80">{task.errorDescription}</p>
                    )}
                  </div>
                )}
              </SectionCard>
            );
          })()}

          {/* Section 4: Progress Overview */}
          <SectionCard
            title="进度概览"
            icon={<FileText className="h-4 w-4 text-primary" />}
          >
            <p className="mb-4 text-xs text-muted-foreground">查看该充值订单的完整处理进度</p>
            <div className="relative space-y-0">
              {nodes.map((node, index, arr) => {
                const isLast = index === arr.length - 1;
                const cfg = statusConfig[node.status];
                const prevCompleted = index === 0 || arr[index - 1].status === "completed";
                const lineColor = node.status === "completed" ? "bg-emerald-200" : prevCompleted ? "bg-border" : "bg-gray-200";

                return (
                  <div key={index} className="relative flex gap-3 pb-4">
                    {/* Vertical line */}
                    {!isLast && (
                      <div className={`absolute left-[7px] top-6 h-[calc(100%-8px)] w-px ${lineColor}`} />
                    )}
                    {/* Status dot */}
                    <div className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${cfg.dot}`} />

                    {/* Content */}
                    <div className={`min-w-0 flex-1 rounded-lg border px-3 py-2.5 ${
                      node.status === "active" ? "border-blue-200 bg-blue-50/40" :
                      node.status === "rejected" || node.status === "error" ? "border-red-200 bg-red-50/40" :
                      node.status === "pending" ? "border-gray-100 bg-gray-50/30" :
                      "border-transparent"
                    }`}>
                      {/* Node header */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold ${
                          node.status === "active" ? "text-blue-700" :
                          node.status === "pending" ? "text-muted-foreground/60" :
                          "text-foreground"
                        }`}>{node.name}</span>
                        <Badge className={`h-4 gap-0.5 px-1.5 text-[10px] ${cfg.badge}`}>
                          {cfg.label}
                        </Badge>
                      </div>

                      {/* Handler */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium ${
                          node.status === "active" ? "bg-blue-100 text-blue-700" :
                          node.status === "pending" ? "bg-gray-100 text-gray-400" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {node.handlerInitial}
                        </div>
                        <span className={`text-xs ${node.status === "pending" ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                          {node.handlerName}
                        </span>
                        <span className={`text-[10px] ${node.status === "pending" ? "text-muted-foreground/40" : "text-muted-foreground/60"}`}>
                          ｜{node.handlerRole}
                        </span>
                        <span className={`ml-auto text-[10px] ${node.status === "pending" ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                          {node.time}
                        </span>
                      </div>

                      {/* Description */}
                      <p className={`mt-1.5 text-xs leading-relaxed ${
                        node.status === "pending" ? "text-muted-foreground/50" : "text-muted-foreground"
                      }`}>
                        {node.description}
                      </p>

                      {/* Rejection details */}
                      {node.rejectionReasons && (
                        <div className="mt-2 space-y-1.5 rounded-md bg-red-100/60 px-2.5 py-2">
                          <div className="flex flex-wrap gap-1">
                            {node.rejectionReasons.map((r, i) => (
                              <Badge key={i} className="h-4 border-red-200 bg-red-50 px-1 text-[10px] text-red-700">{r}</Badge>
                            ))}
                          </div>
                          {node.rejectionNote && (
                            <p className="text-[11px] text-red-600/80">{node.rejectionNote}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Section 5: Transfer Screenshot */}
          <SectionCard
            title="划拨截图"
            icon={<ImageIcon className="h-4 w-4 text-primary" />}
          >
            {task.transferScreenshot ? (
              <>
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <img src={task.transferScreenshot} alt="划拨截图" className="w-full object-cover" />
                </div>
                {task.transferCompletedTime && (
                  <p className="mt-2 text-xs text-muted-foreground">划拨时间：{task.transferCompletedTime}</p>
                )}
              </>
            ) : task.node === "transferring" || task.node === "finance_confirm" ? (
              <div className="flex items-center gap-2 py-2">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">米播正在处理账户划拨，完成后将展示划拨截图</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 py-6 text-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">暂无划拨截图</span>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
            {action && (
              <Button className="flex-1 gap-2" onClick={action.onClick}>
                {action.icon}
                {action.label}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
