import React, { useEffect, useMemo, useState } from 'react';
import { App as AntdApp, Avatar, Badge, Button, Card, DatePicker, Descriptions, Drawer, Empty, Form, Input, List, Popconfirm, Radio, Select, Space, Table, Tabs, Tag, Tooltip } from 'antd';
import { PlusOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import FilterBar, { type FilterField } from '@/components/FilterBar';
import PaginationBar, { tablePagination } from '@/components/PaginationBar';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import ApprovalTableSection from '@/features/resource-center/components/ApprovalTableSection';
import type { ApplicationStatus, ResourceApplication, ResourceType } from '@/features/resource-center/types';
import { strategyConfig, typeConfig } from '@/features/resource-center/ui';

// V3色系映射（与原型一致）
const v3Color: Record<string, { bg: string; color: string }> = {
  model: { bg: '#f9f0ff', color: '#722ed1' },
  api: { bg: '#e6f7ff', color: '#1890ff' },
  mcp: { bg: '#fff7e6', color: '#fa8c16' },
  knowledge: { bg: '#f6ffed', color: '#52c41a' },
};

// 资源类型筛选选项（所有tab共用）
const typeFilterOptions = [
  { label: '全部类型', value: 'all' },
  { label: '知识库', value: 'knowledge' },
  { label: '模型', value: 'model' },
  { label: 'API', value: 'api' },
  { label: 'MCP', value: 'mcp' },
];

// 审批决策选项
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
];

// ---------- 资源类型图标的渲染函数 ----------
const renderTypeIcon = (type: string) => {
  const config = typeConfig[type as ResourceType];
  const icon = config?.icon;
  const colors = v3Color[type] || { bg: '#f0f0f0', color: '#8c8c8c' };
  return (
    <span style={{
      width: 28, height: 28, borderRadius: 4, backgroundColor: colors.bg, color: colors.color,
      display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 14, flexShrink: 0,
    }}>
      {icon}
    </span>
  );
};

// ---------- 主页面 ----------
export default function ResourcePermissionsPage() {
  const { message } = AntdApp.useApp();
  const { spaces } = useWorkspace();
  const {
    resources, grants, applications, approveApplication, rejectApplication,
    acquire, revokeGrant,
  } = useResourceCenter();

  // 权限管理子标签
  const [permissionSubTab, setPermissionSubTab] = useState<'pending' | 'history' | 'audit'>('pending');

  // --- 待审批详情抽屉 ---
  const [pendingDetailApp, setPendingDetailApp] = useState<ResourceApplication | null>(null);
  const [pendingDetailOpen, setPendingDetailOpen] = useState(false);
  const [pendingOpinion, setPendingOpinion] = useState('');
  // 审批记录详情
  const [historyDetailApp, setHistoryDetailApp] = useState<ResourceApplication | null>(null);
  const [historyDetailOpen, setHistoryDetailOpen] = useState(false);

  // --- 待审批筛选 ---
  const [pendingFilterValues, setPendingFilterValues] = useState<Record<string, any>>({ nameSearch: '', typeFilter: 'all', applicantSearch: '' });
  const pendingFilterFields: FilterField[] = [
    { type: 'search', key: 'nameSearch', placeholder: '资源名称', width: 200 },
    { type: 'select', key: 'typeFilter', placeholder: '资源类型', options: typeFilterOptions, width: 130 },
    { type: 'search', key: 'applicantSearch', placeholder: '申请人', width: 160 },
  ];

  // --- 审批记录筛选 ---
  const [historyFilterValues, setHistoryFilterValues] = useState<Record<string, any>>({ nameSearch: '', typeFilter: 'all', applicantSearch: '', statusFilter: 'all' });
  const historyFilterFields: FilterField[] = [
    { type: 'search', key: 'nameSearch', placeholder: '资源名称', width: 200 },
    { type: 'select', key: 'typeFilter', placeholder: '资源类型', options: typeFilterOptions, width: 130 },
    { type: 'search', key: 'applicantSearch', placeholder: '申请人', width: 160 },
    { type: 'select', key: 'statusFilter', placeholder: '审批结果', options: statusOptions, width: 120 },
  ];

  const getResource = (id: string) => resources.find(r => r.id === id);
  const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || id;

  // --- 权限审计 ---
  const [selectedAuditSpaceId, setSelectedAuditSpaceId] = useState('');
  const [auditFilterValues, setAuditFilterValues] = useState<Record<string, any>>({ typeFilter: 'all', keyword: '' });
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);

  const auditFilterFields: FilterField[] = [
    { type: 'search', key: 'keyword', placeholder: '资源名称', width: 200 },
  ];

  const auditGrants = useMemo(() => grants.filter(g => g.spaceId === selectedAuditSpaceId), [grants, selectedAuditSpaceId]);

  const filteredAuditResources = useMemo(() => {
    let list = auditGrants
      .map(g => {
        const res = getResource(g.resourceId);
        return res ? { ...res, grant: g } : null;
      })
      .filter(Boolean) as (ReturnType<typeof getResource> & { grant: typeof auditGrants[number] })[];

    if (auditFilterValues.typeFilter !== 'all') list = list.filter(r => r!.type === auditFilterValues.typeFilter);
    if (auditFilterValues.keyword) {
      const lower = auditFilterValues.keyword.toLowerCase();
      list = list.filter(r => r!.name.toLowerCase().includes(lower) || (r!.description && r!.description.toLowerCase().includes(lower)));
    }
    return list;
  }, [auditGrants, auditFilterValues, getResource]);

  const paginatedAuditResources = useMemo(() => {
    const start = (auditPage - 1) * auditPageSize;
    return filteredAuditResources.slice(start, start + auditPageSize);
  }, [filteredAuditResources, auditPage, auditPageSize]);

  // 切换空间/过滤条件时重置页码
  useEffect(() => {
    setAuditPage(1);
  }, [selectedAuditSpaceId, auditFilterValues]);

  const selectedSpace = spaces.find(s => s.id === selectedAuditSpaceId);

  // --- 批量授权 ---
  const [batchAuthDrawerVisible, setBatchAuthDrawerVisible] = useState(false);
  const [batchAuthForm] = Form.useForm();

  const handleBatchAuthSubmit = () => {
    batchAuthForm.validateFields().then((values: { spaceIds: string[]; resourceIds: string[]; authDurationType: 'permanent' | 'custom'; expireDate?: any }) => {
      const { spaceIds, resourceIds } = values;
      let count = 0;
      spaceIds.forEach(sid => {
        resourceIds.forEach(rid => {
          if (acquire(rid, sid, '管理员授权')) count += 1;
        });
      });
      message.success(`已成功完成 ${count} 条空间资源授权`);
      setBatchAuthDrawerVisible(false);
      batchAuthForm.resetFields();
    });
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  // 过滤后的数据
  const filteredPending = useMemo(() => applications.filter(a => {
    if (a.status !== 'pending') return false;
    const res = getResource(a.resourceId);
    if (pendingFilterValues.nameSearch && !res?.name.toLowerCase().includes(pendingFilterValues.nameSearch.toLowerCase())) return false;
    if (pendingFilterValues.typeFilter !== 'all' && res?.type !== pendingFilterValues.typeFilter) return false;
    if (pendingFilterValues.applicantSearch && !a.applicant.toLowerCase().includes(pendingFilterValues.applicantSearch.toLowerCase())) return false;
    return true;
  }), [applications, pendingFilterValues, getResource]);

  const filteredHistory = useMemo(() => applications.filter(a => {
    if (a.status === 'pending') return false;
    const res = getResource(a.resourceId);
    if (historyFilterValues.nameSearch && !res?.name.toLowerCase().includes(historyFilterValues.nameSearch.toLowerCase())) return false;
    if (historyFilterValues.typeFilter !== 'all' && res?.type !== historyFilterValues.typeFilter) return false;
    if (historyFilterValues.applicantSearch && !a.applicant.toLowerCase().includes(historyFilterValues.applicantSearch.toLowerCase())) return false;
    if (historyFilterValues.statusFilter !== 'all' && a.status !== historyFilterValues.statusFilter) return false;
    return true;
  }), [applications, historyFilterValues, getResource]);

  // ==================== 待审批 Tab ====================
  const pendingTab = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
      <FilterBar
        filters={pendingFilterFields}
        filterValues={pendingFilterValues}
        onFilterChange={(key, value) => setPendingFilterValues(prev => ({ ...prev, [key]: value }))}
        onSearch={() => {}}
        onReset={() => setPendingFilterValues({ nameSearch: '', typeFilter: 'all', applicantSearch: '' })}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
        <ApprovalTableSection
          mode="pending"
          pendingData={filteredPending}
          historyData={[]}
          getResource={getResource}
          getSpaceName={getSpaceName}
          onApprove={(app, opinion) => {
            approveApplication(app.id, opinion);
            message.success(`已审核通过 [${app.applicant}] 的申请`);
          }}
          onReject={(app, opinion) => {
            rejectApplication(app.id, opinion);
            message.info(`已成功驳回用户 [${app.applicant}] 的使用申请。`);
          }}
          onRowClick={(app) => { setPendingDetailApp(app); setPendingDetailOpen(true); }}
        />
      </div>

      {/* 待审批详情 Drawer */}
      <Drawer
        title="待审批详情"
        open={pendingDetailOpen}
        onClose={() => { setPendingDetailOpen(false); setPendingDetailApp(null); setPendingOpinion(''); }}
        size="large"
        styles={{ body: { background: '#f5f7fa' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => { setPendingDetailOpen(false); setPendingDetailApp(null); setPendingOpinion(''); }}>取消</Button>
            <Button danger onClick={() => {
              if (!pendingOpinion.trim()) { message.warning('请填写审批意见'); return; }
              rejectApplication(pendingDetailApp!.id, pendingOpinion.trim());
              message.info(`已成功驳回用户 [${pendingDetailApp!.applicant}] 的使用申请。`);
              setPendingDetailOpen(false);
              setPendingDetailApp(null);
              setPendingOpinion('');
            }}>驳回</Button>
            <Button type="primary" onClick={() => {
              approveApplication(pendingDetailApp!.id, pendingOpinion.trim() || '同意直接开通调用权限');
              message.success(`已审核通过 [${pendingDetailApp!.applicant}] 的申请`);
              setPendingDetailOpen(false);
              setPendingDetailApp(null);
              setPendingOpinion('');
            }}>通过</Button>
          </div>
        }
      >
        {pendingDetailApp && (() => {
          const app = pendingDetailApp;
          const res = getResource(app.resourceId);
          const type = res?.type ? typeConfig[res.type] : null;
          const strategy = res?.publicStrategy ? strategyConfig[res.publicStrategy] : null;
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
                  <Empty description="被申请的资源已不存在" />
                </Card>
              )}

              <Card title="申请信息" styles={{ body: { padding: 20 } }}>
                <Descriptions column={2} size="small" items={[
                  {
                    key: 'applicant', label: '申请人',
                    children: (
                      <Space size={8}>
                        <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                        <span style={{ fontWeight: 500 }}>{app.applicant}</span>
                        <span style={{ color: '#8c8c8c' }}>{app.dept}</span>
                      </Space>
                    ),
                  },
                  { key: 'space', label: '申请空间', children: getSpaceName(app.spaceId) },
                  { key: 'time', label: '申请时间', children: app.applyTime },
                  {
                    key: 'duration', label: '使用期限',
                    children: app.duration === 'permanent' ? '永久有效' : app.expireDate,
                  },
                  { key: 'reason', label: '申请理由', span: 2, children: <span style={{ whiteSpace: 'pre-wrap' }}>{app.reason || '未填写理由'}</span> },
                ]} />
              </Card>

              <Card title="审批意见" styles={{ body: { padding: 20 } }} style={{ marginTop: 16 }}>
                <Input.TextArea
                  value={pendingOpinion}
                  onChange={e => setPendingOpinion(e.target.value)}
                  placeholder="请输入审批意见（驳回时必填）"
                  rows={4}
                  style={{ width: '100%' }}
                />
              </Card>
            </>
          );
        })()}
      </Drawer>

      {/* 审批记录详情 Drawer */}
      <Drawer
        title="审批记录详情"
        open={historyDetailOpen}
        onClose={() => { setHistoryDetailOpen(false); setHistoryDetailApp(null); }}
        size="large"
        styles={{ body: { background: '#f5f7fa' } }}
        footer={null}
      >
        {historyDetailApp && (() => {
          const app = historyDetailApp;
          const res = getResource(app.resourceId);
          const type = res?.type ? typeConfig[res.type] : null;
          const strategy = res?.publicStrategy ? strategyConfig[res.publicStrategy] : null;
          const isApproved = app.status === 'approved';
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
                  <Empty description="被申请的资源已不存在" />
                </Card>
              )}

              <Card title="申请信息" styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small" items={[
                  {
                    key: 'applicant', label: '申请人',
                    children: (
                      <Space size={8}>
                        <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                        <span style={{ fontWeight: 500 }}>{app.applicant}</span>
                        <span style={{ color: '#8c8c8c' }}>{app.dept}</span>
                      </Space>
                    ),
                  },
                  { key: 'space', label: '申请空间', children: getSpaceName(app.spaceId) },
                  { key: 'time', label: '申请时间', children: app.applyTime },
                  {
                    key: 'duration', label: '使用期限',
                    children: app.duration === 'permanent' ? '永久有效' : app.expireDate,
                  },
                  { key: 'reason', label: '申请理由', span: 2, children: <span style={{ whiteSpace: 'pre-wrap' }}>{app.reason || '未填写理由'}</span> },
                ]} />
              </Card>

              <Card title="审批结果" styles={{ body: { padding: 20 } }}>
                <Descriptions column={2} size="small" items={[
                  {
                    key: 'status', label: '审批决策',
                    children: <Tag color={isApproved ? 'success' : 'error'} style={{ fontWeight: 500 }}>{isApproved ? '审批通过' : '已驳回'}</Tag>,
                  },
                  { key: 'operator', label: '审批人', children: app.operator || '—' },
                  { key: 'approvalTime', label: '审批时间', children: app.approvalTime || '—' },
                  { key: 'opinion', label: '审批意见', span: 2, children: <span style={{ whiteSpace: 'pre-wrap' }}>{app.opinion || '—'}</span> },
                ]} />
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
        onReset={() => setHistoryFilterValues({ nameSearch: '', typeFilter: 'all', applicantSearch: '', statusFilter: 'all' })}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
        <ApprovalTableSection
        mode="history"
        pendingData={[]}
        historyData={filteredHistory}
        getResource={getResource}
        getSpaceName={getSpaceName}
        onApprove={() => {}}
        onReject={() => {}}
        onRowClick={(app) => { setHistoryDetailApp(app); setHistoryDetailOpen(true); }}
      />
      </div>
    </div>
  );

  // ==================== 权限审计 Tab ====================
  const auditTab = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
      {/* 空间选择器栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Space size={16}>
          <Select
            style={{ width: 280 }}
            placeholder="请选择要审计的空间"
            value={selectedAuditSpaceId || undefined}
            onChange={setSelectedAuditSpaceId}
            optionFilterProp="label"
            allowClear
          >
            {spaces.map(s => (
              <Select.Option key={s.id} value={s.id} label={`${s.name} (${s.type})`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined style={{ color: '#1677ff' }} />
                  <span>{s.name}</span>
                  <span style={{ color: '#8c8c8c', fontSize: 12 }}>({s.type})</span>
                </div>
              </Select.Option>
            ))}
          </Select>
          {selectedSpace && (
            <div style={{ fontSize: 13, color: '#8c8c8c' }}>
              当前拥有的资源授权数: <strong style={{ color: '#1677ff' }}>{filteredAuditResources.length}</strong> 项
            </div>
          )}
        </Space>
      </div>

      {!selectedSpace ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '60vh' }}>
          <Empty description="请选择要审计的空间" />
        </div>
      ) : (
        <>
          {/* 筛选区 + 添加授权按钮 */}
          <FilterBar
            filters={auditFilterFields}
            filterValues={auditFilterValues}
            onFilterChange={(key, value) => setAuditFilterValues(prev => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setAuditFilterValues({ typeFilter: 'all', keyword: '' })}
            onCreate={() => { batchAuthForm.setFieldsValue({ spaceIds: [selectedAuditSpaceId] }); setBatchAuthDrawerVisible(true); }}
            createText="添加授权"
            prefix={
              <Radio.Group value={auditFilterValues.typeFilter || 'all'} onChange={e => setAuditFilterValues(prev => ({ ...prev, typeFilter: e.target.value }))} optionType="button" buttonStyle="solid">
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="knowledge">知识库</Radio.Button>
                <Radio.Button value="model">模型</Radio.Button>
                <Radio.Button value="api">API</Radio.Button>
                <Radio.Button value="mcp">MCP</Radio.Button>
              </Radio.Group>
            }
          />

          {/* Table */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
            <Table
              dataSource={paginatedAuditResources}
              rowKey="id"
              pagination={false}
              size="middle"
              style={{ marginTop: 12 }}
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#8c8c8c', fontSize: 13, display: 'block', marginBottom: 12 }}>该空间暂无匹配授权资源</span>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => { batchAuthForm.setFieldsValue({ spaceIds: [selectedAuditSpaceId] }); setBatchAuthDrawerVisible(true); }}>添加授权</Button>
                    </div>
                  } />
                ),
              }}
              columns={[
                {
                  title: '资源名称 / 描述', key: 'resource', width: '45%',
                  render: (_, record: NonNullable<(typeof filteredAuditResources)[number]>) => {
                    const type = record.type;
                    const config = typeConfig[type];
                    const colors = v3Color[type] || { bg: '#f0f0f0', color: '#8c8c8c' };
                    return (
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{
                          marginTop: 4, width: 32, height: 32, borderRadius: 6, backgroundColor: colors.bg, color: colors.color,
                          display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 16, flexShrink: 0,
                        }}>
                          {config?.icon}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: '#262626', fontSize: 14 }}>{record.name}</span>
                            <Tag color={v3Color[type]?.color} style={{ borderRadius: 4, fontSize: 11, margin: 0, padding: '0 4px', height: 18, lineHeight: '16px' }}>{config?.label}</Tag>
                          </div>
                          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.description}</div>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  title: '所有者', dataIndex: 'owner', key: 'owner', width: '18%',
                  render: (owner: string) => <Tag style={{ borderRadius: 12 }}>{owner}</Tag>,
                },
                {
                  title: '授权有效期', key: 'validity', width: '20%',
                  render: (_, record: NonNullable<(typeof filteredAuditResources)[number]>) => (
                    <div style={{ color: '#595959', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#8c8c8c', fontSize: 11 }}>始:</span>
                        <span>{record.grant.acquiredAt}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span style={{ color: '#8c8c8c', fontSize: 11 }}>止:</span>
                        <span>{record.grant.expireDate || '永久有效'}</span>
                      </div>
                    </div>
                  ),
                },
                {
                  title: '授权来源', dataIndex: ['grant', 'source'], key: 'source', width: '15%',
                  render: (source: string) => (
                    <Badge
                      status={source === '完全公开' ? 'default' : source === '管理员授权' ? 'processing' : 'success'}
                      text={<span style={{ color: '#595959', fontSize: 13 }}>{source}</span>}
                    />
                  ),
                },
                {
                  title: '操作', key: 'action', width: 130,
                  render: (_, record: NonNullable<(typeof filteredAuditResources)[number]>) =>
                    record.grant.source === '完全公开' ? (
                      <Tooltip title="完全公开获取的资源无法单独移除权限">
                        <Button type="text" disabled size="small" style={{ padding: 0, whiteSpace: 'nowrap' }}>不可移除</Button>
                      </Tooltip>
                    ) : (
                      <Popconfirm
                        title={`确认要移除空间 [${selectedSpace?.name}] 对资源 [${record.name}] 的专属使用权吗？`}
                        description="移除后该空间需重新申请，或者通过再次被管理员单独授权后方能恢复。"
                        onConfirm={() => {
                          revokeGrant(record.grant.resourceId, record.grant.spaceId);
                          message.success(`已成功移除了空间 [${selectedSpace?.name}] 对 [${record.name}] 的使用授权。`);
                        }}
                        okText="确定移除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="text" danger size="small" style={{ padding: 0, whiteSpace: 'nowrap' }}>移除权限</Button>
                      </Popconfirm>
                    ),
                },
              ]}
            />
            <PaginationBar
              current={auditPage}
              pageSize={auditPageSize}
              total={filteredAuditResources.length}
              pageSizeOptions={['10', '20', '50', '100']}
              onChange={(p, s) => { setAuditPage(p); setAuditPageSize(s); }}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="资源权限" hint="处理资源使用申请，并审计各空间的资源授权关系" />

      <Tabs
        activeKey={permissionSubTab}
        onChange={(val) => setPermissionSubTab(val as typeof permissionSubTab)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        items={[
          {
            key: 'pending',
            label: (
              <span>
                待审批
                {pendingCount > 0 && (
                  <Badge count={pendingCount} style={{ backgroundColor: '#ff4d4f', marginLeft: 6, transform: 'translateY(-2px)' }} />
                )}
              </span>
            ),
            children: pendingTab,
          },
          { key: 'history', label: '审批记录', children: historyTab },
          { key: 'audit', label: '权限审计', children: (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {auditTab}
            </div>
          )},
        ]}
      />

      {/* 批量授权 Drawer */}
      <Drawer
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SafetyCertificateOutlined style={{ color: '#1677ff' }} /><span>添加授权</span></div>}
        placement="right"
        styles={{ wrapper: { width: 520 } }}
        onClose={() => { setBatchAuthDrawerVisible(false); batchAuthForm.resetFields(); }}
        open={batchAuthDrawerVisible}
        forceRender
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '10px 16px' }}>
            <Button onClick={() => { setBatchAuthDrawerVisible(false); batchAuthForm.resetFields(); }}>取消</Button>
            <Button type="primary" onClick={handleBatchAuthSubmit}>确认直接授权</Button>
          </div>
        }
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 20, padding: '12px 16px', backgroundColor: '#e6f4ff', border: '1px solid #91caff', borderRadius: 8, fontSize: 13, color: '#1677ff' }}>
            <SafetyCertificateOutlined style={{ marginRight: 8 }} />
            在此处执行的批量授权为<b>使用权</b>，选中的空间将直接获取目标资源的合规调用凭证，无需再次经过多级审批流程。
          </div>
          <Form form={batchAuthForm} layout="vertical">
            <Form.Item name="spaceIds" label="授权空间" rules={[{ required: true, message: '请选择至少一个被授权空间' }]} extra="支持检索且可多选多个空间">
              <Select mode="multiple" placeholder="请搜索或选择被授权的空间..." style={{ width: '100%' }} optionFilterProp="label" allowClear>
                {spaces.map(s => (
                  <Select.Option key={s.id} value={s.id} label={`${s.name} (${s.type})`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserOutlined style={{ color: '#1677ff' }} />
                      <span>{s.name}</span>
                      <span style={{ color: '#8c8c8c', fontSize: 12 }}>({s.type})</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="resourceIds" label="目标资源" rules={[{ required: true, message: '请选择至少一项要授权的专属资源' }]}>
              <Select mode="multiple" placeholder="请搜索或选择需要进行分发的受控资源..." style={{ width: '100%' }} optionFilterProp="label" allowClear>
                {resources.filter(r => !r.isDeleted).map(r => (
                  <Select.Option key={r.id} value={r.id} label={r.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{r.name}</span>
                      <Tag style={{ margin: 0 }}>{typeConfig[r.type]?.label || r.type}</Tag>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="authDurationType" label="授权时效" initialValue="permanent">
              <Radio.Group>
                <Radio value="permanent">长期有效</Radio>
                <Radio value="custom">指定日期</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.authDurationType !== cur.authDurationType}>
              {({ getFieldValue }) =>
                getFieldValue('authDurationType') === 'custom' ? (
                  <Form.Item name="expireDate" label="授权截止日期" rules={[{ required: true, message: '请选择授权截止日期' }]}>
                    <DatePicker placeholder="请选择授权截止日期" style={{ width: '100%' }} />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
}
