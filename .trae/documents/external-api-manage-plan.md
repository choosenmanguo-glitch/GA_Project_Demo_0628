# 外部知识库 API 管理 — 编辑与删除能力设计

## 概述

知识库模块当前仅支持创建外部知识库 API 配置，缺少编辑和删除入口。本方案参考模型管理页的"模型源管理"模式，在知识库页面为外部 API 配置增加完整的管理能力。

## 现状分析

- [ExternalApiConfig 接口](file:///c:/Users/choosenman/Documents/trae_projects/GAproject/GAproject/DEMO/traedemo/src/pages/knowledge/index.tsx#L106-L111)：仅含 `id`、`name`、`endpoint`、`apiKey` 四个字段，无元数据
- [ExternalApiCreateModal](file:///c:/Users/choosenman/Documents/trae_projects/GAproject/GAproject/DEMO/traedemo/src/pages/knowledge/index.tsx#L406-L453)：仅支持创建，不支持编辑
- `externalApiList` 状态管理在 KnowledgeBasePage 组件中，初始有 2 条 mock 数据
- 创建知识库时，外部 API 选择通过 [SimpleCreateDrawer](file:///c:/Users/choosenman/Documents/trae_projects/GAproject/GAproject/DEMO/traedemo/src/pages/knowledge/index.tsx#L590-L610) 的下拉框（含"新建外部知识库 API"快捷入口）
- FilterBar 已支持 `extra` prop，可在右侧操作区插入自定义按钮

**参考模式（模型源管理）：**
[models/index.tsx](file:///c:/Users/choosenman/Documents/trae_projects/GAproject/GAproject/DEMO/traedemo/src/pages/models/index.tsx#L502-L578) 采用两级 Drawer 嵌套架构：外层 Drawer 含 Table 列表（编辑/删除操作），内层子 Drawer 含表单（创建/编辑复用同一表单）。

## 方案设计

### 1. ExternalApiConfig 接口扩展

在 [knowledge/index.tsx#L106](file:///c:/Users/choosenman/Documents/trae_projects/GAproject/GAproject/DEMO/traedemo/src/pages/knowledge/index.tsx#L106) 的接口中增加 `remark` 字段：

```typescript
interface ExternalApiConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  remark?: string;   // 新增：备注
}
```

### 2. 组件架构

采用三级结构：

```
FilterBar extra → "外部 API 管理" 按钮
    ↓
ExternalApiManageDrawer（外层 Drawer：列表管理）
    ├── FilterBar（搜索名称/备注）
    ├── Table（列表：名称、Endpoint、操作[编辑/删除]）
    └── ExternalApiFormDrawer（内层子 Drawer：创建/编辑表单）
```

### 3. 新增/修改文件

**仅修改一个文件：** `src/pages/knowledge/index.tsx`

#### 3.1 ExternalApiConfig 接口扩展 + 删除确认

- 增加 `remark?: string` 字段
- 新增删除确认函数，检查该 API 是否被已有外部知识库引用
- 新增编辑函数

#### 3.2 ExternalApiManageDrawer 组件（外层）

参考模型源管理 Drawer：
- `open` / `onClose` props
- 内嵌 FilterBar（搜索框 + "添加外部 API"按钮）
- Table 展示 `externalApiList`，列：名称、Endpoint、备注（ellipsis）、操作（编辑/删除）
- 操作列使用 Popconfirm 确认删除
- 删除时先检查是否有知识库引用此 API（通过 `apiEndpoint` 匹配），如有则给出警告

#### 3.3 ExternalApiFormDrawer 组件（内层，替代现有 ExternalApiCreateModal）

替代现有的 `ExternalApiCreateModal` Modal，改为 Drawer 形式：
- 通过 `editingApiId: string | null` 区分创建/编辑模式
- 创建时标题"添加外部知识库 API"
- 编辑时标题"编辑外部知识库 API"，回填表单数据
- 表单字段：name（必填）、endpoint（必填）、apiKey（必填）、remark（选填）
- 底部按钮：取消 + 确定

#### 3.4 KnowledgeBasePage 修改

- 新增状态：`externalApiManageOpen`、`externalApiFormOpen`、`editingApiId`
- 新增处理函数：`handleEditApi`、`handleDeleteApi`、`handleSaveApi`
- 修改 FilterBar 的 `extra`，增加"外部 API 管理"按钮（`<SettingOutlined />` 图标）
- 移除原有的 `ExternalApiCreateModal` 和相关状态，替换为新组件
- SimpleCreateDrawer 的 `onOpenApiCreate` 改为 `() => { setExternalApiFormOpen(true); setEditingApiId(null); }`（或在管理抽屉中触发）

### 4. 交互细节

1. **管理入口**：FilterBar 右侧 `extra` 区增加「外部 API 管理」按钮（位于「从广场获取」左侧，与模型页的「模型源管理」位置一致）
2. **删除确认**：
   - 使用 `Popconfirm`，标题"确定删除该 API 配置？"
   - 删除前检查是否有知识库引用（`kbList.filter(kb => kb.category === 'external' && kb.apiEndpoint === api.endpoint)`）
   - 如有引用，警告"该 API 正被 N 个知识库使用，删除后可能影响知识库检索功能"
3. **编辑**：点击编辑按钮打开表单 Drawer，回填现有数据，保存时更新 `externalApiList`
4. **创建**：管理 Drawer 内的「添加外部 API」按钮打开表单 Drawer，与现有创建流程一致

### 5. 废弃内容

- 移除 `ExternalApiCreateModal` 组件（被 `ExternalApiFormDrawer` 替代）
- 移除 `externalApiCreateModalOpen` 状态
- SimpleCreateDrawer 中的 `onOpenApiCreate` 回调行为保留，但改为打开新的表单 Drawer

## 实施步骤

1. 扩展 `ExternalApiConfig` 接口，增加 `remark?: string`
2. 创建 `ExternalApiFormDrawer` 组件（创建/编辑复用同一 Drawer）
3. 创建 `ExternalApiManageDrawer` 组件（外层列表 Drawer）
4. 在 KnowledgeBasePage 中新增状态和 CRUD 处理函数
5. 修改 FilterBar 的 `extra`，增加"外部 API 管理"按钮
6. 移除旧 `ExternalApiCreateModal` 和相关状态
7. 验证 TypeScript 编译通过
