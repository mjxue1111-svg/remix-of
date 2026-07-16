"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X, CheckCircle2, FileText, Upload, Zap, AlertTriangle, Info,
  Copy, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SpecialPaymentTaskInfo {
  id: string;
  account: string;
  accountId: string;
  subject: string;
  amount: string;
  payableAmount: string;
  discount: string;
  rechargeType: "special";
  node: string;
  step: number;
  totalSteps: number;
  customerName?: string;
  paymentReceipt?: string;
  paymentStatus?: string;
  errorReason?: string;
  errorDescription?: string;
}

interface SpecialPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: SpecialPaymentTaskInfo | null;
}

// ── Bank Info ──────────────────────────────────────────────────────────────

const bankInfo = {
  companyName: "北京米播科技有限公司",
  bankName: "招商银行股份有限公司北京自贸试验区生命科学园支行",
  accountNumber: "110962262110001",
};

// ── Component ──────────────────────────────────────────────────────────────

export function SpecialPaymentModal({ open, onOpenChange, task }: SpecialPaymentModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [payAccountName, setPayAccountName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const isResubmit = task?.paymentStatus === "error";
  const remarkText = task ? `${task.id} / ${task.subject}` : "";

  const fullPaymentText = [
    `应付金额：¥${task?.payableAmount ?? "0.00"}`,
    `收款公司名称：${bankInfo.companyName}`,
    `开户行：${bankInfo.bankName}`,
    `银行账号：${bankInfo.accountNumber}`,
    `打款备注：${remarkText}`,
  ].join("\n");

  const hasUnsavedContent = !draftSaved && (receiptFile !== null || payAccountName !== (task?.subject ?? "") || remarks.trim() !== "");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      setStep("form");
      setReceiptFile(null);
      setPayAccountName(task?.subject ?? "");
      setRemarks("");
      setAcknowledged(false);
      setCopiedAll(false);
      setConfirmCloseOpen(false);
      setDraftSaved(false);
    }
  }, [open, task?.id]);

  // Esc key handler
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleRequestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, hasUnsavedContent]);

  const handleRequestClose = () => {
    if (hasUnsavedContent) {
      setConfirmCloseOpen(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirmClose = () => {
    setConfirmCloseOpen(false);
    onOpenChange(false);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullPaymentText).then(
      () => { setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000); },
      () => toast.error("复制失败，请手动复制"),
    );
  };

  const canSubmit = receiptFile !== null && payAccountName.trim() !== "" && acknowledged;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStep("success");
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    toast.success("付款凭证草稿已保存");
  };

  if (!mounted || !open || !task) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleRequestClose} />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isResubmit ? "重新提交付款凭证" : "提交付款凭证"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              该订单为特批充值，请在完成对公付款后上传付款凭证。米播财务确认到账后，该订单将更新为已完成。
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleRequestClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {step === "success" ? (
          /* ── Success State ──────────────────────────────────── */
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">付款凭证已提交</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              米播财务将确认到账情况，确认后该订单将更新为已完成。
            </p>
            <Button className="mt-6" onClick={() => onOpenChange(false)}>
              返回看板
            </Button>
          </div>
        ) : (
          /* ── Form State ─────────────────────────────────────── */
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* ── Order Summary Card ──────────────────────────── */}
            <div className="rounded-xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">订单摘要</h3>
              </div>

              {/* Layer 1: Core info */}
              <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-foreground">{task.id}</span>
                  <Badge className="gap-1 border-amber-200 bg-amber-50 text-xs text-amber-700"><Zap className="h-3 w-3" />特批充值</Badge>
                </div>
                <Badge className="gap-1 border-blue-200 bg-blue-50 text-xs text-blue-700">待提交付款凭证</Badge>
              </div>

              {/* Layer 2: Customer & Account */}
              <div className="grid grid-cols-2 divide-x divide-border/30 border-b border-border/30">
                <div className="space-y-2 px-4 py-3">
                  <p className="text-xs font-semibold text-foreground">客户信息</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground/70">客户名称</span>
                      <span className="text-xs font-medium text-foreground">{task.customerName ?? task.subject}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground/70">账户主体</span>
                      <span className="text-xs font-medium text-foreground">{task.subject}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 px-4 py-3">
                  <p className="text-xs font-semibold text-foreground">账户信息</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground/70">账户名称</span>
                      <span className="text-xs font-medium text-foreground">{task.account}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground/70">账户 ID</span>
                      <Badge className="h-4 border-gray-200 bg-gray-50 px-1 font-mono text-[10px] text-gray-600">{task.accountId}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layer 3: Amount */}
              <div className="flex items-center justify-between rounded-b-xl border-t-2 border-sapphire-light/60 bg-sapphire-subtle/40 px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="text-xs">
                    <span className="text-muted-foreground">客户充值金额 </span>
                    <span className="font-medium text-foreground">{task.amount}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">折扣 </span>
                    <Badge className="h-4 border-emerald-200 bg-emerald-50 px-1 text-[10px] text-emerald-700">98 折</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">客户应付金额</p>
                  <p className="text-xl font-bold tracking-tight text-primary">{task.payableAmount}</p>
                </div>
              </div>
            </div>

            {/* ── Payment Info Card ───────────────────────────── */}
            <div className="rounded-xl border-2 border-sapphire-light bg-gradient-to-br from-sapphire-subtle via-white to-blue-50/30 p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                    <Landmark className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">付款信息</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 border-primary/30 text-xs text-primary hover:bg-primary/5 hover:border-primary/50"
                  onClick={handleCopyAll}
                >
                  <Copy className="h-3 w-3" />
                  {copiedAll ? "已复制" : "一键复制付款信息"}
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground">应付金额</p>
                <span className="text-3xl font-bold tracking-tight text-primary">{task.payableAmount}</span>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-lg bg-white/70 px-3 py-1.5">
                  <span className="text-[11px] text-muted-foreground">收款公司名称</span>
                  <p className="text-xs font-medium text-foreground">{bankInfo.companyName}</p>
                </div>
                <div className="rounded-lg bg-white/70 px-3 py-1.5">
                  <span className="text-[11px] text-muted-foreground">开户行</span>
                  <p className="text-xs font-medium text-foreground">{bankInfo.bankName}</p>
                </div>
                <div className="rounded-lg bg-white/70 px-3 py-1.5">
                  <span className="text-[11px] text-muted-foreground">银行账号</span>
                  <p className="text-xs font-medium text-foreground">{bankInfo.accountNumber}</p>
                </div>
                <div className="rounded-lg bg-white/70 px-3 py-1.5">
                  <span className="text-[11px] text-muted-foreground">打款备注</span>
                  <p className="text-xs font-medium text-foreground">{remarkText}</p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50/80 px-3 py-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-sapphire">
                  请使用应付金额完成对公转账，付款完成后上传付款凭证。
                </p>
              </div>
            </div>

            {/* ── Rejection Reason (re-submit only) ────────────── */}
            {isResubmit && task.errorReason && (
              <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700">
                  <AlertTriangle className="h-4 w-4" />上次凭证未通过原因
                </h3>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {task.errorReason.split("、").map((r, i) => (
                    <Badge key={i} className="border-red-200 bg-red-50 text-xs text-red-700">{r.trim()}</Badge>
                  ))}
                </div>
                {task.errorDescription && (
                  <p className="text-xs text-red-600/80">{task.errorDescription}</p>
                )}
              </div>
            )}

            {/* ── Upload Payment Receipt ──────────────────────── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">上传付款凭证</h3>

              {/* File upload */}
              <div className="space-y-1.5">
                <Label>付款凭证 <span className="text-destructive">*</span></Label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/20 px-4 py-6 transition-colors hover:border-primary/40 hover:bg-muted/30">
                  {receiptFile ? (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <FileText className="h-4 w-4" />
                      {receiptFile.name}
                      <button
                        type="button"
                        className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.preventDefault(); setReceiptFile(null); }}
                      >
                        移除
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
                      <p className="mt-1 text-xs text-muted-foreground">点击或拖拽上传付款截图 / 银行回单</p>
                      <p className="text-[10px] text-muted-foreground/60">支持 JPG、PNG、PDF，单个文件不超过 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setReceiptFile(f); }}
                  />
                </label>
              </div>

              {/* Payment account name */}
              <div className="space-y-1.5">
                <Label>付款账户名称 <span className="text-destructive">*</span></Label>
                <Input
                  value={payAccountName}
                  onChange={(e) => setPayAccountName(e.target.value)}
                  placeholder="请输入实际付款账户名称"
                />
              </div>

              {/* Payable amount (read-only) */}
              <div className="space-y-1.5">
                <Label>客户付款金额</Label>
                <Input value={task.payableAmount} disabled className="bg-muted/50 text-foreground" />
                <p className="text-[11px] text-muted-foreground">系统自动带出，不可修改</p>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <Label>补充说明</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="如付款主体、金额或凭证有特殊情况，请补充说明"
                  rows={2}
                />
              </div>
            </div>

            {/* ── Confirmation Checkbox ───────────────────────── */}
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(!!v)}
                className="mt-0.5"
              />
              <span className="text-xs text-muted-foreground">
                我已确认付款金额、付款账户名称及上传的付款凭证真实有效。
              </span>
            </label>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────── */}
        {step !== "success" && (
          <div className="flex items-center gap-2 border-t border-border px-6 py-4">
            <Button variant="outline" className="flex-1" onClick={handleRequestClose}>取消</Button>
            <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>保存草稿</Button>
            <Button
              className="flex-1 shadow-lg shadow-primary/20"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isResubmit ? "重新提交付款凭证" : "提交付款凭证"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const confirmDialog = confirmCloseOpen && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmCloseOpen(false)} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-foreground">确认离开？</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          当前付款凭证信息尚未提交，离开后未保存的内容将丢失。
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmCloseOpen(false)}>继续编辑</Button>
          <Button className="flex-1" onClick={handleConfirmClose}>放弃并关闭</Button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      {modal}
      {confirmDialog}
    </>,
    document.body,
  );
}
