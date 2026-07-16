import React, { useState, useMemo, useEffect } from 'react';
import {
  Table, Button, Space, Tag, Drawer, Form, Input, Select, Row, Col, Typography, Tabs, message, Dropdown, Modal, Popconfirm,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined, SettingOutlined, InfoCircleOutlined, TeamOutlined,
  HistoryOutlined, SearchOutlined, CrownOutlined,
  SafetyOutlined, UserOutlined, EditOutlined,
  StopOutlined, CheckCircleOutlined, DeleteOutlined, EllipsisOutlined,
  RobotOutlined, FileTextOutlined, ToolOutlined, ApiOutlined,
  ThunderboltOutlined, BookOutlined, ClockCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import PageTabs from '@/components/PageTabs';
import FilterBar from '@/components/FilterBar';
import StatCards from '@/components/StatCards';
import type { FilterField } from '@/components/FilterBar';
import { mockSpaces, mockMembers, type SpaceItem, type SpaceMember } from '@/mock/data';
import MemberSelect from '@/components/MemberSelect';
import StepDrawer from '@/components/StepDrawer';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import IconPicker, { type IconPickerValue } from '@/components/IconPicker';

const { Text, Title } = Typography;
const { TextArea } = Input;

const statusColorMap: Record<string, string> = { '启用': 'green', '冻结': 'blue', '归档': 'default' };

// ── Tab 1 筛选字段 ──
const spaceFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索空间名称', width: 220 },
  { type: 'select', key: 'status', placeholder: '状态', width: 100, options: [
    { label: '启用', value: '启用' }, { label: '冻结', value: '冻结' }, { label: '归档', value: '归档' },
  ]},
  { type: 'select', key: 'spaceType', placeholder: '空间类型', width: 120, options: [
    { label: '个人空间', value: '个人空间' }, { label: '工作空间', value: '工作空间' }, { label: '专案空间', value: '专案空间' },
  ]},
];

// ── Tab 2/3 筛选字段（无状态筛选） ──
const approvalFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索空间名称', width: 220 },
  { type: 'select', key: 'spaceType', placeholder: '空间类型', width: 120, options: [
    { label: '工作空间', value: '工作空间' }, { label: '专案空间', value: '专案空间' },
  ]},
];

export default function OpsSpacesPage() {
  const [activeTab, setActiveTab] = useState('manage');

  // ── Tab 1 状态 ──
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', status: undefined, spaceType: undefined });
  const [selectedSpace, setSelectedSpace] = useState<SpaceItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [detailTab, setDetailTab] = useState('info');
  const [editingInfo, setEditingInfo] = useState(false);
  const [editInfoIcon, setEditInfoIcon] = useState<IconPickerValue>({ mode: 'text' });
  const [memberAddOpen, setMemberAddOpen] = useState(false);
  const [memberAddRole, setMemberAddRole] = useState<'普通用户'>('普通用户');
  const [spaceMembers, setSpaceMembers] = useState<SpaceMember[]>(mockMembers);
  const [presetSelections, setPresetSelections] = useState<Record<string, string[]>>({});
  const [confirmState, setConfirmState] = useState<{ action: string; space: SpaceItem } | null>(null);
  const [createSpaceName, setCreateSpaceName] = useState('');
  const [createSpaceDept, setCreateSpaceDept] = useState<string | undefined>(undefined);
  const [createSpaceType, setCreateSpaceType] = useState('工作空间');
  const [createSpaceOwner, setCreateSpaceOwner] = useState<string | undefined>(undefined);
  const [createMembers, setCreateMembers] = useState<SpaceMember[]>([]);
  const [createSpaceIcon, setCreateSpaceIcon] = useState<IconPickerValue>({ mode: 'text' });

  // ── Tab 2 状态 ──
  const [pendingFilters, setPendingFilters] = useState<Record<string, any>>({ keyword: '', spaceType: undefined });

  // ── 审批详情抽屉 ──
  const [pendingDetailSpace, setPendingDetailSpace] = useState<SpaceItem | null>(null);
  const [pendingDetailOpen, setPendingDetailOpen] = useState(false);

  // ── 驳回原因 ──
  const [rejectionReasonOpen, setRejectionReasonOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // ── Tab 3 状态 ──
  const [rejectedFilters, setRejectedFilters] = useState<Record<string, any>>({ keyword: '', spaceType: undefined });

  // ── 触发刷新（mock 数据直接操作后需要） ──
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);

  // ── 创建空间：同步负责人到成员管理 ──
  useEffect(() => {
    if (createStep === 2 && createSpaceOwner) {
      const ownerInfo = memberOptions.find(m => m.value === createSpaceOwner);
      if (ownerInfo) {
        setCreateMembers(prev => {
          const existingOwner = prev.find(m => m.role === '所有者');
          if (existingOwner && existingOwner.name === ownerInfo.name) return prev;
          const withoutOwner = prev.filter(m => m.role !== '所有者');
          return [
            {
              id: `owner-${ownerInfo.value}`,
              name: ownerInfo.name,
              dept: ownerInfo.dept,
              role: '所有者' as const,
              joinTime: new Date().toISOString().slice(0, 10),
              lastActive: '',
            },
            ...withoutOwner,
          ];
        });
      }
    }
  }, [createStep, createSpaceOwner]);

  // ── 详情抽屉打开时初始化图标 ──
  useEffect(() => {
    if (selectedSpace) {
      setEditInfoIcon({ mode: 'text', text: selectedSpace.name.charAt(0) });
    }
  }, [selectedSpace]);

  // ── 确认操作执行（冻结/归档/删除） ──
  const handleConfirm = () => {
    if (!confirmState) return;
    const { action, space } = confirmState;
    if (action === '冻结') {
      space.status = '冻结';
      message.success(`空间「${space.name}」已冻结`);
    } else if (action === '归档') {
      space.status = '归档';
      message.success(`空间「${space.name}」已归档`);
    } else if (action === '删除') {
      message.success(`空间「${space.name}」已删除`);
    }
    setConfirmState(null);
    triggerRefresh();
  };

  // ── 审批通过 ──
  const handleApprove = (space: SpaceItem) => {
    space.status = '启用';
    const now = new Date();
    space.updateTime = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
    message.success(`空间申请已通过，「${space.name}」已启用`);
    setPendingDetailOpen(false);
    setPendingDetailSpace(null);
    triggerRefresh();
  };

  // ── 审批驳回 ──
  const handleReject = (space: SpaceItem) => {
    space.status = '已驳回';
    const now = new Date();
    space.updateTime = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
    message.success(`已驳回空间申请「${space.name}」${rejectionReason ? `，原因：${rejectionReason}` : ''}`);
    setRejectionReasonOpen(false);
    setRejectionReason('');
    setPendingDetailOpen(false);
    setPendingDetailSpace(null);
    triggerRefresh();
  };

  // ── 可选成员列表 ──
  const memberOptions = [
    { name: '演示用户', dept: '科信大队', value: 'u0' },
    { name: '李警官', dept: '指挥中心', value: 'u1' },
    { name: '王大队', dept: '反诈中心', value: 'u2' },
    { name: '赵警官', dept: '交警支队', value: 'u3' },
    { name: '陈队长', dept: '刑警大队', value: 'u4' },
    { name: '张警官', dept: '治安支队', value: 'u5' },
    { name: '周科长', dept: '法制大队', value: 'u6' },
    { name: '孙法官', dept: '法制大队', value: 'u7' },
    { name: '刘队长', dept: '巡特警支队', value: 'u8' },
    { name: '赵副组长', dept: '刑侦大队', value: 'u9' },
    { name: '钱警官', dept: '派出所', value: 'u10' },
  ];

  // ── Tab 1 数据 ──
  const tab1Spaces = useMemo(() => {
    return mockSpaces.filter(s => s.status !== '待审核' && s.status !== '已驳回');
  }, [refreshKey]);

  const filteredSpaces = useMemo(() => {
    return tab1Spaces.filter((s) => {
      if (filters.keyword && !s.name.includes(filters.keyword)) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (filters.spaceType && s.type !== filters.spaceType) return false;
      return true;
    });
  }, [tab1Spaces, filters]);

  // ── Tab 2 数据 ──
  const pendingSpaces = useMemo(() => {
    return mockSpaces.filter(s => s.status === '待审核').filter(s => {
      if (pendingFilters.keyword && !s.name.includes(pendingFilters.keyword)) return false;
      if (pendingFilters.spaceType && s.type !== pendingFilters.spaceType) return false;
      return true;
    });
  }, [refreshKey, pendingFilters]);

  // ── Tab 3 数据 ──
  const rejectedSpaces = useMemo(() => {
    return mockSpaces.filter(s => s.status === '已驳回').filter(s => {
      if (rejectedFilters.keyword && !s.name.includes(rejectedFilters.keyword)) return false;
      if (rejectedFilters.spaceType && s.type !== rejectedFilters.spaceType) return false;
      return true;
    });
  }, [refreshKey, rejectedFilters]);

  const [activeStatIndex, setActiveStatIndex] = useState<number | undefined>(undefined);

  // ── Tab 1 表格列 ──
  const tableColumns: ColumnsType<SpaceItem> = useMemo(() => [
    {
      title: '空间名称', dataIndex: 'name', width: 200,
      render: (n, r) => (
        <Space>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {n.charAt(0)}
          </div>
          <div>
            <a onClick={() => { setSelectedSpace(r); setDetailDrawerOpen(true); }} style={{ fontWeight: 500 }}>{n}</a>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{r.dept}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: '所属警种/部门', dataIndex: 'dept', width: 110,
      render: d => <Text type="secondary">{d}</Text>,
    },
    {
      title: '空间类型', dataIndex: 'type', width: 100,
      render: (t: string) => {
        const typeColorMap: Record<string, string> = { '个人空间': 'blue', '工作空间': 'green', '专案空间': 'orange' };
        return <Tag color={typeColorMap[t] || 'default'} style={{ borderRadius: 4 }}>{t}</Tag>;
      },
    },
    {
      title: '成员数', dataIndex: 'memberCount', width: 80,
      sorter: (a, b) => a.memberCount - b.memberCount,
    },
    {
      title: '智能体数', dataIndex: 'agentCount', width: 90,
      sorter: (a, b) => a.agentCount - b.agentCount,
    },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (s: string) => <Tag color={statusColorMap[s]}>{s}</Tag>,
    },
    {
      title: '创建时间', dataIndex: 'createTime', width: 110,
      sorter: (a, b) => a.createTime.localeCompare(b.createTime),
    },
    {
      title: '操作', width: 220,
      render: (_, r) => {
        const menuItems: MenuProps['items'] = [
          ...(r.status === '归档'
            ? [{ key: 'restore', label: '恢复', icon: <CheckCircleOutlined />, onClick: () => { r.status = '启用'; message.success(`空间「${r.name}」已恢复`); triggerRefresh(); } }]
            : r.status === '冻结'
              ? [{ key: 'enable', label: '启用', icon: <CheckCircleOutlined />, onClick: () => { r.status = '启用'; message.success(`空间「${r.name}」已启用`); triggerRefresh(); } }]
              : [{ key: 'freeze', label: '冻结', icon: <StopOutlined />, onClick: () => setConfirmState({ action: '冻结', space: r }) }]
          ),
          ...(r.status !== '归档' ? [{ key: 'archive', label: '归档', icon: <SettingOutlined />, onClick: () => setConfirmState({ action: '归档', space: r }) }] : []),
          { type: 'divider' },
          { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true, onClick: () => setConfirmState({ action: '删除', space: r }) },
        ];
        return (
          <Space size={0} wrap>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelectedSpace(r); setEditingInfo(true); setDetailTab('info'); setDetailDrawerOpen(true); }}>编辑</Button>
            <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => { setSelectedSpace(r); setDetailTab('members'); setDetailDrawerOpen(true); }}>成员</Button>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="link" size="small" icon={<EllipsisOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ], []);

  // ── Tab 2 待审批表格列 ──
  const pendingColumns: ColumnsType<SpaceItem> = useMemo(() => [
    {
      title: '空间名称', dataIndex: 'name', width: 200,
      render: (n, r) => (
        <Space>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {n.charAt(0)}
          </div>
          <div>
            <a onClick={() => { setPendingDetailSpace(r); setPendingDetailOpen(true); }} style={{ fontWeight: 500 }}>{n}</a>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{r.dept}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: '空间类型', dataIndex: 'type', width: 100,
      render: (t: string) => {
        const typeColorMap: Record<string, string> = { '工作空间': 'green', '专案空间': 'orange' };
        return <Tag color={typeColorMap[t] || 'default'} style={{ borderRadius: 4 }}>{t}</Tag>;
      },
    },
    {
      title: '申请人', dataIndex: 'creator', width: 90,
    },
    {
      title: '所属部门', dataIndex: 'dept', width: 110,
    },
    {
      title: '成员数', dataIndex: 'memberCount', width: 70,
    },
    {
      title: '预置资源', dataIndex: 'modelCount', width: 220,
      render: (_, r) => (
        <Space size={6} wrap style={{ fontSize: 12 }}>
          <span><RobotOutlined style={{ color: '#1677ff', marginRight: 2 }} />{r.modelCount}</span>
          <span><FileTextOutlined style={{ color: '#722ed1', marginRight: 2 }} />{r.promptCount}</span>
          <span><ToolOutlined style={{ color: '#fa8c16', marginRight: 2 }} />{r.toolCount}</span>
          <span><ApiOutlined style={{ color: '#52c41a', marginRight: 2 }} />{r.connectorCount}</span>
          <span><BookOutlined style={{ color: '#eb2f96', marginRight: 2 }} />{r.knowledgeCount}</span>
        </Space>
      ),
    },
    {
      title: '申请时间', dataIndex: 'createTime', width: 170,
    },
    {
      title: '操作', width: 100,
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          onClick={() => { setPendingDetailSpace(r); setPendingDetailOpen(true); }}
        >
          审批
        </Button>
      ),
    },
  ], []);

  // ── Tab 3 审批记录表格列 ──
  const rejectedColumns: ColumnsType<SpaceItem> = useMemo(() => [
    {
      title: '空间名称', dataIndex: 'name', width: 200,
      render: (n, r) => (
        <Space>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {n.charAt(0)}
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>{n}</span>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{r.dept}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: '空间类型', dataIndex: 'type', width: 100,
      render: (t: string) => {
        const typeColorMap: Record<string, string> = { '工作空间': 'green', '专案空间': 'orange' };
        return <Tag color={typeColorMap[t] || 'default'} style={{ borderRadius: 4 }}>{t}</Tag>;
      },
    },
    {
      title: '申请人', dataIndex: 'creator', width: 90,
    },
    {
      title: '所属部门', dataIndex: 'dept', width: 110,
    },
    {
      title: '成员数', dataIndex: 'memberCount', width: 70,
    },
    {
      title: '预置资源', dataIndex: 'modelCount', width: 220,
      render: (_, r) => (
        <Space size={6} wrap style={{ fontSize: 12 }}>
          <span><RobotOutlined style={{ color: '#1677ff', marginRight: 2 }} />{r.modelCount}</span>
          <span><FileTextOutlined style={{ color: '#722ed1', marginRight: 2 }} />{r.promptCount}</span>
          <span><ToolOutlined style={{ color: '#fa8c16', marginRight: 2 }} />{r.toolCount}</span>
          <span><ApiOutlined style={{ color: '#52c41a', marginRight: 2 }} />{r.connectorCount}</span>
          <span><BookOutlined style={{ color: '#eb2f96', marginRight: 2 }} />{r.knowledgeCount}</span>
        </Space>
      ),
    },
    {
      title: '审批人', dataIndex: 'approver', width: 90,
      render: (v) => v || '-',
    },
    {
      title: '审批时间', dataIndex: 'updateTime', width: 170,
    },
    {
      title: '驳回原因', dataIndex: 'rejectionReason', width: 180,
      render: (v) => v ? <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> : '-',
      ellipsis: true,
    },
  ], []);

  // ── 创建步骤 ──
  const createSteps = [
    { title: '基本信息' },
    { title: '预置资源' },
    { title: '成员管理' },
    { title: '确认创建' },
  ];

  // ── 待审批角标数 ──
  const pendingCount = useMemo(() => mockSpaces.filter(s => s.status === '待审核').length, [refreshKey]);

  // ── 打开审批详情并重置驳回原因 ──
  const openPendingDetail = (space: SpaceItem) => {
    setPendingDetailSpace(space);
    setRejectionReason('');
    setPendingDetailOpen(true);
  };

  // ── 从抽屉发起驳回 ──
  const handleRejectFromDrawer = () => {
    setRejectionReasonOpen(true);
  };

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="空间管理" hint="管理平台全部工作空间，包括创建、编辑、状态管理以及审批空间申请" />

      <PageTabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setActiveStatIndex(undefined);
        }}
        items={[
          {
            key: 'manage',
            label: '空间管理',
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <StatCards
                  items={[
                    { title: '总空间数', value: tab1Spaces.length, color: '#1677ff', onClick: () => { setActiveStatIndex(0); setFilters(prev => ({ ...prev, spaceType: undefined })); } },
                    { title: '个人空间', value: tab1Spaces.filter(s => s.type === '个人空间').length, color: '#52c41a', onClick: () => { setActiveStatIndex(1); setFilters(prev => ({ ...prev, spaceType: '个人空间' })); } },
                    { title: '工作空间', value: tab1Spaces.filter(s => s.type === '工作空间').length, color: '#722ed1', onClick: () => { setActiveStatIndex(2); setFilters(prev => ({ ...prev, spaceType: '工作空间' })); } },
                    { title: '专案空间', value: tab1Spaces.filter(s => s.type === '专案空间').length, color: '#fa8c16', onClick: () => { setActiveStatIndex(3); setFilters(prev => ({ ...prev, spaceType: '专案空间' })); } },
                  ]}
                  activeIndex={activeStatIndex}
                  colSpan={6}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                  <FilterBar
                    filters={spaceFilterFields}
                    filterValues={filters}
                    onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
                    onSearch={() => {}}
                    onReset={() => { setFilters({ keyword: '', status: undefined, spaceType: undefined }); setActiveStatIndex(undefined); }}
                    onCreate={() => { setCreateStep(0); setCreateDrawerOpen(true); }}
                    createText="创建空间"
                  />
                  <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
                    <Table
                      rowKey="id"
                      columns={tableColumns}
                      dataSource={filteredSpaces}
                      size="middle"
                      style={{ marginTop: 12 }}
                      pagination={{
                        defaultPageSize: 20,
                        showSizeChanger: true,
                        showTotal: (t) => `共 ${t} 条`,
                      }}
                      onRow={(record) => ({
                        onClick: () => setSelectedSpace(record),
                        style: {
                          cursor: 'pointer',
                          background: selectedSpace?.id === record.id ? '#f0f5ff' : undefined,
                        },
                      })}
                    />
                  </div>
                </div>
                </div>
              ),
            },
            {
              key: 'pending',
              label: (
                <Space size={4}>
                  待审批
                  {pendingCount > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: 18, height: 18, borderRadius: 9,
                      backgroundColor: '#ff4d4f', color: '#fff',
                      fontSize: 11, fontWeight: 600, padding: '0 5px',
                    }}>
                      {pendingCount}
                    </span>
                  )}
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                    <FilterBar
                      filters={approvalFilterFields}
                      filterValues={pendingFilters}
                      onFilterChange={(key, value) => setPendingFilters((prev) => ({ ...prev, [key]: value }))}
                      onSearch={() => {}}
                      onReset={() => setPendingFilters({ keyword: '', spaceType: undefined })}
                    />
                    <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
                      <Table
                        rowKey="id"
                        columns={pendingColumns}
                        dataSource={pendingSpaces}
                        size="middle"
                        style={{ marginTop: 12 }}
                        pagination={{
                          defaultPageSize: 20,
                          showSizeChanger: true,
                          showTotal: (t) => `共 ${t} 条待审批`,
                        }}
                        locale={{ emptyText: '暂无待审批的空间申请' }}
                        onRow={(record) => ({
                          style: { cursor: 'pointer' },
                          onClick: () => openPendingDetail(record),
                        })}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'rejected',
              label: '审批记录',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                  <StatCards
                    items={[
                      { title: '已驳回', value: mockSpaces.filter(s => s.status === '已驳回').length, color: '#ff4d4f' },
                      { title: '已通过', value: mockSpaces.filter(s => s.status === '启用' && parseInt(s.id) >= 11).length, color: '#52c41a' },
                      { title: '驳回率', value: (() => { const r = mockSpaces.filter(s => s.status === '已驳回').length; const a = mockSpaces.filter(s => s.status === '启用' && parseInt(s.id) >= 11).length; return a + r > 0 ? Math.round((r / (a + r)) * 100) + '%' : '0%'; })(), color: '#fa8c16' },
                    ]}
                    colSpan={8}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                    <FilterBar
                      filters={approvalFilterFields}
                      filterValues={rejectedFilters}
                      onFilterChange={(key, value) => setRejectedFilters((prev) => ({ ...prev, [key]: value }))}
                      onSearch={() => {}}
                      onReset={() => setRejectedFilters({ keyword: '', spaceType: undefined })}
                    />
                    <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
                      <Table
                        rowKey="id"
                        columns={rejectedColumns}
                        dataSource={rejectedSpaces}
                        size="middle"
                        style={{ marginTop: 12 }}
                        pagination={{
                          defaultPageSize: 20,
                          showSizeChanger: true,
                          showTotal: (t) => `共 ${t} 条记录`,
                        }}
                        locale={{ emptyText: '暂无审批记录' }}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />

      {/* ── 审批详情抽屉 ── */}
      <Drawer
        title={pendingDetailSpace ? `审批空间申请 - ${pendingDetailSpace.name}` : '审批空间申请'}
        open={pendingDetailOpen}
        onClose={() => { setPendingDetailOpen(false); setPendingDetailSpace(null); }}
        width={640}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleRejectFromDrawer}
            >
              驳回（填写原因）
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                if (pendingDetailSpace) handleApprove(pendingDetailSpace);
              }}
            >
              确认通过
            </Button>
          </div>
        }
      >
        {pendingDetailSpace && (
          <div style={{ padding: '16px 24px' }}>
            {/* 头部 */}
            <div style={{ padding: '20px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0', marginBottom: 16 }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 20,
                  }}>
                    {pendingDetailSpace.name.charAt(0)}
                  </div>
                </Col>
                <Col flex={1}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{pendingDetailSpace.name}</div>
                  <Space size={6}>
                    <Tag color={pendingDetailSpace.type === '专案空间' ? 'orange' : 'green'}>{pendingDetailSpace.type}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{pendingDetailSpace.dept}</Text>
                    <Tag color="orange">待审核</Tag>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* 基本信息 */}
            <div style={{ padding: '20px', borderRadius: 10, background: '#f5f8ff', border: '1px solid #d6e4ff', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>基本信息</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { label: '空间名称', value: pendingDetailSpace.name },
                  { label: '空间类型', value: pendingDetailSpace.type },
                  { label: '所属部门', value: pendingDetailSpace.dept },
                  { label: '负责人', value: pendingDetailSpace.creator },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', padding: '6px 0' }}>
                    <Text type="secondary" style={{ width: 100 }}>{item.label}</Text>
                    <span style={{ fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 预置资源清单 */}
            <div style={{ padding: '20px', borderRadius: 10, background: '#fafafa', border: '1px solid #f0f0f0', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>预置资源清单</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { label: '模型', values: ['DeepSeek-Chat', 'Qwen-72B-Chat'] },
                  { label: '提示词', values: ['案情摘要模板'] },
                  { label: '工具', values: ['文书智能解析', '人口信息查询'] },
                  { label: '连接器', values: ['公安数据库连接器'] },
                  { label: '知识库', values: [] as string[] },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', padding: '6px 0' }}>
                    <Text type="secondary" style={{ width: 100 }}>{item.label}</Text>
                    <span>
                      {item.values.length > 0
                        ? item.values.map(v => (
                            <Tag key={v} style={{ marginBottom: 4 }}>{v}</Tag>
                          ))
                        : <Text type="secondary">未选择</Text>
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 成员清单 */}
            <div style={{ padding: '20px', borderRadius: 10, background: '#fafafa', border: '1px solid #f0f0f0', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>成员清单</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { name: '赵警官', dept: '网安支队', role: '所有者', isOwner: true },
                  { name: '孙法官', dept: '法制大队', role: '普通用户', isOwner: false },
                  { name: '刘队长', dept: '巡特警支队', role: '普通用户', isOwner: false },
                ].map(m => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', padding: '6px 0' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: '#1677ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12, marginRight: 8, flexShrink: 0,
                    }}>
                      {m.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{m.name}</span>
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{m.dept}</Text>
                    <Tag style={{ marginLeft: 8 }} color={m.isOwner ? 'gold' : undefined}>
                      {m.isOwner && <CrownOutlined style={{ marginRight: 2 }} />}{m.role}
                    </Tag>
                  </div>
                ))}
              </div>
            </div>

            {/* 审批提示 */}
            <div style={{
              padding: '16px 20px', borderRadius: 10, background: '#fffbe6',
              border: '1px solid #ffe58f',
            }}>
              <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#d48806' }}>审批须知</Title>
              <div style={{ fontSize: 13, color: '#8c6d00', lineHeight: '22px' }}>
                <div>通过后，该空间将立即启用，空间创建者将自动成为空间所有者。</div>
                <div>驳回需填写驳回原因，驳回后该空间不会出现在用户切换列表中。</div>
                <div>请确认空间名称、类型和所属部门无误后再操作。</div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ── 驳回原因弹窗 ── */}
      <Modal
        title="填写驳回原因"
        open={rejectionReasonOpen}
        onCancel={() => { setRejectionReasonOpen(false); setRejectionReason(''); }}
        onOk={() => {
          if (!rejectionReason.trim()) {
            message.warning('请填写驳回原因');
            return;
          }
          if (pendingDetailSpace) handleReject(pendingDetailSpace);
        }}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="驳回原因" required>
            <TextArea
              rows={4}
              placeholder="请填写驳回原因，以便申请人了解审批结果"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 创建空间抽屉 ── */}
      <StepDrawer
        title="创建空间"
        open={createDrawerOpen}
        onClose={() => { setCreateDrawerOpen(false); setCreateSpaceName(''); setCreateSpaceDept(undefined); setCreateSpaceType('工作空间'); setCreateSpaceOwner(undefined); setCreateMembers([]); setPresetSelections({}); }}
        steps={createSteps}
        current={createStep}
        totalSteps={createSteps.length}
        onCurrentChange={setCreateStep}
        onFinish={() => {
          message.success('空间创建成功');
          setCreateDrawerOpen(false);
          setCreateSpaceName('');
          setCreateSpaceDept(undefined);
          setCreateSpaceType('工作空间');
          setCreateSpaceOwner(undefined);
          setCreateMembers([]);
          setPresetSelections({});
          triggerRefresh();
        }}
      >
        {/* 第一步：基本信息 */}
        {createStep === 0 && (
          <Form layout="vertical">
            <Form.Item label="空间名称" required rules={[{ required: true }]}>
              <Input
                placeholder="请输入空间名称"
                style={{ borderRadius: 6 }}
                value={createSpaceName}
                onChange={(e) => setCreateSpaceName(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="空间描述">
              <TextArea rows={3} placeholder="描述该空间的用途和适用范围" style={{ borderRadius: 6 }} />
            </Form.Item>
            <Form.Item label="空间图标">
              <IconPicker
                value={createSpaceIcon}
                onChange={setCreateSpaceIcon}
                size={64}
                defaultName={createSpaceName}
              />
            </Form.Item>
            <Form.Item label="所属警种/部门">
              <Select
                placeholder="从组织架构中选择（选填）"
                style={{ borderRadius: 6 }}
                value={createSpaceDept}
                onChange={setCreateSpaceDept}
                allowClear
                options={[
                  '指挥中心', '反诈中心', '刑警大队', '交警支队', '治安支队',
                  '法制大队', '派出所', '科信大队', '巡特警支队',
                ].map(d => ({ label: d, value: d }))}
              />
            </Form.Item>
            <Form.Item label="负责人" required rules={[{ required: true, message: '请选择空间负责人' }]}>
              <Select
                placeholder="请选择空间负责人"
                style={{ borderRadius: 6 }}
                value={createSpaceOwner}
                onChange={setCreateSpaceOwner}
                options={memberOptions.map(m => ({ label: `${m.name} (${m.dept})`, value: m.value }))}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item label="空间类型" required>
              <Select
                value={createSpaceType}
                onChange={setCreateSpaceType}
                style={{ borderRadius: 6 }}
                options={[
                  { label: '工作空间', value: '工作空间' },
                  { label: '专案空间', value: '专案空间' },
                ]}
              />
              <div style={{ marginTop: 6 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  个人空间为平台默认开启，无需手动创建。
                </Text>
              </div>
            </Form.Item>
          </Form>
        )}

        {/* 第二步：预置资源 */}
        {createStep === 1 && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
              从平台组件管理已登记的资源中选择预置到该空间，创建后可继续添加。
            </Text>
            {[
              { label: '模型', icon: <RobotOutlined />, placeholder: '搜索并选择模型', options: [
                { label: 'DeepSeek-Chat', value: 'deepseek-chat' },
                { label: 'DeepSeek-Reasoner', value: 'deepseek-reasoner' },
                { label: 'Qwen-72B-Chat', value: 'qwen-72b' },
                { label: 'GPT-4o', value: 'gpt-4o' },
                { label: 'Claude-3.5-Sonnet', value: 'claude-3.5' },
                { label: 'Hunyuan-Pro', value: 'hunyuan-pro' },
              ]},
              { label: '提示词', icon: <FileTextOutlined />, placeholder: '搜索并选择提示词', options: [
                { label: '案情摘要模板', value: 'case-summary' },
                { label: '违章分析模板', value: 'violation-analysis' },
                { label: '接警分析模板', value: 'alarm-analysis' },
                { label: '证件审核模板', value: 'id-review' },
              ]},
              { label: '工具', icon: <ToolOutlined />, placeholder: '搜索并选择工具', options: [
                { label: '文书智能解析', value: 'doc-parser' },
                { label: '人口信息查询', value: 'population-query' },
                { label: '车辆轨迹查询', value: 'vehicle-track' },
                { label: '图像识别', value: 'image-recognition' },
              ]},
              { label: '连接器', icon: <ApiOutlined />, placeholder: '搜索并选择连接器', options: [
                { label: '公安数据库连接器', value: 'police-db-mcp' },
                { label: '交管数据连接器', value: 'traffic-mcp' },
                { label: '政务云连接器', value: 'gov-cloud-mcp' },
              ]},
              { label: '知识库', icon: <BookOutlined />, placeholder: '搜索并选择知识库', options: [
                { label: '公安法规库', value: 'legal-db' },
                { label: '警情案例库', value: 'case-db' },
                { label: '标准文书库', value: 'template-db' },
              ]},
            ].map(group => {
              const selectedCount = (presetSelections[group.label] || []).length;
              return (
                <div key={group.label} style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#333' }}>
                    {group.icon}
                    {group.label}
                    {selectedCount > 0 && (
                      <Tag style={{ marginLeft: 4, fontSize: 12, lineHeight: '18px' }} color="blue">已选 {selectedCount} 个</Tag>
                    )}
                  </div>
                  <Select
                    mode="multiple"
                    placeholder={group.placeholder}
                    style={{ width: '100%', borderRadius: 6 }}
                    maxTagCount={5}
                    value={presetSelections[group.label] || []}
                    onChange={(vals) => setPresetSelections(prev => ({ ...prev, [group.label]: vals }))}
                    options={group.options}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 第三步：成员管理 */}
        {createStep === 2 && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
              为空间添加成员并设置初始角色，创建后可继续在空间详情中管理。
            </Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setMemberAddOpen(true)}>添加成员</Button>
            </div>
            {createMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <Text type="secondary">暂未添加成员，可跳过此步骤</Text>
              </div>
            ) : (
              createMembers.map((m) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', padding: '10px 0',
                  borderBottom: '1px solid #f5f5f5',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: '#1677ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13, marginRight: 10, flexShrink: 0,
                  }}>
                    {m.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{m.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{m.dept}</Text>
                  </div>
                  {m.role === '所有者' ? (
                    <Tag color="gold" style={{ borderRadius: 4, marginRight: 8 }}>
                      <CrownOutlined style={{ marginRight: 2 }} />所有者
                    </Tag>
                  ) : (
                    <>
                      <Select
                        size="small"
                        value={m.role}
                        style={{ width: 100, marginRight: 8 }}
                        onChange={(val) => {
                          setCreateMembers(prev => prev.map(p => p.id === m.id ? { ...p, role: val as '普通用户' } : p));
                        }}
                        options={[
                          { label: '普通用户', value: '普通用户' },
                        ]}
                      />
                      <Popconfirm
                        title="确认移除"
                        description={`确定将 ${m.name} 移出？`}
                        onConfirm={() => {
                          setCreateMembers(prev => prev.filter(p => p.id !== m.id));
                        }}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Button type="link" size="small" danger>移除</Button>
                      </Popconfirm>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 第四步：确认创建 */}
        {createStep === 3 && (
          <div>
            <div style={{
              padding: '20px', borderRadius: 10, background: '#f5f8ff',
              border: '1px solid #d6e4ff', marginBottom: 16,
            }}>
              <Title level={5} style={{ margin: 0 }}>基本信息</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { label: '空间名称', value: createSpaceName || '未填写' },
                  { label: '空间类型', value: createSpaceType },
                  { label: '所属部门', value: createSpaceDept || '未选择' },
                  { label: '负责人', value: createSpaceOwner ? memberOptions.find(m => m.value === createSpaceOwner)?.name || createSpaceOwner : '未选择' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', padding: '6px 0' }}>
                    <Text type="secondary" style={{ width: 100 }}>{item.label}</Text>
                    <span style={{ fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              padding: '20px', borderRadius: 10, background: '#fafafa',
              border: '1px solid #f0f0f0', marginBottom: 16,
            }}>
              <Title level={5} style={{ margin: 0 }}>预置资源清单</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { label: '模型', key: '模型' },
                  { label: '提示词', key: '提示词' },
                  { label: '工具', key: '工具' },
                  { label: '连接器', key: '连接器' },
                  { label: '知识库', key: '知识库' },
                ].map(item => {
                  const selected = presetSelections[item.key] || [];
                  return (
                    <div key={item.label} style={{ display: 'flex', padding: '6px 0' }}>
                      <Text type="secondary" style={{ width: 100 }}>{item.label}</Text>
                      <span>
                        {selected.length > 0
                          ? selected.map(v => (
                              <Tag key={v} style={{ marginBottom: 4 }}>{v}</Tag>
                            ))
                          : <Text type="secondary">未选择</Text>
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{
              padding: '20px', borderRadius: 10, background: '#fafafa',
              border: '1px solid #f0f0f0',
            }}>
              <Title level={5} style={{ margin: 0 }}>成员清单</Title>
              <div style={{ marginTop: 12 }}>
                {createMembers.length > 0 ? (
                  createMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '6px 0' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: '#1677ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 12, marginRight: 8, flexShrink: 0,
                      }}>
                        {m.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                      <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{m.dept}</Text>
                      <Tag style={{ marginLeft: 8 }}>{m.role}</Tag>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">未添加成员</Text>
                )}
              </div>
            </div>
          </div>
        )}
      </StepDrawer>

      {/* ── 空间详情抽屉 ── */}
      <Drawer
        title={selectedSpace ? `空间详情 - ${selectedSpace.name}` : '空间详情'}
        open={detailDrawerOpen}
        onClose={() => { setDetailDrawerOpen(false); setEditingInfo(false); }}
        width={640}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        {selectedSpace && (
          <div>
            {/* 头部信息 */}
            <div style={{ padding: '20px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 20,
                  }}>
                    {selectedSpace.name.charAt(0)}
                  </div>
                </Col>
                <Col flex={1}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{selectedSpace.name}</div>
                  <Space size={6}>
                    <Tag color={selectedSpace.type === '个人空间' ? 'blue' : selectedSpace.type === '专案空间' ? 'orange' : 'green'}>{selectedSpace.type}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{selectedSpace.dept}</Text>
                    <Tag color={statusColorMap[selectedSpace.status]}>{selectedSpace.status}</Tag>
                  </Space>
                </Col>
              </Row>
            </div>

            <Tabs activeKey={detailTab} onChange={setDetailTab} style={{ padding: '16px 24px 0' }} items={[
              // Tab 1: 基本信息
              {
                key: 'info',
                label: <Space><InfoCircleOutlined />基本信息</Space>,
                children: (
                  <div>
                    {editingInfo ? (
                      <Form layout="vertical">
                        <Form.Item label="空间名称">
                          <Input defaultValue={selectedSpace.name} style={{ borderRadius: 6 }} />
                        </Form.Item>
                        <Form.Item label="空间描述">
                          <TextArea rows={3} defaultValue={selectedSpace.description || ''} placeholder="描述该空间的用途和适用范围" style={{ borderRadius: 6 }} />
                        </Form.Item>
                        <Form.Item label="空间图标">
                          <IconPicker
                            value={editInfoIcon}
                            onChange={setEditInfoIcon}
                            size={64}
                            defaultName={selectedSpace.name}
                          />
                        </Form.Item>
                        <Form.Item label="所属部门">
                          <Select
                            defaultValue={selectedSpace.dept}
                            style={{ borderRadius: 6 }}
                            options={['指挥中心', '反诈中心', '刑警大队', '交警支队', '治安支队', '法制大队', '派出所', '科信大队', '巡特警支队']
                              .map(d => ({ label: d, value: d }))}
                          />
                        </Form.Item>
                        <Form.Item label="空间类型">
                          <Input value={selectedSpace.type} disabled style={{ borderRadius: 6 }} />
                        </Form.Item>
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                          <Button type="primary" onClick={() => { setEditingInfo(false); message.success('空间信息已更新'); }}>
                            保存
                          </Button>
                          <Button onClick={() => setEditingInfo(false)}>取消</Button>
                        </div>
                      </Form>
                    ) : (
                      <>
                        {/* 只读模式头像 */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 13, color: '#999', marginBottom: 6 }}>空间图标</div>
                          <IconPicker
                            value={editInfoIcon}
                            size={64}
                            defaultName={selectedSpace.name}
                            disabled
                          />
                        </div>
                        {[
                          { label: '空间名称', value: selectedSpace.name },
                          { label: '空间描述', value: selectedSpace.description || '暂无描述' },
                          { label: '所属部门', value: selectedSpace.dept },
                          { label: '空间类型', value: selectedSpace.type },
                          { label: '创建人', value: selectedSpace.creator },
                          { label: '创建时间', value: selectedSpace.createTime },
                          { label: '最近更新', value: selectedSpace.updateTime },
                        ].map(item => (
                          <div key={item.label} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                            <Text type="secondary" style={{ width: 80, flexShrink: 0 }}>{item.label}</Text>
                            <span style={{ fontWeight: 500 }}>{item.value}</span>
                          </div>
                        ))}
                        <Button type="primary" style={{ marginTop: 16, borderRadius: 6 }} icon={<EditOutlined />}
                          onClick={() => setEditingInfo(true)}>
                          编辑
                        </Button>
                      </>
                    )}
                  </div>
                ),
              },

              // Tab 2: 成员管理
              {
                key: 'members',
                label: <Space><TeamOutlined />成员管理</Space>,
                children: (
                  <div>
                    {selectedSpace.type === '个人空间' ? (
                      /* 个人空间：仅展示创建人，不可操作 */
                      <div>
                        <div style={{
                          textAlign: 'center', padding: '32px 24px',
                          background: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f0',
                          marginBottom: 16,
                        }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                            background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 24, fontWeight: 700,
                          }}>
                            {selectedSpace.creator.charAt(0)}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{selectedSpace.creator}</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            个人空间仅创建人可访问，不支持添加其他成员
                          </Text>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', padding: '10px 0',
                          borderBottom: '1px solid #f5f5f5',
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: '#1677ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 13, marginRight: 10, flexShrink: 0,
                          }}>
                            {selectedSpace.creator.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{selectedSpace.creator}</div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{selectedSpace.dept} · 创建于 {selectedSpace.createTime}</Text>
                          </div>
                          <Tag color="gold" style={{ borderRadius: 4 }}>
                            <CrownOutlined style={{ marginRight: 2 }} />所有者
                          </Tag>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <Space>
                            <Select
                              size="small"
                              defaultValue="all"
                              style={{ width: 110 }}
                              options={[
                                { label: '全部', value: 'all' },
                                { label: '所有者', value: '所有者' },
                                { label: '普通用户', value: '普通用户' },
                              ]}
                            />
                            <Input
                              size="small"
                              placeholder="搜索成员"
                              prefix={<SearchOutlined />}
                              style={{ width: 180 }}
                            />
                          </Space>
                          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setMemberAddOpen(true)}>添加成员</Button>
                        </div>
                        {spaceMembers.map((m) => (
                          <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', padding: '10px 0',
                            borderBottom: '1px solid #f5f5f5',
                          }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', background: '#1677ff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: 13, marginRight: 10, flexShrink: 0,
                            }}>
                              {m.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500 }}>{m.name}</div>
                              <Text type="secondary" style={{ fontSize: 12 }}>{m.dept} · 加入于 {m.joinTime}</Text>
                            </div>
                            {m.role === '所有者' ? (
                              <Tag color="gold" style={{ borderRadius: 4, marginRight: 8 }}>
                                <CrownOutlined style={{ marginRight: 2 }} />所有者
                              </Tag>
                            ) : (
                              <>
                                <Select
                                  size="small"
                                  value={m.role}
                                  style={{ width: 100, marginRight: 8 }}
                                  onChange={(val) => {
                                    setSpaceMembers(prev => prev.map(p => p.id === m.id ? { ...p, role: val as '普通用户' } : p));
                                    message.success(`已将 ${m.name} 的角色变更为${val}`);
                                  }}
                                  options={[
                                    { label: '管理员', value: '管理员' },
                                    { label: '普通用户', value: '普通用户' },
                                  ]}
                                />
                                <Popconfirm
                                  title="确认移除"
                                  description={`确定将 ${m.name} 移出空间？`}
                                  onConfirm={() => {
                                    setSpaceMembers(prev => prev.filter(p => p.id !== m.id));
                                    message.success(`已将 ${m.name} 移出空间`);
                                  }}
                                  okText="确认"
                                  cancelText="取消"
                                >
                                  <Button type="link" size="small" danger>移除</Button>
                                </Popconfirm>
                              </>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ),
              },

              // Tab 3: 操作日志
              {
                key: 'logs',
                label: <Space><HistoryOutlined />操作日志</Space>,
                children: (
                  <div>
                    {[
                      { time: '2026-06-25 14:30', user: '演示用户', action: '修改空间设置', detail: '更新了空间图标和描述' },
                      { time: '2026-06-24 16:20', user: '王大队', action: '创建智能体', detail: '创建了涉诈APP分析助手' },
                      { time: '2026-06-23 11:45', user: '周科长', action: '添加成员', detail: '添加成员：孙法官' },
                      { time: '2026-06-22 09:30', user: '管理员', action: '接入模型', detail: '接入了 DeepSeek-Chat 模型' },
                      { time: '2026-06-21 15:10', user: '李警官', action: '修改配额', detail: '将模型调用配额提升至 150%' },
                    ].map((log, i) => (
                      <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{log.user}
                            <Tag color={
                              log.action === '创建智能体' ? 'blue' :
                                log.action === '添加成员' ? 'cyan' :
                                  log.action === '修改配额' ? 'orange' : 'default'
                            } style={{ marginLeft: 6 }}>
                              {log.action}
                            </Tag>
                          </span>
                          <Text type="secondary" style={{ fontSize: 12 }}>{log.time}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 13 }}>{log.detail}</Text>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]} />
          </div>
        )}
      </Drawer>

      {/* ── 添加成员对话框 ── */}
      <Modal
        title="添加成员"
        open={memberAddOpen}
        onCancel={() => setMemberAddOpen(false)}
        onOk={() => {
          setMemberAddOpen(false);
          const added = ['孙法官', '刘队长', '赵副组长', '钱警官'];
          const name = added[Math.floor(Math.random() * added.length)];
          const newMember: SpaceMember = {
            id: Date.now().toString(),
            name,
            dept: selectedSpace?.dept || '指挥中心',
            role: memberAddRole,
            joinTime: new Date().toISOString().slice(0, 10),
            lastActive: '',
          };
          if (createDrawerOpen) {
            setCreateMembers(prev => [...prev, newMember]);
          } else {
            setSpaceMembers(prev => [...prev, newMember]);
          }
          message.success(`已添加成员 ${name}（${memberAddRole}）`);
        }}
        okText="确认添加"
        cancelText="取消"
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="选择成员">
            <MemberSelect
              options={memberOptions}
            />
          </Form.Item>
          <Form.Item label="初始角色">
            <Select
              value={memberAddRole}
              onChange={(val) => setMemberAddRole(val)}
              style={{ width: '100%', borderRadius: 6 }}
              options={[
                { label: '普通用户', value: '普通用户' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 操作确认对话框 ── */}
      <ConfirmActionModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          if (!confirmState) return;
          return handleConfirm();
        }}
        title={
          confirmState?.action === '删除' ? '删除空间' :
          confirmState?.action === '冻结' ? '冻结空间' :
          confirmState?.action === '归档' ? '归档空间' : '确认操作'
        }
        targetName={confirmState?.space.name ?? ''}
        severity={
          confirmState?.action === '删除' ? 'danger' :
          confirmState?.action === '冻结' ? 'warning' :
          'info'
        }
        description={
          confirmState?.action === '冻结'
            ? ['空间不可进入、不可编辑', '已发布的智能体对外服务<b>继续运行</b>', '可随时恢复启用，数据不受影响']
            : confirmState?.action === '归档'
              ? ['空间不可进入、不可操作', '已发布的智能体对外服务<b>停止</b>', '归档前请确认空间内无已发布的智能体和已上线资源广场的资源', '可恢复，但不轻易操作；适用于长期不活跃或使命完成的空间']
              : ['空间及所有数据将<b>永久移除</b>，不可恢复', '仅适用于从未启用、误创建或完全无效的空间', '删除前请确认空间内无已发布的智能体和已上线资源广场的资源']
        }
        requireNameInput={confirmState?.action === '删除'}
        okText={
          confirmState?.action === '删除' ? '确认删除' :
          confirmState?.action === '冻结' ? '确认冻结' : '确认归档'
        }
      />
    </div>
  );
}
