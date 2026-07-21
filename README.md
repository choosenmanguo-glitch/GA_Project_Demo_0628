# 路警智算 AI 平台 — 前端原型

面向公安多警种场景的智能体协作平台，提供智能体全生命周期管理、多空间协同、资源广场和运维监控能力。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5174
```

## 技术栈

React 19 · TypeScript · Vite 6 · Ant Design 6 · React Router 7 · Recharts

## 项目结构

```
src/
  pages/          各功能页面（按路由模块分目录）
  components/     共享 UI 组件
  contexts/       全局状态 Context
  layouts/        布局壳组件
  mock/           前端 Mock 数据
  App.tsx         路由入口
  config.tsx      导航/菜单配置
PRDv2/            现役产品需求文档
prd/              旧版 PRD 参考文档
```

## 功能模块

| 模块 | 路径 | 说明 |
|------|------|------|
| 开发中心 | `/dev/*` | 智能体构建·管理·测评、组件管理、资源广场、空间运营 |
| 运维中心 | `/ops/*` | 资源监控、运营洞察、告警监控、会话日志 |
| 管理中心 | `/manage/*` | 空间管理（创建/审批/管控） |
