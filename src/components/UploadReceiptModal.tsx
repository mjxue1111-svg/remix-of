"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Wallet,
  Copy,
  Upload,
  Info,
  FileText,
  ChevronRight,
  CreditCard,
  Building2,
  Calendar,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReceiptTaskInfo {
  id: string;
  account: string;
  amount: string;
  subject: string;
  bankName: string;
  bankAccount: string;
  payableAmount: string;
}

interface UploadReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ReceiptTaskInfo | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ── Form Step ──────────────────────────────────────────────────────────────

function FormStep({
  task,
  onClose,
  onSuccess,
}: {
  task: ReceiptTaskInfo;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [payAmount, setPayAmount] = useState("");
  const [payTime, setPayTime] = useState("");
  const [payAccountName, setPayAccountName] = useState("");
  const [payBank, setPayBank] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");
  const [copied, setCopied] = useState<"account" | "remark" | null>(null);

  const isFormValid =
    payAmount.trim() !== "" &&
    payTime.trim() !== "" &&
    payAccountName.trim() !== "" &&
    receiptFile !== null;

  const handleCopy = (type: "account" | "remark", text: string) => {
    copyToClipboard(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReceiptFile(file);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="border-b border-border px-8 py-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              上传付款回单
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              请根据收款信息完成打款，并上传付款回单。提交后将由米播财务确认到账。
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-2">
        {/* ── Left: Payment Info ──────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">收款信息</h3>
          </div>

          <div className="rounded-xl border border-border/60 bg-sapphire-subtle p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">充值单号</span>
                <p className="font-mono font-semibold text-foreground">{task.id}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">收款主体</span>
                <p className="font-medium text-foreground">{task.subject}</p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-3 space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">开户行</span>
                <p className="text-sm font-medium text-foreground">{task.bankName}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">银行账号</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-mono text-sm font-medium text-foreground">{task.bankAccount}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 text-xs text-primary"
                    onClick={() => handleCopy("account", task.bankAccount.replace(/\s/g, ""))}
                  >
                    <Copy className="h-3 w-3" />
                    {copied === "account" ? "已复制" : "复制"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">应付金额</span>
                <span className="text-xl font-bold text-primary">{task.payableAmount}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">打款备注</span>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-mono text-sm font-medium text-foreground">{task.id}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-xs text-primary"
                  onClick={() => handleCopy("remark", task.id)}
                >
                  <Copy className="h-3 w-3" />
                  {copied === "remark" ? "已复制" : "复制"}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-amber-700">
              请使用对公账户打款，打款备注请填写充值任务编号。
            </p>
          </div>
        </div>

        {/* ── Right: Upload Form ──────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">付款回单</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                付款金额 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                  ¥
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="请输入实际付款金额"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="h-10 pl-7"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                付款时间 <span className="text-destructive">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={payTime}
                onChange={(e) => setPayTime(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                付款账户名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="请输入付款账户名称"
                value={payAccountName}
                onChange={(e) => setPayAccountName(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">付款银行</Label>
              <Input
                placeholder="请输入付款银行名称"
                value={payBank}
                onChange={(e) => setPayBank(e.target.value)}
                className="h-10"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                付款回单 <span className="text-destructive">*</span>
              </Label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-sapphire-subtle">
                {receiptFile ? (
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-primary" />
                    <p className="mt-2 text-sm font-medium text-foreground">{receiptFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(receiptFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 text-xs text-muted-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        setReceiptFile(null);
                      }}
                    >
                      重新选择
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      点击上传付款回单（支持图片或 PDF）
                    </p>
                    <p className="text-xs text-muted-foreground">
                      支持 JPG、PNG、PDF 格式，单文件不超过 10MB
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">备注说明</Label>
              <Textarea
                placeholder="其他补充说明（选填）"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <div className="border-t border-border px-8 py-4">
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="lg" onClick={onClose}>
            取消
          </Button>
          <Button size="lg" disabled={!isFormValid} onClick={onSuccess} className="min-w-[120px]">
            提交回单
          </Button>
        </div>
      </div>
    </>
  );
}

// ── Success Step ───────────────────────────────────────────────────────────

function SuccessStep({
  task,
  onViewProgress,
  onBackHome,
}: {
  task: ReceiptTaskInfo;
  onViewProgress: () => void;
  onBackHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </div>

      <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground">
        付款回单已提交
      </h2>
      <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        您的付款回单已提交，等待米播财务确认到账。
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-5 py-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">充值单号</p>
          <p className="text-lg font-mono font-bold tracking-wide text-foreground">
            {task.id}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={onBackHome}>
          返回首页
        </Button>
        <Button size="lg" onClick={onViewProgress} className="gap-2">
          查看充值进度
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────

export function UploadReceiptModal({ open, onOpenChange, task }: UploadReceiptModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setStep("form");
  }, [open]);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  if (!mounted || !open || !task) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative z-10 w-full max-w-[760px] max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {step === "form" ? (
          <FormStep
            task={task}
            onClose={handleClose}
            onSuccess={() => setStep("success")}
          />
        ) : (
          <SuccessStep
            task={task}
            onViewProgress={handleClose}
            onBackHome={handleClose}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
