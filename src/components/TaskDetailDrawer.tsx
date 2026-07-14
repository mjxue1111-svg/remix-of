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
  ArrowUpRight,
  Upload,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  CreditCard,
  XCircle,
  Loader,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface OperationLog {
  time: string;
  operator: string;
  action: string;
  notes: string;
}

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
  // Payment info
  paymentAmount?: string;
  paymentTime?: string;
  paymentAccountName?: string;
  paymentBank?: string;
  paymentReceipt?: string;
  financeConfirmed?: boolean;
  financeConfirmedTime?: string;
  // Platform transfer info
  transferStatus?: string;
  transferId?: string;
  transferCompletedTime?: string;
  transferErrorReason?: string;
  transferSuggestion?: string;
}

interface TaskDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: DetailTaskInfo | null;
  onViewProgress?: () => void;
  onViewLedger?: () => void;
  onUploadReceipt?: () => void;
}

// ── Sample operation logs ──────────────────────────────────────────────────

const sampleLogs: OperationLog[] = [
  {
    time: "2026-07-10 14:32",
    operator: "客户 李明",
    action: "提交申请",
    notes: "提交充值申请，充值金额 ¥50,000.00",
  },
  {
    time: "2026-07-10 14:40",
    operator: "米播平台媒介",
    action: "审核通过",
    notes: "审核通过，已生成收款信息",
  },
  {
    time: "2026-07-10 15:05",
    operator: "客户 李明",
    action: "上传回单",
    notes: "已上传付款回单，付款金额 ¥49,000.00",
  },
  {
    time: "2026-07-10 15:20",
    operator: "米播财务",
    action: "确认到账",
    notes: "财务确认到账，已发起平台转账",
  },
  {
    time: "2026-07-10 15:30",
    operator: "米播平台媒介",
    action: "发起转账",
    notes: "平台媒介已发起转账至星图平台",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

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
  onViewProgress,
  onViewLedger,
  onUploadReceipt,
}: TaskDetailDrawerProps) {
  if (!task) return null;

  const isCompleted = task.node === "completed";
  const isTransferring = task.node === "transferring";
  const isError = task.node === "transfer_error";
  const isPendingPayment = task.node === "pending_payment";
  const isPendingAudit = task.node === "pending_audit";
  const isAuditRejected = task.node === "audit_rejected";

  const footerAction = () => {
    if (isTransferring) return { label: "查看进度", icon: <ArrowUpRight className="h-4 w-4" />, onClick: onViewProgress };
    if (isCompleted) return { label: "查看流水", icon: <FileText className="h-4 w-4" />, onClick: onViewLedger };
    if (isError) return { label: "补充材料", icon: <Upload className="h-4 w-4" />, onClick: onUploadReceipt };
    if (isPendingPayment) return { label: "上传回单", icon: <Upload className="h-4 w-4" />, onClick: onUploadReceipt };
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
          {/* Section 1: Basic Info */}
          <SectionCard
            title="基础信息"
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

          {/* Section 3: Payment Info */}
          {task.paymentAmount && (
            <SectionCard
              title="付款信息"
              icon={<Wallet className="h-4 w-4 text-primary" />}
            >
              <InfoRow label="付款金额" value={task.paymentAmount} bold />
              <InfoRow label="付款时间" value={task.paymentTime ?? "—"} />
              <InfoRow label="付款账户名称" value={task.paymentAccountName ?? "—"} />
              <InfoRow label="付款银行" value={task.paymentBank ?? "—"} />
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-muted-foreground">付款回单</span>
                {task.paymentReceipt ? (
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                    <Eye className="mr-1 h-3 w-3" />
                    {task.paymentReceipt}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
              <InfoRow
                label="财务确认状态"
                value={task.financeConfirmed ? "已确认" : "待确认"}
                bold
              />
              {task.financeConfirmedTime && (
                <InfoRow label="财务确认时间" value={task.financeConfirmedTime} />
              )}
            </SectionCard>
          )}

          {/* Section 4: Platform Transfer Info */}
          <SectionCard
            title="平台转账信息"
            icon={<RefreshCw className="h-4 w-4 text-primary" />}
          >
            {task.transferStatus ? (
              <>
                <InfoRow
                  label="转账状态"
                  value={task.transferStatus}
                  bold
                />
                {task.transferId && (
                  <InfoRow label="平台流水号" value={task.transferId} mono />
                )}
                {task.transferCompletedTime && (
                  <InfoRow label="转账完成时间" value={task.transferCompletedTime} />
                )}
                {task.transferErrorReason && (
                  <div className="mt-2 rounded-lg bg-red-50 p-3">
                    <p className="text-xs font-medium text-red-700">失败原因</p>
                    <p className="mt-1 text-xs text-red-600">{task.transferErrorReason}</p>
                    {task.transferSuggestion && (
                      <p className="mt-1 text-xs text-red-500">{task.transferSuggestion}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 py-2">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">处理中</span>
              </div>
            )}
          </SectionCard>

          {/* Section 5: Operation Log */}
          <SectionCard
            title="操作日志"
            icon={<FileText className="h-4 w-4 text-primary" />}
          >
            <div className="relative space-y-0">
              {sampleLogs.map((log, index) => {
                const isLast = index === sampleLogs.length - 1;
                return (
                  <div key={index} className="relative flex gap-3 pb-4">
                    {!isLast && (
                      <div className="absolute left-[7px] top-6 h-[calc(100%-12px)] w-px bg-border" />
                    )}
                    <div className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-background" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{log.action}</span>
                        <span className="text-[10px] text-muted-foreground">{log.time}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{log.operator}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{log.notes}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
