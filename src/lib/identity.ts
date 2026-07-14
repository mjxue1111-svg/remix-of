import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Star,
  Wallet,
  Users,
  LineChart,
  ClipboardList,
  Target,
  Handshake,
  FolderKanban,
  ShoppingBag,
  FileText,
  UserCog,
  Coins,
} from "lucide-react";

export type IdentityType = "client" | "creator";

export const IDENTITY_LABEL: Record<IdentityType, string> = {
  client: "客户",
  creator: "达人",
};

export const IDENTITY_DESC: Record<IdentityType, string> = {
  client: "品牌客户 · 立项 / 项目进展 / 财务对账",
  creator: "达人个人 · 我的订单 / 合同 / 收益",
};

export const IDENTITY_ICON: Record<IdentityType, LucideIcon> = {
  client: Building2,
  creator: Star,
};

export type MenuKey =
  | "sales.leads"
  | "sales.opportunities"
  | "sales.customers"
  | "sales.projects"
  | "execution.selection"
  | "execution.workbench"
  | "execution.orders"
  | "execution.contracts"
  | "hr"
  | "finance";

export interface MenuItem {
  key: MenuKey;
  label: string;
  icon: LucideIcon;
  to: string;
  /** identity → 数据范围说明 */
  scopes: Partial<Record<IdentityType, string>>;
}

export interface MenuGroup {
  key: string;
  label: string;
  items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    key: "sales",
    label: "客户销售系统",
    items: [
      {
        key: "sales.projects",
        label: "立项管理",
        icon: ClipboardList,
        to: "/app/sales/projects",
        scopes: { client: "本客户立项" },
      },
    ],
  },
  {
    key: "execution",
    label: "项目执行管理",
    items: [
      {
        key: "execution.workbench",
        label: "客户项目工作台",
        icon: ClipboardList,
        to: "/app/execution/workbench",
        scopes: { client: "本客户项目" },
      },
      {
        key: "execution.orders",
        label: "达人订单管理",
        icon: ShoppingBag,
        to: "/app/execution/orders",
        scopes: { creator: "本人订单" },
      },
      {
        key: "execution.contracts",
        label: "达人合同管理",
        icon: FileText,
        to: "/app/execution/contracts",
        scopes: { creator: "本人合同" },
      },
    ],
  },
  {
    key: "finance",
    label: "财务管理",
    items: [
      {
        key: "finance",
        label: "财务管理",
        icon: Coins,
        to: "/app/finance",
        scopes: {
          client: "本客户财务",
          creator: "本人财务",
        },
      },
    ],
  },
];

// Keep unused icon imports referenced to avoid TS noUnusedLocals issues
void Target; void Handshake; void Users; void FolderKanban; void UserCog;

export function getVisibleMenuItems(identity: IdentityType): MenuItem[] {
  return MENU_GROUPS.flatMap((g) => g.items).filter(
    (item) => item.scopes[identity] !== undefined,
  );
}

export function getVisibleMenuGroups(identity: IdentityType): MenuGroup[] {
  return MENU_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.scopes[identity] !== undefined),
  })).filter((g) => g.items.length > 0);
}

export { LineChart, Wallet };
