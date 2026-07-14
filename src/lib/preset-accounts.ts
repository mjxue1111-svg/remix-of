import type { IdentityType } from "@/lib/identity";

export interface PresetAccount {
  phone: string;
  password: string;
  identity: IdentityType;
  fullName: string;
}

/** 演示阶段使用的预设账号 — 后续接入后端鉴权时可移除 */
export const PRESET_ACCOUNTS: Record<IdentityType, PresetAccount> = {
  client: {
    phone: "13278883554",
    password: "2121",
    identity: "client",
    fullName: "示例客户",
  },
  agent: {
    phone: "11122223333",
    password: "2121",
    identity: "agent",
    fullName: "示例代理商",
  },
};

const SESSION_KEY = "mxy.mockSession";
const PWD_OVERRIDE_KEY = "mxy.mockPasswords";

export interface MockSession {
  phone: string;
  identity: IdentityType;
  fullName: string;
}

export function findPresetByPhone(phone: string): PresetAccount | null {
  const list = Object.values(PRESET_ACCOUNTS);
  return list.find((a) => a.phone === phone) ?? null;
}

function readOverrides(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PWD_OVERRIDE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getEffectivePassword(phone: string): string | null {
  const preset = findPresetByPhone(phone);
  if (!preset) return null;
  const overrides = readOverrides();
  return overrides[phone] ?? preset.password;
}

export function overridePassword(phone: string, newPassword: string) {
  const overrides = readOverrides();
  overrides[phone] = newPassword;
  localStorage.setItem(PWD_OVERRIDE_KEY, JSON.stringify(overrides));
}

export function setMockSession(s: MockSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function getMockSession(): MockSession | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as MockSession) : null;
  } catch {
    return null;
  }
}

export function clearMockSession() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
