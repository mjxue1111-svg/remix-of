"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

export interface RefundTaskInfo {
  id: string;
}

interface RefundRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: RefundTaskInfo | null;
}

// ── Component ──────────────────────────────────────────────────────────────
// 强提示弹窗：仅支持点击"确认"关闭，不提供关闭按钮或点击遮罩层关闭。

export function RefundRequestModal({ open, onOpenChange, task }: RefundRequestModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConfirm = () => {
    toast.success("退款申请已提交，米播将原路退回款项");
    onOpenChange(false);
  };

  if (!mounted || !open || !task) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">退款申请</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            由于充值任务失败，您的付款将被原路退回。
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{task.id}</p>
        </div>
        <Button size="lg" className="mt-6 w-full" onClick={handleConfirm}>
          确认
        </Button>
      </div>
    </div>,
    document.body,
  );
}
