import React, { useState } from 'react';
import { Avatar, Badge, Button, Empty, Input, Popconfirm, Space, Table, Tabs, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { ApplicationStatus, ResourceApplication, ResourceItem, ResourceType } from '../types';
import { typeConfig } from '../ui';

const v3Color: Record<string, { bg: string; color: string }> = {
  model: { bg: '#f9f0ff', color: '#722ed1' },
  api: { bg: '#e6f7ff', color: '#1890ff' },
  mcp: { bg: '#fff7e6', color: '#fa8c16' },
  knowledge: { bg: '#f6ffed', color: '#52c41a' },
};

const renderTypeIcon = (type: string) => {
  const config = typeConfig[type as ResourceType];
  const colors = v3Color[type] || { bg: '#f0f0f0', color: '#8c8c8c' };
  return (
    <span style={{
      width: 28, height: 28, borderRadius: 4, backgroundColor: colors.bg, color: colors.color,
      display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 14, flexShrink: 0,
    }}>
      {config?.icon}
    </span>
  );
};

export interface ApprovalTableSectionProps {
  pendingData: ResourceApplication[];
  historyData: ResourceApplication[];
  getResource: (id: string) => ResourceItem | undefined;
  getSpaceName: (id: string) => string;
  onApprove: (app: ResourceApplication, opinion: string) => void;
  onReject: (app: ResourceApplication, opinion: string) => void;
  onRowClick?: (app: ResourceApplication) => void;
  /** 展示模式：'tabs'=带内部Tabs（默认），'pending'=仅待审批表格，'history'=仅审批记录表格 */
  mode?: 'tabs' | 'pending' | 'history';
  compact?: boolean;
  pendingCount?: number;
}

const ApprovalTableSection: React.FC<ApprovalTableSectionProps> = ({
  pendingData, historyData, getResource, getSpaceName,
  onApprove, onReject, onRowClick, mode = 'tabs', compact = false, pendingCount,
}) => {
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>('pending');

  // ---- 待审批表格列 ----
  const pendingColumns = [
    {
      title: '申请资源名称 / 属性', key: 'resource', width: '22%',
      render: (_: unknown, rec: ResourceApplication) => {
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
      title: '申请人信息', key: 'applicant', width: '16%',
      render: (_: unknown, rec: ResourceApplication) => (
        <Space size={8}>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 550, color: '#262626', marginBottom: 2 }}>
              {rec.applicant}
              <span style={{ fontSize: 11, color: '#8c8c8c', marginLeft: 8, fontWeight: 400 }}>{rec.dept}</span>
            </div>
            <div style={{ fontSize: 12, color: '#595959' }}>申请空间: {getSpaceName(rec.spaceId)}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '发起申请时间', dataIndex: 'applyTime', key: 'time', width: '14%',
      render: (t: string) => <span style={{ fontSize: 12, color: '#595959' }}>{t}</span>,
    },
    {
      title: '使用期限', dataIndex: 'duration', key: 'duration', width: '12%',
      render: (val: string, rec: ResourceApplication) => {
        const label = val === 'permanent' ? '永久有效' : rec.expireDate;
        return <span style={{ fontSize: 12, color: '#595959' }}>{label}</span>;
      },
    },
    {
      title: '申请理由', dataIndex: 'reason', key: 'reason', ellipsis: true,
      render: (text: string) => <span style={{ color: '#595959', fontSize: 12 }}>{text || '未填写理由'}</span>,
    },
    {
      title: '操作', key: 'action', width: 220,
      render: (_: unknown, rec: ResourceApplication) => (
        <Space size={8} onClick={e => e.stopPropagation()}>
          {onRowClick && !compact && (
            <Button type="link" size="small" style={{ fontWeight: 600, padding: 0 }}
              onClick={() => onRowClick(rec)}>
              详情
            </Button>
          )}
          <Button type="link" size="small" style={{ color: '#52c41a', fontWeight: 600, padding: 0 }}
            onClick={() => onApprove(rec, '同意直接开通调用权限')}>
            通过
          </Button>
          <Popconfirm
            title="驳回该使用申请"
            description={
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>请填写驳回理由:</div>
                <Input.TextArea
                  id={compact ? `usage-reject-${rec.id}` : `reject-opinion-${rec.id}`}
                  placeholder="请输入驳回具体理由..."
                  rows={2}
                  style={{ width: 220 }}
                  value={rejectReasons[rec.id] || ''}
                  onChange={e => setRejectReasons(prev => ({ ...prev, [rec.id]: e.target.value }))}
                />
              </div>
            }
            onConfirm={() => {
              const reason = rejectReasons[rec.id] || '不具备业务访问权限';
              onReject(rec, reason);
              setRejectReasons(prev => { const n = { ...prev }; delete n[rec.id]; return n; });
            }}
            onCancel={() => setRejectReasons(prev => { const n = { ...prev }; delete n[rec.id]; return n; })}
            okText="确认驳回"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger size="small" style={{ fontWeight: 600, padding: 0 }}>驳回</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ---- 审批记录表格列 ----
  const historyColumns = [
    {
      title: '申请资源名称 / 属性', key: 'resource', width: '22%',
      render: (_: unknown, rec: ResourceApplication) => {
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
      render: (_: unknown, rec: ResourceApplication) => (
        <Space size={8}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
              {rec.applicant}
              <span style={{ fontSize: 11, color: '#999', marginLeft: 6, fontWeight: 400 }}>{rec.dept}</span>
            </div>
            <div style={{ fontSize: 12, color: '#595959' }}>申请空间: {getSpaceName(rec.spaceId)}</div>
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
      title: '发起申请时间', dataIndex: 'applyTime', key: 'applyTime', width: '14%',
      render: (t: string) => <span style={{ fontSize: 12, color: '#595959' }}>{t}</span>,
    },
    {
      title: '审批时间', dataIndex: 'approvalTime', key: 'approvalTime', width: '14%',
      render: (t: string) => <span style={{ fontSize: 12, color: '#595959' }}>{t || '—'}</span>,
    },
    {
      title: '审批人', dataIndex: 'operator', key: 'operator', width: '10%',
      render: (v: string) => <span style={{ fontSize: 12, color: '#262626' }}>{v || '—'}</span>,
    },
    {
      title: '审批意见', dataIndex: 'opinion', key: 'opinion', ellipsis: true,
      render: (v: string) => <span style={{ fontSize: 12, color: '#262626' }}>{v || '—'}</span>,
    },
  ];

  // ---- Row 点击 ----
  const pendingRowHandler = onRowClick
    ? (rec: ResourceApplication) => ({ onClick: () => onRowClick(rec), style: { cursor: 'pointer' } })
    : undefined; // rowclick always available; detail button visibility controlled by compact in columns

  const historyRowHandler = onRowClick
    ? (rec: ResourceApplication) => ({ onClick: () => onRowClick(rec), style: { cursor: 'pointer' } })
    : undefined;

  const pendingTable = (
    <Table
      rowKey="id"
      dataSource={pendingData}
      size={compact ? 'small' : 'middle'}
      style={{ marginTop: 12 }}
      pagination={compact ? false : { defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
      onRow={pendingRowHandler}
      locale={{ emptyText: <Empty description={compact ? '暂无待审批申请' : '当前没有待审批的资源申请'} style={{ padding: '60px 0' }} /> }}
      columns={pendingColumns}
    />
  );

  const historyTable = (
    <Table
      rowKey="id"
      dataSource={historyData}
      size={compact ? 'small' : 'middle'}
      style={{ marginTop: 12 }}
      pagination={compact ? false : { defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
      onRow={historyRowHandler}
      locale={{ emptyText: <Empty description={compact ? '暂无审批记录' : '暂无相关的历史决策审批记录'} style={{ padding: '60px 0' }} /> }}
      columns={historyColumns}
    />
  );

  // 单表格模式
  if (mode === 'pending') return pendingTable;
  if (mode === 'history') return historyTable;

  // Tabs 模式
  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={[
        {
          key: 'pending',
          label: (
            <span>
              待审批
              {pendingCount != null && pendingCount > 0 && (
                <Badge count={pendingCount} style={{ backgroundColor: '#ff4d4f', marginLeft: 6, transform: 'translateY(-2px)' }} />
              )}
            </span>
          ),
          children: pendingTable,
        },
        {
          key: 'history',
          label: '审批记录',
          children: historyTable,
        },
      ]}
    />
  );
};

export default ApprovalTableSection;
