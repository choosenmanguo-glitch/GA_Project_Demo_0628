import React, { useMemo, useState } from 'react';
import { App as AntdApp, Badge, Button, Card, Col, Empty, Input, Modal, Row, Select, Space, Table, Tabs, Tag } from 'antd';
import { AuditOutlined, CheckOutlined, CloseOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import type { ApplicationStatus, ResourceApplication, ResourceType } from '@/features/resource-center/types';
import { pageContainerStyle, panelStyle, typeConfig } from '@/features/resource-center/ui';

type ReviewMode = 'approve' | 'reject';

export default function ResourcePermissionsPage() {
  const { message } = AntdApp.useApp();
  const { spaces } = useWorkspace();
  const {
    resources, grants, applications, auditLogs, approveApplication, rejectApplication,
    acquire, revokeGrant,
  } = useResourceCenter();
  const [activeTab, setActiveTab] = useState('pending');
  const [resourceKeyword, setResourceKeyword] = useState('');
  const [applicantKeyword, setApplicantKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ResourceType>('all');
  const [historyStatus, setHistoryStatus] = useState<'all' | ApplicationStatus>('all');
  const [reviewTarget, setReviewTarget] = useState<ResourceApplication | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('approve');
  const [opinion, setOpinion] = useState('');
  const [auditSpaceId, setAuditSpaceId] = useState(spaces[0]?.id || '0');
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchResourceIds, setBatchResourceIds] = useState<string[]>([]);

  const getResource = (id: string) => resources.find(resource => resource.id === id);
  const getSpaceName = (id: string) => spaces.find(space => space.id === id)?.name || id;

  const filteredApplications = useMemo(() => applications.filter(application => {
    const resource = getResource(application.resourceId);
    const requiredStatus = activeTab === 'pending' ? application.status === 'pending' : application.status !== 'pending';
    if (!requiredStatus) return false;
    if (typeFilter !== 'all' && resource?.type !== typeFilter) return false;
    if (activeTab === 'history' && historyStatus !== 'all' && application.status !== historyStatus) return false;
    if (resourceKeyword && !resource?.name.toLowerCase().includes(resourceKeyword.toLowerCase())) return false;
    if (applicantKeyword && !application.applicant.toLowerCase().includes(applicantKeyword.toLowerCase())) return false;
    return true;
  }), [activeTab, applicantKeyword, applications, historyStatus, resourceKeyword, resources, typeFilter]);

  const pendingCount = applications.filter(application => application.status === 'pending').length;
  const auditGrants = grants.filter(grant => grant.spaceId === auditSpaceId);

  const columns = [
    {
      title: '申请资源', dataIndex: 'resourceId', width: 220,
      render: (id: string) => {
        const resource = getResource(id);
        if (!resource) return '资源不存在';
        const type = typeConfig[resource.type];
        return <Space><span style={{ color: type.color }}>{type.icon}</span><div><div style={{ fontWeight: 600 }}>{resource.name}</div><Tag variant="filled" style={{ color: type.color, background: type.bg }}>{type.label}</Tag></div></Space>;
      },
    },
    { title: '申请人', dataIndex: 'applicant', width: 120 },
    { title: '申请空间', dataIndex: 'spaceId', width: 180, render: getSpaceName },
    { title: '部门', dataIndex: 'dept', width: 130 },
    { title: '申请时间', dataIndex: 'applyTime', width: 170 },
    { title: '设定期限', width: 120, render: (_: unknown, record: ResourceApplication) => record.duration === 'permanent' ? '永久有效' : record.expireDate },
    { title: '申请理由', dataIndex: 'reason', ellipsis: true },
    ...(activeTab === 'pending' ? [{
      title: '审批控制', width: 140, fixed: 'right' as const,
      render: (_: unknown, record: ResourceApplication) => <Space size={4}>
        <Button type="link" icon={<CheckOutlined />} onClick={() => { setReviewTarget(record); setReviewMode('approve'); setOpinion(''); }}>通过</Button>
        <Button danger type="link" icon={<CloseOutlined />} onClick={() => { setReviewTarget(record); setReviewMode('reject'); setOpinion(''); }}>驳回</Button>
      </Space>,
    }] : [{
      title: '审批结果', width: 210,
      render: (_: unknown, record: ResourceApplication) => <div><Tag color={record.status === 'approved' ? 'success' : 'error'}>{record.status === 'approved' ? '已通过' : '已驳回'}</Tag><div style={{ color: '#8c95a5', fontSize: 12, marginTop: 4 }}>{record.operator} · {record.approvalTime}</div><div style={{ fontSize: 12 }}>{record.opinion}</div></div>,
    }]),
  ];

  const submitReview = () => {
    if (!reviewTarget) return;
    if (reviewMode === 'reject' && !opinion.trim()) return message.warning('驳回申请时必须填写审批意见');
    if (reviewMode === 'approve') approveApplication(reviewTarget.id, opinion.trim() || '同意使用该资源');
    else rejectApplication(reviewTarget.id, opinion.trim());
    message.success(reviewMode === 'approve' ? '审批通过，资源已加入申请空间的我的资源' : '申请已驳回');
    setReviewTarget(null);
  };

  const applicationList = <>
    <div style={{ ...panelStyle, padding: 14, marginBottom: 14 }}>
      <Space wrap>
        <Input value={resourceKeyword} onChange={event => setResourceKeyword(event.target.value)} allowClear placeholder="输入资源名称检索" style={{ width: 220 }} />
        <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 130 }} options={[{ value: 'all', label: '全部类型' }, ...Object.entries(typeConfig).map(([value, config]) => ({ value, label: config.label }))]} />
        <Input value={applicantKeyword} onChange={event => setApplicantKeyword(event.target.value)} allowClear placeholder="检索申请人员" style={{ width: 180 }} />
        {activeTab === 'history' && <Select value={historyStatus} onChange={setHistoryStatus} style={{ width: 130 }} options={[{ value: 'all', label: '全部结果' }, { value: 'approved', label: '已通过' }, { value: 'rejected', label: '已驳回' }]} />}
      </Space>
    </div>
    <div style={panelStyle}>
      <Table rowKey="id" dataSource={filteredApplications} columns={columns} scroll={{ x: 1250 }} pagination={{ pageSize: 8 }} locale={{ emptyText: <Empty description="暂无记录" /> }} />
    </div>
  </>;

  const auditPanel = <Row gutter={16}>
    <Col span={24}>
      <Card title={<Space><SafetyCertificateOutlined />空间授权审计</Space>} extra={<Space><Select value={auditSpaceId} onChange={setAuditSpaceId} style={{ width: 240 }} options={spaces.map(space => ({ value: space.id, label: `${space.name} · ${space.type}` }))} /><Button type="primary" onClick={() => setBatchOpen(true)}>批量授权</Button></Space>}>
        <Table rowKey="id" dataSource={auditGrants} pagination={false} locale={{ emptyText: <Empty description="该空间暂无已获取资源" /> }} columns={[
          { title: '资源名称', dataIndex: 'resourceId', render: (id: string) => getResource(id)?.name || '资源已删除' },
          { title: '资源类型', dataIndex: 'resourceId', render: (id: string) => { const type = getResource(id)?.type; return type ? <Tag color={typeConfig[type].color}>{typeConfig[type].label}</Tag> : '—'; } },
          { title: '授权来源', dataIndex: 'source' },
          { title: '授权时间', dataIndex: 'acquiredAt' },
          { title: '到期时间', dataIndex: 'expireDate', render: (value?: string) => value || '永久有效' },
          { title: '授权状态', render: (_: unknown, record: (typeof auditGrants)[number]) => <Tag color={record.revoked || record.expired ? 'error' : 'success'}>{record.revoked ? '已撤销' : record.expired ? '已过期' : '有效'}</Tag> },
          { title: '操作', render: (_: unknown, record: (typeof auditGrants)[number]) => <Button danger type="link" disabled={record.revoked || record.expired} onClick={() => { revokeGrant(record.resourceId, record.spaceId); message.success('授权已撤销'); }}>撤销授权</Button> },
        ]} />
      </Card>
    </Col>
    <Col span={24} style={{ marginTop: 16 }}>
      <Card title={<Space><AuditOutlined />权限与资源操作日志</Space>}>
        <Table rowKey="id" size="small" dataSource={auditLogs} pagination={{ pageSize: 6 }} columns={[
          { title: '时间', dataIndex: 'time', width: 190 },
          { title: '资源', dataIndex: 'resourceId', width: 200, render: (id: string) => getResource(id)?.name || '资源已删除' },
          { title: '操作人', dataIndex: 'operator', width: 130 },
          { title: '操作', dataIndex: 'action', width: 180 },
          { title: '详情', dataIndex: 'detail' },
        ]} />
      </Card>
    </Col>
  </Row>;

  return (
    <div style={pageContainerStyle}>
      <PageHeader title="权限管理" hint="处理资源使用申请，并审计各空间的资源授权关系" extra={<Tag color="processing">待审批 {pendingCount}</Tag>} />
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'pending', label: <Badge count={pendingCount} offset={[10, 0]}>待审批</Badge>, children: applicationList },
          { key: 'history', label: '审批记录', children: applicationList },
          { key: 'audit', label: '权限审计', children: auditPanel },
        ]}
      />

      <Modal title={reviewMode === 'approve' ? '审批通过' : '审批驳回'} open={!!reviewTarget} onCancel={() => setReviewTarget(null)} onOk={submitReview} okText={reviewMode === 'approve' ? '确认通过' : '确认驳回'} okButtonProps={{ danger: reviewMode === 'reject' }} destroyOnHidden>
        <div style={{ marginBottom: 12 }}>资源：<b>{reviewTarget ? getResource(reviewTarget.resourceId)?.name : ''}</b></div>
        <div style={{ marginBottom: 12 }}>申请空间：<b>{reviewTarget ? getSpaceName(reviewTarget.spaceId) : ''}</b></div>
        <Input.TextArea rows={4} value={opinion} onChange={event => setOpinion(event.target.value)} placeholder={reviewMode === 'approve' ? '审批意见（选填）' : '请输入驳回理由'} />
      </Modal>

      <Modal title={`批量授权 - ${getSpaceName(auditSpaceId)}`} open={batchOpen} onCancel={() => setBatchOpen(false)} onOk={() => {
        if (!batchResourceIds.length) return message.warning('请选择需要授权的资源');
        let count = 0;
        batchResourceIds.forEach(id => { if (acquire(id, auditSpaceId, '管理员授权')) count += 1; });
        message.success(`已新增 ${count} 条空间资源授权`);
        setBatchOpen(false);
        setBatchResourceIds([]);
      }} okText="确认授权" destroyOnHidden>
        <Select mode="multiple" value={batchResourceIds} onChange={setBatchResourceIds} style={{ width: '100%' }} placeholder="选择资源" options={resources.filter(resource => !resource.isDeleted).map(resource => ({ value: resource.id, label: `${typeConfig[resource.type].label} · ${resource.name}` }))} />
      </Modal>
    </div>
  );
}
