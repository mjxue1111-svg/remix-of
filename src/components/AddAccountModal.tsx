"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Building2,
  Upload,
  FileText,
  Info,
  User,
  Phone,
  Mail,
  ChevronRight,
  ShieldCheck,
  Clock,
  Hash,
  Tag,
  Paperclip,
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

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const accountTypes = ["主账户", "投放账户", "运营账户", "其他"];

const defaultContactName = "李明";
const defaultSubject = "上海云岚科技有限公司";

// ── Form Step ──────────────────────────────────────────────────────────────

function FormStep({
  onSuccess,
  onClose,
}: {
  onSuccess: (data: { accountName: string; accountId: string }) => void;
  onClose: () => void;
}) {
  // Section 1 — Account basic info
  const [accountName, setAccountName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [accountType, setAccountType] = useState("");

  // Section 2 — Contact info
  const [contactName, setContactName] = useState(defaultContactName);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Section 3 — Materials
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);

  // Footer
  const [confirmed, setConfirmed] = useState(false);

  const isFormValid =
    accountName.trim() !== "" &&
    accountId.trim() !== "" &&
    subject.trim() !== "" &&
    contactName.trim() !== "" &&
    contactPhone.trim() !== "" &&
    confirmed;

  const handleSubmit = () => {
    if (!isFormValid) return;
    onSuccess({ accountName: accountName.trim(), accountId: accountId.trim() });
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setMaterialFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setMaterialFiles((prev) => prev.filter((_, i) => i !== index));
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
              新增 / 绑定星图账户
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              请填写已有星图账户信息。提交后，米播将审核账户信息，审核通过后可用于发起充值。
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
      <div className="flex-1 overflow-y-auto px-8 py-6"><div className="space-y-6">
        {/* ══════════════════════════════════════════════════
            Section 1: Account Basic Info
            ══════════════════════════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-foreground">账户基础信息</h3>
          </div>

          <div className="space-y-4 pl-9">
            {/* Account name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                星图账户名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="请输入星图账户名称"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Account ID */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                星图账户 ID <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="请输入星图账户 ID"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="h-10 font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                请填写星图平台中的账户 ID，用于米播核对账户信息。
              </p>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                账户主体 <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="请输入星图账户对应的企业主体"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                请填写该星图账户对应的企业主体。
              </p>
            </div>

            {/* Account type */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">账户类型</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="请选择账户类型" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            Section 2: Contact Info
            ══════════════════════════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sapphire-muted">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">联系人信息</h3>
          </div>

          <div className="space-y-4 pl-9">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  联系人姓名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="请输入联系人姓名"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  联系电话 <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="请输入联系人手机号"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">联系邮箱</Label>
              <Input
                type="email"
                placeholder="请输入联系邮箱"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                如账户信息需要补充确认，米播将通过以上联系人信息与您沟通。
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            Section 3: Materials
            ══════════════════════════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sapphire-muted">
              <Paperclip className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">账户证明材料</h3>
          </div>

          <div className="space-y-3 pl-9">
            {/* Upload area */}
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-5 transition-colors hover:border-primary/50 hover:bg-sapphire-subtle">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                点击或拖拽上传账户截图 / 证明材料
              </p>
              <p className="text-xs text-muted-foreground">
                支持 JPG、PNG、PDF 格式，单个文件不超过 10MB
              </p>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFilesChange}
                className="hidden"
              />
            </label>

            {/* File list */}
            {materialFiles.length > 0 && (
              <div className="space-y-2">
                {materialFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 text-xs text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        removeFile(i);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                建议上传包含账户名称、账户 ID 或账户主体信息的截图，便于米播快速审核。
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            Section 4: Submission Notes
            ══════════════════════════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-sapphire-light bg-sapphire-subtle p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">账户审核说明</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-sapphire">
                提交后，账户状态将变为“待审核”。米播将核对账户 ID、账户主体及账户可充值状态。审核通过后，该账户可用于发起充值；如审核驳回，您可根据驳回原因修改后重新提交。
              </p>
            </div>
          </div>
        </section>
      </div></div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="border-t border-border px-8 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="confirm-add-account"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <Label
              htmlFor="confirm-add-account"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              我已确认账户名称、账户 ID 及账户主体信息真实有效
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
              className="min-w-[120px]"
            >
              提交审核
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Success Step ───────────────────────────────────────────────────────────

function SuccessStep({
  accountName,
  accountId,
  onViewStatus,
  onBackHome,
}: {
  accountName: string;
  accountId: string;
  onViewStatus: () => void;
  onBackHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
        <Clock className="h-10 w-10 text-blue-600" />
      </div>

      <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground">
        账户已提交审核
      </h2>
      <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        您的星图账户信息已提交，米播将在审核通过后将账户状态更新为"可充值"。
      </p>

      {/* Account info card */}
      <div className="mt-6 w-full max-w-sm rounded-xl border border-border/60 bg-sapphire-subtle p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">账户名称</span>
            <span className="text-sm font-semibold text-foreground">{accountName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">星图账户 ID</span>
            <span className="font-mono text-sm font-medium text-foreground">{accountId}</span>
          </div>
          <div className="border-t border-border/60 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">当前状态</span>
              <Badge className="gap-1 border-blue-200 bg-blue-50 text-blue-700">
                <Clock className="h-3 w-3" />
                待审核
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={onBackHome}>
          返回首页
        </Button>
        <Button size="lg" onClick={onViewStatus} className="gap-2">
          查看账户状态
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────

export function AddAccountModal({ open, onOpenChange }: AddAccountModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [submittedData, setSubmittedData] = useState<{
    accountName: string;
    accountId: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setStep("form");
      setSubmittedData(null);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSuccess = useCallback(
    (data: { accountName: string; accountId: string }) => {
      setSubmittedData(data);
      setStep("success");
    },
    [],
  );

  const handleViewStatus = useCallback(() => {
    onOpenChange(false);
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
        className="relative z-10 flex w-full max-w-[720px] max-h-[90vh] flex-col rounded-2xl border border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {step === "form" ? (
          <FormStep onSuccess={handleSuccess} onClose={handleClose} />
        ) : (
          <SuccessStep
            accountName={submittedData?.accountName ?? ""}
            accountId={submittedData?.accountId ?? ""}
            onViewStatus={handleViewStatus}
            onBackHome={handleBackHome}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
