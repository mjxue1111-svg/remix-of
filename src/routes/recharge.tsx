import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet, TrendingUp, CheckCircle2, Clock, Eye, Zap, ListTodo,
  FileText, Upload, XCircle, RefreshCw, ShieldAlert, ChevronRight,
  Search, RotateCcw, ChevronLeft, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RechargeModal } from "@/components/RechargeModal";
import { TaskDetailDrawer, type DetailTaskInfo } from "@/components/TaskDetailDrawer";
import { UploadPaymentModal, type PaymentTaskInfo, type UploadMode } from "@/components/UploadPaymentModal";
import { CancelOrderModal, type CancelTaskInfo } from "@/components/CancelOrderModal";

export const Route = createFileRoute("/recharge")({ component: RechargePage });

// ── Data ───────────────────────────────────────────────────────────────────

const regularStepLabels = ["提交申请", "审核通过", "财务确认", "平台转账", "充值完成"];
const specialStepLabels = ["提交特批申请", "米播评估", "特批通过", "充值完成"];

const nodeStatusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  draft: { label: "草稿", className: "border-gray-200 bg-gray-50 text-gray-500", icon: <FileText className="h-3 w-3" /> },
  pending_audit: { label: "待审核", className: "border-blue-200 bg-blue-50 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  audit_rejected: { label: "审核驳回", className: "border-red-200 bg-red-50 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  finance_confirm: { label: "财务确认", className: "border-sky-200 bg-sky-50 text-sky-700", icon: <Upload className="h-3 w-3" /> },
  transferring: { label: "平台转账", className: "border-primary/30 bg-primary/10 text-primary", icon: <RefreshCw className="h-3 w-3" /> },
  completed: { label: "充值完成", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  transfer_error: { label: "转账异常", className: "border-red-200 bg-red-50 text-red-700", icon: <ShieldAlert className="h-3 w-3" /> },
  sp_submitted: { label: "提交特批申请", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Clock className="h-3 w-3" /> },
  sp_evaluating: { label: "米播评估", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <Zap className="h-3 w-3" /> },
  sp_approved: { label: "特批通过", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  sp_completed: { label: "充值完成", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const accountTypeClass: Record<string, string> = {
  "主账户": "border-blue-200 bg-blue-50 text-blue-700",
  "投放账户": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "运营账户": "border-purple-200 bg-purple-50 text-purple-700",
  "品牌账户": "border-amber-200 bg-amber-50 text-amber-700",
};

interface Task {
  id: string; account: string; accountId: string; subject: string;
  amount: string; payableAmount: string; discount: string;
  node: string; rechargeType: "regular" | "special"; isDraft?: boolean;
  accountType?: string; step: number; totalSteps: number;
  time: string; purpose: string; orderCompleted: boolean;
  paymentReceipt?: string; financeConfirmed?: boolean; paymentStatus?: string;
}

const allTasks: Task[] = [
  { id: "RC-2026-07006", account: "云岚品牌中心", accountId: "ST-10086101", subject: "上海云岚科技有限公司", accountType: "主账户", isDraft: true, amount: "¥100,000.00", payableAmount: "¥98,000.00", discount: "98 折", node: "draft", rechargeType: "regular", step: 0, totalSteps: 5, time: "2026-07-10 15:20", purpose: "达人采买", orderCompleted: false },
  { id: "RC-2026-07001", account: "云岚品牌中心", accountId: "ST-10086101", subject: "上海云岚科技有限公司", accountType: "主账户", amount: "¥50,000.00", payableAmount: "¥49,000.00", discount: "98 折", node: "transferring", rechargeType: "regular", step: 4, totalSteps: 5, time: "2026-07-10 14:32", purpose: "达人采买", paymentReceipt: "回单_20260710.pdf", financeConfirmed: true, orderCompleted: false },
  { id: "RC-2026-07002", account: "云岚效果投放", accountId: "ST-10086102", subject: "上海云岚科技有限公司", accountType: "投放账户", amount: "¥120,000.00", payableAmount: "¥117,600.00", discount: "98 折", node: "pending_audit", rechargeType: "regular", step: 1, totalSteps: 5, time: "2026-07-10 11:15", purpose: "广告投放", orderCompleted: false },
  { id: "RC-2026-07003", account: "云岚内容增长", accountId: "ST-10086103", subject: "上海云岚科技有限公司", accountType: "运营账户", amount: "¥30,000.00", payableAmount: "¥29,400.00", discount: "98 折", node: "completed", rechargeType: "regular", step: 5, totalSteps: 5, time: "2026-07-09 16:48", purpose: "助推投流", paymentReceipt: "回单_20260709.pdf", financeConfirmed: true, orderCompleted: true },
  { id: "RC-2026-07004", account: "云岚新品推广", accountId: "ST-10086104", subject: "上海云岚科技有限公司", accountType: "品牌账户", amount: "¥80,000.00", payableAmount: "¥78,400.00", discount: "98 折", node: "sp_approved", rechargeType: "special", step: 3, totalSteps: 4, time: "2026-07-10 10:20", purpose: "达人采买", paymentReceipt: "特批付款回单_20260710.pdf", financeConfirmed: false, orderCompleted: false },
  { id: "RC-2026-07005", account: "云岚达人合作", accountId: "ST-10086105", subject: "上海云岚科技有限公司", accountType: "投放账户", amount: "¥40,000.00", payableAmount: "¥39,200.00", discount: "98 折", node: "sp_completed", rechargeType: "special", step: 4, totalSteps: 4, time: "2026-07-08 18:30", purpose: "广告投放", orderCompleted: false },
  { id: "RC-2026-07006", account: "云岚达人合作", accountId: "ST-10086105", subject: "上海云岚科技有限公司", accountType: "投放账户", amount: "¥60,000.00", payableAmount: "¥58,800.00", discount: "98 折", node: "sp_completed", rechargeType: "special", step: 4, totalSteps: 4, time: "2026-07-11 09:30", purpose: "广告投放", paymentReceipt: "特批回单_20260711.pdf", orderCompleted: true },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function isInAudit(task: Task): boolean {
  if (task.rechargeType === "special") return task.step >= 2;
  return task.step >= 3;
}

type PaymentInfo = { statusLabel: string; statusClass: string; receiptFile?: string; actionLabel?: string; actionMode?: UploadMode; isError?: boolean };

function getPaymentInfo(task: Task): PaymentInfo {
  if (task.paymentStatus === "error") return { statusLabel: "凭证异常", statusClass: "border-red-200 bg-red-50 text-red-700", actionLabel: "重新上传", actionMode: "reupload_error", isError: true };
  if (task.financeConfirmed) return { statusLabel: "已确认到账", statusClass: "border-emerald-200 bg-emerald-50 text-emerald-700", receiptFile: task.paymentReceipt, actionLabel: "申请重新上传", actionMode: "reupload_post" };
  if (!!task.paymentReceipt && isInAudit(task)) return { statusLabel: "已进入审核", statusClass: "border-blue-200 bg-blue-50 text-blue-700", receiptFile: task.paymentReceipt, actionLabel: "申请重新上传", actionMode: "reupload_post" };
  if (!!task.paymentReceipt) return { statusLabel: "已上传待确认", statusClass: "border-blue-200 bg-blue-50 text-blue-700", receiptFile: task.paymentReceipt, actionLabel: "重新上传", actionMode: "reupload_pre" };
  if (task.rechargeType === "special" && task.step >= task.totalSteps) return { statusLabel: "待上传凭证", statusClass: "border-amber-200 bg-amber-50 text-amber-700", actionLabel: "补传凭证", actionMode: "supplement" };
  return { statusLabel: "待上传凭证", statusClass: "border-amber-200 bg-amber-50 text-amber-700", actionLabel: "上传凭证", actionMode: "upload" };
}

function getOrderCompleted(task: Task): boolean {
  if (task.rechargeType === "special") return task.step >= task.totalSteps && !!task.paymentReceipt;
  return task.step >= task.totalSteps;
}

function canCancelOrder(task: Task): boolean {
  if (task.isDraft) return true;
  if (task.financeConfirmed) return false;
  if (task.step >= 4 && task.rechargeType === "regular") return false;
  if (task.step >= 3 && task.rechargeType === "special") return false;
  if (isInAudit(task)) return false;
  return true;
}

// ── Component ──────────────────────────────────────────────────────────────

function RechargePage() {
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTask, setUploadTask] = useState<Task | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("upload");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTask, setCancelTask] = useState<Task | null>(null);

  // Filter state
  const [filterId, setFilterId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterNode, setFilterNode] = useState("");
  const [filterPayStatus, setFilterPayStatus] = useState("");
  const [filterOrder, setFilterOrder] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");

  const filteredTasks = allTasks.filter(t => {
    if (filterId && !t.id.includes(filterId)) return false;
    if (filterType && t.rechargeType !== filterType) return false;
    if (filterNode && t.node !== filterNode) return false;
    if (filterPayStatus) {
      const pi = getPaymentInfo(t);
      if (pi.statusLabel !== filterPayStatus) return false;
    }
    if (filterOrder === "completed" && !getOrderCompleted(t)) return false;
    if (filterOrder === "uncompleted" && getOrderCompleted(t)) return false;
    if (filterOrder === "cancelled") return false;
    if (filterPurpose && t.purpose !== filterPurpose) return false;
    return true;
  });

  const buildDetailTaskInfo = (t: Task | null): DetailTaskInfo | null => {
    if (!t) return null;
    const node = nodeStatusMap[t.node];
    return { id: t.id, account: t.account, accountId: t.accountId, amount: t.amount, payableAmount: t.payableAmount, discount: t.discount, node: t.node, nodeLabel: node?.label ?? "", nodeClassName: node?.className ?? "", handler: "", statusDescription: "", time: t.time };
  };

  const buildPaymentTaskInfo = (t: Task | null): PaymentTaskInfo | null => {
    if (!t) return null;
    return { id: t.id, rechargeType: t.rechargeType, account: t.account, payableAmount: t.payableAmount, subject: t.subject };
  };

  const buildCancelTaskInfo = (t: Task | null): CancelTaskInfo | null => {
    if (!t) return null;
    const node = nodeStatusMap[t.node];
    return { id: t.id, rechargeType: t.rechargeType, account: t.account, amount: t.amount, payableAmount: t.payableAmount, nodeLabel: node?.label ?? "" };
  };

  const handleUploadPayment = useCallback((task: Task, mode: UploadMode) => { setUploadTask(task); setUploadMode(mode); setUploadOpen(true); }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">充值任务</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看全部充值任务、处理进度及付款状态</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setRechargeModalOpen(true)} className="gap-2"><Wallet className="h-4 w-4" />发起充值</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "进行中任务", value: "5 笔", icon: ListTodo, accent: "bg-blue-50 text-blue-600" },
          { label: "待处理任务", value: "2 笔", icon: Zap, accent: "bg-amber-50 text-amber-600" },
          { label: "本月充值总额", value: "¥380,000.00", icon: TrendingUp, accent: "bg-emerald-50 text-emerald-600" },
          { label: "异常任务", value: "0 笔", icon: CheckCircle2, accent: "bg-gray-50 text-gray-400" },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-border/60 bg-sapphire-subtle p-3">
            <div className="flex items-center gap-2"><div className={`flex h-6 w-6 items-center justify-center rounded-md ${item.accent}`}><item.icon className="h-3 w-3" /></div><span className="text-xs text-muted-foreground">{item.label}</span></div>
            <p className="mt-1.5 text-lg font-bold tracking-tight text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="充值单号" value={filterId} onChange={e => setFilterId(e.target.value)} className="h-9 w-36 text-xs" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="充值类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="regular">常规充值</SelectItem>
            <SelectItem value="special">特批充值</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterNode} onValueChange={setFilterNode}>
          <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="当前节点" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            {Object.entries(nodeStatusMap).filter(([k]) => k !== "draft" && k !== "sp_rejected").map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filterPayStatus} onValueChange={setFilterPayStatus}>
          <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="付款状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="待上传凭证">待上传凭证</SelectItem>
            <SelectItem value="已上传待确认">已上传待确认</SelectItem>
            <SelectItem value="已进入审核">已进入审核</SelectItem>
            <SelectItem value="已确认到账">已确认到账</SelectItem>
            <SelectItem value="凭证异常">凭证异常</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterOrder} onValueChange={setFilterOrder}>
          <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="订单状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="uncompleted">未完成</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPurpose} onValueChange={setFilterPurpose}>
          <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="充值用途" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="达人采买">达人采买</SelectItem>
            <SelectItem value="广告投放">广告投放</SelectItem>
            <SelectItem value="助推投流">助推投流</SelectItem>
            <SelectItem value="其他">其他</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-9 gap-1"><Search className="h-3.5 w-3.5" />查询</Button>
        <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs" onClick={() => { setFilterId(""); setFilterType(""); setFilterNode(""); setFilterPayStatus(""); setFilterOrder(""); setFilterPurpose(""); }}>
          <RotateCcw className="h-3.5 w-3.5" />重置
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap text-xs font-semibold">充值单信息</TableHead>
                <TableHead className="whitespace-nowrap text-xs font-semibold min-w-[180px]">账户信息</TableHead>
                <TableHead className="whitespace-nowrap text-xs font-semibold min-w-[150px]">金额信息</TableHead>
                <TableHead className="whitespace-nowrap text-xs font-semibold min-w-[180px]">当前节点</TableHead>
                <TableHead className="whitespace-nowrap text-xs font-semibold min-w-[150px]">付款信息</TableHead>
                <TableHead className="whitespace-nowrap text-xs font-semibold">用途</TableHead>
                <TableHead className="whitespace-nowrap text-xs font-semibold">订单状态</TableHead>
                <TableHead className="whitespace-nowrap text-xs font-semibold">提交时间</TableHead>
                <TableHead className="whitespace-nowrap text-xs font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => {
                const node = nodeStatusMap[task.node];
                const isSpecial = task.rechargeType === "special";
                const isCompleted = task.step >= task.totalSteps && (task.node === "completed" || task.node === "sp_completed");
                const isError = task.node === "transfer_error" || task.node === "audit_rejected";
                const stepLabels = isSpecial ? specialStepLabels : regularStepLabels;
                const payInfo = getPaymentInfo(task);
                const orderDone = getOrderCompleted(task);

                return (
                  <TableRow key={task.id}>
                    <TableCell className="py-3">
                      <div className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5">
                        <span className="font-mono text-xs font-semibold">{task.id}</span>
                        <div className="mt-1">{isSpecial ? <Badge className="gap-1 border-amber-200 bg-amber-50 text-[10px] text-amber-700"><Zap className="h-2.5 w-2.5" />特批</Badge> : <Badge className="gap-1 border-blue-200 bg-blue-50 text-[10px] text-blue-700"><Wallet className="h-2.5 w-2.5" />常规</Badge>}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1"><Badge className="h-3.5 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[9px] text-blue-700">星图</Badge><span className="text-xs font-semibold">{task.account}</span>{task.accountType && <Badge className={`h-3.5 px-1 text-[9px] ${accountTypeClass[task.accountType] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>{task.accountType}</Badge>}</div>
                        <p className="text-[10px] text-muted-foreground">ID：{task.accountId}</p>
                        <p className="text-[10px] text-muted-foreground">主体：{task.subject}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="rounded-md border border-border/60 bg-muted/20 px-2 py-1.5">
                        <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">充值</span><span className="font-semibold">{task.amount}</span></div>
                        <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">折扣</span><Badge className="h-3.5 border-emerald-200 bg-emerald-50 px-1 text-[9px] text-emerald-700">{task.discount}</Badge></div>
                        <div className="flex justify-between text-[10px] border-t border-border/40 pt-0.5 mt-0.5"><span className="text-muted-foreground">实付</span><span className="font-bold text-primary">{task.payableAmount}</span></div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="space-y-1.5">
                        <Badge variant="outline" className={`gap-1 text-[10px] ${node.className}`}>{node.icon}{node.label}</Badge>
                        <div className="flex items-center gap-0.5">
                          {stepLabels.map((sl, i) => {
                            const sn = i + 1;
                            let c = "bg-muted";
                            if (task.isDraft) c = "bg-muted";
                            else if (sn < task.step) c = "bg-emerald-400";
                            else if (sn === task.step) c = isError ? "bg-red-500" : isSpecial ? "bg-amber-500" : "bg-primary";
                            if (!task.isDraft && isCompleted && sn >= task.step) c = "bg-emerald-500";
                            return <div key={sl} className="group relative flex-1" title={sl}><div className={`h-1 w-full rounded-full ${c}`} /></div>;
                          })}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{task.isDraft ? "草稿｜尚未提交" : `第${task.step}/${task.totalSteps}步｜${isCompleted ? "完成" : node.label + "中"}`}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="rounded-md border border-border/60 bg-white px-2 py-1.5 space-y-1">
                        <Badge variant="outline" className={`text-[10px] ${payInfo.statusClass}`}>{payInfo.statusLabel}</Badge>
                        {payInfo.receiptFile && <button className="flex items-center gap-1 text-[10px] text-primary hover:underline"><FileText className="h-3 w-3" />{payInfo.receiptFile}</button>}
                        {payInfo.receiptFile && payInfo.actionMode && (payInfo.actionMode === "reupload_pre" || payInfo.actionMode === "reupload_post") && (
                          <button className="text-[9px] text-muted-foreground hover:text-primary hover:underline" onClick={() => handleUploadPayment(task, payInfo.actionMode!)}>上传内容有误？{payInfo.actionMode === "reupload_post" ? "申请重新上传" : "重新上传"}</button>
                        )}
                        {payInfo.actionLabel && !payInfo.receiptFile && <Button variant="outline" size="sm" className="h-6 text-[10px] w-full" onClick={() => handleUploadPayment(task, payInfo.actionMode!)}><Upload className="h-2.5 w-2.5" />{payInfo.actionLabel}</Button>}
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">{task.purpose}</TableCell>
                    <TableCell>{orderDone ? <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"><CheckCircle2 className="h-2.5 w-2.5" />已完成</Badge> : <Badge className="gap-1 border-amber-200 bg-amber-50 text-[10px] text-amber-700"><Clock className="h-2.5 w-2.5" />未完成</Badge>}</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">{task.time}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {(task.isDraft || payInfo.actionMode === "upload" || payInfo.actionMode === "supplement" || payInfo.actionMode === "reupload_error") ? (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] border-primary/30 bg-sapphire-subtle text-primary w-full" onClick={() => { if (task.isDraft) setRechargeModalOpen(true); else handleUploadPayment(task, payInfo.actionMode!); }}><Upload className="h-2.5 w-2.5" />继续提交</Button>
                        ) : <Button size="sm" variant="ghost" disabled className="h-6 text-[10px] w-full">继续提交</Button>}
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground w-full" onClick={() => { setDetailTask(task); setDetailDrawerOpen(true); }}><Eye className="h-2.5 w-2.5" />查看详情</Button>
                        <Popover>
                          <PopoverTrigger asChild><Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground w-full tracking-widest">…</Button></PopoverTrigger>
                          <PopoverContent align="end" className="w-36 p-1.5">
                            {canCancelOrder(task) ? (
                              <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[10px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => { setCancelTask(task); setCancelOpen(true); }}><XCircle className="h-3 w-3" />取消订单</button>
                            ) : <button disabled className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[10px] text-muted-foreground/40"><XCircle className="h-3 w-3" />取消订单</button>}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">共 {filteredTasks.length} 条记录</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" disabled><ChevronLeft className="h-3.5 w-3.5" />上一页</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 text-xs font-semibold bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" disabled>下一页<ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {/* Modals & Drawers */}
      <RechargeModal open={rechargeModalOpen} onOpenChange={setRechargeModalOpen} />
      <TaskDetailDrawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} task={buildDetailTaskInfo(detailTask)} />
      <UploadPaymentModal open={uploadOpen} onOpenChange={setUploadOpen} task={buildPaymentTaskInfo(uploadTask)} mode={uploadMode} />
      <CancelOrderModal open={cancelOpen} onOpenChange={setCancelOpen} task={buildCancelTaskInfo(cancelTask)} />
    </div>
  );
}
