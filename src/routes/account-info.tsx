import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2, User, Shield, Plus, CheckCircle2, Eye, Pencil, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AddAccountModal } from "@/components/AddAccountModal";

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

// Row of a 4-column descriptor grid: label | value | label | value.
// Column widths locked to 15% / 35% / 15% / 35% via colgroup on the wrapping <table>.
type Cell = {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  colSpan?: 1 | 3; // 3 = value spans across the remaining label+value columns
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
                <>
                  <th
                    key={`${ri}-${ci}-l`}
                    className="border-r border-border/60 bg-muted/40 px-4 py-3 text-left align-middle text-xs font-normal text-muted-foreground"
                  >
                    {cell.label}
                  </th>
                  <td
                    key={`${ri}-${ci}-v`}
                    colSpan={cell.colSpan === 3 ? 3 : 1}
                    className={`border-r border-border/60 bg-background px-4 py-3 align-middle text-sm font-medium text-foreground last:border-r-0 ${cell.mono ? "font-mono" : ""}`}
                  >
                    {cell.value}
                  </td>
                </>
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

// Kept for the account-detail drawer at the bottom of this file.
function InfoCell({ label, value, mono }: { label: string; value: string | React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 py-2.5 w-[110px]">{label}</span>
      <span className={`text-xs font-medium text-foreground py-2.5 pl-3 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

function AccountInfoPage() {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [detailAccount, setDetailAccount] = useState<typeof starAccounts[0] | null>(null);

  return (
    <div className="w-full space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">我的账号信息</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看和管理当前客户主体信息、登录账号信息及已绑定账户</p>
        </div>
        <Button onClick={() => setAddAccountOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />新增账户
        </Button>
      </div>

      {/* ── Module 1: Customer Entity Info ───────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />客户主体信息
              </CardTitle>
              <CardDescription>展示当前客户在米播系统中的主体资料、开票信息及账户基础信息。</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditProfileOpen(true)}>
              <Pencil className="h-3.5 w-3.5" />编辑
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <SectionTitle>基本信息</SectionTitle>
            <DescTable
              rows={[
                [
                  { label: "企业名称", value: "上海云岚科技有限公司" },
                  { label: "企业简称", value: "云岚科技" },
                ],
                [
                  { label: "英文名称", value: "Shanghai Yunlan Technology Co., Ltd." },
                  { label: "统一社会信用代码", value: "91310115MACJ6K1C8A", mono: true },
                ],
                [
                  { label: "注册号", value: "310115004861028", mono: true },
                  { label: "组织机构代码", value: "MACJ6K1C-8", mono: true },
                ],
                [
                  { label: "纳税人识别号", value: "91310115MACJ6K1C8A", mono: true },
                  {
                    label: "企业状态",
                    value: (
                      <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />在营（开业）
                      </Badge>
                    ),
                  },
                ],
              ]}
            />
          </div>
          <div>
            <SectionTitle>发票 / 支票信息</SectionTitle>
            <DescTable
              rows={[
                [
                  { label: "发票抬头", value: "上海云岚科技有限公司" },
                  { label: "纳税人类型", value: "增值税一般纳税人" },
                ],
                [
                  { label: "发票类型", value: "增值税专用发票" },
                  { label: "开户银行", value: "招商银行股份有限公司上海张江支行" },
                ],
                [
                  { label: "银行账户", value: "6225 **** **** 0001", mono: true },
                  { label: "开票电话", value: "021-58886666" },
                ],
                [
                  { label: "开票地址", value: "上海市浦东新区张江高科技园区科苑路 88 号" },
                  { label: "备注", value: "默认开票信息" },
                ],
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Module 2: Login Account Info ─────────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />登录账号信息
              </CardTitle>
              <CardDescription>该信息用于登录米播充值平台客户端。</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setChangePwdOpen(true)}>
              <Lock className="h-3.5 w-3.5" />修改密码
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DescTable
            rows={[
              [
                { label: "登录账号", value: "yunlan_admin", mono: true },
                { label: "当前账号角色", value: "客户管理员" },
              ],
              [
                { label: "绑定手机号", value: "173****451" },
                { label: "最近登录时间", value: "2026-07-15 14:32" },
              ],
              [
                { label: "登录邮箱", value: "shu****.yan@yunlan.com" },
                { label: "密码", value: "********", mono: true },
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
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddAccountOpen(true)}>
              <Plus className="h-3.5 w-3.5" />新增账户
            </Button>
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

      {/* Edit Customer Profile */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditProfileOpen(false)} />
          <div className="relative z-10 w-full max-w-[520px] rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">编辑客户主体信息</h2>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditProfileOpen(false)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto space-y-4 px-6 py-5">
              <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                主体认证信息如需修改，请联系米播商务处理。
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>企业名称</Label><Input value="上海云岚科技有限公司" disabled className="bg-muted/50" /></div>
                <div className="space-y-1.5"><Label>统一社会信用代码</Label><Input value="91310115MACJ6K1C8A" disabled className="bg-muted/50" /></div>
                <div className="space-y-1.5"><Label>企业简称</Label><Input defaultValue="云岚科技" /></div>
                <div className="space-y-1.5"><Label>英文名称</Label><Input defaultValue="Shanghai Yunlan Technology Co., Ltd." /></div>
                <div className="space-y-1.5">
                  <Label>纳税人类型</Label>
                  <Select defaultValue="general"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">增值税一般纳税人</SelectItem><SelectItem value="small">小规模纳税人</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-1.5">
                  <Label>发票类型</Label>
                  <Select defaultValue="special"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="special">增值税专用发票</SelectItem><SelectItem value="normal">增值税普通发票</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-1.5"><Label>开户银行</Label><Input defaultValue="招商银行股份有限公司上海张江支行" /></div>
                <div className="space-y-1.5"><Label>银行账户</Label><Input defaultValue="6225888899990001" /></div>
                <div className="space-y-1.5"><Label>开票电话</Label><Input defaultValue="021-58886666" /></div>
                <div className="space-y-1.5 col-span-2"><Label>开票地址</Label><Input defaultValue="上海市浦东新区张江高科技园区科苑路 88 号" /></div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditProfileOpen(false)}>取消</Button>
                <Button className="flex-1" onClick={() => setEditProfileOpen(false)}>保存修改</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password */}
      {changePwdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setChangePwdOpen(false)} />
          <div className="relative z-10 w-full max-w-[520px] rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">修改密码</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">修改的是米播充值平台客户端的登录密码，不会影响星图账户、平台开户信息或授权状态。</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setChangePwdOpen(false)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </Button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-[11px] text-muted-foreground">密码需为 8-20 位，包含字母和数字，建议包含特殊字符。</p>
              <div className="space-y-1.5"><Label>当前密码 <span className="text-destructive">*</span></Label><Input type="password" placeholder="请输入当前登录密码" /></div>
              <div className="space-y-1.5"><Label>新密码 <span className="text-destructive">*</span></Label><Input type="password" placeholder="请输入新密码" /></div>
              <div className="space-y-1.5"><Label>确认新密码 <span className="text-destructive">*</span></Label><Input type="password" placeholder="请再次输入新密码" /></div>
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setChangePwdOpen(false)}>取消</Button>
                <Button className="flex-1" onClick={() => setChangePwdOpen(false)}>确认修改</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Add Account Modal — reused from workbench */}
      <AddAccountModal open={addAccountOpen} onOpenChange={setAddAccountOpen} />
    </div>
  );
}
