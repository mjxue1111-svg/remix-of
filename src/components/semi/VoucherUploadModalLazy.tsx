"use client";

import { lazy, Suspense } from "react";
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

const VoucherUploadModal = lazy(() => import("./VoucherUploadModal"));

export function VoucherUploadModalLazy(props: Props) {
  return (
    <ClientOnly fallback={null}>
      <Suspense fallback={null}>
        <VoucherUploadModal {...props} />
      </Suspense>
    </ClientOnly>
  );
}
