"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  Loader,
  Eye,
  Building2,
  Wallet,
  User,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TaskInfo {
  id: string;
  account: string;
  amount: string;
  node: string;
  nodeLabel: string;
  nodeClassName: string;
  handler: string;
  step: number;
}

interface TimelineStep {
  label: string;
  status: "completed" | "current" | "pending";
  time?: string;
  handler?: string;
  description: string;
}

interface TaskProgressDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskInfo | null;
  onViewDetail?: () => void;
}

// ── Timeline data ──────────────────────────────────────────────────────────

function buildTimeline(task: TaskInfo | null): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      label: "提交申请",
      status: "completed",
      time: "2026-07-10 14:32",
      handler: "客户 李明",
      description: "客户提交充值申请",
    },
    {
      label: "审核通过",
      status: "completed",
      time: "2026-07-10 14:40",
      handler: "米播平台媒介",
      description: "米播平台媒介审核通过",
    },
    {
      label: "打款上传回单",
      status: "completed",
      time: "2026-07-10 15:05",
      handler: "客户 李明",
      description: "客户已上传付款回单",
    },
    {
      label: "财务确认到账",
      status: "completed",
      time: "2026-07-10 15:20",
      handler: "米播财务",
      description: "米播财务确认到账",
    },
    {
      label: "平台转账",
      status: "current",
      handler: "米播平台媒介",
      description: "当前处理方为米播平台媒介，正在进行平台转账处理",
    },
    {
      label: "充值完成",
      status: "pending",
      description: "待平台转账完成后自动更新",
    },
  ];

  if (!task) return steps;

  // Adjust based on actual task step
  return steps.map((s, i) => {
    const stepNum = i + 1;
    if (stepNum < task.step) return { ...s, status: "completed" as const };
    if (stepNum === task.step) return { ...s, status: "current" as const };
    return { ...s, status: "pending" as const, time: undefined, handler: undefined };
  });
}

// ── Component ──────────────────────────────────────────────────────────────

export function TaskProgressDrawer({ open, onOpenChange, task, onViewDetail }: TaskProgressDrawerProps) {
  if (!task) return null;

  const timeline = buildTimeline(task);
  const nodeStatus = timeline.find((s) => s.status === "current");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[520px]"
      >
        {/* ── Header ─────────────────────────────────── */}
        <SheetHeader className="space-y-3 border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Loader className="h-3.5 w-3.5 text-white" />
            </div>
            <SheetTitle>充值进度</SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            查看充值任务的详细进度时间线
          </SheetDescription>

          {/* Task summary card */}
          <div className="rounded-xl border border-border/60 bg-sapphire-subtle p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">充值单号</span>
                <p className="font-mono font-semibold text-foreground">{task.id}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">星图账户</span>
                <p className="font-medium text-foreground">{task.account}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">充值金额</span>
                <p className="font-bold text-foreground">{task.amount}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">当前状态</span>
                <Badge variant="outline" className={`mt-0.5 gap-1 text-xs ${task.nodeClassName}`}>
                  {task.nodeLabel}
                </Badge>
              </div>
            </div>
            {nodeStatus?.handler && (
              <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>当前处理方：</span>
                <span className="font-medium text-foreground">{nodeStatus.handler}</span>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* ── Timeline ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            充值流程进度
          </p>

          <div className="relative space-y-0">
            {timeline.map((step, index) => {
              const isLast = index === timeline.length - 1;
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";
              const isPending = step.status === "pending";

              return (
                <div key={step.label} className="relative flex gap-4 pb-6">
                  {/* Vertical line */}
                  {!isLast && (
                    <div
                      className={`absolute left-[15px] top-8 h-[calc(100%-20px)] w-px ${
                        isCompleted ? "bg-emerald-300" : "bg-border"
                      }`}
                    />
                  )}

                  {/* Node icon */}
                  <div className="relative z-10 shrink-0">
                    {isCompleted && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-4 ring-primary/20">
                        <Loader className="h-4 w-4 animate-spin text-white" />
                      </div>
                    )}
                    {isPending && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`min-w-0 flex-1 pt-0.5 ${isPending ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-semibold ${
                          isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <Badge className="h-5 gap-1 border-primary/30 bg-primary/10 text-[10px] text-primary">
                          当前节点
                        </Badge>
                      )}
                    </div>

                    {step.time && (
                      <p className="mt-1 text-xs text-muted-foreground">{step.time}</p>
                    )}

                    {step.handler && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{step.handler}</span>
                      </div>
                    )}

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
            <Button className="flex-1 gap-2" onClick={onViewDetail}>
              <Eye className="h-4 w-4" />
              查看详情
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
