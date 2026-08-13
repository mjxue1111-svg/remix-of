import { Fragment, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2, User, Shield, Plus, CheckCircle2, Eye, Pencil, Lock, X, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AddAccountModal } from "@/components/AddAccountModal";
import { BindAccountModal } from "@/components/BindAccountModal";
import { toast } from "sonner";

export const Route = createFileRoute("/account-info")({ component: AccountInfoPage });

// ── Data ───────────────────────────────────────────────────────────────────

const starAccounts = [
  { name: "云岚品牌中心", accountType: "主账户", accountId: "ST-10086101", subject: "上海云岚科技有限公司", authStatus: "已授权", status: "正常", balance: "¥286,500.00", available: "¥266,500.00", frozen: "¥20,000.00", monthlyRecharge: "¥100,000.00", monthlySpend: "¥68,000.00", updatedAt: "2026-07-10 14:32", authTime: "2025-12-01", authExpire: "2026-12-01" },
  { name: "云岚效果投放", accountType: "投放账户", accountId: "ST-10086102", subject: "上海云岚科技有限公司", authStatus: "已授权", status: "正常", balance: "¥142,300.00", available: "¥142,300.00", frozen: "¥0.00", monthlyRecharge: "¥80,000.00", monthlySpend: "¥56,800.00", updatedAt: "2026-07-10 14:15", authTime: "2025-10-15", authExpire: "2026-10-15" },
  { name: "云岚内容增长", accountType: "运营账户", accountId: "ST-10086103", subject: "上海云岚科技有限公司", authStatus: "已授权", status: "正常", balance: "¥58,200.00", available: "¥58,200.00", frozen: "¥0.00", monthlyRecharge: "¥20,000.00", monthlySpend: "¥32,000.00", updatedAt: "2026-07-10 13:58", authTime: "2025-11-20", authExpire: "2026-11-20" },
];

const accountTypeClass: Record<string, string> = {
  "主账户": "border-blue-200 bg-blue-50 text-blue-700",
  "投放账户": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "运营账户": "border-purple-200 bg-purple-50 text-purple-700",
  "品牌账户": "border-amber-200 bg-amber-50 text-amber-700",
};

const statusConfig: Record<string, string> = {
  "正常": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "待确认": "border-blue-200 bg-blue-50 text-blue-700",
  "已授权": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "未授权": "border-amber-200 bg-amber-50 text-amber-700",
  "授权即将过期": "border-yellow-200 bg-yellow-50 text-yellow-700",
};

// ── Helpers ────────────────────────────────────────────────────────────────

type Cell = {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  colSpan?: 1 | 3;
};

function DescTable({ rows }: { rows: Cell[][] }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border/60">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col style={{ width: "15%" }} />
          <col style={{ width: "35%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "35%" }} />
        </colgroup>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/60 last:border-0">
              {row.map((cell, ci) => (
                <Fragment key={ci}>
                  <th className="border-r border-border/60 bg-muted/40 px-4 py-3 text-left align-middle text-xs font-normal text-muted-foreground">
                    {cell.label}
                  </th>
                  <td
                    colSpan={cell.colSpan === 3 ? 3 : 1}
                    className={`border-r border-border/60 bg-background px-4 py-3 align-middle text-sm font-medium text-foreground last:border-r-0 ${cell.mono ? "font-mono" : ""}`}
                  >
                    {cell.value}
                  </td>
                </Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-primary" />
      <h4 className="text-sm font-semibold text-foreground">{children}</h4>
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string | React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 py-2.5 w-[110px]">{label}</span>
      <span className={`text-xs font-medium text-foreground py-2.5 pl-3 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

// ── Bank account formatting ────────────────────────────────────────────────

function formatBankAccount(value: string): string {
  const digits = value.replace(/\s/g, "");
  if (digits.length <= 4) return digits;
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(" ");
}

// ── Mock company database ──────────────────────────────────────────────────
// 工商回显字段：由企业名称联动查询工商登记信息（模拟数据），客户/运营不可直接编辑。

interface CompanyRecord {
  creditCode: string;
  status: string;
  legalRepresentative: string;
  registeredCapital: string;
  registeredAddress: string;
}

const companyDb: Record<string, CompanyRecord> = {
  "上海云岚科技有限公司": {
    creditCode: "91310115MACJ6K1C8A",
    status: "存续",
    legalRepresentative: "陈曦",
    registeredCapital: "5,000 万元人民币",
    registeredAddress: "上海市浦东新区张江高科技园区科苑路 88 号",
  },
  "北京星辰互动传媒有限公司": {
    creditCode: "91110108MA7YH3K2B9",
    status: "存续",
    legalRepresentative: "王一凡",
    registeredCapital: "2,000 万元人民币",
    registeredAddress: "北京市朝阳区建国路 99 号院 2 号楼",
  },
  "杭州启明信息技术有限公司": {
    creditCode: "91330100MA2KJ8P3D5",
    status: "存续",
    legalRepresentative: "林晓",
    registeredCapital: "1,000 万元人民币",
    registeredAddress: "杭州市余杭区五常街道文一西路 998 号",
  },
};

// 字段来源标签：标注该字段数据来源，便于运营/客户识别是否可编辑
type FieldSource = "工商回显" | "人工校正" | "系统记录";

const sourceTagClass: Record<FieldSource, string> = {
  工商回显: "border-blue-100 bg-blue-50 text-blue-600",
  人工校正: "border-amber-100 bg-amber-50 text-amber-600",
  系统记录: "border-border bg-muted/60 text-muted-foreground",
};

function SourceTag({ type }: { type: FieldSource }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none ${sourceTagClass[type]}`}>
      {type}
    </span>
  );
}

function FieldBox({ label, tag, children }: { label: string; tag: FieldSource; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <SourceTag type={tag} />
      </div>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

function EditFieldBox({ label, tag, required, children }: { label: string; tag: FieldSource; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-normal text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <SourceTag type={tag} />
      </div>
      {children}
    </div>
  );
}

// ── EntityInfoCard ──────────────────────────────────────────────────────────

function EntityInfoCard() {
  const [editing, setEditing] = useState(false);

  const [companyName, setCompanyName] = useState("上海云岚科技有限公司");
  const [creditCode, setCreditCode] = useState("91310115MACJ6K1C8A");
  const [companyStatus, setCompanyStatus] = useState("存续");
  const [legalRepresentative, setLegalRepresentative] = useState("陈曦");
  const [companyType, setCompanyType] = useState("品牌主体");
  const [registeredCapital, setRegisteredCapital] = useState("5,000 万元人民币");
  const [industry, setIndustry] = useState("互联网营销");
  const [sopIndustryGroup, setSopIndustryGroup] = useState("泛互联网组");
  const [industryTier, setIndustryTier] = useState("行业腰部客户");
  const [employeeScale, setEmployeeScale] = useState("100-499 人");
  const [registeredAddress, setRegisteredAddress] = useState("上海市浦东新区张江高科技园区科苑路 88 号");
  const [businessAddress, setBusinessAddress] = useState("同注册地址");
  const [businessScope, setBusinessScope] = useState(
    "从事企业形象策划、品牌营销推广、短视频与直播内容营销咨询服务；受托为达人分销及广告主提供星图账户充值与结算服务。",
  );
  const [dataUpdatedAt, setDataUpdatedAt] = useState("2026-07-10 14:32");
  const [bankName, setBankName] = useState("招商银行股份有限公司上海张江支行");
  const [bankAccount, setBankAccount] = useState("6225888899990001");
  const [billingPhone, setBillingPhone] = useState("021-58886666");
  const [billingAddress, setBillingAddress] = useState("上海市浦东新区张江高科技园区科苑路 88 号");

  // Draft state for editing
  const [draft, setDraft] = useState({
    companyName: "",
    creditCode: "",
    companyStatus: "",
    legalRepresentative: "",
    companyType: "",
    registeredCapital: "",
    industry: "",
    sopIndustryGroup: "",
    industryTier: "",
    employeeScale: "",
    registeredAddress: "",
    businessAddress: "",
    businessScope: "",
    bankName: "",
    bankAccount: "",
    billingPhone: "",
    billingAddress: "",
  });

  const startEditing = () => {
    setDraft({
      companyName,
      creditCode,
      companyStatus,
      legalRepresentative,
      companyType,
      registeredCapital,
      industry,
      sopIndustryGroup,
      industryTier,
      employeeScale,
      registeredAddress,
      businessAddress,
      businessScope,
      bankName,
      bankAccount: bankAccount.replace(/\s/g, ""),
      billingPhone,
      billingAddress,
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  // 客户主体名称变更时，联动回显工商登记信息（企业名称/信用代码/法人代表/注册资本/注册地址）
  const handleCompanyNameChange = (value: string) => {
    setDraft((prev) => {
      const match = companyDb[value];
      return {
        ...prev,
        companyName: value,
        creditCode: match ? match.creditCode : prev.creditCode,
        legalRepresentative: match ? match.legalRepresentative : prev.legalRepresentative,
        registeredCapital: match ? match.registeredCapital : prev.registeredCapital,
        registeredAddress: match ? match.registeredAddress : prev.registeredAddress,
      };
    });
  };

  const handleBankAccountChange = (value: string) => {
    // Strip non-digits for storage
    const digits = value.replace(/\D/g, "");
    setDraft((prev) => ({ ...prev, bankAccount: digits }));
  };

  const saveEditing = () => {
    if (!draft.companyName.trim() || !draft.bankName.trim() || !draft.bankAccount.trim()) {
      toast.error("请填写必填字段");
      return;
    }
    // Re-query 工商回显字段
    const match = companyDb[draft.companyName.trim()];
    setCompanyName(draft.companyName.trim());
    setCreditCode(match ? match.creditCode : draft.creditCode);
    setLegalRepresentative(match ? match.legalRepresentative : draft.legalRepresentative);
    setRegisteredCapital(match ? match.registeredCapital : draft.registeredCapital);
    setRegisteredAddress(match ? match.registeredAddress : draft.registeredAddress);
    // 人工校正字段
    setCompanyStatus(draft.companyStatus.trim() || companyStatus);
    setCompanyType(draft.companyType.trim());
    setIndustry(draft.industry.trim());
    setSopIndustryGroup(draft.sopIndustryGroup.trim());
    setIndustryTier(draft.industryTier.trim());
    setEmployeeScale(draft.employeeScale.trim());
    setBusinessAddress(draft.businessAddress.trim());
    setBusinessScope(draft.businessScope.trim());
    setBankName(draft.bankName.trim());
    setBankAccount(draft.bankAccount.trim());
    setBillingPhone(draft.billingPhone.trim() || "");
    setBillingAddress(draft.billingAddress.trim() || "");
    // 系统记录字段：保存时自动刷新
    setDataUpdatedAt(new Date().toISOString().slice(0, 16).replace("T", " "));
    setEditing(false);
    toast.success("信息已保存");
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />客户主体信息
            </CardTitle>
            <CardDescription>管理企业的工商注册信息与财务收款信息。</CardDescription>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={startEditing}>
              <Pencil className="h-3.5 w-3.5" />编辑
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={cancelEditing}>取消</Button>
              <Button size="sm" onClick={saveEditing}>保存</Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── 工商信息 ──────────────────────────────── */}
        <div>
          <SectionTitle>工商信息</SectionTitle>
          {editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <EditFieldBox label="客户主体名称" tag="工商回显" required>
                <Input
                  placeholder="请输入或选择客户主体名称"
                  value={draft.companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  list="company-list"
                  className="h-9"
                />
                <datalist id="company-list">
                  {Object.keys(companyDb).map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </EditFieldBox>
              <EditFieldBox label="统一社会信用代码" tag="工商回显">
                <Input value={draft.creditCode} disabled className="h-9 bg-muted/50 font-mono text-muted-foreground" />
              </EditFieldBox>
              <EditFieldBox label="企业状态" tag="人工校正">
                <Input
                  placeholder="请输入企业状态"
                  value={draft.companyStatus}
                  onChange={(e) => setDraft((prev) => ({ ...prev, companyStatus: e.target.value }))}
                  className="h-9"
                />
              </EditFieldBox>

              <EditFieldBox label="法人代表" tag="工商回显">
                <Input value={draft.legalRepresentative} disabled className="h-9 bg-muted/50 text-muted-foreground" />
              </EditFieldBox>
              <EditFieldBox label="企业类型" tag="人工校正">
                <Input
                  placeholder="如：集团 / 品牌主体"
                  value={draft.companyType}
                  onChange={(e) => setDraft((prev) => ({ ...prev, companyType: e.target.value }))}
                  className="h-9"
                />
              </EditFieldBox>
              <EditFieldBox label="注册资本" tag="工商回显">
                <Input value={draft.registeredCapital} disabled className="h-9 bg-muted/50 text-muted-foreground" />
              </EditFieldBox>

              <EditFieldBox label="所属行业" tag="人工校正">
                <Input
                  placeholder="请输入所属行业"
                  value={draft.industry}
                  onChange={(e) => setDraft((prev) => ({ ...prev, industry: e.target.value }))}
                  className="h-9"
                />
              </EditFieldBox>
              <EditFieldBox label="SOP 行业组" tag="人工校正">
                <Input
                  placeholder="请输入 SOP 行业组"
                  value={draft.sopIndustryGroup}
                  onChange={(e) => setDraft((prev) => ({ ...prev, sopIndustryGroup: e.target.value }))}
                  className="h-9"
                />
              </EditFieldBox>
              <EditFieldBox label="行业梯队" tag="人工校正">
                <Input
                  placeholder="请输入行业梯队"
                  value={draft.industryTier}
                  onChange={(e) => setDraft((prev) => ({ ...prev, industryTier: e.target.value }))}
                  className="h-9"
                />
              </EditFieldBox>

              <EditFieldBox label="员工规模" tag="人工校正">
                <Input
                  placeholder="如：100-499 人"
                  value={draft.employeeScale}
                  onChange={(e) => setDraft((prev) => ({ ...prev, employeeScale: e.target.value }))}
                  className="h-9"
                />
              </EditFieldBox>
              <EditFieldBox label="注册地址" tag="工商回显">
                <Input value={draft.registeredAddress} disabled className="h-9 bg-muted/50 text-muted-foreground" />
              </EditFieldBox>
              <EditFieldBox label="经营地址" tag="人工校正">
                <Input
                  placeholder="请输入经营地址，如与注册地址一致可填“同注册地址”"
                  value={draft.businessAddress}
                  onChange={(e) => setDraft((prev) => ({ ...prev, businessAddress: e.target.value }))}
                  className="h-9"
                />
              </EditFieldBox>

              <EditFieldBox label="资料更新时间" tag="系统记录">
                <Input value={dataUpdatedAt} disabled className="h-9 bg-muted/50 font-mono text-muted-foreground" />
              </EditFieldBox>

              <div className="sm:col-span-3">
                <EditFieldBox label="经营范围 / 企业简介" tag="人工校正">
                  <Textarea
                    placeholder="请输入经营范围或企业简介"
                    value={draft.businessScope}
                    onChange={(e) => setDraft((prev) => ({ ...prev, businessScope: e.target.value }))}
                    className="min-h-[80px] resize-none"
                  />
                </EditFieldBox>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FieldBox label="客户主体名称" tag="工商回显">{companyName}</FieldBox>
              <FieldBox label="统一社会信用代码" tag="工商回显"><span className="font-mono">{creditCode || "—"}</span></FieldBox>
              <FieldBox label="企业状态" tag="人工校正">
                {companyStatus ? (
                  <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />{companyStatus}
                  </Badge>
                ) : "—"}
              </FieldBox>

              <FieldBox label="法人代表" tag="工商回显">{legalRepresentative || "—"}</FieldBox>
              <FieldBox label="企业类型" tag="人工校正">{companyType || "—"}</FieldBox>
              <FieldBox label="注册资本" tag="工商回显">{registeredCapital || "—"}</FieldBox>

              <FieldBox label="所属行业" tag="人工校正">{industry || "—"}</FieldBox>
              <FieldBox label="SOP 行业组" tag="人工校正">{sopIndustryGroup || "—"}</FieldBox>
              <FieldBox label="行业梯队" tag="人工校正">{industryTier || "—"}</FieldBox>

              <FieldBox label="员工规模" tag="人工校正">{employeeScale || "—"}</FieldBox>
              <FieldBox label="注册地址" tag="工商回显">{registeredAddress || "—"}</FieldBox>
              <FieldBox label="经营地址" tag="人工校正">{businessAddress || "—"}</FieldBox>

              <FieldBox label="资料更新时间" tag="系统记录"><span className="font-mono">{dataUpdatedAt}</span></FieldBox>

              <div className="sm:col-span-3">
                <FieldBox label="经营范围 / 企业简介" tag="人工校正">
                  <p className="text-sm font-normal leading-relaxed text-foreground">{businessScope || "—"}</p>
                </FieldBox>
              </div>
            </div>
          )}
        </div>

        {/* ── 财务信息 ──────────────────────────────── */}
        <div>
          <SectionTitle>财务信息</SectionTitle>
          {editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>开户银行 <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="请输入开户银行"
                  value={draft.bankName}
                  onChange={(e) => setDraft((prev) => ({ ...prev, bankName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>银行账户 <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="请输入银行账户"
                  value={formatBankAccount(draft.bankAccount)}
                  onChange={(e) => handleBankAccountChange(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>开票电话</Label>
                <Input
                  placeholder="请输入开票电话"
                  value={draft.billingPhone}
                  onChange={(e) => setDraft((prev) => ({ ...prev, billingPhone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>开票地址</Label>
                <Input
                  placeholder="请输入开票地址"
                  value={draft.billingAddress}
                  onChange={(e) => setDraft((prev) => ({ ...prev, billingAddress: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <DescTable
              rows={[
                [
                  { label: "开户银行", value: bankName || "—" },
                  { label: "银行账户", value: bankAccount ? formatBankAccount(bankAccount) : "—", mono: true },
                ],
                [
                  { label: "开票电话", value: billingPhone || "—" },
                  { label: "开票地址", value: billingAddress || "—" },
                ],
              ]}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

function AccountInfoPage() {
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [bindAccountOpen, setBindAccountOpen] = useState(false);
  const [detailAccount, setDetailAccount] = useState<typeof starAccounts[0] | null>(null);

  // User profile data
  const [contactData, setContactData] = useState({
    loginAccount: "173****451",
    maskedPhone: "173****451",
    phone: "17388884451",
    contactName: "李明",
    contactPhone: "17388884451",
    contactEmail: "shu.yan@yunlan.com",
    maskedEmail: "shu****.yan@yunlan.com",
    role: "客户管理员",
    status: "正常",
    lastLoginTime: "2026-07-15 14:32",
  });

  // Mask phone helper
  const maskPhone = (phone: string) => {
    if (phone.length < 7) return phone;
    return phone.slice(0, 3) + "****" + phone.slice(-3);
  };

  return (
    <div className="w-full space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">我的账号信息</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看和管理当前客户主体信息、登录账号信息及已绑定账户</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setBindAccountOpen(true)} className="gap-2">
            <Hash className="h-4 w-4" />绑定账户
          </Button>
          <Button onClick={() => setAddAccountOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />新增账户
          </Button>
        </div>
      </div>

      {/* ── Module 1: Business & Financial Info ───────────── */}
      <EntityInfoCard />

      {/* ── Module 2: Account & Contact Info ─────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />账号与联系人信息
              </CardTitle>
              <CardDescription>
                该信息用于登录米播充值平台客户端、接收充值流程通知及账号安全验证。
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setEditContactOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />修改个人信息
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setChangePwdOpen(true)}>
                <Lock className="h-3.5 w-3.5" />修改密码
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DescTable
            rows={[
              [
                { label: "登录账号", value: contactData.loginAccount, mono: true },
                { label: "绑定手机号", value: contactData.maskedPhone },
              ],
              [
                { label: "联系人姓名", value: contactData.contactName },
                { label: "联系人电话", value: maskPhone(contactData.contactPhone) },
              ],
              [
                { label: "联系人邮箱", value: contactData.maskedEmail },
                { label: "当前账号角色", value: contactData.role },
              ],
              [
                { label: "账号状态", value: <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700"><CheckCircle2 className="h-3 w-3" />{contactData.status}</Badge> },
                { label: "最近登录时间", value: contactData.lastLoginTime },
              ],
              [
                { label: "密码", value: "********", mono: true },
                { label: "——", value: "——" },
              ],
            ]}
          />
        </CardContent>
      </Card>

      {/* ── Module 3: Bound Accounts ─────────────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />已绑定账户
              </CardTitle>
              <CardDescription>展示当前客户主体下已绑定的星图账户，仅支持查看，不支持编辑或删除。</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setBindAccountOpen(true)}>
                <Hash className="h-3.5 w-3.5" />绑定账户
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddAccountOpen(true)}>
                <Plus className="h-3.5 w-3.5" />新增账户
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {starAccounts.map((a) => (
            <div key={a.accountId} className="rounded-xl border border-border/60 bg-card p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className="h-4 gap-0.5 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700">星图</Badge>
                  <span className="text-sm font-semibold text-foreground">{a.name}</span>
                  <Badge className={`h-4 px-1 text-[10px] ${accountTypeClass[a.accountType] ?? ""}`}>{a.accountType}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary" onClick={() => setDetailAccount(a)}>
                  <Eye className="h-3 w-3" />查看详情
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs">
                <div><span className="text-muted-foreground">账户 ID：</span><span className="font-mono text-foreground">{a.accountId}</span></div>
                <div><span className="text-muted-foreground">主体：</span><span className="text-foreground">{a.subject}</span></div>
                <div><span className="text-muted-foreground">授权：</span><Badge className={`h-4 px-1 text-[10px] ${statusConfig[a.authStatus] ?? ""}`}>{a.authStatus}</Badge></div>
                <div><span className="text-muted-foreground">状态：</span><Badge className={`h-4 gap-0.5 px-1 text-[10px] ${statusConfig[a.status] ?? ""}`}><CheckCircle2 className="h-2.5 w-2.5" />{a.status}</Badge></div>
              </div>
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/30 text-xs">
                <span><span className="text-muted-foreground">余额：</span><span className="font-bold text-foreground">{a.balance}</span></span>
                <span className="text-emerald-600"><span className="text-muted-foreground">本月充值：</span>{a.monthlyRecharge}</span>
                <span className="text-amber-600"><span className="text-muted-foreground">本月消耗：</span>{a.monthlySpend}</span>
                <span className="text-muted-foreground ml-auto">更新：{a.updatedAt}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ═══════════════ Modals ═══════════════ */}

      {/* Edit Contact Info — Module 2 */}
      {editContactOpen && (
        <EditContactModal
          open={editContactOpen}
          onOpenChange={setEditContactOpen}
          contactData={contactData}
          onSubmit={(newPhone) => {
            setContactData(prev => ({
              ...prev,
              phone: newPhone,
              maskedPhone: maskPhone(newPhone),
            }));
            toast.success("绑定手机号已更新");
          }}
        />
      )}

      {/* Change Password — Module 2 */}
      {changePwdOpen && <ChangePasswordModal open={changePwdOpen} onOpenChange={setChangePwdOpen} />}

      {/* Account Detail */}
      {detailAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailAccount(null)} />
          <div className="relative z-10 w-full max-w-[560px] rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">星图账户详情</h2>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDetailAccount(null)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto space-y-4 px-6 py-5">
              <div className="rounded-xl border border-border/60 p-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">账户基础信息</h4>
                <InfoCell label="平台" value="星图" />
                <InfoCell label="账户名称" value={detailAccount.name} />
                <div className="flex items-center border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground shrink-0 py-2.5 w-[120px]">账户类型</span>
                  <Badge className={`ml-3 h-4 px-1 text-[10px] ${accountTypeClass[detailAccount.accountType] ?? ""}`}>{detailAccount.accountType}</Badge>
                </div>
                <InfoCell label="星图账户 ID" value={detailAccount.accountId} mono />
                <InfoCell label="账户主体" value={detailAccount.subject} />
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">授权信息</h4>
                <div className="flex items-center border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground shrink-0 py-2.5 w-[120px]">授权状态</span>
                  <Badge className={`ml-3 gap-1 text-xs ${statusConfig[detailAccount.authStatus] ?? ""}`}><CheckCircle2 className="h-3 w-3" />{detailAccount.authStatus}</Badge>
                </div>
                <InfoCell label="授权时间" value={detailAccount.authTime} />
                <InfoCell label="授权到期时间" value={detailAccount.authExpire} />
                <InfoCell label="授权主体" value={detailAccount.subject} />
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">资金信息</h4>
                <InfoCell label="当前余额" value={detailAccount.balance} />
                <InfoCell label="可用余额" value={detailAccount.available} />
                <InfoCell label="冻结金额" value={detailAccount.frozen} />
                <InfoCell label="本月充值" value={detailAccount.monthlyRecharge} />
                <InfoCell label="本月消耗" value={detailAccount.monthlySpend} />
                <InfoCell label="最近更新时间" value={detailAccount.updatedAt} />
              </div>
            </div>
            <div className="border-t border-border px-6 py-4">
              <Button className="w-full" onClick={() => setDetailAccount(null)}>关闭</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      <AddAccountModal open={addAccountOpen} onOpenChange={setAddAccountOpen} />
      <BindAccountModal open={bindAccountOpen} onOpenChange={setBindAccountOpen} />
    </div>
  );
}

// ── EditContactModal ────────────────────────────────────────────────────────

function EditContactModal({
  open,
  onOpenChange,
  contactData,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactData: {
    maskedPhone: string;
    phone: string;
  };
  onSubmit: (newPhone: string) => void;
}) {
  const [newPhone, setNewPhone] = useState("");

  // SMS verification
  const [smsCode, setSmsCode] = useState("");
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [smsSent, setSmsSent] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Validate phone number
  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return null;
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) return "请输入正确的中国大陆手机号";
    if (phone.trim() === contactData.phone) return "新手机号不能与当前绑定手机号相同";
    return null;
  };

  // Derived
  const phoneChanged = newPhone.trim() !== "";
  const canSendSms = phoneChanged && !validatePhone(newPhone) && smsCountdown === 0;
  const isFormValid = phoneChanged && !validatePhone(newPhone) && smsVerified;

  // SMS countdown timer
  const startCountdown = () => {
    setSmsCountdown(60);
    const interval = setInterval(() => {
      setSmsCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendSms = () => {
    const err = validatePhone(newPhone);
    if (err) {
      setPhoneError(err);
      toast.error(err);
      return;
    }
    setPhoneError("");
    setSmsSent(true);
    setSmsVerified(false);
    setSmsCode("");
    startCountdown();
    toast.success(`验证码已发送至新绑定手机号：${newPhone.slice(0, 3)}****${newPhone.slice(-4)}，有效期 5 分钟。`);
  };

  const handleVerifySms = (code: string) => {
    setSmsCode(code);
    if (code.length === 6 && code === "123456") {
      setSmsVerified(true);
    } else if (code.length === 6 && code !== "123456") {
      setSmsVerified(false);
      toast.error("验证码错误，请重新输入");
      setSmsCode("");
    } else {
      setSmsVerified(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setNewPhone(digits);
    setPhoneError("");
    // Reset SMS state when phone changes
    if (digits !== newPhone) {
      setSmsCode("");
      setSmsVerified(false);
      setSmsSent(false);
    }
  };

  const handleSubmit = () => {
    if (!isFormValid) return;
    onSubmit(newPhone.trim());
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[480px] flex-col rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold text-foreground">修改个人信息</h2>
            <p className="text-xs text-muted-foreground">填写新绑定手机号并完成短信验证码验证，验证通过后立即生效，无需米播审核。</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-5 px-6 py-5">
          {/* Current phone — readonly */}
          <div className="space-y-1.5">
            <Label>当前绑定手机号</Label>
            <Input value={contactData.maskedPhone} disabled className="bg-muted/50 text-muted-foreground" />
          </div>

          {/* New phone */}
          <div className="space-y-1.5">
            <Label>新绑定手机号 <span className="text-destructive">*</span></Label>
            <Input
              type="tel"
              placeholder="请输入新的绑定手机号"
              value={newPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={11}
              className={`h-10 ${phoneError ? "border-destructive" : ""}`}
            />
            {phoneError && (
              <p className="text-[11px] text-destructive">{phoneError}</p>
            )}
          </div>

          {/* SMS verification — only when new phone is filled */}
          {phoneChanged && (
            <div className="space-y-1.5">
              <Label>验证码 <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="请输入6位验证码"
                    value={smsCode}
                    onChange={(e) => handleVerifySms(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    disabled={smsVerified}
                    className={`h-10 font-mono tracking-widest ${
                      smsVerified ? "border-emerald-300 bg-emerald-50 text-emerald-700 pr-8" : ""
                    }`}
                  />
                  {smsVerified && (
                    <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <Button
                  variant="outline"
                  disabled={!canSendSms}
                  onClick={handleSendSms}
                  className="h-10 shrink-0 text-xs w-[120px]"
                >
                  {smsCountdown > 0 ? `${smsCountdown}s 后重新获取` : "获取验证码"}
                </Button>
              </div>
              {smsSent && (
                <p className="text-[11px] text-muted-foreground">
                  验证码已发送至新绑定手机号：{newPhone.slice(0, 3)}****{newPhone.slice(-4)}
                </p>
              )}
              {smsVerified && (
                <p className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />验证通过，确认后立即生效
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>取消</Button>
          <Button className="flex-1" disabled={!isFormValid} onClick={handleSubmit}>确认修改</Button>
        </div>
      </div>
    </div>
  );
}

// ── ChangePasswordModal ──────────────────────────────────────────────────────

function ChangePasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const isValid = currentPwd.trim() !== "" && newPwd.trim().length >= 8 && newPwd === confirmPwd;

  const handleSubmit = () => {
    if (!isValid) return;
    toast.success("登录密码已修改成功，仅影响米播充值平台客户端登录，不影响星图账户授权及绑定信息。");
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-[520px] rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">修改密码</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              修改的是米播充值平台客户端的登录密码，不影响绑定手机号、星图账户授权状态或联系人信息。
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-[11px] text-muted-foreground">密码需为 8-20 位，包含字母和数字，建议包含特殊字符。</p>
          <div className="space-y-1.5">
            <Label>当前密码 <span className="text-destructive">*</span></Label>
            <Input type="password" placeholder="请输入当前登录密码" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>新密码 <span className="text-destructive">*</span></Label>
            <Input type="password" placeholder="请输入新密码（8-20位，含字母和数字）" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>确认新密码 <span className="text-destructive">*</span></Label>
            <Input type="password" placeholder="请再次输入新密码" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
            {confirmPwd && newPwd !== confirmPwd && (
              <p className="text-[11px] text-destructive">两次输入的密码不一致</p>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>取消</Button>
            <Button className="flex-1" disabled={!isValid} onClick={handleSubmit}>确认修改</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
