## 目标
基于当前 `src/components/UploadPaymentModal.tsx` 源码 + 之前 5 种模式的截图，产出一份**完整的还原规范文档**，作为你在本地 Semi UI 项目中重建该弹窗的唯一参考。

产物将保存为：`/mnt/documents/upload-payment-modal-spec.md`（可下载、可粘贴给同事），不改动项目源码。

## 文档结构（章节）

1. **概览**
   - 组件职责、5 种模式的业务语义（upload / supplement / reupload_pre / reupload_post / reupload_error）
   - Props 契约（`PaymentTaskInfo`、`UploadMode`、`errorReason`）

2. **模式差异矩阵（表格）**
   一张对照表，列出每种模式的：标题文案、副标题文案、是否显示异常条 / 风险警示条 / 重新上传原因 / 其他原因 / 确认勾选、上传区标签（"付款凭证" vs "新付款凭证"）、主按钮文案。

3. **组件结构（Header / Body / Footer / Success）**
   - 容器：宽 `max-w-[640px]`、`max-h-[90vh]`、`rounded-2xl`、`shadow-2xl`、`bg-card`、`border`
   - 遮罩：`bg-black/30 backdrop-blur-sm`
   - Header：`border-b`、`px-6 py-5`；标题 `text-lg font-bold`，副标题 `text-sm text-muted-foreground`；右上角 X 按钮
   - Task 摘要卡：`bg-sapphire-subtle`、`rounded-lg`、`border-border/60`、`p-3`、`mt-3`，2 列 grid，`text-xs`
   - Body：`px-6 py-5`、`space-y-4`
   - Footer：`border-t`、`px-6 py-4`、右对齐、`gap-3`

4. **字段清单（按渲染顺序，含 mode 可见性）**
   对每个字段给出：Label 文案、是否必填、控件类型 & 尺寸（`h-10` / `min-h-[60px]`）、placeholder、辅助说明、默认值来源（如 `payAmount = task.payableAmount`）、错误态样式。
   顺序：
   - (可选) 异常条 `reupload_error`
   - (可选) 风险警示条 `reupload_post`
   - (可选) 重新上传原因 Select `reupload_post`（6 个预设值列全）
   - (可选) 其他原因 Textarea `reupload_post && 原因=其他`
   - 付款凭证 / 新付款凭证 上传区
   - 付款金额（带 ¥ 前缀）
   - 付款主体 / 付款账户户名
   - 备注说明
   - (可选) 确认勾选 `reupload_post`

5. **设计 Token 一览（颜色 / 字号 / 间距 / 圆角 / 阴影）**
   - 主色（primary / 蓝）、Sapphire subtle（浅蓝底）
   - Badge 配色：常规充值 `border-blue-200 bg-blue-50 text-blue-700` + Wallet 图标；特批充值 `border-amber-200 bg-amber-50 text-amber-700` + Zap 图标
   - 异常条：`border-red-200 bg-red-50 text-red-600/700` + AlertTriangle
   - 风险条：`border-amber-200 bg-amber-50 text-amber-700` + Info
   - 成功页：`bg-emerald-100` + `text-emerald-600`
   - 字号：标题 18 / 主字段标签 14 / 辅助说明 11–12 / 摘要卡 12
   - 圆角：容器 16、卡片 8、上传区 8（虚线 `border-2 border-dashed`）
   - 间距：`space-y-4`、`gap-3`、`p-3` / `p-5` / `px-6 py-4|5`

6. **交互与校验规则**
   - `isFormValid` 完整逻辑：文件必选 + 金额非空 + 主体非空；`reupload_post` 追加：原因非空 + 若"其他"则说明非空 + 确认勾选
   - "其他原因"未填时输入框红边框 + 红色错误文案（"请填写重新上传的具体原因"）
   - 打开时字段初始化（payAmount ← task.payableAmount，payAccountName ← task.subject，其他清空）
   - ESC 关闭、点击遮罩关闭
   - 主按钮禁用态；文案按 mode 切换（提交重新上传 / 确认上传 / 提交凭证）
   - 提交后切到 success 步骤（`step === "success"`）：emerald 圆形勾图标 + "付款凭证已提交" + "返回看板"

7. **Semi UI 组件映射建议**
   一栏对照表，帮助你迁移：
   - shadcn `Dialog` → Semi `Modal`（自定义 header/footer）
   - `Select` → `Select` / `RadioGroup`
   - `Textarea` → `TextArea`
   - `Checkbox` → `Checkbox`
   - `Badge` → `Tag`
   - `Button variant=outline/default` → `Button type=tertiary/primary`
   - 上传虚线区 → `Upload` 的 `dragger`
   - 图标 `lucide-react` → `@douyinfe/semi-icons` 对应项（附映射：X → IconClose、AlertTriangle → IconAlertTriangle、Info → IconInfoCircle、Upload → IconUpload、FileText → IconFile、CheckCircle2 → IconTickCircle、Wallet → IconCreditCard、Zap → IconBolt）

8. **附录**
   - 5 种模式截图路径（`/mnt/documents/upload-modal/modal_*.png`）
   - 完整字段/文案的可复制中文文案清单

## 交付
- 文档：`/mnt/documents/upload-payment-modal-spec.md`
- 内嵌 5 张模式截图引用（`upload-modal/modal_*.png` 已存在）
- 完成后以 `<presentation-artifact>` 呈现，方便下载

## 约束
- 不修改项目源码
- 保留 `src/routes/dev-modals.tsx` 临时路由（等你确认还原完成后再让我删）
