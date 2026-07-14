"use client";

import { useState, useEffect, useCallback } from "react";
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
  QrCode,
  Copy,
  Zap,
  CreditCard,
  Landmark,
  MessageSquareText,
  Hash,
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

// ── Data ───────────────────────────────────────────────────────────────────

const accounts: Account[] = [
  {
    name: "云岚主账户",
    accountId: "ST-10086101",
    subject: "上海云岚科技有限公司",
    balance: "¥286,500.00",
    status: "正常",
    updatedAt: "2026-07-10 14:32",
  },
  {
    name: "云岚投放账户 A",
    accountId: "ST-10086102",
    subject: "上海云岚科技有限公司",
    balance: "¥142,300.00",
    status: "正常",
    updatedAt: "2026-07-10 14:15",
  },
  {
    name: "云岚运营账户",
    accountId: "ST-10086103",
    subject: "上海云岚科技有限公司",
    balance: "¥58,200.00",
    status: "正常",
    updatedAt: "2026-07-10 13:58",
  },
];

const purposes = ["达人采买", "广告投放", "助推投流", "其他"];

const DISCOUNT_RATE = 0.98;
const DISCOUNT_LABEL = "98 折";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateRechargeId(): string {
  const date = new Date();
  const y = date.getFullYear();
  const seq = String(Math.floor(Math.random() * 90000) + 10000);
  return `RC-${y}-${seq}`;
}

function formatAmount(value: number): string {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
          <p className="text-sm font-semibold text-foreground">{account.name}</p>
          <p className="text-xs text-muted-foreground">{account.accountId}</p>
        </div>
        <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          可充值
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border/60 pt-3 text-xs">
        <div>
          <span className="text-muted-foreground">账户主体</span>
          <p className="font-medium text-foreground">{account.subject}</p>
        </div>
        <div>
          <span className="text-muted-foreground">当前余额</span>
          <p className="font-semibold text-foreground">{account.balance}</p>
        </div>
        <div>
          <span className="text-muted-foreground">账户状态</span>
          <p className="font-medium text-emerald-600">正常</p>
        </div>
        <div>
          <span className="text-muted-foreground">最近更新</span>
          <p className="font-medium text-foreground">{account.updatedAt}</p>
        </div>
      </div>
    </div>
  );
}

// ── Payment Info Card (Section 3) ──────────────────────────────────────────

function PaymentInfoCard({
  amount,
  payableAmount,
  discountAmount,
}: {
  amount: string;
  payableAmount: string;
  discountAmount: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(payableAmount).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border-2 border-sapphire-light bg-gradient-to-br from-sapphire-subtle via-white to-blue-50/30 p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <CreditCard className="h-3.5 w-3.5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-foreground">付款信息</h3>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Left: Amount details */}
        <div className="flex-1 space-y-3">
          {/* Payable amount — prominent */}
          <div>
            <p className="text-xs text-muted-foreground">应付金额</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-primary">
                ¥{payableAmount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <Copy className="h-3 w-3" />
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
          </div>

          {/* Receiving entity */}
          <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2">
            <Landmark className="h-4 w-4 text-primary" />
            <div>
              <span className="text-xs text-muted-foreground">收款主体</span>
              <p className="text-sm font-semibold text-foreground">上海米播科技有限公司</p>
            </div>
          </div>

          {/* Calculation breakdown */}
          <div className="space-y-1 rounded-lg bg-white/60 px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">充值金额</span>
              <span className="font-medium text-foreground">¥{amount || "0.00"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">折扣</span>
              <span className="font-medium text-foreground">{DISCOUNT_LABEL}</span>
            </div>
            <div className="border-t border-border/40 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">优惠金额</span>
                <span className="text-sm font-semibold text-amber-600">
                  -¥{discountAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR Code */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div className="flex h-[140px] w-[140px] items-center justify-center rounded-xl border-2 border-dashed border-sapphire-light bg-white p-3">
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <QrCode className="h-16 w-16 text-primary/70" />
              <span className="text-[10px]">扫码付款</span>
              <span className="text-[10px]">米播科技收款码</span>
            </div>
          </div>
          <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
            请使用实际应付金额
            <br />
            完成付款
          </p>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50/80 px-3 py-2">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-sapphire">
          请使用应付金额完成付款，付款完成后上传付款凭证。
        </p>
      </div>
    </div>
  );
}

// ── Form Step ──────────────────────────────────────────────────────────────

function FormStep({
  onSuccess,
  onClose,
}: {
  onSuccess: (rechargeId: string) => void;
  onClose: () => void;
}) {
  // Section 1
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // Section 2
  const [amount, setAmount] = useState("");

  // Section 4 — Upload receipt
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payAccountName, setPayAccountName] = useState("");
  const [payMethod, setPayMethod] = useState<"scan" | "transfer">("scan");
  const [payNote, setPayNote] = useState("");
  const [extraNote, setExtraNote] = useState("");

  // Section 5
  const [purpose, setPurpose] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
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

  // Sync pay amount & account name when account/amount changes
  useEffect(() => {
    if (amountNum > 0) {
      setPayAmount(formatAmount(payableAmount));
    }
    if (selectedAccount) {
      setPayAccountName(selectedAccount.subject);
    }
  }, [payableAmount, amountNum, selectedAccount]);

  const isFormValid =
    selectedAccountId !== "" &&
    amountNum > 0 &&
    receiptFile !== null &&
    payAmount.trim() !== "" &&
    payAccountName.trim() !== "" &&
    purpose !== "" &&
    confirmed &&
    !isAccountAbnormal;

  const handleSubmit = () => {
    if (!isFormValid) return;
    const newId = generateRechargeId();
    onSuccess(newId);
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
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              发起充值申请
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              请选择需要充值的星图账户，填写充值金额并完成付款。提交后将进入米播内部审核流程。
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

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="space-y-6 px-8 py-6">
        {/* ══════════════════════════════════════════════════
            Section 1: Account Selection
            ══════════════════════════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">
              1
            </div>
            <h3 className="text-sm font-bold text-foreground">选择充值账户</h3>
          </div>

          <div className="space-y-1.5 pl-8">
            <Label className="text-sm font-semibold">
              星图账户 <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="请选择星图账户" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.accountId} value={account.accountId}>
                    <div className="flex items-center gap-3 py-0.5">
                      <span className="font-medium text-foreground">{account.name}</span>
                      <span className="text-xs text-muted-foreground">{account.accountId}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        余额 {account.balance}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAccount && !isAccountAbnormal && (
            <div className="pl-8">
              <AccountInfoCard account={selectedAccount} />
            </div>
          )}

          {isAccountAbnormal && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 pl-8">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">当前账户不可充值</p>
                <p className="text-xs text-muted-foreground">
                  该账户状态异常，请选择其他可用账户或联系客服处理。
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════════
            Section 2: Amount
            ══════════════════════════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">
              2
            </div>
            <h3 className="text-sm font-bold text-foreground">填写充值金额</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 pl-8 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                充值金额 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
                  ¥
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="请输入希望充入星图账户的金额"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 pl-7"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">折扣</Label>
              <div className="flex h-11 items-center rounded-md border border-input bg-muted/50 px-3">
                <TrendingDown className="mr-2 h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-foreground">{DISCOUNT_LABEL}</span>
                {amountNum > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    优惠 ¥{formatAmount(discountAmount)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            Section 3: Payment Info
            ══════════════════════════════════════════════════ */}
        {amountNum > 0 && selectedAccount && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">
                3
              </div>
              <h3 className="text-sm font-bold text-foreground">付款信息</h3>
            </div>

            <div className="pl-8">
              <PaymentInfoCard
                amount={formatAmount(amountNum)}
                payableAmount={formatAmount(payableAmount)}
                discountAmount={formatAmount(discountAmount)}
              />
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            Section 4: Upload Receipt
            ══════════════════════════════════════════════════ */}
        {amountNum > 0 && selectedAccount && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">
                4
              </div>
              <h3 className="text-sm font-bold text-foreground">上传付款凭证</h3>
            </div>

            <div className="space-y-4 pl-8">
              {/* 1. File upload */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  付款凭证 <span className="text-destructive">*</span>
                </Label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-5 transition-colors hover:border-primary/50 hover:bg-sapphire-subtle">
                  {receiptFile ? (
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-primary" />
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {receiptFile.name}
                      </p>
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
                        点击或拖拽上传付款截图 / 回单
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

              {/* 2. Pay amount */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  付款金额 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                    ¥
                  </span>
                  <Input
                    type="text"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="h-10 pl-7"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  默认带出应付金额，如实际付款金额不一致可修改
                </p>
              </div>

              {/* 3. Pay account name / 付款主体 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  付款主体 / 付款账户户名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="请输入实际付款账户户名"
                  value={payAccountName}
                  onChange={(e) => setPayAccountName(e.target.value)}
                  className="h-10"
                />
                <p className="text-[11px] text-muted-foreground">
                  请填写实际付款的公司主体或账户户名，便于财务确认到账
                </p>
                {payAccountMismatch && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <p className="text-xs leading-relaxed text-amber-700">
                      付款主体与客户主体不一致，可能影响财务确认，请补充说明。
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Pay method */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">付款方式</Label>
                <div className="flex gap-3 pt-0.5">
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                      payMethod === "scan"
                        ? "border-primary/40 bg-sapphire-subtle text-primary"
                        : "border-border text-muted-foreground hover:border-primary/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value="scan"
                      checked={payMethod === "scan"}
                      onChange={() => setPayMethod("scan")}
                      className="sr-only"
                    />
                    <QrCode className="h-4 w-4" />
                    扫码支付
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                      payMethod === "transfer"
                        ? "border-primary/40 bg-sapphire-subtle text-primary"
                        : "border-border text-muted-foreground hover:border-primary/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value="transfer"
                      checked={payMethod === "transfer"}
                      onChange={() => setPayMethod("transfer")}
                      className="sr-only"
                    />
                    <Landmark className="h-4 w-4" />
                    对公转账
                  </label>
                </div>
              </div>

              {/* 5. Pay note / 流水号 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">付款备注 / 流水号</Label>
                <Input
                  placeholder="如有付款备注或银行流水号，可在此填写"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* 6. Extra note */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">补充说明</Label>
                <Textarea
                  placeholder="如付款主体与客户主体不一致，请在此说明"
                  value={extraNote}
                  onChange={(e) => setExtraNote(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              </div>
            </div>

            {/* Auto-time recording tip */}
            <div className="flex items-start gap-2.5 rounded-lg border border-sapphire-light bg-sapphire-subtle px-4 py-3 pl-8">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-sapphire">
                系统将自动记录您提交付款凭证的时间，财务确认到账后会更新到账状态。
              </p>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            Section 5: Recharge Info
            ══════════════════════════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">
              5
            </div>
            <h3 className="text-sm font-bold text-foreground">充值信息</h3>
          </div>

          <div className="space-y-4 pl-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* 充值用途 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  充值用途 <span className="text-destructive">*</span>
                </Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="请选择充值用途" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposes.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 充值紧急程度 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">充值紧急程度</Label>
                <div className="flex gap-3 pt-1">
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                      urgency === "normal"
                        ? "border-primary/40 bg-sapphire-subtle text-primary"
                        : "border-border text-muted-foreground hover:border-primary/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value="normal"
                      checked={urgency === "normal"}
                      onChange={() => setUrgency("normal")}
                      className="sr-only"
                    />
                    <Clock className="h-4 w-4" />
                    正常
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                      urgency === "urgent"
                        ? "border-amber-300 bg-amber-50 text-amber-700"
                        : "border-border text-muted-foreground hover:border-amber-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value="urgent"
                      checked={urgency === "urgent"}
                      onChange={() => setUrgency("urgent")}
                      className="sr-only"
                    />
                    <Zap className="h-4 w-4" />
                    紧急
                  </label>
                </div>
              </div>
            </div>

            {/* Urgency warning */}
            {urgency === "urgent" && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-700">
                  紧急充值仅作为内部处理优先级参考，实际到账时间仍受财务确认和平台转账时效影响。
                </p>
              </div>
            )}

            {/* 备注说明 */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">备注说明</Label>
              <Textarea
                placeholder="请填写本次充值用途、项目说明或其他补充信息"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            Tips
            ══════════════════════════════════════════════════ */}
        <div className="space-y-3 pl-8">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm leading-relaxed text-amber-800">
              下午 5 点后提交的充值申请，财务确认及平台转账可能顺延至下一工作日处理。
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="border-t border-border px-8 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="confirm-recharge"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <Label
              htmlFor="confirm-recharge"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              我已确认充值账户、充值金额、应付金额、收款主体及付款凭证无误
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" onClick={onClose}>
              取消
            </Button>
            <Button
              size="lg"
              disabled={!isFormValid}
              onClick={handleSubmit}
              className="min-w-[140px]"
            >
              提交充值申请
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Success Step ───────────────────────────────────────────────────────────

function SuccessStep({
  rechargeId,
  onViewProgress,
  onBackHome,
}: {
  rechargeId: string;
  onViewProgress: () => void;
  onBackHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </div>

      <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground">
        充值申请已提交
      </h2>
      <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        您的充值申请已提交，米播内部将进行审核并确认付款到账。
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-5 py-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">充值单号</p>
          <p className="text-lg font-mono font-bold tracking-wide text-foreground">
            {rechargeId}
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

export function RechargeModal({ open, onOpenChange }: RechargeModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [rechargeId, setRechargeId] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setStep("form");
      setRechargeId("");
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSuccess = useCallback((id: string) => {
    setRechargeId(id);
    setStep("success");
  }, []);

  const handleViewProgress = useCallback(() => {
    onOpenChange(false);
    window.location.href = "/recharge";
  }, [onOpenChange]);

  const handleBackHome = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className="relative z-10 w-full max-w-[720px] max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {step === "form" ? (
          <FormStep onSuccess={handleSuccess} onClose={handleClose} />
        ) : (
          <SuccessStep
            rechargeId={rechargeId}
            onViewProgress={handleViewProgress}
            onBackHome={handleBackHome}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
