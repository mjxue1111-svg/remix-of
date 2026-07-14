import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { IdentityType } from "@/lib/identity";

interface ActiveIdentityState {
  identity: IdentityType | null;
  orgId: string | null;
  orgName: string;
  setIdentity: (i: IdentityType, orgId: string | null, orgName: string) => void;
  clearIdentity: () => void;
}

const KEY = "mxy.activeIdentity";

const Ctx = createContext<ActiveIdentityState | null>(null);

type Persisted = { identity: IdentityType | null; orgId: string | null; orgName: string };

export function ActiveIdentityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>({
    identity: null,
    orgId: null,
    orgName: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<ActiveIdentityState>(
    () => ({
      ...state,
      setIdentity: (identity, orgId, orgName) => {
        const next = { identity, orgId, orgName };
        setState(next);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      },
      clearIdentity: () => {
        const next: Persisted = { identity: null, orgId: null, orgName: "" };
        setState(next);
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
      },
    }),
    [state],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveIdentity() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useActiveIdentity must be used within ActiveIdentityProvider");
  return ctx;
}
