import type { LucideIcon } from "lucide-react";
import { Building2, Headset } from "lucide-react";

export type IdentityType = "client" | "agent";

export const IDENTITY_LABEL: Record<IdentityType, string> = {
  client: "客户",
  agent: "代理商",
};

export const IDENTITY_DESC: Record<IdentityType, string> = {
  client: "发起充值、上传付款凭证、查看充值进度与余额流水",
  agent: "审核充值申请、跟进付款确认、处理平台充值与账户划拨",
};

export const IDENTITY_ICON: Record<IdentityType, LucideIcon> = {
  client: Building2,
  agent: Headset,
};
