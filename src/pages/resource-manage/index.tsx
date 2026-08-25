import React, { useMemo, useState } from 'react';
import { App as AntdApp, Badge, Button, Card, Descriptions, Drawer, Dropdown, Empty, Input, List, Popconfirm, Space, Table, Tabs, Tag, Typography } from 'antd';
import {
  DeleteOutlined, EditOutlined, EyeOutlined,
  PushpinOutlined, SafetyCertificateOutlined, SendOutlined,
  AppstoreOutlined, MoreOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import type { FilterField } from '@/components/FilterBar';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import PaginationBar from '@/components/PaginationBar';
import ResourceCard from '@/features/resource-center/components/ResourceCard';
import ResourceFormDrawer from '@/features/resource-center/components/ResourceFormDrawer';
import ResourcePermissionDrawer from '@/features/resource-center/components/ResourcePermissionDrawer';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { CreateResourceInput, PublishApproval, ResourceItem, ResourceType } from '@/features/resource-center/types';
import { publishConfig, strategyConfig, typeConfig } from '@/features/resource-center/ui';

const { Text } = Typography;

const cardFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索资源名称、所有权人', width: 240 },
  { type: 'select', key: 'type', placeholder: '资源类型', width: 120, options: [
    { label: '知识库', value: 'knowledge' },
    { label: '模型', value: 'model' },
    { label: 'API', value: 'api' },
    { label: 'MCP', value: 'mcp' },
    { label: '技能', value: 'skill' },
  ]},
  { type: 'select', key: 'status', placeholder: '发布状态', width: 130, options: [
    { label: '已上架', value: 'published' },
    { label: '已下架', value: 'offline' },
    { label: '待上架', value: 'pending' },
    { label: '发布审批中', value: 'reviewing' },
    { label: '下架审批中', value: 'unpublishing' },
  ]},
];

const approvalFilterFields: FilterField[] = [
  { type: 'search', key: 'nameSearch', placeholder: '资源名称', width: 200 },
  { type: 'select', key: 'applyType', placeholder: '申请类型', width: 120, options: [
    { label: '发布', value: 'publish' },
    { label: '下架', value: 'offline' },
  ]},
  { type: 'search', key: 'applicantSearch', placeholder: '申请人', width: 160 },
];

const historyFilterFields: FilterField[] = [
  { type: 'search', key: 'nameSearch', placeholder: '资源名称', width: 200 },
  { type: 'search', key: 'applicantSearch', placeholder: '申请人', width: 160 },
  { type: 'select', key: 'statusFilter', placeholder: '审批结果', width: 120, options: [
    { label: '已通过', value: 'approved' },
    { label: '已驳回', value: 'rejected' },
  ]},
];

// 资源类型图标
const renderTypeIcon = (type: string) => {
  const config = typeConfig[type as ResourceType];
  const colors: Record<string, { bg: string; color: string }> = {
    model: { bg: '#f9f0ff', color: '#722ed1' },
    api: { bg: '#e6f7ff', color: '#1890ff' },
    mcp: { bg: '#fff7e6', color: '#fa8c16' },
    knowledge: { bg: '#f6ffed', color: '#52c41a' },
    skill: { bg: '#fff0f6', color: '#eb2f96' },
  };
  const c = colors[type] || { bg: '#f0f0f0', color: '#8c8c8c' };
  return (
    <span style={{
      width: 28, height: 28, borderRadius: 4, backgroundColor: c.bg, color: c.color,
      display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 14, flexShrink: 0,
    }}>
      {config?.icon}
    </span>
  );
};

export default function ResourceManagePage() {
  const { message, modal } = AntdApp.useApp();
  const { spaces } = useWorkspace();
  const {
    resources, createResource, updateResource, togglePublish, togglePinned,
    grants, deleteResource, publishApprovals,
    approvePublish, rejectPublish, approveOffline, rejectOffline,
  } = useResourceCenter();

  // Tab
  const [manageTab, setManageTab] = useState<'all' | 'approvals' | 'history'>('all');

  // --- 全部资源 ---
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
    const blockedStatuses: string[] = ['published', 'reviewing', 'unpublishing'];
    if (blockedStatuses.includes(resource.publishStatus)) {
      message.warning('温馨提示：为了保障工作流与下游关联服务的安全稳定，编辑功能仅在"待上架"或"已下架"状态下可用。审批中的资源不可编辑。');
      return;
    }
    setEditing(resource);
    setFormOpen(true);
  };

  const confirmTogglePublish = (resource: ResourceItem) => {
    const isPublish = resource.publishStatus === 'pending' || resource.publishStatus === 'offline';
    modal.confirm({
      title: isPublish ? '确认上架所选资源?' : '确认下架所选资源?',
      icon: <QuestionCircleOutlined style={{ color: '#faad14' }} />,
      content: <div style={{ marginTop: 8, color: '#595959' }}>当前选中资源为{resource.name}</div>,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        togglePublish(resource.id);
        message.success(isPublish ? '资源已上架' : '资源已下架');
      },
    });
  };

  const menuItems = (resource: ResourceItem): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      { key: 'view', icon: <EyeOutlined />, label: '查看详情', onClick: () => setDetail(resource) },
      { key: 'edit', icon: <EditOutlined />, label: '编辑资源', onClick: () => editResource(resource) },
    ];
    // 上架/下架：待上架和已下架可上架；已上架可下架
    if (resource.publishStatus === 'pending' || resource.publishStatus === 'offline') {
      items.push({ key: 'publish', icon: <SendOutlined />, label: '上架资源', onClick: () => confirmTogglePublish(resource) });
    }
    if (resource.publishStatus === 'published') {
      items.push({ key: 'unpublish', icon: <SendOutlined />, label: '下架资源', onClick: () => confirmTogglePublish(resource) });
    }
    items.push(
      { key: 'pin', icon: <PushpinOutlined />, label: resource.isPinned ? '取消置顶' : '置顶资源', onClick: () => togglePinned(resource.id) },
      { key: 'strategy', icon: <SafetyCertificateOutlined />, label: '权限管理', onClick: () => setPermissionTarget(resource) },
      { type: 'divider' },
      { key: 'delete', icon: <DeleteOutlined />, danger: true, label: '删除资源', onClick: () => setDeleteTarget(resource) },
    );
    return items;
  };

  const submitResource = (values: CreateResourceInput) => {
    if (editing) {
      updateResource(editing.id, values);
      message.success('资源修改已保存');
    } else {
      createResource(values);
      message.success('资源创建成功！初始状态为待上架，可直接上架发布。');
    }
    setFormOpen(false);
    setEditing(null);
  };

  // --- 发布审批 ---
  const [approvalFilterValues, setApprovalFilterValues] = useState<Record<string, any>>({ nameSearch: '', applyType: undefined, applicantSearch: '' });
  const [approvalDetail, setApprovalDetail] = useState<PublishApproval | null>(null);
  const [approvalDetailOpen, setApprovalDetailOpen] = useState(false);
  const [approvalOpinion, setApprovalOpinion] = useState('');
  // 审批记录详情
  const [historyDetail, setHistoryDetail] = useState<PublishApproval | null>(null);
  const [historyDetailOpen, setHistoryDetailOpen] = useState(false);

  const getResource = (id: string) => resources.find(r => r.id === id);

  const pendingApprovals = useMemo(() => publishApprovals.filter(a => {
    if (a.status !== 'pending') return false;
    const res = getResource(a.resourceId);
    if (approvalFilterValues.nameSearch && !res?.name.toLowerCase().includes(approvalFilterValues.nameSearch.toLowerCase())) return false;
    if (approvalFilterValues.applyType && a.applyType !== approvalFilterValues.applyType) return false;
    if (approvalFilterValues.applicantSearch && !a.applicant.toLowerCase().includes(approvalFilterValues.applicantSearch.toLowerCase())) return false;
    return true;
  }), [publishApprovals, approvalFilterValues, getResource]);

  // --- 审批记录 ---
  const [historyFilterValues, setHistoryFilterValues] = useState<Record<string, any>>({ nameSearch: '', applicantSearch: '', statusFilter: undefined });
  const nonPendingApprovals = useMemo(() => publishApprovals.filter(a => {
    if (a.status === 'pending') return false;
    const res = getResource(a.resourceId);
    if (historyFilterValues.nameSearch && !res?.name.toLowerCase().includes(historyFilterValues.nameSearch.toLowerCase())) return false;
    if (historyFilterValues.applicantSearch && !a.applicant.toLowerCase().includes(historyFilterValues.applicantSearch.toLowerCase())) return false;
    if (historyFilterValues.statusFilter && a.status !== historyFilterValues.statusFilter) return false;
    return true;
  }), [publishApprovals, historyFilterValues, getResource]);

  const pendingCount = pendingApprovals.length;

  const statCards = [
    { key: 'all', title: '资源总数', value: activeResources.length, color: '#1677ff', bg: '#e6f4ff', icon: <AppstoreOutlined /> },
    ...(['knowledge', 'model', 'api', 'mcp', 'skill'] as ResourceType[]).map(type => ({
      key: type, title: typeConfig[type].label,
      value: activeResources.filter(resource => resource.type === type).length,
      color: '#1677ff', bg: '#e6f4ff', icon: typeConfig[type].icon,
    })),
  ];
  const activeStatIndex = activeStat === null ? -1 : statCards.findIndex(item => item.key === activeStat);

  // ==================== 全部资源 Tab ====================
  const allResourcesTab = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
          filters={cardFilterFields}
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
                footer={<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <Dropdown menu={{ items: menuItems(resource) }} trigger={['click']}><Button type="text" size="small" icon={<MoreOutlined />} style={{ borderRadius: 6, fontSize: 12 }} onClick={(e) => e.stopPropagation()} /></Dropdown>
                </div>}
              />
            ))}
          </div>
          <PaginationBar current={cardPage} pageSize={cardPageSize} total={filtered.length} onChange={(p, s) => { setCardPage(p); setCardPageSize(s); }} />
        </div>
      </div>
    </div>
  );

  // ==================== 发布审批 Tab ====================
  const approvalsTab = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
      <FilterBar
        filters={approvalFilterFields}
        filterValues={approvalFilterValues}
        onFilterChange={(key, value) => setApprovalFilterValues(prev => ({ ...prev, [key]: value }))}
        onSearch={() => {}}
        onReset={() => setApprovalFilterValues({ nameSearch: '', applyType: undefined, applicantSearch: '' })}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
        <Table
          rowKey="id"
          dataSource={pendingApprovals}
          size="middle"
          style={{ marginTop: 12 }}
          pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
          locale={{ emptyText: <Empty description="暂无待审批的发布/下架申请" style={{ padding: '60px 0' }} /> }}
          onRow={(rec) => ({
            onClick: () => { setApprovalDetail(rec); setApprovalDetailOpen(true); },
            style: { cursor: 'pointer' },
          })}
          columns={[
            {
              title: '资源名称', key: 'resource', width: '24%',
              render: (_, rec: PublishApproval) => {
                const res = getResource(rec.resourceId);
                const type = res?.type;
                const typeLabel = type ? typeConfig[type]?.label : '';
                const colors: Record<string, string> = { model: '#722ed1', api: '#1890ff', mcp: '#fa8c16', knowledge: '#52c41a', skill: '#eb2f96' };
                return (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {type && renderTypeIcon(type)}
                    <div>
                      <div style={{ fontWeight: 600, color: '#262626', fontSize: 13 }}>{res?.name || '资源不存在'}</div>
                      {type && <Tag color={colors[type]} style={{ marginTop: 2, borderRadius: 4, fontSize: 10, margin: 0, padding: '0 4px', height: 16, lineHeight: '14px' }}>{typeLabel}</Tag>}
                    </div>
                  </div>
                );
              },
            },
            { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: '12%', render: (v: string) => <span style={{ fontSize: 13 }}>{v}</span> },
            {
              title: '申请类型', dataIndex: 'applyType', key: 'applyType', width: '10%',
              render: (v: string) => <Tag color={v === 'publish' ? 'blue' : 'orange'} style={{ borderRadius: 4 }}>{v === 'publish' ? '发布' : '下架'}</Tag>,
            },
            { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime', width: '16%', render: (v: string) => <span style={{ fontSize: 12, color: '#595959' }}>{v}</span> },
            {
              title: '公开策略', key: 'strategy', width: '12%',
              render: (_: unknown, rec: PublishApproval) => {
                const res = getResource(rec.resourceId);
                const s = res?.publicStrategy ? strategyConfig[res.publicStrategy] : null;
                return s ? <Tag color={s.color} style={{ borderRadius: 4, fontSize: 11 }}>{s.label}</Tag> : <span style={{ color: '#8c8c8c' }}>-</span>;
              },
            },
            {
              title: '操作', key: 'action', width: 160,
              render: (_: unknown, rec: PublishApproval) => (
                <Space size={8} onClick={e => e.stopPropagation()}>
                  <Button type="link" size="small" style={{ fontWeight: 600, padding: 0 }}
                    onClick={() => { setApprovalDetail(rec); setApprovalDetailOpen(true); }}>
                    详情
                  </Button>
                  <Button type="link" size="small" style={{ color: '#52c41a', fontWeight: 600, padding: 0 }}
                    onClick={() => {
                      const fn = rec.applyType === 'publish' ? approvePublish : approveOffline;
                      fn(rec.id, '同意');
                      message.success(`已审批通过${rec.applyType === 'publish' ? '发布' : '下架'}申请`);
                    }}>
                    通过
                  </Button>
                  <Popconfirm
                    title={rec.applyType === 'publish' ? '驳回发布申请' : '驳回下架申请'}
                    description={
                      <div style={{ marginTop: 8 }}>
                        <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>请填写驳回理由:</div>
                        <Input.TextArea id={`reject-opinion-${rec.id}`} placeholder="请输入驳回具体理由..." rows={2} style={{ width: 220 }} />
                      </div>
                    }
                    onConfirm={() => {
                      const el = document.getElementById(`reject-opinion-${rec.id}`) as HTMLTextAreaElement;
                      const reasonText = el?.value || '不符合发布规范';
                      const fn = rec.applyType === 'publish' ? rejectPublish : rejectOffline;
                      fn(rec.id, reasonText);
                      message.info(`已驳回${rec.applyType === 'publish' ? '发布' : '下架'}申请`);
                    }}
                    okText="确认驳回"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="link" danger size="small" style={{ fontWeight: 600, padding: 0 }}>驳回</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>

      {/* 审批详情 Drawer */}
      <Drawer
        title={approvalDetail?.applyType === 'publish' ? '发布审批详情' : '下架审批详情'}
        open={approvalDetailOpen}
        onClose={() => { setApprovalDetailOpen(false); setApprovalDetail(null); setApprovalOpinion(''); }}
        size="large"
        styles={{ body: { background: '#f5f7fa' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => { setApprovalDetailOpen(false); setApprovalDetail(null); setApprovalOpinion(''); }}>取消</Button>
            <Button danger onClick={() => {
              if (!approvalOpinion.trim()) { message.warning('请填写审批意见'); return; }
              const fn = approvalDetail!.applyType === 'publish' ? rejectPublish : rejectOffline;
              fn(approvalDetail!.id, approvalOpinion.trim());
              message.info('已驳回申请');
              setApprovalDetailOpen(false);
              setApprovalDetail(null);
              setApprovalOpinion('');
            }}>驳回</Button>
            <Button type="primary" onClick={() => {
              const fn = approvalDetail!.applyType === 'publish' ? approvePublish : approveOffline;
              fn(approvalDetail!.id, approvalOpinion.trim() || '同意');
              message.success('已审批通过');
              setApprovalDetailOpen(false);
              setApprovalDetail(null);
              setApprovalOpinion('');
            }}>通过</Button>
          </div>
        }
      >
        {approvalDetail && (() => {
          const app = approvalDetail;
          const res = getResource(app.resourceId);
          const type = res?.type ? typeConfig[res.type] : null;
          const strategy = res?.publicStrategy ? strategyConfig[res.publicStrategy] : null;
          const pubCfg = res?.publishStatus ? publishConfig[res.publishStatus] : null;
          return (
            <>
              {res ? (
                <Card styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    {type && (
                      <div style={{ width: 52, height: 52, borderRadius: 10, background: type.bg, color: type.color, display: 'grid', placeItems: 'center', fontSize: 26 }}>
                        {type.icon}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 650 }}>{res.name}</div>
                      <Space size={4} style={{ marginTop: 6 }}>
                        {type && <Tag color={type.color}>{type.label}</Tag>}
                        {pubCfg && <Tag color={pubCfg.color}>{pubCfg.label}</Tag>}
                      </Space>
                    </div>
                  </div>
                  <Descriptions column={2} size="small" items={[
                    { key: 'owner', label: '创建人', children: res.owner },
                    { key: 'date', label: '更新时间', children: res.updateTime },
                    { key: 'key', label: '资源标识', children: res.resourceKey || '—' },
                    { key: 'strategy', label: '可见范围', children: strategy ? <Tag color={strategy.color}>{strategy.label}</Tag> : '—' },
                    { key: 'desc', label: '资源描述', span: 2, children: res.description },
                  ]} />
                </Card>
              ) : (
                <Card styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                  <Empty description="该资源已不存在" />
                </Card>
              )}

              <Card title="申请信息" styles={{ body: { padding: 20 } }}>
                <Descriptions column={2} size="small" items={[
                  { key: 'applicant', label: '申请人', children: <span style={{ fontWeight: 500 }}>{app.applicant}</span> },
                  { key: 'type', label: '申请类型', children: <Tag color={app.applyType === 'publish' ? 'blue' : 'orange'}>{app.applyType === 'publish' ? '发布' : '下架'}</Tag> },
                  { key: 'time', label: '申请时间', children: app.applyTime },
                  ...(app.applyType === 'offline' ? [{ key: 'reason', label: '下架原因', span: 2, children: app.reason || '-' }] : []),
                ]} />
                {res && res.publicStrategy === 'whitelist' && res.visibleTargets && res.visibleTargets.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>可见目标</div>
                    <List
                      size="small"
                      dataSource={res.visibleTargets}
                      locale={{ emptyText: '未设置可见目标' }}
                      renderItem={t => <List.Item style={{ padding: '6px 0', fontSize: 13 }}>{t.name}</List.Item>}
                      style={{ background: '#fafafa', borderRadius: 6, padding: '4px 12px' }}
                    />
                  </div>
                )}
              </Card>

              <Card title="审批意见" styles={{ body: { padding: 20 } }} style={{ marginTop: 16 }}>
                <Input.TextArea
                  value={approvalOpinion}
                  onChange={e => setApprovalOpinion(e.target.value)}
                  placeholder="请输入审批意见（驳回时必填）"
                  rows={4}
                  style={{ width: '100%' }}
                />
              </Card>
            </>
          );
        })()}
      </Drawer>
    </div>
  );

  // ==================== 审批记录 Tab ====================
  const historyTab = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
      <FilterBar
        filters={historyFilterFields}
        filterValues={historyFilterValues}
        onFilterChange={(key, value) => setHistoryFilterValues(prev => ({ ...prev, [key]: value }))}
        onSearch={() => {}}
        onReset={() => setHistoryFilterValues({ nameSearch: '', applicantSearch: '', statusFilter: undefined })}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
        <Table
          rowKey="id"
          dataSource={nonPendingApprovals}
          size="middle"
          style={{ marginTop: 12 }}
          pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
          locale={{ emptyText: <Empty description="暂无审批记录" style={{ padding: '60px 0' }} /> }}
          onRow={(rec: PublishApproval) => ({ onClick: () => { setHistoryDetail(rec); setHistoryDetailOpen(true); }, style: { cursor: 'pointer' } })}
          columns={[
            {
              title: '资源名称', key: 'resource', width: '22%',
              render: (_, rec: PublishApproval) => {
                const res = getResource(rec.resourceId);
                const type = res?.type;
                const typeLabel = type ? typeConfig[type]?.label : '';
                return (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {type && renderTypeIcon(type)}
                    <div>
                      <div style={{ fontWeight: 600, color: '#262626', fontSize: 13 }}>{res?.name || '资源不存在'}</div>
                      {type && <Tag color={type === 'model' ? '#722ed1' : type === 'api' ? '#1890ff' : type === 'mcp' ? '#fa8c16' : type === 'skill' ? '#eb2f96' : '#52c41a'} style={{ marginTop: 2, borderRadius: 4, fontSize: 10, margin: 0, padding: '0 4px', height: 16, lineHeight: '14px' }}>{typeLabel}</Tag>}
                    </div>
                  </div>
                );
              },
            },
            { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: '12%', render: (v: string) => <span style={{ fontSize: 13 }}>{v}</span> },
            {
              title: '申请类型', dataIndex: 'applyType', key: 'applyType', width: '10%',
              render: (v: string) => <Tag color={v === 'publish' ? 'blue' : 'orange'} style={{ borderRadius: 4 }}>{v === 'publish' ? '发布' : '下架'}</Tag>,
            },
            {
              title: '审批决策', dataIndex: 'status', key: 'status', width: '10%',
              render: (status: string) => (
                <Tag color={status === 'approved' ? 'success' : 'error'} style={{ borderRadius: 4, fontWeight: 500 }}>
                  {status === 'approved' ? '审批通过' : '已驳回'}
                </Tag>
              ),
            },
            { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime', width: '14%', render: (v: string) => <span style={{ fontSize: 12, color: '#8c8c8c' }}>{v}</span> },
            { title: '审批人', dataIndex: 'operator', key: 'operator', width: '10%', render: (v: string) => <span style={{ fontSize: 12, color: '#595959' }}>{v || '—'}</span> },
            { title: '审批意见', dataIndex: 'opinion', key: 'opinion', render: (v: string) => <span style={{ fontSize: 12, color: '#262626' }}>{v || '—'}</span> },
          ]}
        />
      </div>

      {/* 审批记录详情 Drawer */}
      <Drawer
        title={historyDetail?.applyType === 'publish' ? '发布审批记录详情' : '下架审批记录详情'}
        open={historyDetailOpen}
        onClose={() => { setHistoryDetailOpen(false); setHistoryDetail(null); }}
        size="large"
        styles={{ body: { background: '#f5f7fa' } }}
        footer={null}
      >
        {historyDetail && (() => {
          const h = historyDetail;
          const res = getResource(h.resourceId);
          const type = res?.type ? typeConfig[res.type] : null;
          const strategy = res?.publicStrategy ? strategyConfig[res.publicStrategy] : null;
          const isApproved = h.status === 'approved';
          return (
            <>
              {res ? (
                <Card styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    {type && (
                      <div style={{ width: 52, height: 52, borderRadius: 10, background: type.bg, color: type.color, display: 'grid', placeItems: 'center', fontSize: 26 }}>
                        {type.icon}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 650 }}>{res.name}</div>
                      <Space size={4} style={{ marginTop: 6 }}>
                        {type && <Tag color={type.color}>{type.label}</Tag>}
                      </Space>
                    </div>
                  </div>
                  <Descriptions column={2} size="small" items={[
                    { key: 'owner', label: '创建人', children: res.owner },
                    { key: 'date', label: '更新时间', children: res.updateTime },
                    { key: 'key', label: '资源标识', children: res.resourceKey || '—' },
                    { key: 'strategy', label: '可见范围', children: strategy ? <Tag color={strategy.color}>{strategy.label}</Tag> : '—' },
                    { key: 'desc', label: '资源描述', span: 2, children: res.description },
                  ]} />
                </Card>
              ) : (
                <Card styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                  <Empty description="该资源已不存在" />
                </Card>
              )}

              <Card title="申请信息" styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small" items={[
                  { key: 'applicant', label: '申请人', children: <span style={{ fontWeight: 500 }}>{h.applicant}</span> },
                  { key: 'type', label: '申请类型', children: <Tag color={h.applyType === 'publish' ? 'blue' : 'orange'}>{h.applyType === 'publish' ? '发布' : '下架'}</Tag> },
                  { key: 'time', label: '申请时间', children: h.applyTime },
                  ...(h.applyType === 'offline' ? [{ key: 'reason', label: '下架原因', span: 2, children: h.reason || '-' }] : []),
                ]} />
                {res && res.publicStrategy === 'whitelist' && res.visibleTargets && res.visibleTargets.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>可见目标</div>
                    <List
                      size="small"
                      dataSource={res.visibleTargets}
                      locale={{ emptyText: '未设置可见目标' }}
                      renderItem={t => <List.Item style={{ padding: '6px 0', fontSize: 13 }}>{t.name}</List.Item>}
                      style={{ background: '#fafafa', borderRadius: 6, padding: '4px 12px' }}
                    />
                  </div>
                )}
              </Card>

              <Card title="审批结果" styles={{ body: { padding: 20 } }}>
                <Descriptions column={2} size="small" items={[
                  {
                    key: 'status', label: '审批决策',
                    children: <Tag color={isApproved ? 'success' : 'error'} style={{ fontWeight: 500 }}>{isApproved ? '审批通过' : '已驳回'}</Tag>,
                  },
                  { key: 'operator', label: '审批人', children: h.operator || '—' },
                  { key: 'approvalTime', label: '审批时间', children: h.approvalTime || '—' },
                  { key: 'opinion', label: '审批意见', span: 2, children: <span style={{ whiteSpace: 'pre-wrap' }}>{h.opinion || '—'}</span> },
                ]} />
              </Card>
            </>
          );
        })()}
      </Drawer>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="资源管理"
        hint="平台共享资源的创建、上架、公开策略、授权与安全删除"
      />

      <Tabs
        activeKey={manageTab}
        onChange={(val) => setManageTab(val as typeof manageTab)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        items={[
          { key: 'all', label: '全部资源', children: allResourcesTab },
          {
            key: 'approvals',
            label: (
              <span>
                发布审批
                {pendingCount > 0 && (
                  <Badge count={pendingCount} style={{ backgroundColor: '#ff4d4f', marginLeft: 6, transform: 'translateY(-2px)' }} />
                )}
              </span>
            ),
            children: approvalsTab,
          },
          { key: 'history', label: '审批记录', children: historyTab },
        ]}
      />

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
