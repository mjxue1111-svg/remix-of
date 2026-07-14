"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, CheckCircle2, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CancelTaskInfo {
  id: string;
  rechargeType: "regular" | "special";
  account: string;
  amount: string;
  payableAmount: string;
  nodeLabel: string;
}

interface CancelOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: CancelTaskInfo | null;
}

const cancelReasons = [
  "客户暂不充值",
  "付款计划变更",
  "充值金额填写错误",
  "账户选择错误",
  "重复创建订单",
  "其他",
];

// ── Component ──────────────────────────────────────────────────────────────

export function CancelOrderModal({ open, onOpenChange, task }: CancelOrderModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const otherReasonEmpty = cancelReason === "其他" && otherReason.trim() === "";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (open) { setStep("form"); setCancelReason(""); setOtherReason(""); setRemarks(""); setConfirmed(false); }
  }, [open]);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const isFormValid = cancelReason !== "" && confirmed && (cancelReason !== "其他" || otherReason.trim() !== "");

  const handleReasonChange = (v: string) => { setCancelReason(v); if (v !== "其他") setOtherReason(""); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  if (!mounted || !open || !task) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl" role="dialog" aria-modal="true">
        {step === "form" ? (
          <>
            <div className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-bold text-foreground">取消充值订单</h2>
                <button onClick={handleClose} className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-700">取消后，该充值订单将终止处理，已填写的信息和上传的凭证将保留在订单记录中，但不可继续推进。</p>
              </div>
              <div className="mt-3 rounded-lg border border-border/60 bg-sapphire-subtle p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">充值单号</span><p className="font-mono font-semibold text-foreground">{task.id}</p></div>
                  <div><span className="text-muted-foreground">充值类型</span>
                    <Badge className={`ml-1 gap-1 text-xs ${task.rechargeType === "special" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                      {task.rechargeType === "special" ? <><Zap className="h-3 w-3" />特批</> : <><Wallet className="h-3 w-3" />常规</>}
                    </Badge>
                  </div>
                  <div><span className="text-muted-foreground">账户名称</span><p className="font-medium text-foreground">{task.account}</p></div>
                  <div><span className="text-muted-foreground">当前节点</span><p className="text-foreground">{task.nodeLabel}</p></div>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">取消原因 <span className="text-destructive">*</span></Label>
                <Select value={cancelReason} onValueChange={handleReasonChange}>
                  <SelectTrigger className="h-10 w-full"><SelectValue placeholder="请选择取消原因" /></SelectTrigger>
                  <SelectContent>{cancelReasons.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
                </Select>
              </div>

              {cancelReason === "其他" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">其他原因说明 <span className="text-destructive">*</span></Label>
                  <Textarea placeholder="请填写取消订单的具体原因" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} className={`min-h-[60px] resize-none ${otherReasonEmpty ? "border-destructive" : ""}`} />
                  {otherReasonEmpty && <p className="text-[11px] text-destructive">请填写取消订单的具体原因</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">备注说明</Label>
                <Textarea placeholder="其他补充说明（选填）" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="min-h-[60px] resize-none" />
              </div>

              <div className="flex items-center gap-2.5">
                <Checkbox id="confirm-cancel" checked={confirmed} onCheckedChange={(c) => setConfirmed(c === true)} />
                <Label htmlFor="confirm-cancel" className="text-xs text-muted-foreground cursor-pointer">我已确认取消该充值订单</Label>
              </div>
            </div>

            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" size="lg" onClick={handleClose}>返回</Button>
              <Button variant="destructive" size="lg" disabled={!isFormValid} onClick={() => setStep("success")}>确认取消</Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center px-8 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"><CheckCircle2 className="h-8 w-8 text-gray-500" /></div>
            <h2 className="mt-4 text-lg font-bold text-foreground">订单已取消</h2>
            <p className="mt-1 text-sm text-muted-foreground">该充值订单已取消，订单记录已保留。</p>
            <Button className="mt-6" onClick={handleClose}>返回看板</Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
