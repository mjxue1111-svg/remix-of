import { createFileRoute } from "@tanstack/react-router";
import { UploadPaymentModal, type UploadMode } from "@/components/UploadPaymentModal";

const task = {
  id: "RC202607210001",
  rechargeType: "regular" as const,
  account: "星图账户 A · 北京米粒文化传媒",
  payableAmount: "¥ 128,000.00",
  subject: "北京米粒文化传媒有限公司",
};

function DevModals() {
  const mode = (new URLSearchParams(window.location.search).get("mode") || "upload") as UploadMode;
  return (
    <UploadPaymentModal open onOpenChange={() => {}} task={task} mode={mode} errorReason="付款金额与实付金额不一致" />
  );
}

export const Route = createFileRoute("/_dev-modals")({ component: DevModals });
