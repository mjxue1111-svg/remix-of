"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Button,
  Input,
  TextArea,
  Checkbox,
  Tag,
  Upload,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";
import {
  IconClose,
  IconTickCircle,
  IconFile,
  IconUpload,
  IconAlertTriangle,
  IconInfoCircle,
  IconCopy,
  IconHome,
  IconBolt,
} from "@douyinfe/semi-icons";
import { Landmark } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SpecialPaymentTaskInfo {
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
}

interface VoucherUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: SpecialPaymentTaskInfo | null;
}

// ── Bank Info ──────────────────────────────────────────────────────────────

const bankInfo = {
  companyName: "北京米播科技有限公司",
  bankName: "招商银行股份有限公司北京自贸试验区生命科学园支行",
  accountNumber: "110962262110001",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ── Component ──────────────────────────────────────────────────────────────

export function VoucherUploadModal({ open, onOpenChange, task }: VoucherUploadModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [payAccountName, setPayAccountName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const isResubmit = task?.paymentStatus === "error";
  const remarkText = task ? `${task.id} / ${task.subject}` : "";

  const fullPaymentText = [
    `应付金额：${task?.payableAmount ?? "0.00"}`,
    `收款公司名称：${bankInfo.companyName}`,
    `开户行：${bankInfo.bankName}`,
    `银行账号：${bankInfo.accountNumber}`,
    `打款备注：${remarkText}`,
  ].join("\n");

  const hasUnsavedContent =
    !draftSaved &&
    (receiptFile !== null ||
      payAccountName !== (task?.subject ?? "") ||
      remarks.trim() !== "");

  const resetState = useCallback(() => {
    setStep("form");
    setReceiptFile(null);
    setPayAccountName(task?.subject ?? "");
    setRemarks("");
    setAcknowledged(false);
    setCopiedAll(false);
    setDraftSaved(false);
  }, [task?.subject, task?.id]);

  useEffect(() => {
    if (open) resetState();
  }, [open, resetState]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleRequestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, hasUnsavedContent]);

  const handleRequestClose = () => {
    if (hasUnsavedContent) {
      Modal.confirm({
        title: "确认离开？",
        content: "当前付款凭证信息尚未提交，离开后未保存的内容将丢失。",
        okText: "放弃并关闭",
        cancelText: "继续编辑",
        onOk: () => onOpenChange(false),
        centered: true,
      });
    } else {
      onOpenChange(false);
    }
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullPaymentText).then(
      () => {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      },
      () => Toast.error("复制失败，请手动复制"),
    );
  };

  const canSubmit = receiptFile !== null && payAccountName.trim() !== "" && acknowledged;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStep("success");
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    Toast.success("付款凭证草稿已保存");
  };

  const handleFileSelect = (props: any) => {
    const file = props.file as File;
    if (!file) return false;
    if (file.size > MAX_FILE_SIZE) {
      Toast.error("文件大小超过 10MB，请重新选择");
      return false;
    }
    setReceiptFile(file);
    return false; // prevent actual upload
  };

  if (!open || !task) return null;

  const primary = "var(--color-primary)";
  const sapphireSubtle = "var(--color-sapphire-subtle)";
  const sapphireLight = "var(--color-sapphire-light)";
  const sapphire = "var(--color-sapphire)";

  const renderForm = () => (
    <div style={{ padding: "20px 24px", overflowY: "auto" }} className="space-y-5">
      {/* Order Summary Card */}
      <div
        className="rounded-xl border bg-card shadow-sm"
        style={{ borderColor: "var(--color-border)", borderRadius: 12, overflow: "hidden" }}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Typography.Text strong style={{ fontSize: 14 }}>
            订单摘要
          </Typography.Text>
        </div>

        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold">{task.id}</span>
            <Tag color="amber" size="small" type="light" className="gap-1">
              <IconBolt size="small" />
              特批充值
            </Tag>
          </div>
          <Tag color="blue" size="small" type="light">
            待提交付款凭证
          </Tag>
        </div>

        <div className="grid grid-cols-2 divide-x" style={{ borderColor: "var(--color-border)" }}>
          <div className="space-y-2 px-4 py-3">
            <Typography.Text strong style={{ fontSize: 12 }}>
              客户信息
            </Typography.Text>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>客户名称</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{task.customerName ?? task.subject}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>账户主体</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{task.subject}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 px-4 py-3">
            <Typography.Text strong style={{ fontSize: 12 }}>
              账户信息
            </Typography.Text>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>账户名称</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{task.account}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>账户 ID</span>
                <Tag size="small" type="light" style={{ fontFamily: "monospace", fontSize: 10 }}>
                  {task.accountId}
                </Tag>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-b-xl border-t-2 px-4 py-3"
          style={{
            borderColor: sapphireLight,
            backgroundColor: "rgba(239, 246, 255, 0.4)",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <div className="flex items-center gap-4">
            <div style={{ fontSize: 12 }}>
              <span style={{ color: "var(--color-muted-foreground)" }}>客户充值金额 </span>
              <span style={{ fontWeight: 500 }}>{task.amount}</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: "var(--color-muted-foreground)" }}>折扣 </span>
              <Tag color="green" size="small" type="light">
                98 折
              </Tag>
            </div>
          </div>
          <div className="text-right">
            <p style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>客户应付金额</p>
            <p
              className="text-xl font-bold"
              style={{ color: primary, fontSize: 20, fontWeight: 700 }}
            >
              {task.payableAmount}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Info Card */}
      <div
        className="rounded-xl p-5"
        style={{
          border: `2px solid ${sapphireLight}`,
          borderRadius: 12,
          background: "linear-gradient(135deg, var(--color-sapphire-subtle) 0%, #ffffff 50%, rgba(239, 246, 255, 0.3) 100%)",
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: primary }}
            >
              <Landmark className="h-3.5 w-3.5 text-white" />
            </div>
            <Typography.Text strong style={{ fontSize: 14 }}>
              付款信息
            </Typography.Text>
          </div>
          <Button
            theme="borderless"
            type="tertiary"
            style={{ color: primary, border: `1px solid ${primary}40`, fontSize: 12 }}
            icon={<IconCopy size="small" />}
            onClick={handleCopyAll}
          >
            {copiedAll ? "已复制" : "一键复制付款信息"}
          </Button>
        </div>

        <div className="mb-4">
          <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>应付金额</p>
          <span className="text-3xl font-bold" style={{ color: primary, fontSize: 30 }}>
            {task.payableAmount}
          </span>
        </div>

        <div className="space-y-2.5">
          {[
            { label: "收款公司名称", value: bankInfo.companyName },
            { label: "开户行", value: bankInfo.bankName },
            { label: "银行账号", value: bankInfo.accountNumber },
            { label: "打款备注", value: remarkText },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg px-3 py-1.5"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
            >
              <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{item.label}</span>
              <p style={{ fontSize: 12, fontWeight: 500 }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "rgba(239, 246, 255, 0.8)" }}
        >
          <IconInfoCircle size="small" style={{ color: primary, marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 12, lineHeight: 1.6, color: sapphire }}>
            请使用应付金额完成对公转账，付款完成后上传付款凭证。
          </p>
        </div>
      </div>

      {/* Rejection Reason (re-submit only) */}
      {isResubmit && task.errorReason && (
        <div
          className="rounded-xl p-4"
          style={{ border: "1px solid #fecaca", backgroundColor: "rgba(254, 242, 242, 0.6)" }}
        >
          <Typography.Text
            strong
            className="mb-2 flex items-center gap-1.5"
            style={{ color: "#b91c1c", fontSize: 14, display: "flex" }}
          >
            <IconAlertTriangle size="small" />
            上次凭证未通过原因
          </Typography.Text>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {task.errorReason.split("、").map((r, i) => (
              <Tag key={i} color="red" size="small" type="light">
                {r.trim()}
              </Tag>
            ))}
          </div>
          {task.errorDescription && (
            <p style={{ fontSize: 12, color: "rgba(185, 28, 28, 0.8)" }}>{task.errorDescription}</p>
          )}
        </div>
      )}

      {/* Upload Payment Receipt */}
      <div className="space-y-4">
        <Typography.Text strong style={{ fontSize: 14 }}>
          上传付款凭证
        </Typography.Text>

        <div className="space-y-1.5">
          <label style={{ fontSize: 14, fontWeight: 500 }}>
            付款凭证 <span style={{ color: "var(--color-destructive)" }}>*</span>
          </label>
          <Upload
            action=""
            draggable
            beforeUpload={handleFileSelect}
            showUploadList={false}
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg px-4 py-6"
              style={{
                border: "2px dashed var(--color-border)",
                backgroundColor: "var(--color-muted)",
                transition: "all 0.2s",
              }}
            >
              {receiptFile ? (
                <div className="flex items-center gap-2" style={{ fontSize: 14, color: primary }}>
                  <IconFile size="small" />
                  {receiptFile.name}
                  <Button
                    theme="borderless"
                    type="tertiary"
                    size="small"
                    style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setReceiptFile(null);
                    }}
                  >
                    移除
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <IconUpload size="default" style={{ color: "var(--color-muted-foreground)" }} />
                  <p className="mt-1" style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                    点击或拖拽上传付款截图 / 银行回单
                  </p>
                  <p style={{ fontSize: 10, color: "var(--color-muted-foreground)" }}>
                    支持 JPG、PNG、PDF，单个文件不超过 10MB
                  </p>
                </div>
              )}
            </div>
          </Upload>
        </div>

        <div className="space-y-1.5">
          <label style={{ fontSize: 14, fontWeight: 500 }}>
            付款账户名称 <span style={{ color: "var(--color-destructive)" }}>*</span>
          </label>
          <Input
            value={payAccountName}
            onChange={(v) => setPayAccountName(v)}
            placeholder="请输入实际付款账户名称"
          />
        </div>

        <div className="space-y-1.5">
          <label style={{ fontSize: 14, fontWeight: 500 }}>客户付款金额</label>
          <Input value={task.payableAmount} disabled style={{ backgroundColor: "var(--color-muted)" }} />
          <p style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>系统自动带出，不可修改</p>
        </div>

        <div className="space-y-1.5">
          <label style={{ fontSize: 14, fontWeight: 500 }}>补充说明</label>
          <TextArea
            value={remarks}
            onChange={(v) => setRemarks(v)}
            placeholder="如付款主体、金额或凭证有特殊情况，请补充说明"
            rows={2}
            autosize
          />
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="flex items-start gap-2">
        <Checkbox
          checked={acknowledged}
          onChange={(e) => setAcknowledged(!!e.target.checked)}
          style={{ marginTop: 2 }}
        />
        <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
          我已确认付款金额、付款账户名称及上传的付款凭证真实有效。
        </span>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(236, 253, 245, 1)" }}
      >
        <IconTickCircle className="h-8 w-8" style={{ color: "#10b981" }} />
      </div>
      <h3 className="mt-4 text-lg font-semibold">付款凭证已提交</h3>
      <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
        米播财务将确认到账情况，确认后该订单将更新为已完成。
      </p>
      <Button
        className="mt-6"
        theme="solid"
        type="primary"
        onClick={() => onOpenChange(false)}
      >
        返回看板
      </Button>
    </div>
  );

  return (
    <Modal
      visible={open}
      width={640}
      centered
      maskClosable={false}
      footer={null}
      closable={false}
      bodyStyle={{ padding: 0 }}
      onCancel={handleRequestClose}
      title={
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <Typography.Title heading={5} style={{ margin: 0 }}>
              {isResubmit ? "重新提交付款凭证" : "提交付款凭证"}
            </Typography.Title>
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              该订单为特批充值，请在完成对公付款后上传付款凭证。米播财务确认到账后，该订单将更新为已完成。
            </p>
          </div>
          <Button
            theme="borderless"
            type="tertiary"
            size="small"
            icon={<IconClose size="small" />}
            onClick={handleRequestClose}
          />
        </div>
      }
    >
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        {step === "success" ? renderSuccess() : renderForm()}

        {step !== "success" && (
          <div
            className="flex items-center gap-2 border-t px-6 py-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Button theme="light" type="tertiary" className="flex-1" onClick={handleRequestClose}>
              取消
            </Button>
            <Button theme="light" type="tertiary" className="flex-1" onClick={handleSaveDraft}>
              保存草稿
            </Button>
            <Button
              theme="solid"
              type="primary"
              className="flex-1"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {isResubmit ? "重新提交付款凭证" : "提交付款凭证"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
