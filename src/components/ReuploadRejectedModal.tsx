"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X, CheckCircle2, FileText, Upload, Zap, AlertTriangle, Info,
  Copy, Landmark, Wallet, Building2, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReuploadRejectedTaskInfo {
  id: string;
  account: string;
  accountId: string;
  subject: string;
  amount: string;
  payableAmount: string;
  discount: string;
  rechargeType: "regular" | "special";
  node: string;
  step: number;
  totalSteps: number;
  purpose: string;
  customerName?: string;
  paymentReceipt?: string;
  paymentStatus?: string;
  errorReason?: string;
  errorDescription?: string;
  // Special-only fields
  specialReason?: string;
  specialExpectedPayTime?: string;
  specialApprovedTime?: string;
  specialCompletedTime?: string;
}

interface ReuploadRejectedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ReuploadRejectedTaskInfo | null;
}

// ── Bank Info ──────────────────────────────────────────────────────────────

const bankInfo = {
  companyName: "北京米播科技有限公司",
  bankName: "招商银行股份有限公司北京自贸试验区生命科学园支行",
  accountNumber: "110962262110001",
};

// ── Component ──────────────────────────────────────────────────────────────

export function ReuploadRejectedModal({ open, onOpenChange, task }: ReuploadRejectedModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [payAccountName, setPayAccountName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const isRegular = task?.rechargeType === "regular";
  const isSpecial = task?.rechargeType === "special";
  const remarkText = task ? `${task.id} / ${task.subject}` : "";

  const fullPaymentText = [
    `应付金额：${task?.payableAmount ?? "0.00"}`,
    `收款公司名称：${bankInfo.companyName}`,
    `开户行：${bankInfo.bankName}`,
    `银行账号：${bankInfo.accountNumber}`,
    `打款备注：${remarkText}`,
  ].join("\n");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open && task) {
      setStep("form");
      setReceiptFile(null);
      setPayAccountName(task.subject ?? "");
      setRemarks("");
      setAcknowledged(false);
      setCopiedAll(false);
    }
  }, [open, task?.id]);

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

  if (!mounted || !open || !task) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">重新提交付款凭证</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isRegular
                ? "当前付款凭证未通过审核，请根据驳回原因重新上传有效付款凭证。重新提交后，米播将重新审核充值申请。"
                : "当前特批补款凭证未通过审核，请重新上传付款凭证。付款凭证确认到账后，该特批充值订单才会完成。"}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onOpenChange(false)}>
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
              {isRegular
                ? "米播将重新审核付款凭证及充值信息，审核通过后继续充值处理流程。"
                : "米播将重新确认补款凭证及到账情况，确认后订单将更新为已完成。"}
            </p>
            <Button className="mt-6" onClick={() => onOpenChange(false)}>返回看板</Button>
          </div>
        ) : (
          /* ── Form State ─────────────────────────────────────── */
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <Badge className="gap-1 border-red-200 bg-red-50 text-xs text-red-700">
                <AlertTriangle className="h-3 w-3" />
                {isRegular ? "付款凭证已驳回" : "补款凭证已驳回"}
              </Badge>
            </div>

            {/* ── 1. Order Summary ──────────────────────────── */}
            <div className="rounded-xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">订单摘要</h3>
                <Badge className={`gap-1 text-xs ${isSpecial ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                  {isSpecial ? <><Zap className="h-3 w-3" />特批充值</> : <><Wallet className="h-3 w-3" />常规充值</>}
                </Badge>
              </div>
              <div className="space-y-1.5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">充值单号</span>
                  <span className="font-mono text-sm font-semibold text-foreground">{task.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">充值处理方式</span>
                  <span className="text-sm text-foreground">{isRegular ? "常规充值" : "特批充值"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">星图账户名称</span>
                  <span className="text-sm font-medium text-foreground">{task.account}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">星图账户 ID</span>
                  <span className="font-mono text-sm text-foreground">{task.accountId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">账户主体</span>
                  <span className="text-sm text-foreground">{task.subject}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/30 pt-2 mt-1">
                  <span className="text-xs text-muted-foreground">充值金额</span>
                  <span className="text-sm font-medium text-foreground">{task.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">折扣</span>
                  <Badge className="h-4 border-emerald-200 bg-emerald-50 px-1 text-[10px] text-emerald-700">{task.discount}</Badge>
                </div>
                <div className="flex items-center justify-between border-t border-border/30 pt-2">
                  <span className="text-xs text-muted-foreground">{isSpecial ? "客户应付金额" : "应付金额"}</span>
                  <span className="text-base font-bold text-primary">{task.payableAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">充值用途</span>
                  <Badge variant="outline" className="border-border text-xs font-normal text-muted-foreground">{task.purpose}</Badge>
                </div>
              </div>
            </div>

            {/* ── 2. Special Info (special only) ────────────── */}
            {isSpecial && (
              <div className="rounded-xl border border-border/60 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">特批信息</h3>
                {task.specialReason && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">特批原因</span>
                    <span className="text-sm text-foreground max-w-[280px] text-right">{task.specialReason}</span>
                  </div>
                )}
                {task.specialExpectedPayTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">预计补款时间</span>
                    <span className="text-sm text-foreground">{task.specialExpectedPayTime}</span>
                  </div>
                )}
                {task.specialApprovedTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">特批通过时间</span>
                    <span className="text-sm text-foreground">{task.specialApprovedTime}</span>
                  </div>
                )}
                {task.specialCompletedTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">充值完成时间</span>
                    <span className="text-sm text-foreground">{task.specialCompletedTime}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── 3. Rejection Info ─────────────────────────── */}
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700">
                <AlertTriangle className="h-4 w-4" />驳回信息
              </h3>
              {task.errorReason && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {task.errorReason.split("、").map((r, i) => (
                    <Badge key={i} className="border-red-200 bg-red-50 text-xs text-red-700">{r.trim()}</Badge>
                  ))}
                </div>
              )}
              {task.errorDescription && (
                <p className="text-xs text-red-600/80">{task.errorDescription}</p>
              )}
              {!task.errorReason && !task.errorDescription && (
                <p className="text-xs text-red-600/80">付款凭证未通过审核，请重新上传。</p>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-red-200 pt-2">
                <span className="text-xs text-red-600/70">驳回时间</span>
                <span className="text-xs text-red-600/70">{task.specialCompletedTime || "2026-07-13 16:00"}</span>
              </div>
            </div>

            {/* ── 4. Bank/Payment Info ─────────────────────── */}
            <div className="rounded-xl border-2 border-sapphire-light bg-gradient-to-br from-sapphire-subtle via-white to-blue-50/30 p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                    <Landmark className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {isSpecial ? "补款信息" : "收款信息"}
                  </h3>
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

            {/* ── 5. Re-upload Payment Receipt ──────────────── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">重新上传付款凭证</h3>

              {/* Payment account name */}
              <div className="space-y-1.5">
                <Label>付款主体 <span className="text-destructive">*</span></Label>
                <Input
                  value={payAccountName}
                  onChange={(e) => setPayAccountName(e.target.value)}
                  placeholder="请输入实际付款账户名称"
                />
              </div>

              {/* Payable amount (read-only) */}
              <div className="space-y-1.5">
                <Label>付款金额</Label>
                <Input value={task.payableAmount} disabled className="bg-muted/50 text-foreground" />
                <p className="text-[11px] text-muted-foreground">默认带出应付金额，只读不可修改</p>
              </div>

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

              {/* Remarks */}
              <div className="space-y-1.5">
                <Label>备注说明</Label>
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
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>取消</Button>
            <Button
              className="flex-1 shadow-lg shadow-primary/20"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              提交付款凭证
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
