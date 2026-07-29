import React, { useMemo, useState } from 'react';
import { App as AntdApp, Avatar, Badge, Button, Card, DatePicker, Drawer, Empty, Form, Input, Popconfirm, Radio, Select, Space, Table, Tabs, Tag, Tooltip } from 'antd';
import { AuditOutlined, PlusOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import type { ApplicationStatus, ResourceApplication, ResourceType } from '@/features/resource-center/types';
import { pageContainerStyle, typeConfig } from '@/features/resource-center/ui';

// V3色系映射（与原型一致）
const v3Color: Record<string, { bg: string; color: string }> = {
  model: { bg: '#f9f0ff', color: '#722ed1' },
  api: { bg: '#e6f7ff', color: '#1890ff' },
  mcp: { bg: '#fff7e6', color: '#fa8c16' },
  knowledge: { bg: '#f6ffed', color: '#52c41a' },
};

// ---------- 待审批 / 审批记录 共用筛选面板 ----------
interface ApprovalFiltersProps {
  pending?: boolean;
  nameSearch: string;
  onNameSearch: (v: string) => void;
  typeFilter: string;
  onTypeFilter: (v: string) => void;
  applicantSearch: string;
  onApplicantSearch: (v: string) => void;
  statusFilter?: string;
  onStatusFilter?: (v: string) => void;
}

const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
  pending, nameSearch, onNameSearch, typeFilter, onTypeFilter,
  applicantSearch, onApplicantSearch, statusFilter, onStatusFilter,
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, background: '#fafafa', padding: '16px', borderRadius: 8 }}>
    <Space size={16} wrap>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#595959', fontWeight: 500 }}>资源名称:</span>
        <Input placeholder="输入资源名称检索..." style={{ width: 180 }} value={nameSearch} onChange={e => onNameSearch(e.target.value)} allowClear />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#595959', fontWeight: 500 }}>资源类型:</span>
        <Select value={typeFilter} onChange={onTypeFilter} style={{ width: 120 }}>
          <Select.Option value="all">全部类型</Select.Option>
          <Select.Option value="knowledge">知识库</Select.Option>
          <Select.Option value="model">大模型</Select.Option>
          <Select.Option value="api">API</Select.Option>
          <Select.Option value="mcp">MCP</Select.Option>
        </Select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#595959', fontWeight: 500 }}>申请人:</span>
        <Input placeholder="检索申请人员..." style={{ width: 150 }} value={applicantSearch} onChange={e => onApplicantSearch(e.target.value)} allowClear />
      </div>
      {!pending && onStatusFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#595959', fontWeight: 500 }}>审批决策:</span>
          <Select value={statusFilter} onChange={onStatusFilter} style={{ width: 110 }}>
            <Select.Option value="all">全部决策</Select.Option>
            <Select.Option value="approved">已通过</Select.Option>
            <Select.Option value="rejected">已驳回</Select.Option>
          </Select>
        </div>
      )}
    </Space>
  </div>
);

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
    resources, grants, applications, auditLogs, approveApplication, rejectApplication,
    acquire, revokeGrant,
  } = useResourceCenter();

  // 权限管理子标签
  const [permissionSubTab, setPermissionSubTab] = useState<'pending' | 'history' | 'audit'>('pending');

  // --- 待审批筛选 ---
  const [pendingNameSearch, setPendingNameSearch] = useState('');
  const [pendingTypeFilter, setPendingTypeFilter] = useState('all');
  const [pendingApplicantSearch, setPendingApplicantSearch] = useState('');

  // --- 审批记录筛选 ---
  const [historyNameSearch, setHistoryNameSearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all');
  const [historyApplicantSearch, setHistoryApplicantSearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');

  const getResource = (id: string) => resources.find(r => r.id === id);
  const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || id;

  // --- 权限审计 ---
  const [selectedAuditSpaceId, setSelectedAuditSpaceId] = useState(spaces[0]?.id || '0');
  const [auditTypeFilter, setAuditTypeFilter] = useState('all');
  const [auditResourceSearchKey, setAuditResourceSearchKey] = useState('');

  const auditGrants = useMemo(() => grants.filter(g => g.spaceId === selectedAuditSpaceId), [grants, selectedAuditSpaceId]);

  const filteredAuditResources = useMemo(() => {
    let list = auditGrants
      .map(g => {
        const res = getResource(g.resourceId);
        return res ? { ...res, grant: g } : null;
      })
      .filter(Boolean) as (ReturnType<typeof getResource> & { grant: typeof auditGrants[number] })[];

    if (auditTypeFilter !== 'all') list = list.filter(r => r!.type === auditTypeFilter);
    if (auditResourceSearchKey) {
      const lower = auditResourceSearchKey.toLowerCase();
      list = list.filter(r => r!.name.toLowerCase().includes(lower) || (r!.description && r!.description.toLowerCase().includes(lower)));
    }
    return list;
  }, [auditGrants, auditResourceSearchKey, auditTypeFilter, getResource]);

  const selectedSpace = spaces.find(s => s.id === selectedAuditSpaceId);

  // --- 批量授权 ---
  const [batchAuthDrawerVisible, setBatchAuthDrawerVisible] = useState(false);
  const [batchAuthForm] = Form.useForm();

  const handleBatchAuthSubmit = () => {
    batchAuthForm.validateFields().then((values: { spaceIds: string[]; resourceIds: string[]; authDurationType: 'permanent' | 'custom'; expireDate?: any }) => {
      const { spaceIds, resourceIds, authDurationType, expireDate } = values;
      const expireStr = authDurationType === 'custom' && expireDate ? expireDate.format('YYYY-MM-DD') : undefined;
      let count = 0;
      spaceIds.forEach(sid => {
        resourceIds.forEach(rid => {
          if (acquire(rid, sid, '管理员授权')) count += 1;
        });
      });
      // expireDate暂不写入grant模型（当前模型无此字段），仅用于UI提示
      message.success(`已成功完成 ${count} 条空间资源授权`);
      setBatchAuthDrawerVisible(false);
      batchAuthForm.resetFields();
    });
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  // ==================== 待审批 Tab ====================
  const pendingTab = (
    <Card style={{ borderRadius: 12, border: '1px solid #e8e8e8', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }} styles={{ body: { padding: '20px 24px' } }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ApprovalFilters
          pending
          nameSearch={pendingNameSearch} onNameSearch={setPendingNameSearch}
          typeFilter={pendingTypeFilter} onTypeFilter={setPendingTypeFilter}
          applicantSearch={pendingApplicantSearch} onApplicantSearch={setPendingApplicantSearch}
        />
        <Table
          rowKey="id"
          dataSource={applications.filter(a => {
            if (a.status !== 'pending') return false;
            const res = getResource(a.resourceId);
            if (pendingNameSearch && !res?.name.toLowerCase().includes(pendingNameSearch.toLowerCase())) return false;
            if (pendingTypeFilter !== 'all' && res?.type !== pendingTypeFilter) return false;
            if (pendingApplicantSearch && !a.applicant.toLowerCase().includes(pendingApplicantSearch.toLowerCase())) return false;
            return true;
          })}
          size="middle"
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="当前没有待审批的资源申请" style={{ padding: '60px 0' }} /> }}
          columns={[
            {
              title: '申请资源名称 / 属性', key: 'resource', width: '24%',
              render: (_, rec: ResourceApplication) => {
                const res = getResource(rec.resourceId);
                const type = res?.type;
                const typeLabel = type ? typeConfig[type]?.label : '';
                return (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {type && renderTypeIcon(type)}
                    <div>
                      <div style={{ fontWeight: 600, color: '#262626', fontSize: 13 }}>{res?.name || '资源不存在'}</div>
                      {type && <Tag color={v3Color[type]?.color} style={{ marginTop: 2, borderRadius: 4, fontSize: 10, margin: 0, padding: '0 4px', height: 16, lineHeight: '14px' }}>{typeLabel}</Tag>}
                    </div>
                  </div>
                );
              },
            },
            {
              title: '申请人信息', key: 'applicant', width: '18%',
              render: (_, rec: ResourceApplication) => (
                <Space size={8}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 550, color: '#262626', marginBottom: 2 }}>{rec.applicant}</div>
                    <div style={{ fontSize: 12, color: '#595959', marginBottom: 2 }}>申请空间: {getSpaceName(rec.spaceId)}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>部门: {rec.dept}</div>
                  </div>
                </Space>
              ),
            },
            {
              title: '发起申请时间', dataIndex: 'applyTime', key: 'time', width: '16%',
              render: (t: string) => <span style={{ fontSize: 12, color: '#595959' }}>{t}</span>,
            },
            {
              title: '设定期限', dataIndex: 'duration', key: 'duration', width: '14%',
              render: (val: string, rec: ResourceApplication) => {
                const label = val === 'permanent' ? '永久有效' : rec.expireDate;
                return <Tag color={val === 'permanent' ? 'blue' : 'warning'} style={{ borderRadius: 4, fontSize: 11 }}>{label}</Tag>;
              },
            },
            {
              title: '申请理由', dataIndex: 'reason', key: 'reason', ellipsis: true,
              render: (text: string) => <span style={{ color: '#595959', fontSize: 12 }}>{text || '未填写理由'}</span>,
            },
            {
              title: '审批控制', key: 'action', width: '14%',
              render: (_, rec: ResourceApplication) => (
                <Space size={12}>
                  <Button type="link" size="small" style={{ color: '#52c41a', fontWeight: 600, padding: 0 }}
                    onClick={() => {
                      approveApplication(rec.id, '同意直接开通调用权限');
                      message.success(`已审核通过 [${rec.applicant}] 的申请`);
                    }}>
                    通过
                  </Button>
                  <Popconfirm
                    title="驳回该使用申请"
                    description={
                      <div style={{ marginTop: 8 }}>
                        <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>请填写驳回理由:</div>
                        <Input.TextArea id={`reject-opinion-${rec.id}`} placeholder="请输入驳回具体理由..." rows={2} style={{ width: 220 }} />
                      </div>
                    }
                    onConfirm={() => {
                      const el = document.getElementById(`reject-opinion-${rec.id}`) as HTMLTextAreaElement;
                      const opinionText = el?.value || '不具备业务访问权限';
                      rejectApplication(rec.id, opinionText);
                      message.info(`已成功驳回用户 [${rec.applicant}] 的使用申请。`);
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
    </Card>
  );

  // ==================== 审批记录 Tab ====================
  const historyTab = (
    <Card style={{ borderRadius: 12, border: '1px solid #e8e8e8', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }} styles={{ body: { padding: '20px 24px' } }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ApprovalFilters
          nameSearch={historyNameSearch} onNameSearch={setHistoryNameSearch}
          typeFilter={historyTypeFilter} onTypeFilter={setHistoryTypeFilter}
          applicantSearch={historyApplicantSearch} onApplicantSearch={setHistoryApplicantSearch}
          statusFilter={historyStatusFilter} onStatusFilter={setHistoryStatusFilter}
        />
        <Table
          rowKey="id"
          dataSource={applications.filter(a => {
            if (a.status === 'pending') return false;
            const res = getResource(a.resourceId);
            if (historyNameSearch && !res?.name.toLowerCase().includes(historyNameSearch.toLowerCase())) return false;
            if (historyTypeFilter !== 'all' && res?.type !== historyTypeFilter) return false;
            if (historyApplicantSearch && !a.applicant.toLowerCase().includes(historyApplicantSearch.toLowerCase())) return false;
            if (historyStatusFilter !== 'all' && a.status !== historyStatusFilter) return false;
            return true;
          })}
          size="middle"
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="暂无相关的历史决策审批记录" style={{ padding: '60px 0' }} /> }}
          columns={[
            {
              title: '申请资源名称 / 属性', key: 'resource', width: '22%',
              render: (_, rec: ResourceApplication) => {
                const res = getResource(rec.resourceId);
                const type = res?.type;
                const typeLabel = type ? typeConfig[type]?.label : '';
                return (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {type && renderTypeIcon(type)}
                    <div>
                      <div style={{ fontWeight: 600, color: '#262626', fontSize: 13 }}>{res?.name || '资源不存在'}</div>
                      {type && <Tag color={v3Color[type]?.color} style={{ marginTop: 2, borderRadius: 4, fontSize: 10, margin: 0, padding: '0 4px', height: 16, lineHeight: '14px' }}>{typeLabel}</Tag>}
                    </div>
                  </div>
                );
              },
            },
            {
              title: '申请人', key: 'applicant', width: '14%',
              render: (_, rec: ResourceApplication) => (
                <Space size={8}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{rec.applicant}</div>
                    <div style={{ fontSize: 12, color: '#595959', marginBottom: 2 }}>申请空间: {getSpaceName(rec.spaceId)}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>部门: {rec.dept}</div>
                  </div>
                </Space>
              ),
            },
            {
              title: '审批决策', dataIndex: 'status', key: 'status', width: '12%',
              render: (status: ApplicationStatus) => (
                <Tag color={status === 'approved' ? 'success' : 'error'} style={{ borderRadius: 4, fontWeight: 500 }}>
                  {status === 'approved' ? '审批通过' : '已驳回'}
                </Tag>
              ),
            },
            {
              title: '预计有效时效', key: 'duration', width: '12%',
              render: (_: unknown, rec: ResourceApplication) => (
                <span style={{ fontSize: 12, color: '#595959' }}>{rec.duration === 'permanent' ? '永久有效' : rec.expireDate}</span>
              ),
            },
            {
              title: '审批时间', dataIndex: 'approvalTime', key: 'time', width: '16%',
              render: (t: string) => <span style={{ fontSize: 12, color: '#8c8c8c' }}>{t || '—'}</span>,
            },
            {
              title: '审批人', dataIndex: 'operator', key: 'operator', width: '11%',
              render: (val: string) => <span style={{ fontSize: 12, color: '#595959' }}>{val || '系统自动'}</span>,
            },
            {
              title: '处理详情/驳回意见', dataIndex: 'opinion', key: 'opinion',
              render: (val: string) => <span style={{ fontSize: 12, color: '#262626' }}>{val || '-'}</span>,
            },
          ]}
        />
      </div>
    </Card>
  );

  // ==================== 权限审计 Tab ====================
  const auditTab = (
    <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
      <Card
        style={{ flex: 1, borderRadius: 12, border: '1px solid #e8e8e8', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}
        styles={{ body: { padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
          {/* Header: space select + count + add button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
            <Space size={16} style={{ flex: 1 }}>
              <Select
                style={{ width: 280 }}
                placeholder="请选择要审计的空间"
                value={selectedAuditSpaceId || undefined}
                onChange={setSelectedAuditSpaceId}
                options={spaces.map(s => ({ value: s.id, label: s.name }))}
              />
              {selectedSpace && (
                <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                  当前拥有的资源授权数: <strong style={{ color: '#1677ff' }}>{filteredAuditResources.length}</strong> 项
                </div>
              )}
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setBatchAuthDrawerVisible(true)} disabled={!selectedSpace}>
              为该空间添加授权
            </Button>
          </div>

          {!selectedSpace ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Empty description="请在左上角选择要审计的空间" />
            </div>
          ) : (
            <>
              {/* Type Filter + Search */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#fafafa', padding: '12px 16px', borderRadius: 8 }}>
                <Space size={16}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#595959', fontSize: 13, fontWeight: 500 }}>资源类型:</span>
                    <Radio.Group value={auditTypeFilter} onChange={e => setAuditTypeFilter(e.target.value)} optionType="button" buttonStyle="solid" size="small">
                      <Radio.Button value="all">全部</Radio.Button>
                      <Radio.Button value="knowledge">知识库</Radio.Button>
                      <Radio.Button value="model">模型</Radio.Button>
                      <Radio.Button value="api">API</Radio.Button>
                      <Radio.Button value="mcp">MCP</Radio.Button>
                    </Radio.Group>
                  </div>
                </Space>
                <Input.Search placeholder="搜索资源名称..." value={auditResourceSearchKey} onChange={e => setAuditResourceSearchKey(e.target.value)} allowClear style={{ width: 220 }} size="middle" />
              </div>

              {/* Table */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <Table
                  dataSource={filteredAuditResources}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  locale={{
                    emptyText: (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ color: '#8c8c8c', fontSize: 13, display: 'block', marginBottom: 12 }}>该空间暂无匹配授权资源</span>
                          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setBatchAuthDrawerVisible(true)}>立即添加授权</Button>
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
                      title: '管理', key: 'action', width: '10%',
                      render: (_, record: NonNullable<(typeof filteredAuditResources)[number]>) =>
                        record.grant.source === '完全公开' ? (
                          <Tooltip title="完全公开获取的资源无法单独移除权限">
                            <Button type="text" disabled size="small" style={{ padding: 0 }}>不可移除</Button>
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
                            <Button type="text" danger size="small" style={{ padding: 0 }}>移除权限</Button>
                          </Popconfirm>
                        ),
                    },
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );

  // ==================== 审计日志（保留在独立区域） ====================
  const auditLogPanel = auditLogs.length > 0 ? (
    <Card title={<Space><AuditOutlined />权限与资源操作日志</Space>} style={{ marginTop: 16 }}>
      <Table rowKey="id" size="small" dataSource={auditLogs} pagination={{ pageSize: 6 }} columns={[
        { title: '时间', dataIndex: 'time', width: 190 },
        { title: '资源', dataIndex: 'resourceId', width: 200, render: (id: string) => getResource(id)?.name || '资源已删除' },
        { title: '操作人', dataIndex: 'operator', width: 130 },
        { title: '操作', dataIndex: 'action', width: 180 },
        { title: '详情', dataIndex: 'detail' },
      ]} />
    </Card>
  ) : null;

  return (
    <div style={pageContainerStyle}>
      <PageHeader title="权限管理" hint="处理资源使用申请，并审计各空间的资源授权关系" extra={<Tag color="processing">待审批 {pendingCount}</Tag>} />

      <Tabs
        activeKey={permissionSubTab}
        onChange={(val) => setPermissionSubTab(val as typeof permissionSubTab)}
        tabBarExtraContent={permissionSubTab === 'audit' ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setBatchAuthDrawerVisible(true)} style={{ borderRadius: 6, fontWeight: 550 }}>批量添加授权</Button>
        ) : null}
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {auditTab}
              {auditLogPanel}
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
