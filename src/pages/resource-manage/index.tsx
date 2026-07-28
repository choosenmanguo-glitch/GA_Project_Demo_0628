import React, { useMemo, useState } from 'react';
import { App as AntdApp, Button, Card, Dropdown, Pagination, Typography } from 'antd';
import {
  DeleteOutlined, EditOutlined, EyeOutlined,
  PushpinOutlined, SafetyCertificateOutlined, SendOutlined,
  AppstoreOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import type { FilterField } from '@/components/FilterBar';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ResourceCard from '@/features/resource-center/components/ResourceCard';
import ResourceFormDrawer from '@/features/resource-center/components/ResourceFormDrawer';
import ResourcePermissionDrawer from '@/features/resource-center/components/ResourcePermissionDrawer';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import type { CreateResourceInput, ResourceItem, ResourceType } from '@/features/resource-center/types';
import { typeConfig } from '@/features/resource-center/ui';

const { Text } = Typography;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索资源名称、所有权人', width: 240 },
  { type: 'select', key: 'type', placeholder: '资源类型', width: 120, options: [
    { label: '知识库', value: 'knowledge' },
    { label: '模型', value: 'model' },
    { label: 'API', value: 'api' },
    { label: 'MCP', value: 'mcp' },
  ]},
  { type: 'select', key: 'status', placeholder: '发布状态', width: 120, options: [
    { label: '已上架', value: 'published' },
    { label: '已下架', value: 'offline' },
    { label: '待上架', value: 'pending' },
  ]},
];

export default function ResourceManagePage() {
  const { message } = AntdApp.useApp();
  const {
    resources, createResource, updateResource, togglePublish, togglePinned,
    grants, deleteResource,
  } = useResourceCenter();
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', type: undefined, status: undefined });
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [detail, setDetail] = useState<ResourceItem | null>(null);
  const [permissionTarget, setPermissionTarget] = useState<ResourceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null);

  const activeResources = resources.filter(resource => !resource.isDeleted);
  const filtered = useMemo(() => activeResources.filter(resource => {
    if (filters.type && resource.type !== filters.type) return false;
    if (filters.status && resource.publishStatus !== filters.status) return false;
    const word = (filters.keyword || '').trim().toLowerCase();
    return !word || resource.name.toLowerCase().includes(word) || resource.owner.toLowerCase().includes(word);
  }), [activeResources, filters]);

  const editResource = (resource: ResourceItem) => {
    if (resource.publishStatus === 'published' || resource.publishStatus === 'publishing') {
      message.warning('温馨提示：为了保障工作流与下游关联服务的安全稳定，编辑功能仅在“待上架”或“已下架”状态下可用。请先将该资源下架，再进行编辑修改。');
      return;
    }
    setEditing(resource);
    setFormOpen(true);
  };

  const menuItems = (resource: ResourceItem): MenuProps['items'] => [
    { key: 'view', icon: <EyeOutlined />, label: '查看详情', onClick: () => setDetail(resource) },
    { key: 'edit', icon: <EditOutlined />, label: '编辑资源', onClick: () => editResource(resource) },
    { key: 'publish', icon: <SendOutlined />, label: resource.publishStatus === 'published' ? '下架资源' : '上架资源', onClick: () => { togglePublish(resource.id); message.success(resource.publishStatus === 'published' ? '资源已下架' : '资源已上架'); } },
    { key: 'pin', icon: <PushpinOutlined />, label: resource.isPinned ? '取消置顶' : '置顶资源', onClick: () => togglePinned(resource.id) },
    { key: 'strategy', icon: <SafetyCertificateOutlined />, label: '权限管理', onClick: () => setPermissionTarget(resource) },
    { type: 'divider' },
    { key: 'delete', icon: <DeleteOutlined />, danger: true, label: '删除资源', onClick: () => setDeleteTarget(resource) },
  ];

  const submitResource = (values: CreateResourceInput) => {
    if (editing) {
      updateResource(editing.id, values);
      message.success('资源修改已保存');
    } else {
      createResource(values);
      message.success('资源创建成功！初始状态为待上架，请在资源管理中手动上架发布。');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const statCards = [
    { key: 'all', title: '资源总数', value: activeResources.length, color: '#1677ff', bg: '#e6f4ff', icon: <AppstoreOutlined /> },
    ...(['knowledge', 'model', 'api', 'mcp'] as ResourceType[]).map(type => ({
      key: type, title: typeConfig[type].label,
      value: activeResources.filter(resource => resource.type === type).length,
      color: '#1677ff', bg: '#e6f4ff', icon: typeConfig[type].icon,
    })),
  ];
  const activeStatIndex = activeStat === null ? -1 : statCards.findIndex(item => item.key === activeStat);

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="资源管理"
        hint="平台共享资源的创建、上架、公开策略、授权与安全删除"
      />

      <div style={{ display: 'flex', gap: 16, padding: '0 0 12px' }}>
        {statCards.map((item, idx) => {
          const isActive = activeStatIndex === idx;
          const handleClick = () => {
            if (item.key === 'all') {
              setActiveStat('all');
              setFilters(prev => ({ ...prev, type: undefined }));
            } else {
              setActiveStat(item.key);
              setFilters(prev => ({ ...prev, type: item.key }));
            }
          };
          return (
            <Card
              key={item.key}
              className="resource-stat-card"
              size="small"
              onClick={handleClick}
              style={{
                flex: 1, minWidth: 0,
                borderRadius: 10,
                borderColor: isActive ? item.color : '#f0f0f0',
                cursor: 'pointer',
                background: isActive ? item.bg : '#fff',
                boxShadow: isActive ? `0 2px 8px ${item.color}18` : 'none',
                transition: 'all .2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color, fontSize: 20,
                }}>
                  {item.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.title}</Text>
                  <div style={{ fontSize: 26, fontWeight: 700, color: item.color, lineHeight: '32px' }}>
                    {item.value}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <FilterBar
          filters={filterFields}
          filterValues={filters}
          onFilterChange={(key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setCardPage(1); if (key === 'type') setActiveStat(null); }}
          onSearch={() => {}}
          onReset={() => { setFilters({ keyword: '', type: undefined, status: undefined }); setActiveStat(null); setCardPage(1); }}
          onCreate={() => { setEditing(null); setFormOpen(true); }}
          createText="创建资源"
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
          <div className="resource-card-grid" style={{ marginTop: 12 }}>
            {filtered.slice((cardPage - 1) * cardPageSize, cardPage * cardPageSize).map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                mode="manage"
                onCardClick={() => setDetail(resource)}
                onStrategyClick={() => setPermissionTarget(resource)}
                footer={<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Dropdown menu={{ items: menuItems(resource) }} trigger={['click']}><Button type="text" size="small" icon={<MoreOutlined />} style={{ borderRadius: 6, fontSize: 12 }} onClick={(e) => e.stopPropagation()} /></Dropdown>
                </div>}
              />
            ))}
          </div>
          <div className="resource-page-pagination">
            <Pagination
              current={cardPage}
              pageSize={cardPageSize}
              total={filtered.length}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              pageSizeOptions={['8', '12', '16', '24']}
              onChange={(page, size) => { setCardPage(page); setCardPageSize(size); }}
            />
          </div>
        </div>
      </div>

      <ResourceFormDrawer open={formOpen} resource={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={submitResource} />
      <ResourceFormDrawer open={!!detail} resource={detail} readOnly onClose={() => setDetail(null)} onSubmit={() => undefined} />
      <ResourcePermissionDrawer open={!!permissionTarget} resource={permissionTarget} onClose={() => setPermissionTarget(null)} />

      <ConfirmActionModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteResource(deleteTarget.id); setDeleteTarget(null); message.success('资源已删除，已有获取记录将显示为失效'); }}
        title="删除资源"
        targetName={deleteTarget?.name || ''}
        severity="danger"
        description={[
          `全站不可用：已有 ${deleteTarget ? grants.filter(item => item.resourceId === deleteTarget.id && !item.revoked).length : 0} 个空间获取该资源，删除后其引用服务可能立即报错或中断。`,
          '资产回收：API 接口、数据映射、模型依赖和底层物理通路将永久闭合。',
          '权限解绑：当前可见范围和授权使用记录将转为资源已删除的失效状态。',
        ]}
        requireAcknowledgement
        acknowledgementText="我已知晓并核实删除此资源带来的潜在服务中断风险，并自愿承担相应的技术影响与责任风险。"
        requireNameInput
        cancelText="取消，我再想想"
        okText="确认，永久删除此资产"
      />
    </div>
  );
}
