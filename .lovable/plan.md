
# SpecialPaymentModal → Semi UI (VoucherUploadModal) 改造计划

## 一、组件总体结构

弹窗通过 `createPortal` 挂载到 `document.body`，包含两个并列层：主弹窗 + 二次确认弹窗（离开确认）。

```text
Portal
├── 主 Modal（z-50）
│   ├── Backdrop（点击关闭，触发未保存校验）
│   └── Card（max-w 640px, max-h 90vh, rounded-2xl, shadow-2xl）
│       ├── Header（标题 + 副标题 + 关闭按钮）
│       ├── Body（step=form | step=success）
│       └── Footer（step=form 时显示，三按钮 flex-1 等宽）
└── ConfirmDialog（z-60，未保存离开确认）
```

Semi UI 建议：使用 `Modal` 组件（`width={640}`, `centered`, `maskClosable={false}`，自定义 `title/footer`；关闭钩子 `onCancel` 内做未保存判断）。二次确认使用 `Modal.confirm` 或独立 `Modal`。

---

## 二、Props 与状态

**Props**
- `open: boolean`
- `onOpenChange(open): void`
- `task: SpecialPaymentTaskInfo | null`（含 id / account / accountId / subject / amount / payableAmount / discount / customerName / paymentStatus / errorReason / errorDescription）

**内部 state**
| state | 类型 | 说明 |
|---|---|---|
| `step` | `"form" \| "success"` | 表单态 / 成功态 |
| `receiptFile` | `File \| null` | 上传的凭证文件 |
| `payAccountName` | string | 默认 `task.subject` |
| `remarks` | string | 补充说明 |
| `acknowledged` | boolean | 确认声明 |
| `copiedAll` | boolean | 复制成功态，2s 自动复位 |
| `confirmCloseOpen` | boolean | 二次确认弹窗 |
| `draftSaved` | boolean | 已保存草稿标记 |

**派生变量**
- `isResubmit = task.paymentStatus === "error"`
- `remarkText = "${task.id} / ${task.subject}"`
- `fullPaymentText`：5 行组合文本（应付金额/收款公司/开户行/银行账号/打款备注）
- `hasUnsavedContent = !draftSaved && (receiptFile || payAccountName 变更 || remarks 非空)`
- `canSubmit = receiptFile && payAccountName.trim() && acknowledged`

**副作用**
- `open` 变化 → 重置所有 state（`payAccountName` 初始化为 `task.subject`）
- 监听 `Escape` → 走 `handleRequestClose`
- 点击遮罩 / 关闭按钮 / Esc → 若 `hasUnsavedContent` 打开二次确认，否则直接关闭

---

## 三、Body 分区规范

### 1. Header
- 布局：`flex justify-between`，下边框
- 内边距：`px-6 py-4`
- 标题：`text-lg font-semibold`；`isResubmit ? "重新提交付款凭证" : "提交付款凭证"`
- 副标题（`mt-0.5 text-xs text-muted-foreground`）：
  > 该订单为特批充值，请在完成对公付款后上传付款凭证。米播财务确认到账后，该订单将更新为已完成。
- 右侧关闭按钮：`Button variant="ghost" size="sm"` + `X` 图标

### 2. Body — 表单态（`space-y-5 px-6 py-5 overflow-y-auto`）

**(A) 订单摘要卡片** `rounded-xl border shadow-sm`
- Layer 1 顶部条：`ID`（等宽字体 bold）+ 「特批充值」amber Badge + 右侧「待提交付款凭证」blue Badge
- Layer 2 二栏分割（`grid-cols-2 divide-x`）
  - 客户信息：客户名称、账户主体
  - 账户信息：账户名称、账户 ID（灰色 Badge、等宽字体）
- Layer 3 底部金额条（`bg-sapphire-subtle/40 border-t-2 border-sapphire-light/60 rounded-b-xl`）
  - 左：客户充值金额 + 折扣（绿色 Badge「98 折」）
  - 右：客户应付金额（`text-xl font-bold text-primary`）

**(B) 付款信息卡片** `rounded-xl border-2 border-sapphire-light bg-gradient-to-br from-sapphire-subtle via-white to-blue-50/30 p-5`
- 顶部：图标（`bg-primary` 圆角方块 + `Landmark`）+ 「付款信息」标题 + 右侧「一键复制付款信息 / 已复制」按钮（outline，primary 色）
- 应付金额大字：`text-3xl font-bold text-primary`
- 四行信息卡（`bg-white/70 rounded-lg px-3 py-1.5`）：收款公司名称、开户行、银行账号、打款备注（值 = `${id} / ${subject}`）
- 底部蓝色提示条：`bg-blue-50/80 rounded-lg` + `Info` 图标 + "请使用应付金额完成对公转账，付款完成后上传付款凭证。"

**(C) 上次凭证未通过原因**（仅 `isResubmit && errorReason` 时展示）
- `rounded-xl border-red-200 bg-red-50/60 p-4`
- 标题红色 + `AlertTriangle`
- `errorReason.split("、")` 转成多个红色 Badge
- 详细描述 `text-xs text-red-600/80`

**(D) 上传付款凭证表单区**
- Section 标题：`text-sm font-semibold` 「上传付款凭证」
- 字段：
  1. 付款凭证 *（虚线上传框，`border-2 border-dashed rounded-lg`，点击/拖拽；accept `.jpg,.jpeg,.png,.pdf`，单文件 ≤ 10MB；已选状态显示文件名 + 移除按钮）
  2. 付款账户名称 *（Input，默认 `task.subject`，placeholder「请输入实际付款账户名称」）
  3. 客户付款金额（Input 只读 disabled，值 `task.payableAmount`，下方灰色小字「系统自动带出，不可修改」）
  4. 补充说明（Textarea，rows=2，placeholder「如付款主体、金额或凭证有特殊情况，请补充说明」）

**(E) 确认声明**
- `Checkbox` + 灰色小字：「我已确认付款金额、付款账户名称及上传的付款凭证真实有效。」

### 3. Body — 成功态
居中展示：绿色圆形勾图标 → 「付款凭证已提交」→ 「米播财务将确认到账情况，确认后该订单将更新为已完成。」→ 「返回看板」按钮。Footer 隐藏。

### 4. Footer（三按钮等宽 flex-1）
- 「取消」outline → `handleRequestClose`
- 「保存草稿」outline → `handleSaveDraft`（`draftSaved=true` + `toast.success("付款凭证草稿已保存")`）
- 「提交付款凭证 / 重新提交付款凭证」primary，`disabled={!canSubmit}`，带 `shadow-primary/20`

---

## 四、样式 Token（映射到 Semi）

| 原 token | 建议值 | Semi 用法 |
|---|---|---|
| `primary` | `#2563EB`（蓝） | `--semi-color-primary` 覆盖或用主题 |
| `sapphire-subtle` | `#EFF6FF` 极浅蓝 | 局部内联样式或 CSS 变量 |
| `sapphire-light` | `#93C5FD` | 边框/分割线 |
| `sapphire` | `#1E40AF` | 提示条文字 |
| `amber-*` | 特批标签 | `Tag color="amber"` |
| `emerald-*` | 折扣/成功 | `Tag color="green"` / `IconTickCircle` |
| `red-*` | 拒绝原因 | `Tag color="red"` / `Banner type="danger"` |
| 圆角 | 卡片 `rounded-xl(12)` / 弹窗 `rounded-2xl(16)` | `borderRadius` |
| 阴影 | 弹窗 `shadow-2xl`；主按钮 `shadow-lg` primary/20 | 内联 boxShadow |
| 间距 | Body `space-y-5`、卡内 `p-4/p-5`、字段 `space-y-1.5` | 保持一致 |
| 字号 | 标题 lg / 卡标题 sm / 值 xs / 元 [10-11px] | 内联 fontSize |

---

## 五、Semi UI 组件映射建议

| 原（shadcn） | Semi UI 替换 |
|---|---|
| `Dialog / createPortal` | `Modal`（`visible`, `onCancel`, `footer={null}`, `width={640}`, `centered`, `closeOnEsc={false}` 自己处理 Esc；或 `maskClosable={false}` + 自定义 mask 逻辑）|
| `Button` | `Button`（`theme="solid/light/borderless"`, `type="primary/tertiary"`）|
| `Input` | `Input` |
| `Textarea` | `TextArea`（`rows={2}`, `autosize`）|
| `Checkbox` | `Checkbox` |
| `Label` | 原生 `<label>` / `Form.Label` |
| `Badge` | `Tag`（`color`, `size="small"`, `type="light"`）|
| 上传虚线区 | `Upload`（`draggable`, `action=""`, `beforeUpload` 拦截并本地保存 File；自定义 children 复刻虚线卡）|
| `toast.success` | `Toast.success({ content })` |
| icons | `@douyinfe/semi-icons`（`IconClose`, `IconTickCircle`, `IconFile`, `IconUpload`, `IconAlertTriangle`, `IconInfoCircle`, `IconCopy`, `IconBank/IconHome`, `IconBolt`）— 缺失的用 lucide-react 混用 |
| 二次确认 | `Modal.confirm({ title:"确认离开？", content, okText:"放弃并关闭", cancelText:"继续编辑" })` |

---

## 六、交互细节清单

1. **一键复制**：`navigator.clipboard.writeText(fullPaymentText)` → 成功切换按钮文本为「已复制」2 秒后复位；失败 `Toast.error("复制失败，请手动复制")`。
2. **保存草稿**：仅置 `draftSaved=true` + Toast，不关闭弹窗；此后 `hasUnsavedContent` 变 false，可无提示关闭。
3. **未保存离开确认**：Backdrop / 关闭按钮 / Esc 触发；确认弹窗按钮「继续编辑」/「放弃并关闭」。
4. **Esc 键**：`useEffect` 挂 `keydown`，`open=false` 时移除。
5. **文件校验**：`accept=".jpg,.jpeg,.png,.pdf"` + 大小 ≤10MB（Semi 用 `beforeUpload` 返回 false 阻止真实上传，仅缓存 File）。
6. **重开重置**：`open` 从 false→true 或 `task.id` 变化时，全量重置 state；`payAccountName` 初始值 = `task.subject`。
7. **重新提交模式**：`paymentStatus === "error"` 时，标题、提交按钮文案切换，多渲染「上次凭证未通过原因」块。
8. **提交按钮禁用**：三条件缺一即禁用。
9. **提交成功**：切 `step="success"`；Footer 隐藏；成功卡片内「返回看板」直接 `onOpenChange(false)`。

---

## 七、实施步骤（建议）

1. 在本地新建 `VoucherUploadModal.tsx`，声明与 `SpecialPaymentTaskInfo` 一致的 Props/Types。
2. 用 Semi `Modal` 搭骨架（自定义 header/footer、`width=640`、`bodyStyle={{padding:0}}`）。
3. 按四大区块（Header / 摘要卡 / 付款信息卡 / 表单）逐段落实样式；使用 CSS Module 或内联 style 精确落到上述像素/颜色。
4. 接入 `Upload` 组件并禁用真实上传，本地保存 File。
5. 接入复制、保存草稿、未保存离开确认（`Modal.confirm`）三条交互。
6. 接入 `isResubmit` 分支与成功态切换。
7. 主题变量：在 `:root` 覆盖 `--semi-color-primary` 与自定义 `--sapphire-*`，保证与原型一致。
8. 视觉走查：对照原型 5 组截图（默认 / 重新提交 / 成功态 / 复制态 / 二次确认）逐项核对间距字号颜色。

