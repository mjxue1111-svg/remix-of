"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X, CheckCircle2, FileText, Upload, Wallet, Building2, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────

export interface PaymentTaskInfo {
  id: string;
  rechargeType: "regular" | "special";
  account: string;
  payableAmount: string;
  subject: string;
}

interface UploadPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: PaymentTaskInfo | null;
  mode: "upload" | "reupload" | "supplement";
}

// ── Helpers ────────────────────────────────────────────────────────────────

const titleMap: Record<string, string> = {
  upload: "上传凭证",
  reupload: "重新上传付款凭证",
  supplement: "补传付款凭证",
};

// ── Component ──────────────────────────────────────────────────────────────

export function UploadPaymentModal({ open, onOpenChange, task, mode }: UploadPaymentModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payAccountName, setPayAccountName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (open && task) {
      setStep("form");
      setPayAmount(task.payableAmount);
      setPayAccountName(task.subject);
      setReceiptFile(null);
      setRemarks("");
    }
  }, [open, task]);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const isFormValid = receiptFile !== null && payAmount.trim() !== "" && payAccountName.trim() !== "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReceiptFile(file);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  if (!mounted || !open || !task) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl" role="dialog" aria-modal="true">
        {step === "form" ? (
          <>
            {/* Header */}
            <div className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-foreground">{titleMap[mode]}</h2>
                  <p className="text-sm text-muted-foreground">请上传付款凭证，提交后米播将进行确认。</p>
                </div>
                <button onClick={handleClose} className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Task summary */}
              <div className="mt-3 rounded-lg border border-border/60 bg-sapphire-subtle p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">充值单号</span><p className="font-mono font-semibold text-foreground">{task.id}</p></div>
                  <div><span className="text-muted-foreground">充值类型</span>
                    <Badge className={`ml-1 gap-1 text-xs ${task.rechargeType === "special" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                      {task.rechargeType === "special" ? <><Zap className="h-3 w-3" />特批充值</> : <><Wallet className="h-3 w-3" />常规充值</>}
                    </Badge>
                  </div>
                  <div><span className="text-muted-foreground">账户名称</span><p className="font-medium text-foreground">{task.account}</p></div>
                  <div><span className="text-muted-foreground">实付金额</span><p className="font-bold text-primary">{task.payableAmount}</p></div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-5">
              {/* File upload */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">付款凭证 <span className="text-destructive">*</span></Label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-5 transition-colors hover:border-primary/50 hover:bg-sapphire-subtle">
                  {receiptFile ? (
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-primary" />
                      <p className="mt-1 text-sm font-medium text-foreground">{receiptFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                      <Button variant="ghost" size="sm" className="mt-1 text-xs text-muted-foreground" onClick={(e) => { e.preventDefault(); setReceiptFile(null); }}>重新选择</Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">点击或拖拽上传付款截图 / 回单</p>
                      <p className="text-xs text-muted-foreground">支持 JPG、PNG、PDF 格式，单文件不超过 10MB</p>
                    </>
                  )}
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">付款金额 <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">¥</span>
                  <Input type="text" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="h-10 pl-7" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">付款主体 / 付款账户户名 <span className="text-destructive">*</span></Label>
                <Input value={payAccountName} onChange={(e) => setPayAccountName(e.target.value)} className="h-10" />
                <p className="text-[11px] text-muted-foreground">请填写实际付款的公司主体或账户户名，便于财务确认到账</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">备注说明</Label>
                <Textarea placeholder="如付款主体与客户主体不一致、分笔付款或其他特殊情况，请在此说明" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="min-h-[60px] resize-none" />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" size="lg" onClick={handleClose}>取消</Button>
              <Button size="lg" disabled={!isFormValid} onClick={() => setStep("success")}>提交凭证</Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center px-8 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">付款凭证已提交</h2>
            <p className="mt-1 text-sm text-muted-foreground">米播将根据您提交的付款凭证进行确认。</p>
            <Button className="mt-6" onClick={handleClose}>返回看板</Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
