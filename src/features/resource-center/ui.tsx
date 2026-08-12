import React from 'react';
import {
  ApiOutlined, CodeSandboxOutlined, ControlOutlined, FolderOutlined,
} from '@ant-design/icons';
import type { InstallStatus, PublicStrategy, PublishStatus, ResourceStatus, ResourceType } from './types';

export const typeConfig: Record<ResourceType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  model: { label: '模型', color: '#1677ff', bg: '#e6f4ff', icon: <CodeSandboxOutlined /> },
  api: { label: 'API', color: '#52c41a', bg: '#f6ffed', icon: <ApiOutlined /> },
  mcp: { label: 'MCP', color: '#722ed1', bg: '#f9f0ff', icon: <ControlOutlined /> },
  knowledge: { label: '知识库', color: '#fa8c16', bg: '#fff7e6', icon: <FolderOutlined /> },
};

export const strategyConfig: Record<PublicStrategy, { label: string; color: string }> = {
  public: { label: '完全公开', color: 'success' },
  visible: { label: '公开可见，授权可用', color: 'processing' },
  whitelist: { label: '仅授权对象可见', color: 'warning' },
};

export const installConfig: Record<InstallStatus, { label: string; color: string }> = {
  installed: { label: '已安装', color: 'success' },
  not_installed: { label: '未安装', color: 'default' },
  failed: { label: '安装失败', color: 'error' },
  installing: { label: '安装中', color: 'processing' },
};

export const statusConfig: Record<ResourceStatus, { label: string; color: string }> = {
  authorized: { label: '已授权', color: 'success' },
  view_only: { label: '仅可见', color: 'warning' },
  reviewing: { label: '审核中', color: 'processing' },
  revoked: { label: '已撤销', color: 'error' },
};

export const publishConfig: Record<PublishStatus, { label: string; color: string }> = {
  pending: { label: '待上架', color: 'warning' },
  reviewing: { label: '发布审批中', color: 'processing' },
  published: { label: '已上架', color: 'success' },
  unpublishing: { label: '下架审批中', color: 'processing' },
  offline: { label: '已下架', color: 'default' },
};

export const pageContainerStyle: React.CSSProperties = {
  minHeight: '100%',
  padding: '12px 24px 32px',
  background: '#f5f7fa',
};

export const panelStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #edf0f5',
  borderRadius: 8,
};

