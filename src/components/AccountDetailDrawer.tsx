"use client";

import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, CheckCircle2, Clock, ShieldAlert, Ban, User, Phone, Mail,
  Wallet, TrendingUp, TrendingDown, FileText, ChevronRight, Eye, XCircle,
  Landmark, KeyRound,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DetailAccountMaterialFile {
  name: string;
  sizeKB: number;
}

export interface DetailAccountInfo {
  name: string;
  accountType: string;
  accountId: string;
  subject: string;
  balance: string;
  monthlyRecharge: string;
  monthlySpend: string;
  status: string;
  updatedAt: string;
  // 新增账户时填写的信息
  directClientId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  proofType?: "bank" | "auth" | "";
  proofBankName?: string;
  proofBankCard?: string;
  proofAuthAccountId?: string;
  materialFiles?: DetailAccountMaterialFile[];
}

interface AccountDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: DetailAccountInfo | null;
  onRecharge?: () => void;
  onViewLedger?: () => void;
}

const accountTypeClass: Record<string, string> = {
  "主账户": "border-blue-200 bg-blue-50 text-blue-700",
  "投放账户": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "运营账户": "border-purple-200 bg-purple-50 text-purple-700",
  "品牌账户": "border-amber-200 bg-amber-50 text-amber-700",
};

// ── Component ──────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-2.5">{icon}<h4 className="text-sm font-semibold text-foreground">{title}</h4></div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs ${bold ? "font-semibold text-foreground" : "text-foreground"} ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

const proofTypeLabel = (proofType?: "bank" | "auth" | ""): string =>
  proofType === "bank" ? "银行开户对公" : proofType === "auth" ? "账户授权" : "—";

function maskPhone(phone?: string): string {
  if (!phone || phone.length < 7) return phone || "—";
  return phone.slice(0, 3) + "****" + phone.slice(-3);
}

const recentRecharges = [
  { id: "RC-2026-07001", amount: "¥50,000.00", paidAmount: "¥49,000.00", type: "常规充值", node: "平台转账中", order: "未完成" },
  { id: "RC-2026-07003", amount: "¥30,000.00", paidAmount: "¥29,400.00", type: "常规充值", node: "充值完成", order: "已完成" },
  { id: "RC-2026-07006", amount: "¥100,000.00", paidAmount: "¥98,000.00", type: "草稿", node: "未提交", order: "未完成" },
];

export function AccountDetailDrawer({ open, onOpenChange, account, onRecharge, onViewLedger }: AccountDetailDrawerProps) {
  if (!account) return null;

  const isAbnormal = account.status === "异常" || account.status === "不可充值";
  const canRecharge = account.status === "正常";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[640px]">
        {/* Header */}
        <SheetHeader className="space-y-3 border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary"><Building2 className="h-3.5 w-3.5 text-white" /></div>
            <SheetTitle>账户详情</SheetTitle>
          </div>
          <div className="rounded-xl border border-border/60 bg-sapphire-subtle p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="h-4 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700">星图</Badge>
              <span className="text-sm font-semibold text-foreground">{account.name}</span>
              <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[account.accountType] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>{account.accountType}</Badge>
            </div>
            <div className="flex items-center gap-3">
              {isAbnormal ? (
                <Badge className="gap-1 border-red-200 bg-red-50 text-xs text-red-700"><ShieldAlert className="h-3 w-3" />{account.status}</Badge>
              ) : (
                <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700"><CheckCircle2 className="h-3 w-3" />正常</Badge>
              )}
              <Badge className={`gap-1 text-xs ${canRecharge ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                {canRecharge ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                {canRecharge ? "可充值" : "不可充值"}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {/* Section 1: Basic Info */}
          <SectionCard title="账户基础信息" icon={<Building2 className="h-4 w-4 text-primary" />}>
            <InfoRow label="平台" value="星图" />
            <InfoRow label="账户名称" value={account.name} bold />
            <InfoRow label="账户类型" value={account.accountType} />
            <InfoRow label="账户 ID" value={account.accountId} mono />
            <InfoRow label="账户主体" value={account.subject} />
            <InfoRow label="直客ID" value={account.directClientId || "—"} mono />
            <InfoRow label="绑定时间" value="2026-07-01 10:30" />
            <InfoRow label="最近更新" value={account.updatedAt} />
          </SectionCard>

          {/* Section 2: Contact Info */}
          <SectionCard title="联系人信息" icon={<User className="h-4 w-4 text-primary" />}>
            <InfoRow label="联系人姓名" value={account.contactName || "—"} />
            <InfoRow label="联系电话" value={maskPhone(account.contactPhone)} />
            <InfoRow label="账号绑定邮箱" value={account.contactEmail || "—"} />
            <p className="mt-2 text-[11px] text-muted-foreground">联系人信息为新增账户时填写的信息，可用于米播审核或异常沟通。</p>
          </SectionCard>

          {/* Section 2b: Proof Info */}
          <SectionCard
            title="资质证明信息"
            icon={account.proofType === "auth" ? <KeyRound className="h-4 w-4 text-primary" /> : <Landmark className="h-4 w-4 text-primary" />}
          >
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted-foreground">资质证明方式</span>
              <Badge className="h-4 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700">{proofTypeLabel(account.proofType)}</Badge>
            </div>
            {account.proofType === "bank" ? (
              <>
                <InfoRow label="开户行" value={account.proofBankName || "—"} />
                <InfoRow label="银行卡号" value={account.proofBankCard || "—"} mono />
              </>
            ) : account.proofType === "auth" ? (
              <InfoRow label="可授权账户ID" value={account.proofAuthAccountId || "—"} mono />
            ) : null}
            {account.materialFiles && account.materialFiles.length > 0 && (
              <div className="pt-2.5">
                <span className="text-xs text-muted-foreground">已上传证明材料</span>
                <div className="mt-1.5 space-y-1.5">
                  {account.materialFiles.map((f) => (
                    <div key={f.name} className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-xs text-foreground">{f.name}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{f.sizeKB.toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Section 3: Fund Info */}
          <SectionCard title="账户资金信息" icon={<Wallet className="h-4 w-4 text-primary" />}>
            <InfoRow label="当前余额" value={account.balance} bold />
            <InfoRow label="本月充值" value={account.monthlyRecharge} />
            <InfoRow label="本月消耗" value={account.monthlySpend} />
            <InfoRow label="冻结金额" value="¥20,000.00" />
            <InfoRow label="可用余额" value="¥266,500.00" bold />
            <InfoRow label="余额更新时间" value={account.updatedAt} />
          </SectionCard>

          {/* Section 4: Audit Info */}
          <SectionCard title="账户审核信息" icon={<ShieldAlert className="h-4 w-4 text-primary" />}>
            <InfoRow label="审核状态" value="审核通过" />
            <InfoRow label="审核时间" value="2026-07-01 11:20" />
            <InfoRow label="审核人" value="米播平台媒介" />
            <div className="mt-2 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">审核说明：账户信息核对无误，可用于充值</p>
            </div>
          </SectionCard>

          {/* Section 5: Recent Recharges */}
          <SectionCard title="最近充值记录" icon={<FileText className="h-4 w-4 text-primary" />}>
            <div className="space-y-2">
              {recentRecharges.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-xs">
                  <span className="font-mono font-medium text-foreground">{r.id}</span>
                  <span className="text-muted-foreground">{r.amount}</span>
                  <Badge className={`text-[10px] ${r.type === "草稿" ? "border-gray-200 bg-gray-50 text-gray-500" : "border-blue-200 bg-blue-50 text-blue-700"}`}>{r.type}</Badge>
                  <span className="text-muted-foreground">{r.node}</span>
                  <Badge className={`text-[10px] ${r.order === "已完成" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{r.order}</Badge>
                </div>
              ))}
            </div>
          </SectionCard>

        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>关闭</Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={onViewLedger}>
            <Eye className="h-4 w-4" />查看流水
          </Button>
          {canRecharge ? (
            <Button className="flex-1 gap-2" onClick={onRecharge}><Wallet className="h-4 w-4" />发起充值</Button>
          ) : (
            <div className="group relative flex-1">
              <Button disabled className="w-full gap-2">发起充值</Button>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">当前账户暂不可充值</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
