"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CancelCompletedTaskInfo {
  id: string;
}

interface CancelCompletedOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: CancelCompletedTaskInfo | null;
}

// ── Component ──────────────────────────────────────────────────────────────
// 已完成订单的取消确认弹窗：仅"关闭"和"退款申请"两个选项，点选后即关闭弹窗。

export function CancelCompletedOrderModal({ open, onOpenChange, task }: CancelCompletedOrderModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => onOpenChange(false);

  const handleRefund = () => {
    toast.success("退款申请已提交，米播将原路退回款项");
    onOpenChange(false);
  };

  if (!mounted || !open || !task) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">取消订单</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            是否取消订单并申请退款？
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{task.id}</p>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={handleClose}>
            关闭
          </Button>
          <Button size="lg" className="flex-1" onClick={handleRefund}>
            退款申请
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
