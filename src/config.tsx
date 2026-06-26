import {
  HomeOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
  CodeOutlined,
  DashboardOutlined,
  SettingOutlined,
  RobotOutlined,
  CopyOutlined,
  ExperimentOutlined,
  ShopOutlined,
  StarOutlined,
  CodeSandboxOutlined,
  FileTextOutlined,
  ToolOutlined,
  ApiOutlined,
  BuildOutlined,
  DatabaseOutlined,
  FolderOutlined,
  LineChartOutlined,
  ControlOutlined,
  TeamOutlined,
  DesktopOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  FileSearchOutlined,
  UserOutlined,
  BankOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import React from 'react';

/** 一级导航模块定义 */
export const topNavModules = [
  { key: 'home', label: '首页', icon: React.createElement(HomeOutlined), path: '/home' },
  { key: 'app-center', label: '应用中心', icon: React.createElement(AppstoreOutlined), path: '/app-center' },
  { key: 'resource-center', label: '资源中心', icon: React.createElement(FolderOpenOutlined), path: '/resource-center' },
  { key: 'dev', label: '开发中心', icon: React.createElement(CodeOutlined), path: '/dev' },
  { key: 'ops', label: '运维中心', icon: React.createElement(DashboardOutlined), path: '/ops' },
  { key: 'manage', label: '管理中心', icon: React.createElement(SettingOutlined), path: '/manage' },
];

/** 开发中心 - 完整菜单 */
export const devSideMenuItems: MenuProps['items'] = [
  {
    type: 'group',
    label: '',
    children: [
      { key: '/dev/workbench', icon: React.createElement(DesktopOutlined), label: '工作台' },
    ],
  },
  {
    type: 'group',
    label: '智能体开发',
    children: [
      { key: '/dev/agent-build', icon: React.createElement(CodeOutlined), label: '智能体构建' },
      { key: '/dev/agent-manage', icon: React.createElement(RobotOutlined), label: '智能体管理' },
      { key: '/dev/agent-eval', icon: React.createElement(ExperimentOutlined), label: '智能体测评' },
    ],
  },
  {
    type: 'group',
    label: '资源广场',
    children: [
      { key: '/dev/resource-square', icon: React.createElement(ShopOutlined), label: '资源广场' },
      { key: '/dev/my-resources', icon: React.createElement(StarOutlined), label: '我的资源' },
    ],
  },
  {
    type: 'group',
    label: '组件管理',
    children: [
      { key: '/dev/models', icon: React.createElement(CodeSandboxOutlined), label: '模型' },
      { key: '/dev/prompts', icon: React.createElement(FileTextOutlined), label: '提示词' },
      { key: '/dev/tools', icon: React.createElement(ToolOutlined), label: '工具' },
      { key: '/dev/connectors', icon: React.createElement(ApiOutlined), label: '连接器' },
      { key: '/dev/skills', icon: React.createElement(BuildOutlined), label: '技能' },
      { key: '/dev/datasources', icon: React.createElement(DatabaseOutlined), label: '数据连接' },
      { key: '/dev/knowledge', icon: React.createElement(FolderOutlined), label: '知识库' },
    ],
  },
  {
    type: 'group',
    label: '空间运营',
    children: [
      { key: '/dev/stats', icon: React.createElement(LineChartOutlined), label: '统计分析' },
      { key: '/dev/space-manage', icon: React.createElement(ControlOutlined), label: '空间管理' },
    ],
  },
];

/** 运维中心 - 完整菜单 */
export const opsSideMenuItems: MenuProps['items'] = [
  {
    type: 'group',
    label: '空间管理',
    children: [
      { key: '/ops/space-manage', icon: React.createElement(ControlOutlined), label: '空间管理' },
    ],
  },
  {
    type: 'group',
    label: '资源监控',
    children: [
      { key: '/ops/agent-analysis', icon: React.createElement(RobotOutlined), label: '智能体分析' },
      { key: '/ops/model-analysis', icon: React.createElement(CodeSandboxOutlined), label: '模型分析' },
      { key: '/ops/knowledge-analysis', icon: React.createElement(FolderOutlined), label: '知识库分析' },
      { key: '/ops/tool-analysis', icon: React.createElement(ToolOutlined), label: '工具分析' },
      { key: '/ops/connector-analysis', icon: React.createElement(ApiOutlined), label: '连接器分析' },
    ],
  },
  {
    type: 'group',
    label: '运营洞察',
    children: [
      { key: '/ops/dept-analysis', icon: React.createElement(BankOutlined), label: '部门分析' },
      { key: '/ops/user-analysis', icon: React.createElement(UserOutlined), label: '用户分析' },
      { key: '/ops/space-analysis', icon: React.createElement(TeamOutlined), label: '空间分析' },
    ],
  },
  {
    type: 'group',
    label: '运维监控',
    children: [
      { key: '/ops/alert-monitor', icon: React.createElement(AlertOutlined), label: '告警监控' },
      { key: '/ops/session-log', icon: React.createElement(FileSearchOutlined), label: '会话日志' },
    ],
  },
];

/** 各模块对应的左侧菜单 */
export const moduleSideMenus: Record<string, MenuProps['items']> = {
  home: [
    { type: 'group', label: '首页', children: [{ key: '/home', icon: React.createElement(HomeOutlined), label: '首页概览' }] },
  ],
  'app-center': [
    { type: 'group', label: '应用中心', children: [{ key: '/app-center', icon: React.createElement(AppstoreOutlined), label: '应用市场' }] },
  ],
  'resource-center': [
    { type: 'group', label: '资源中心', children: [{ key: '/resource-center', icon: React.createElement(FolderOpenOutlined), label: '资源总览' }] },
  ],
  dev: devSideMenuItems,
  ops: opsSideMenuItems,
  manage: [
    { type: 'group', label: '系统管理', children: [
      { key: '/manage/org', icon: React.createElement(BankOutlined), label: '组织管理' },
      { key: '/manage/users', icon: React.createElement(UserOutlined), label: '用户管理' },
      { key: '/manage/roles', icon: React.createElement(TeamOutlined), label: '角色管理' },
    ]},
  ],
};

/** 模块 key 到中文名的映射 */
export const moduleLabelMap: Record<string, string> = {
  home: '首页',
  'app-center': '应用中心',
  'resource-center': '资源中心',
  dev: '开发中心',
  ops: '运维中心',
  manage: '管理中心',
};

/** 根据路由路径解析页面名称（用于页签标题） */
export function resolvePageLabel(path: string): string {
  // 先精确匹配菜单项
  for (const menus of Object.values(moduleSideMenus)) {
    if (!menus) continue;
    for (const group of menus as any[]) {
      const children = group?.children || [];
      for (const item of children) {
        if (item?.key === path) return item.label;
      }
    }
  }
  // 前缀模糊匹配
  for (const menus of Object.values(moduleSideMenus)) {
    if (!menus) continue;
    for (const group of menus as any[]) {
      const children = group?.children || [];
      for (const item of children) {
        if (item?.key && path.startsWith(item.key)) return item.label;
      }
    }
  }
  // 最后一段作为兜底
  const last = path.split('/').filter(Boolean).pop();
  return last || '未命名';
}
