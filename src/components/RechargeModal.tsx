"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Building2,
  Wallet,
  Clock,
  Info,
  AlertTriangle,
  TrendingDown,
  ChevronRight,
  FileText,
  Upload,
  Copy,
  Zap,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ──────────────────────────────────────────────────────────────────

interface Account {
  name: string;
  accountType: string;
  accountId: string;
  subject: string;
  balance: string;
  status: string;
  updatedAt: string;
}

interface RechargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const accountTypeClass: Record<string, string> = {
  "主账户": "border-blue-200 bg-blue-50 text-blue-700",
  "投放账户": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "运营账户": "border-purple-200 bg-purple-50 text-purple-700",
  "品牌账户": "border-amber-200 bg-amber-50 text-amber-700",
};

// ── Data ───────────────────────────────────────────────────────────────────

const accounts: Account[] = [
  { name: "云岚品牌中心", accountType: "主账户", accountId: "ST-10086101", subject: "上海云岚科技有限公司", balance: "¥286,500.00", status: "正常", updatedAt: "2026-07-10 14:32" },
  { name: "云岚效果投放", accountType: "投放账户", accountId: "ST-10086102", subject: "上海云岚科技有限公司", balance: "¥142,300.00", status: "正常", updatedAt: "2026-07-10 14:15" },
  { name: "云岚内容增长", accountType: "运营账户", accountId: "ST-10086103", subject: "上海云岚科技有限公司", balance: "¥58,200.00", status: "正常", updatedAt: "2026-07-10 13:58" },
];

const purposes = ["达人采买", "广告投放", "助推投流", "其他"];
const businessContacts = ["李商务", "王商务", "张商务", "陈商务"];

const DISCOUNT_RATE = 0.98;
const DISCOUNT_LABEL = "98 折";

const bankInfo = {
  companyName: "北京米播科技有限公司",
  bankName: "招商银行股份有限公司北京自贸试验区生命科学园支行",
  accountNumber: "110962262110001",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function generateRechargeId(): string {
  const y = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 90000) + 10000);
  return `RC-${y}-${seq}`;
}

function formatAmount(value: number): string {
  return value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Account Info Card ──────────────────────────────────────────────────────

function AccountInfoCard({ account }: { account: Account }) {
  return (
    <div className="mt-3 rounded-xl border border-sapphire-light bg-sapphire-subtle p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Badge className="h-4 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700">星图</Badge>
            <p className="text-sm font-semibold text-foreground">{account.name}</p>
            <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[account.accountType] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>{account.accountType}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{account.accountId}</p>
        </div>
        <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />可充值
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border/60 pt-3 text-xs">
        <div><span className="text-muted-foreground">账户类型</span><Badge className={`ml-1 h-4 px-1 text-[10px] ${accountTypeClass[account.accountType] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>{account.accountType}</Badge></div>
        <div><span className="text-muted-foreground">账户主体</span><p className="font-medium text-foreground">{account.subject}</p></div>
        <div><span className="text-muted-foreground">当前余额</span><p className="font-semibold text-foreground">{account.balance}</p></div>
        <div><span className="text-muted-foreground">账户状态</span><p className="font-medium text-emerald-600">正常</p></div>
        <div><span className="text-muted-foreground">最近更新</span><p className="font-medium text-foreground">{account.updatedAt}</p></div>
      </div>
    </div>
  );
}

// ── Payment Info Card ──────────────────────────────────────────────────────

function PaymentInfoCard({ amount, payableAmount, discountAmount, rechargeId, customerName, isSpecial }: {
  amount: string; payableAmount: string; discountAmount: string; rechargeId?: string; customerName?: string; isSpecial?: boolean;
}) {
  const [copiedAll, setCopiedAll] = useState(false);
  const remark = rechargeId ? `${rechargeId} / ${customerName ?? ""}` : "";

  const fullPaymentText = [
    `应付金额：¥${payableAmount}`,
    `收款公司名称：${bankInfo.companyName}`,
    `开户行：${bankInfo.bankName}`,
    `银行账号：${bankInfo.accountNumber}`,
    `打款备注：${remark || "充值单号 / 客户名称"}`,
  ].join("\n");

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullPaymentText).then(
      () => { setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000); },
      () => toast.error("复制失败，请手动复制"),
    );
  };

  return (
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

      {/* Payable amount — prominent */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground">应付金额</p>
        <span className="text-3xl font-bold tracking-tight text-primary">¥{payableAmount}</span>
      </div>

      {/* Bank info rows */}
      <div className="space-y-2.5">
        <BankRow label="收款公司名称" value={bankInfo.companyName} />
        <BankRow label="开户行" value={bankInfo.bankName} />
        <BankRow label="银行账号" value={bankInfo.accountNumber} />
        <BankRow label="打款备注" value={remark || "充值单号 / 客户名称"} />
      </div>

      {/* Calculation breakdown */}
      <div className="mt-4 space-y-1.5 rounded-lg bg-white/60 px-3 py-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">充值金额</span>
          <span className="font-medium text-foreground">¥{amount || "0.00"}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">折扣</span>
          <Badge className="h-4 gap-0.5 border-emerald-200 bg-emerald-50 px-1 text-[10px] text-emerald-700">{DISCOUNT_LABEL}</Badge>
        </div>
        <div className="border-t border-border/40 pt-1.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">优惠金额</span>
          <span className="text-sm font-semibold text-amber-600">-¥{discountAmount}</span>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50/80 px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-sapphire">
            {isSpecial ? "请按应付金额完成对公转账，并在约定时间内上传付款凭证。" : "请使用应付金额完成对公转账，付款完成后上传付款凭证。"}
          </p>
      </div>
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/70 px-3 py-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <p className="text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}

// ── Customer-facing Special Approval Flow ──────────────────────────────────

const approvalSteps = [
  { label: "提交特批申请" },
  { label: "米播评估" },
  { label: "特批通过" },
  { label: "充值完成" },
];

// ── Form Step ──────────────────────────────────────────────────────────────

function FormStep({ onSuccess, onClose, onSaveDraft }: { onSuccess: (rechargeId: string, isSpecial: boolean) => void; onClose: () => void; onSaveDraft: (rechargeId: string, isSpecial: boolean, accountName: string, accountId: string) => void }) {
  // Section 0 — Mode
  const [rechargeMode, setRechargeMode] = useState<"normal" | "special">("normal");

  // Section 2 — Account
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // Section 3 — Amount
  const [amount, setAmount] = useState("");

  // Section 5 — Upload receipt (normal only)
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payAccountName, setPayAccountName] = useState("");

  // Section 6 — Special approval (special only)
  const [specialReason, setSpecialReason] = useState("");
  const [expectedRepayTime, setExpectedRepayTime] = useState("");
  const [businessContact, setBusinessContact] = useState("");
  const [approvalFile, setApprovalFile] = useState<File | null>(null);

  // Section 7 — Recharge info
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");

  // Footer
  const [confirmed, setConfirmed] = useState(false);

  const selectedAccount = accounts.find((a) => a.accountId === selectedAccountId);
  const isAccountAbnormal = selectedAccount ? selectedAccount.status !== "正常" : false;
  const customerSubject = "上海云岚科技有限公司";

  const amountNum = parseFloat(amount) || 0;
  const payableAmount = amountNum * DISCOUNT_RATE;
  const discountAmount = amountNum * (1 - DISCOUNT_RATE);

  const payAccountMismatch = payAccountName.trim() !== "" && payAccountName.trim() !== customerSubject;

  const isNormal = rechargeMode === "normal";
  const isSpecial = rechargeMode === "special";

  // Sync pay amount & account name
  useEffect(() => {
    if (amountNum > 0) setPayAmount(formatAmount(payableAmount));
    if (selectedAccount) setPayAccountName(selectedAccount.subject);
  }, [payableAmount, amountNum, selectedAccount]);

  // Validation
  const isFormValid = (() => {
    if (selectedAccountId === "" || amountNum <= 0 || purpose === "" || !confirmed || isAccountAbnormal) return false;
    if (isNormal) {
      return receiptFile !== null && payAmount.trim() !== "" && payAccountName.trim() !== "";
    }
    if (isSpecial) {
      return specialReason.trim() !== "" && expectedRepayTime.trim() !== "" && businessContact.trim() !== "";
    }
    return false;
  })();

  const handleSubmit = () => {
    if (!isFormValid) return;
    onSuccess(generateRechargeId(), isSpecial);
  };

  const canSaveDraft = selectedAccountId !== "" && amountNum > 0 && !isAccountAbnormal;

  const handleSaveDraft = () => {
    if (!canSaveDraft) return;
    const id = generateRechargeId();
    onSaveDraft(id, isSpecial, selectedAccount?.name ?? "", selectedAccount?.accountId ?? "");
  };

  const handleFileChange = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setter(file);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">发起充值申请</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">请选择充值处理方式，并填写本次充值信息。</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6"><div className="space-y-6">

        {/* ═══ Section 0: Recharge Mode ═══ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">1</div>
            <h3 className="text-sm font-bold text-foreground">充值处理方式</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 pl-8 sm:grid-cols-2">
            <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              isNormal ? "border-primary bg-sapphire-subtle" : "border-border hover:border-primary/30"
            }`}>
              <input type="radio" name="rechargeMode" value="normal" checked={isNormal} onChange={() => { setRechargeMode("normal"); setConfirmed(false); }} className="sr-only" />
              <div className="flex items-center gap-2 mb-1.5">
                <Wallet className={`h-5 w-5 ${isNormal ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-bold ${isNormal ? "text-primary" : "text-foreground"}`}>常规充值</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">完成付款并上传有效付款凭证，审核通过后执行充值入账。</p>
            </label>

            <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              isSpecial ? "border-amber-300 bg-amber-50/50" : "border-border hover:border-amber-200"
            }`}>
              <input type="radio" name="rechargeMode" value="special" checked={isSpecial} onChange={() => { setRechargeMode("special"); setConfirmed(false); }} className="sr-only" />
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className={`h-5 w-5 ${isSpecial ? "text-amber-600" : "text-muted-foreground"}`} />
                <span className={`text-sm font-bold ${isSpecial ? "text-amber-700" : "text-foreground"}`}>特批充值</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">紧急场景可先行申请充值、后续补款，申请前需结清往期特批欠款。</p>
            </label>
          </div>

          <div className="flex items-center gap-1.5 pl-8">
            <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">到账时效：17:00 前提交，预计 2–3 小时到账；17:00 后提交，到账时间可能适当顺延。</p>
          </div>
        </section>

        {/* ═══ Section 2: Account ═══ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">2</div>
            <h3 className="text-sm font-bold text-foreground">选择充值账户</h3>
          </div>
          <div className="space-y-3 pl-8">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">星图账户 <span className="text-destructive">*</span></Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="请选择星图账户" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.accountId} value={a.accountId}>
                      <div className="flex items-center gap-2 py-0.5">
                        <span className="font-medium text-foreground">{a.name}</span>
                        <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[a.accountType] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>{a.accountType}</Badge>
                        <span className="text-xs text-muted-foreground">{a.accountId}</span>
                        <span className="ml-auto text-xs text-muted-foreground">余额 {a.balance}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedAccount && !isAccountAbnormal && <AccountInfoCard account={selectedAccount} />}
            {isAccountAbnormal && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">当前账户不可充值</p>
                  <p className="text-xs text-muted-foreground">该账户状态异常，请选择其他可用账户或联系客服处理。</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══ Section 3: Amount ═══ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">3</div>
            <h3 className="text-sm font-bold text-foreground">填写充值金额</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 pl-8 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">充值金额 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">¥</span>
                <Input type="number" min="0" step="0.01" placeholder="请输入希望充入星图账户的金额" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 pl-7" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">折扣</Label>
              <div className="flex h-11 items-center rounded-md border border-input bg-muted/50 px-3">
                <TrendingDown className="mr-2 h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-foreground">{DISCOUNT_LABEL}</span>
                {amountNum > 0 && <span className="ml-auto text-xs text-muted-foreground">优惠 ¥{formatAmount(discountAmount)}</span>}
              </div>
            </div>
          </div>

          {/* Payable amount highlight */}
          {amountNum > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-sapphire-light bg-sapphire-subtle px-4 py-3 pl-8">
              <div>
                <span className="text-xs text-muted-foreground">应付金额（客户实际支付）</span>
                <p className="text-2xl font-bold text-primary">¥{formatAmount(payableAmount)}</p>
              </div>
              <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-center">
                <p className="text-xs text-amber-600">优惠金额</p>
                <p className="text-sm font-semibold text-amber-700">¥{formatAmount(discountAmount)}</p>
              </div>
            </div>
          )}
        </section>

        {/* ═══ Section 4: Payment Info ═══ */}
        {amountNum > 0 && selectedAccount && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">4</div>
              <h3 className="text-sm font-bold text-foreground">付款信息</h3>
            </div>
            <div className="pl-8">
              <PaymentInfoCard
                amount={formatAmount(amountNum)}
                payableAmount={formatAmount(payableAmount)}
                discountAmount={formatAmount(discountAmount)}
                rechargeId={selectedAccountId ? "RC-XXXXX" : undefined}
                customerName={customerSubject}
                isSpecial={isSpecial}
              />
            </div>
          </section>
        )}

        {/* ═══ Section 5: Upload Receipt (normal only) ═══ */}
        {isNormal && amountNum > 0 && selectedAccount && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">5</div>
              <h3 className="text-sm font-bold text-foreground">上传付款凭证</h3>
            </div>
            <div className="space-y-4 pl-8">
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
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange(setReceiptFile)} className="hidden" />
                </label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">付款金额 <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">¥</span>
                  <Input type="text" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="h-10 pl-7" placeholder="0.00" />
                </div>
                <p className="text-[11px] text-muted-foreground">默认带出应付金额，如实际付款金额不一致可修改</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">付款主体 / 付款账户户名 <span className="text-destructive">*</span></Label>
                <Input placeholder="请输入实际付款账户户名" value={payAccountName} onChange={(e) => setPayAccountName(e.target.value)} className="h-10" />
                <p className="text-[11px] text-muted-foreground">请填写实际付款的公司主体或账户户名，便于财务确认到账</p>
                {payAccountMismatch && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <p className="text-xs leading-relaxed text-amber-700">付款主体与客户主体不一致，可能影响财务确认，请补充说明。</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">备注说明</Label>
                <Textarea placeholder="如付款主体与客户主体不一致、分笔付款或其他特殊情况，请在此说明" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="min-h-[60px] resize-none" />
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-sapphire-light bg-sapphire-subtle px-4 py-3 pl-8">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-sapphire">系统将自动记录您提交付款凭证的时间，财务确认到账后会更新到账状态。</p>
            </div>
          </section>
        )}

        {/* ═══ Section: Special Approval Info (special only) ═══ */}
        {isSpecial && amountNum > 0 && selectedAccount && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-xs font-bold text-white">5</div>
              <h3 className="text-sm font-bold text-foreground">特批信息</h3>
            </div>

            <div className="space-y-4 pl-8">
              {/* ── 特批原因 — full width ────────────────── */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">特批原因 <span className="text-destructive">*</span></Label>
                <Textarea placeholder="请说明申请特批充值的原因，例如投放时间紧急、账户余额不足、需提前锁定资源等。" value={specialReason} onChange={(e) => setSpecialReason(e.target.value)} className="min-h-[80px] resize-none" />
              </div>

              {/* 客户承诺付款金额 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">客户承诺付款金额</Label>
                <div className="relative max-w-xs">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">¥</span>
                  <Input type="text" value={`¥${formatAmount(payableAmount)}`} readOnly className="h-10 pl-7 bg-muted/50 text-foreground cursor-default" />
                </div>
                <p className="text-[11px] text-muted-foreground">系统根据充值金额和折扣自动计算</p>
              </div>

            </div>
          </section>
        )}

        {/* ═══ Section: Recharge Info ═══ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">{isSpecial ? "6" : "6"}</div>
            <h3 className="text-sm font-bold text-foreground">充值信息</h3>
          </div>
          <div className="space-y-4 pl-8">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">充值用途 <span className="text-destructive">*</span></Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="h-11 w-full"><SelectValue placeholder="请选择充值用途" /></SelectTrigger>
                <SelectContent>
                  {purposes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {isSpecial && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">承诺付款时间 <span className="text-destructive">*</span></Label>
                  <Input type="datetime-local" value={expectedRepayTime} onChange={(e) => setExpectedRepayTime(e.target.value)} className="h-10" placeholder="请选择承诺完成付款的日期与时间" />
                  <p className="text-[11px] text-muted-foreground">请具体到日期与时间，米播将据此跟进付款进度</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">联系商务负责人 <span className="text-destructive">*</span></Label>
                  <Select value={businessContact} onValueChange={setBusinessContact}>
                    <SelectTrigger className="h-10 w-full"><SelectValue placeholder="请选择对接商务负责人" /></SelectTrigger>
                    <SelectContent>
                      {businessContacts.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {!isSpecial && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">备注说明</Label>
                <Textarea placeholder="请填写本次充值用途、项目说明或其他补充信息" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="min-h-[70px] resize-none" />
              </div>
            )}
          </div>
        </section>

      </div></div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="border-t border-border px-8 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Checkbox id="confirm-recharge" checked={confirmed} onCheckedChange={(checked) => setConfirmed(checked === true)} />
            <Label htmlFor="confirm-recharge" className="text-sm font-medium text-foreground cursor-pointer">
              {isNormal
                ? "我已确认充值账户、充值金额、应付金额、收款账户及付款凭证无误"
                : "我已确认该申请为特批充值场景，并承诺按约定时间完成付款及上传付款凭证"}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" onClick={onClose}>取消</Button>
            <Button variant="outline" size="lg" disabled={!canSaveDraft} onClick={handleSaveDraft}>保存草稿</Button>
            <Button size="lg" disabled={!isFormValid} onClick={handleSubmit} className="min-w-[140px]">提交充值申请</Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Draft Success Step ─────────────────────────────────────────────────────

function DraftSuccessStep({ rechargeId, isSpecial, accountName, accountId, onContinueEdit, onBackHome }: {
  rechargeId: string; isSpecial: boolean; accountName: string; accountId: string; onContinueEdit: () => void; onBackHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-10">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <FileText className="h-10 w-10 text-gray-500" />
      </div>

      <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground">草稿已保存</h2>
      <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        您的充值申请已保存为草稿，后续可在充值任务看板中继续提交。
      </p>

      <div className="mt-6 w-full max-w-sm rounded-xl border border-border/60 bg-sapphire-subtle p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">充值单号</span><span className="font-mono text-sm font-semibold text-foreground">{rechargeId}</span></div>
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">充值类型</span>
            <Badge className={`gap-1 text-xs ${isSpecial ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
              {isSpecial ? <><Zap className="h-3 w-3" />特批充值</> : <><Wallet className="h-3 w-3" />常规充值</>}
            </Badge>
          </div>
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">账户名称</span><span className="text-sm font-medium text-foreground">{accountName}</span></div>
          <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">账户 ID</span><span className="font-mono text-sm text-foreground">{accountId}</span></div>
          <div className="border-t border-border/60 pt-3">
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">当前状态</span>
              <Badge className="gap-1 border-gray-200 bg-gray-50 text-xs text-gray-500"><FileText className="h-3 w-3" />草稿</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={onBackHome}>返回看板</Button>
        <Button size="lg" onClick={onContinueEdit} className="gap-2">继续编辑<ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ── Success Step ───────────────────────────────────────────────────────────

function SuccessStep({ rechargeId, isSpecial, onViewProgress, onBackHome }: {
  rechargeId: string; isSpecial: boolean; onViewProgress: () => void; onBackHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-12">
      <div className={`flex h-20 w-20 items-center justify-center rounded-full ${isSpecial ? "bg-amber-100" : "bg-emerald-100"}`}>
        {isSpecial ? <Clock className="h-10 w-10 text-amber-600" /> : <CheckCircle2 className="h-10 w-10 text-emerald-600" />}
      </div>

      <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground">
        {isSpecial ? "特批充值申请已提交" : "充值申请已提交"}
      </h2>
      <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        {isSpecial
          ? "您的特批充值申请已提交，米播将进行评估。评估通过后，请按约定时间完成付款并上传付款凭证。"
          : "您的充值申请已提交，米播将进行审核、财务确认及平台充值处理。"}
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-5 py-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">充值单号</p>
          <p className="text-lg font-mono font-bold tracking-wide text-foreground">{rechargeId}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={onBackHome}>返回首页</Button>
        <Button size="lg" onClick={onViewProgress} className="gap-2">
          查看更多 <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────

export function RechargeModal({ open, onOpenChange }: RechargeModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success" | "draft">("form");
  const [rechargeId, setRechargeId] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ accountName: string; accountId: string }>({ accountName: "", accountId: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (open) { setStep("form"); setRechargeId(""); setIsSpecial(false); } }, [open]);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);
  const handleSuccess = useCallback((id: string, special: boolean) => { setRechargeId(id); setIsSpecial(special); setStep("success"); }, []);
  const handleSaveDraft = useCallback((id: string, special: boolean, accountName: string, accountId: string) => {
    setRechargeId(id); setIsSpecial(special);
    setDraftInfo({ accountName, accountId });
    setStep("draft");
  }, []);
  const handleContinueEdit = useCallback(() => setStep("form"), []);
  const handleViewProgress = useCallback(() => { onOpenChange(false); navigate({ to: "/recharge" }); }, [onOpenChange, navigate]);
  const handleBackHome = useCallback(() => onOpenChange(false), [onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 flex w-full max-w-[720px] max-h-[90vh] flex-col rounded-2xl border border-border bg-card shadow-2xl" role="dialog" aria-modal="true">
        {step === "form" ? (
          <FormStep onSuccess={handleSuccess} onClose={handleClose} onSaveDraft={handleSaveDraft} />
        ) : step === "draft" ? (
          <DraftSuccessStep rechargeId={rechargeId} isSpecial={isSpecial} accountName={draftInfo.accountName} accountId={draftInfo.accountId} onContinueEdit={handleContinueEdit} onBackHome={handleBackHome} />
        ) : (
          <SuccessStep rechargeId={rechargeId} isSpecial={isSpecial} onViewProgress={handleViewProgress} onBackHome={handleBackHome} />
        )}
      </div>
    </div>,
    document.body,
  );
}
