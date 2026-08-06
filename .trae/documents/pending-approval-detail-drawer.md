# 待审批详情抽屉 — 实施计划

## 摘要

在资源权限页面的「待审批」Tab 表格中，点击申请行弹出详情抽屉，展示被申请资源的完整信息和申请详情，供管理员在审批前全面了解申请内容后做出决策。

## 当前状态分析

- **文件：** `src/pages/resource-permissions/index.tsx`
- 待审批 Tab（`pendingTab`，第 165-268 行）当前是一张表格，包含列：申请资源名称/属性、申请人信息、发起申请时间、设定期限、申请理由、审批控制
- 「审批控制」列有「通过」按钮和「驳回」Popconfirm，审批操作在表格行内直接完成
- 页面已有：`resources` 数组（按 ID 查找资源详情）、`getResource` 函数、`approveApplication` / `rejectApplication` 方法、`typeConfig` / `v3Color` 等 UI 配置
- `ResourceApplication` 类型包含字段：`id, resourceId, spaceId, applicant, dept, applyTime, duration, expireDate, reason, status, operator, opinion, approvalTime`

## 设计方案

### 交互流程

1. 用户点击表格中任意一行（或点击资源名称链接）→ 弹出详情抽屉
2. 抽屉展示两部分内容：被申请**资源详情** + **申请信息** 
3. 抽屉底部 Footer 提供「通过」和「驳回」（带理由输入）两个审批操作按钮
4. 审批完成后抽屉自动关闭，表格数据同步刷新
5. **保留**表格行内的原有「通过」「驳回」按钮，与抽屉独立操作，互不冲突

### 抽屉内容结构

```
┌─ 资源权限 - 待审批详情 ─────────────────────┐
│                                                │
│  ┌─ 被申请资源 ──────────────────────────┐   │
│  │ [类型图标] 资源名称                     │   │
│  │ [类型标签] 所有者 · 更新时间 · 资源标识  │   │
│  │ 资源描述...                            │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  ┌─ 申请信息 ────────────────────────────┐   │
│  │ 申请人     [头像] 姓名 · 部门           │   │
│  │ 申请空间   空间名称                      │   │
│  │ 申请时间   2026-05-01 10:30:00          │   │
│  │ 使用期限   永久有效 / 2026-12-31        │   │
│  │ 申请理由   业务需要接入智能客服能力...    │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  ┌─ 资源详细介绍（Markdown） ────────────┐   │
│  │ markdownIntro 渲染内容...              │   │
│  └────────────────────────────────────────┘   │
│                                                │
├────────────────────────────────────────────────┤
│  [取消]                          [驳回] [通过] │
└────────────────────────────────────────────────┘
```

## 实施步骤

### Step 1：新增状态变量

在 `ResourcePermissionsPage` 组件中（第 60 行附近）新增：

```ts
const [pendingDetailApp, setPendingDetailApp] = useState<ResourceApplication | null>(null);
const [pendingDetailOpen, setPendingDetailOpen] = useState(false);
```

### Step 2：表格行添加点击事件和「详情」按钮

**2a.** 表格新增一列「操作」（放在审批控制列之前或合并），增加「详情」按钮点击打开抽屉：

```tsx
render: (_, rec) => <Button type="link" size="small" onClick={() => { setPendingDetailApp(rec); setPendingDetailOpen(true); }}>详情</Button>
```

**2b.** 同时给表格添加 `onRow` 属性，点击整行也打开抽屉：

```tsx
onRow={(rec) => ({
  onClick: () => { setPendingDetailApp(rec); setPendingDetailOpen(true); },
  style: { cursor: 'pointer' },
})}
```

审批控制列的按钮添加 `e.stopPropagation()` 防止冒泡。

### Step 3：构建详情抽屉内容

抽屉主体使用 antd `Drawer`，`size="large"`，`placement="right"`。内容结构：

**3a. 资源详情 Card** — 复用 `typeConfig` / `v3Color` / `renderTypeIcon`：
- 类型图标 + 资源名称 + 类型标签
- Descriptions 组件：所有者、更新时间、资源标识（resourceKey）、网关路径（gatewayPath）、部署方式（deployment）
- 资源描述文本

**3b. 申请信息 Card**：
- 申请人：Avatar + 姓名 + 部门
- 申请空间：空间名称
- 申请时间：applyTime
- 使用期限：永久有效 / 具体日期（Tag 样式）
- 申请理由：reason（多行文本，带边框的输入框样式只读展示）

**3c. 资源详细介绍 Card**（当 `markdownIntro` 存在时显示）：
- 用 `ReactMarkdown` 渲染

### Step 4：Drawer Footer 审批操作

Footer 放置三个按钮：
- 「取消」— 关闭抽屉
- 「驳回」— 使用 Popconfirm 弹出理由输入，调用 `rejectApplication(id, reason)`，成功后关闭抽屉 + message 提示
- 「通过」— 主色调按钮，调用 `approveApplication(id, '同意直接开通调用权限')`，成功后关闭抽屉 + message 提示

审批完成后重置 `pendingDetailApp` 为 null。

### Step 5：Drawer 入口集成

在 `pendingTab` JSX 的 `</div>` 关闭标签前（第 267 行之前），将完整的 `<Drawer>` 组件插入。

## 需要修改的文件

| 文件 | 变更内容 |
|------|----------|
| `src/pages/resource-permissions/index.tsx` | 新增 2 个 state；表格新增 onRow + 详情按钮 + 事件冒泡阻止；新增 Drawer 组件 |

## 技术决策

1. **不创建独立组件文件** — 待审批抽屉逻辑简单，直接内联在页面中，与现有的批量授权 Drawer 和审批记录详情保持一致的内联模式
2. **保留原表格行内审批按钮** — 不改变已有交互习惯，抽屉作为增强的详情查看入口
3. **Drawer 尺寸用 `large`** — 与资源详情抽屉和权限管理抽屉一致
4. **被申请资源不存在时的处理** — 当 `getResource(rec.resourceId)` 返回 undefined（资源被删除），显示「资源已不存在」占位提示

## 验证方式

1. 进入 资源权限 → 待审批 页面
2. 点击任意待审批行 → 抽屉弹出，展示资源详情 + 申请信息
3. 点击「通过」→ 申请状态变更，抽屉关闭，列表更新
4. 点击「驳回」→ 输入理由 → 确认 → 申请状态变更，抽屉关闭
5. 点击行内的审批控制列按钮 → 阻止抽屉弹出，审批正常执行
