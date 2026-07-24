import React, { useMemo, useState } from 'react';
import { App as AntdApp, Button, Descriptions, Drawer, Empty, Select, Space, Table, Tabs, Tag } from 'antd';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useResourceCenter } from '../ResourceCenterContext';
import type { ResourceItem } from '../types';
import { installConfig, strategyConfig, typeConfig } from '../ui';

interface ResourceAdminDrawerProps {
  open: boolean;
  resource: ResourceItem | null;
  onClose: () => void;
}

const ResourceAdminDrawer: React.FC<ResourceAdminDrawerProps> = ({ open, resource, onClose }) => {
  const { message } = AntdApp.useApp();
  const { spaces } = useWorkspace();
  const { grants, applications, auditLogs, acquire, revokeGrant } = useResourceCenter();
  const [grantSpaceId, setGrantSpaceId] = useState<string>();
  const resourceGrants = useMemo(() => grants.filter(item => item.resourceId === resource?.id), [grants, resource?.id]);
  const resourceApplications = useMemo(() => applications.filter(item => item.resourceId === resource?.id), [applications, resource?.id]);
  const resourceLogs = useMemo(() => auditLogs.filter(item => item.resourceId === resource?.id), [auditLogs, resource?.id]);
  if (!resource) return null;
  const type = typeConfig[resource.type];

  const grant = () => {
    if (!grantSpaceId) return message.warning('请选择授权空间');
    const created = acquire(resource.id, grantSpaceId, '管理员授权');
    message[created ? 'success' : 'info'](created ? '授权成功' : '该空间已获取此资源');
    setGrantSpaceId(undefined);
  };

  const items = [
    {
      key: 'basic', label: '基本信息', children: <Descriptions bordered column={2} items={[
        { key: 'name', label: '资源名称', children: resource.name },
        { key: 'type', label: '资源类型', children: <Tag color={type.color}>{type.label}</Tag> },
        { key: 'owner', label: '所有权人', children: resource.owner },
        { key: 'status', label: '上架状态', children: <Tag color={resource.publishStatus === 'published' ? 'success' : 'default'}>{resource.publishStatus === 'published' ? '已上架' : '已下架'}</Tag> },
        { key: 'strategy', label: '公开策略', children: strategyConfig[resource.publicStrategy].label },
        { key: 'key', label: '资源 Key', children: resource.resourceKey || '—' },
        { key: 'desc', label: '描述', span: 2, children: resource.description },
      ]} />,
    },
    {
      key: 'technical', label: '技术配置', children: <Descriptions bordered column={1} items={[
        { key: 'gateway', label: '网关路径', children: resource.gatewayPath || '—' },
        { key: 'base', label: 'Base URL / Endpoint', children: resource.baseurl || resource.apiEndpoint || resource.mcpServerEndpoint || '—' },
        { key: 'path', label: '调用路径', children: resource.path || '—' },
        { key: 'auth', label: '鉴权方式', children: resource.authType || '—' },
        { key: 'schema', label: 'OpenAPI / Swagger', children: resource.swaggerSchema ? <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{resource.swaggerSchema}</pre> : '—' },
      ]} />,
    },
    {
      key: 'grants', label: `授权空间（${resourceGrants.length}）`, children: <>
        <Space style={{ marginBottom: 14 }}>
          <Select placeholder="选择空间" value={grantSpaceId} onChange={setGrantSpaceId} style={{ width: 260 }} options={spaces.map(space => ({ label: `${space.name} · ${space.type}`, value: space.id }))} />
          <Button type="primary" onClick={grant}>管理员直接授权</Button>
        </Space>
        <Table rowKey="id" size="small" pagination={false} dataSource={resourceGrants} columns={[
          { title: '空间', dataIndex: 'spaceId', render: (id: string) => spaces.find(space => space.id === id)?.name || id },
          { title: '来源', dataIndex: 'source' },
          { title: '授权时间', dataIndex: 'acquiredAt' },
          { title: '安装状态', dataIndex: 'installStatus', render: (status: keyof typeof installConfig) => <Tag color={installConfig[status].color}>{installConfig[status].label}</Tag> },
          { title: '操作', render: (_: unknown, record: (typeof resourceGrants)[number]) => <Button danger type="link" disabled={record.revoked} onClick={() => revokeGrant(resource.id, record.spaceId)}>{record.revoked ? '已撤销' : '撤销授权'}</Button> },
        ]} />
      </>,
    },
    {
      key: 'applications', label: `使用申请（${resourceApplications.length}）`, children: resourceApplications.length ? <Table rowKey="id" size="small" pagination={false} dataSource={resourceApplications} columns={[
        { title: '申请空间', dataIndex: 'spaceId', render: (id: string) => spaces.find(space => space.id === id)?.name || id },
        { title: '申请人', dataIndex: 'applicant' },
        { title: '申请时间', dataIndex: 'applyTime' },
        { title: '期限', render: (_: unknown, record: (typeof resourceApplications)[number]) => record.duration === 'permanent' ? '永久有效' : record.expireDate },
        { title: '状态', dataIndex: 'status', render: (status: string) => <Tag color={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'processing'}>{status === 'approved' ? '已通过' : status === 'rejected' ? '已驳回' : '待审批'}</Tag> },
      ]} /> : <Empty description="暂无使用申请" />,
    },
    {
      key: 'logs', label: '操作日志', children: resourceLogs.length ? <Table rowKey="id" size="small" pagination={false} dataSource={resourceLogs} columns={[
        { title: '时间', dataIndex: 'time', width: 180 }, { title: '操作人', dataIndex: 'operator', width: 120 }, { title: '操作', dataIndex: 'action', width: 160 }, { title: '详情', dataIndex: 'detail' },
      ]} /> : <Empty description="暂无操作日志" />,
    },
  ];

  return <Drawer title={`资源详情 - ${resource.name}`} open={open} onClose={onClose} size="large"><Tabs items={items} /></Drawer>;
};

export default ResourceAdminDrawer;
