"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { ClientOnly } from "@/components/ClientOnly";

export type SpecialPaymentTaskInfo = {
  id: string;
  account: string;
  accountId: string;
  subject: string;
  amount: string;
  payableAmount: string;
  discount: string;
  rechargeType: "special";
  node: string;
  step: number;
  totalSteps: number;
  customerName?: string;
  paymentReceipt?: string;
  paymentStatus?: string;
  errorReason?: string;
  errorDescription?: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: SpecialPaymentTaskInfo | null;
}

export function VoucherUploadModalLazy(props: Props) {
  const [Modal, setModal] = useState<React.ComponentType<Props> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("VoucherUploadModalLazy: starting dynamic import");
    import("./VoucherUploadModal")
      .then((mod) => {
        // eslint-disable-next-line no-console
        console.log("VoucherUploadModalLazy: loaded module", Object.keys(mod));
        setModal(() => mod.VoucherUploadModal);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to load VoucherUploadModal:", err);
      });
  }, []);

  return (
    <ClientOnly>
      {Modal ? <Modal {...props} /> : null}
    </ClientOnly>
  );
}
