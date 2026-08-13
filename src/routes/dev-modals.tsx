import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { VoucherUploadModal, type SpecialPaymentTaskInfo } from "@/components/semi/VoucherUploadModal";
import { ClientOnly } from "@/components/ClientOnly";

const task: SpecialPaymentTaskInfo = {
  id: "RC202607210001",
  account: "星图账户 A · 北京米粒文化传媒",
  accountId: "ST-10086101",
  subject: "北京米粒文化传媒有限公司",
  amount: "¥100,000.00",
  payableAmount: "¥98,000.00",
  discount: "98 折",
  rechargeType: "special",
  node: "sp_payment_pending",
  step: 5,
  totalSteps: 5,
  customerName: "北京米粒文化传媒有限公司",
  paymentStatus: "error",
  errorReason: "付款金额与应付金额不一致、凭证信息不清晰",
  errorDescription: "请核对付款金额与应付金额是否一致，并重新上传清晰的付款凭证。",
};

function DevModals() {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-6">
      <button
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        onClick={() => setOpen(true)}
      >
        打开 VoucherUploadModal
      </button>
      <VoucherUploadModal open={open} onOpenChange={setOpen} task={task} />
    </div>
  );
}

export const Route = createFileRoute("/dev-modals")({ component: DevModals });
