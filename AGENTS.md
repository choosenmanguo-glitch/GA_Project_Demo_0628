# AGENTS.md — traedemo

## 项目定位
鲁警智算 AI 平台前端原型 — 面向公安多警种的智能体协作平台，覆盖智能体开发、资源管理、空间运营、运维监控和管理中心五大模块。

## 启动
```bash
npm run dev      # → http://localhost:5174
npm run build    # 产出到 dist/
```

## 技术栈
- React 19 + TypeScript + Vite 6
- Ant Design 6 + @ant-design/icons
- React Router 7 (BrowserRouter)
- Recharts (图表)
- dayjs (日期处理)

## 目录约定
```
src/
  components/   # 共享组件（含 SpaceCreateDrawer、StepDrawer、WorkspaceSwitcher 等）
  contexts/     # TabsContext、WorkspaceContext
  layouts/      # AppLayout（侧栏+顶栏布局壳）
  pages/        # 按功能模块分目录，每个页面一个 index.tsx
  mock/         # 纯前端 Mock 数据（data.ts）
  config.tsx    # 顶部导航、侧栏菜单、路由→标签名映射
  App.tsx       # 路由定义 + ConfigProvider
PRDv2/          # 现役 PRD 文档
prd/            # 旧版 PRD 参考（未被 PRDv2 完全覆盖，保留为参考）
```
路径别名 `@/` → `src/`

## 当前状态与下一步
- **已完成**：空间管理闭环（创建/申请/审批/管控）、SpaceCreateDrawer 共享组件抽取、知识库模块、模型/提示词/工具/连接器/知识库管理
- **进行中**：空间管理细节优化（冻结/归档文案、描述字段、审批抽屉）
- **待开发**：工作台门户首页、统计分析看板、资源配额管理

## 关键约定
- 状态筛选仅用「启用/停用」
- 操作列 ≤3 个按钮直接展示，超过用 `…` 下拉菜单
- 同一逻辑优先复用共享组件，避免 ops-spaces 和 WorkspaceSwitcher 重复
- Mock 数据在 `src/mock/data.ts` 集中管理
