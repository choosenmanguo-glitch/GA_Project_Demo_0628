import React, { useState, useMemo } from 'react';
import {
  Table, Button, Space, Tag, Drawer, Form, Input, Select, Row, Col, Typography, Tabs, message, Dropdown, Modal,
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
import { mockSpaces, mockMembers, type SpaceItem, type SpaceMember, mockApprovals, type SpaceApproval, mockOperationLogs } from '@/mock/data';
import MemberSelect from '@/components/MemberSelect';
import SpaceCreateDrawer from '@/components/SpaceCreateDrawer';
import type { SpaceCreateValues } from '@/components/SpaceCreateDrawer';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import { useSpaceDetailTabs } from '@/components/SpaceDetailTabs';

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
  { type: 'search', key: 'keyword', placeholder: '搜索空间名称/申请人/部门', width: 220 },
  { type: 'select', key: 'spaceType', placeholder: '空间类型', width: 120, options: [
    { label: '工作空间', value: '工作空间' }, { label: '专案空间', value: '专案空间' },
  ]},
];

// ── 抽屉内 Tab 内容（独立组件保证 hook 生命周期） ──
function SpaceDetailDrawerBody({ space, detailTab, onTabChange }: { space: SpaceItem; detailTab: string; onTabChange: (tab: string) => void }) {
  const { infoContent, membersContent, logsContent } = useSpaceDetailTabs(space, true, false);

  return (
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
              {space.name.charAt(0)}
            </div>
          </Col>
          <Col flex={1}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{space.name}</div>
            <Space size={6}>
              <Tag color={space.type === '个人空间' ? 'blue' : space.type === '专案空间' ? 'orange' : 'green'}>{space.type}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>{space.dept}</Text>
              <Tag color={space.status === '启用' ? 'green' : space.status === '冻结' ? 'orange' : 'default'}>
                {space.status}
              </Tag>
            </Space>
          </Col>
        </Row>
      </div>

      <Tabs
        activeKey={detailTab}
        onChange={onTabChange}
        style={{ padding: '16px 24px 0' }}
        items={[
          { key: 'info', label: <Space><InfoCircleOutlined />基本信息</Space>, children: infoContent },
          { key: 'members', label: <Space><TeamOutlined />成员管理</Space>, children: membersContent },
          { key: 'logs', label: <Space><HistoryOutlined />操作日志</Space>, children: logsContent },
        ]}
      />
    </div>
  );
}

export default function OpsSpacesPage() {
  const [activeTab, setActiveTab] = useState('manage');

  // ── Tab 1 状态 ──
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', status: undefined, spaceType: undefined });
  const [selectedSpace, setSelectedSpace] = useState<SpaceItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('info');
  const [memberAddOpen, setMemberAddOpen] = useState(false);
  const [memberAddRole, setMemberAddRole] = useState<'普通用户'>('普通用户');
  const [localSpaces, setLocalSpaces] = useState<SpaceItem[]>(mockSpaces);
  const [localApprovals, setLocalApprovals] = useState<SpaceApproval[]>(mockApprovals);
  const [spaceMembers, setSpaceMembers] = useState<SpaceMember[]>(mockMembers);
  const [confirmState, setConfirmState] = useState<{ action: string; space: SpaceItem } | null>(null);

  // ── Tab 2 状态 ──
  const [pendingFilters, setPendingFilters] = useState<Record<string, any>>({ keyword: '', spaceType: undefined });

  // ── 审批详情抽屉 ──
  const [pendingDetailSpace, setPendingDetailSpace] = useState<SpaceApproval | null>(null);
  const [pendingDetailOpen, setPendingDetailOpen] = useState(false);

  // ── 驳回原因 ──
  const [rejectionReasonOpen, setRejectionReasonOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // ── Tab 3 状态 ──
  const [rejectedFilters, setRejectedFilters] = useState<Record<string, any>>({ keyword: '', spaceType: undefined });

  // ── 触发刷新（mock 数据直接操作后需要） ──
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);

  // ── 确认操作执行（冻结/归档/删除） ──
  const handleConfirm = () => {
    if (!confirmState) return;
    const { action, space } = confirmState;
    if (action === '冻结') {
      setLocalSpaces(prev => prev.map(s => s.id === space.id ? { ...s, status: '冻结' as const } : s));
      message.success(`空间「${space.name}」已冻结`);
    } else if (action === '归档') {
      setLocalSpaces(prev => prev.map(s => s.id === space.id ? { ...s, status: '归档' as const } : s));
      message.success(`空间「${space.name}」已归档`);
    } else if (action === '删除') {
      setLocalSpaces(prev => prev.filter(s => s.id !== space.id));
      message.success(`空间「${space.name}」已删除`);
    }
    setConfirmState(null);
    triggerRefresh();
  };

  // ── 审批通过 ──
  const handleApprove = (approval: SpaceApproval) => {
    // Update approval record
    const now = new Date();
    const nowStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
    setLocalApprovals(prev => prev.map(a =>
      a.id === approval.id
        ? { ...a, status: '已通过' as const, approver: '演示用户', approvalTime: nowStr }
        : a
    ));
    // Add new space to localSpaces
    const newSpace: SpaceItem = {
      id: `space-${Date.now()}`,
      name: approval.spaceName,
      dept: approval.dept,
      type: approval.spaceType,
      status: '启用',
      memberCount: approval.members?.length ?? 0,
      agentCount: 0,
      knowledgeCount: approval.presetResources?.knowledge?.length ?? 0,
      promptCount: approval.presetResources?.prompts?.length ?? 0,
      toolCount: approval.presetResources?.tools?.length ?? 0,
      modelCount: approval.presetResources?.models?.length ?? 0,
      connectorCount: approval.presetResources?.connectors?.length ?? 0,
      creator: approval.applicant,
      createTime: nowStr,
      updateTime: nowStr,
    };
    setLocalSpaces(prev => [...prev, newSpace]);
    message.success(`空间申请已通过，「${approval.spaceName}」已启用`);
    setPendingDetailOpen(false);
    setPendingDetailSpace(null);
    triggerRefresh();
  };

  // ── 审批驳回 ──
  const handleReject = (approval: SpaceApproval) => {
    const now = new Date();
    const nowStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
    setLocalApprovals(prev => prev.map(a =>
      a.id === approval.id
        ? { ...a, status: '已驳回' as const, approver: '演示用户', approvalTime: nowStr, rejectionReason: rejectionReason || undefined }
        : a
    ));
    message.success(`已驳回空间申请「${approval.spaceName}」${rejectionReason ? `，原因：${rejectionReason}` : ''}`);
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
    return localSpaces;
  }, [localSpaces, refreshKey]);

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
    return localApprovals.filter(a => a.status === '待审核').filter(a => {
      if (pendingFilters.keyword) {
        const kw = pendingFilters.keyword;
        if (!a.spaceName.includes(kw) && !a.applicant.includes(kw) && !a.dept.includes(kw)) return false;
      }
      if (pendingFilters.spaceType && a.spaceType !== pendingFilters.spaceType) return false;
      return true;
    });
  }, [localApprovals, pendingFilters]);

  // ── Tab 3 数据 ──
  const rejectedSpaces = useMemo(() => {
    return localApprovals.filter(a => a.status !== '待审核').filter(a => {
      if (rejectedFilters.keyword) {
        const kw = rejectedFilters.keyword;
        if (!a.spaceName.includes(kw) && !a.applicant.includes(kw) && !a.dept.includes(kw)) return false;
      }
      if (rejectedFilters.spaceType && a.spaceType !== rejectedFilters.spaceType) return false;
      return true;
    });
  }, [localApprovals, rejectedFilters]);

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
            <div><Text type="secondary" style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{r.description || '-'}</Text></div>
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
            ? [{ key: 'restore', label: '恢复', icon: <CheckCircleOutlined />, onClick: () => { setLocalSpaces(prev => prev.map(s => s.id === r.id ? { ...s, status: '启用' as const } : s)); message.success(`空间「${r.name}」已恢复`); triggerRefresh(); } }]
            : r.status === '冻结'
              ? [{ key: 'enable', label: '启用', icon: <CheckCircleOutlined />, onClick: () => { setLocalSpaces(prev => prev.map(s => s.id === r.id ? { ...s, status: '启用' as const } : s)); message.success(`空间「${r.name}」已启用`); triggerRefresh(); } }]
              : [{ key: 'freeze', label: '冻结', icon: <StopOutlined />, onClick: () => setConfirmState({ action: '冻结', space: r }) }]
          ),
          ...(r.status !== '归档' ? [{ key: 'archive', label: '归档', icon: <SettingOutlined />, onClick: () => setConfirmState({ action: '归档', space: r }) }] : []),
          { type: 'divider' },
          { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true, onClick: () => setConfirmState({ action: '删除', space: r }) },
        ];
        return (
          <Space size={0} wrap>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelectedSpace(r); setDetailTab('info'); setDetailDrawerOpen(true); }}>编辑</Button>
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
  const getResourceTotal = (a: SpaceApproval) => {
    if (!a?.presetResources) return 0;
    const r = a.presetResources;
    return (r.models?.length ?? 0) + (r.prompts?.length ?? 0) + (r.tools?.length ?? 0) + (r.connectors?.length ?? 0) + (r.knowledge?.length ?? 0);
  };

  const pendingColumns: ColumnsType<SpaceApproval> = useMemo(() => [
    {
      title: '空间名称', dataIndex: 'spaceName', width: 200,
      render: (n: string, r) => (
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
      title: '空间类型', dataIndex: 'spaceType', width: 100,
      render: (t: string) => {
        const typeColorMap: Record<string, string> = { '工作空间': 'green', '专案空间': 'orange' };
        return <Tag color={typeColorMap[t] || 'default'} style={{ borderRadius: 4 }}>{t}</Tag>;
      },
    },
    {
      title: '申请人', dataIndex: 'applicant', width: 90,
    },
    {
      title: '所属部门', dataIndex: 'dept', width: 110,
    },
    {
      title: '预置资源', dataIndex: 'presetResources', width: 220,
      render: (_, r) => {
        const pr = r.presetResources;
        return (
          <Space size={6} wrap style={{ fontSize: 12 }}>
            <span><RobotOutlined style={{ color: '#1677ff', marginRight: 2 }} />{pr?.models?.length ?? 0}</span>
            <span><FileTextOutlined style={{ color: '#722ed1', marginRight: 2 }} />{pr?.prompts?.length ?? 0}</span>
            <span><ToolOutlined style={{ color: '#fa8c16', marginRight: 2 }} />{pr?.tools?.length ?? 0}</span>
            <span><ApiOutlined style={{ color: '#52c41a', marginRight: 2 }} />{pr?.connectors?.length ?? 0}</span>
            <span><BookOutlined style={{ color: '#eb2f96', marginRight: 2 }} />{pr?.knowledge?.length ?? 0}</span>
          </Space>
        );
      },
    },
    {
      title: '申请时间', dataIndex: 'applyTime', width: 170,
    },
  ], []);

  // ── Tab 3 审批记录表格列 ──
  const rejectedColumns: ColumnsType<SpaceApproval> = useMemo(() => [
    {
      title: '空间名称', dataIndex: 'spaceName', width: 200,
      render: (n: string, r) => (
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
      title: '空间类型', dataIndex: 'spaceType', width: 100,
      render: (t: string) => {
        const typeColorMap: Record<string, string> = { '工作空间': 'green', '专案空间': 'orange' };
        return <Tag color={typeColorMap[t] || 'default'} style={{ borderRadius: 4 }}>{t}</Tag>;
      },
    },
    {
      title: '申请人', dataIndex: 'applicant', width: 90,
    },
    {
      title: '所属部门', dataIndex: 'dept', width: 110,
    },
    {
      title: '预置资源', dataIndex: 'presetResources', width: 220,
      render: (_, r) => {
        const pr = r.presetResources;
        return (
          <Space size={6} wrap style={{ fontSize: 12 }}>
            <span><RobotOutlined style={{ color: '#1677ff', marginRight: 2 }} />{pr?.models?.length ?? 0}</span>
            <span><FileTextOutlined style={{ color: '#722ed1', marginRight: 2 }} />{pr?.prompts?.length ?? 0}</span>
            <span><ToolOutlined style={{ color: '#fa8c16', marginRight: 2 }} />{pr?.tools?.length ?? 0}</span>
            <span><ApiOutlined style={{ color: '#52c41a', marginRight: 2 }} />{pr?.connectors?.length ?? 0}</span>
            <span><BookOutlined style={{ color: '#eb2f96', marginRight: 2 }} />{pr?.knowledge?.length ?? 0}</span>
          </Space>
        );
      },
    },
    {
      title: '审批人', dataIndex: 'approver', width: 90,
      render: (v) => v || '-',
    },
    {
      title: '审批时间', dataIndex: 'approvalTime', width: 170,
      render: (v) => v || '-',
    },
    {
      title: '审批结果', dataIndex: 'status', width: 90,
      render: (s: string) => {
        if (s === '已通过') return <Tag color="green">已通过</Tag>;
        if (s === '已驳回') return <Tag color="red">已驳回</Tag>;
        return <Tag>{s}</Tag>;
      },
    },
    {
      title: '驳回原因', dataIndex: 'rejectionReason', width: 180,
      render: (v) => v ? <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> : '-',
      ellipsis: true,
    },
  ], []);

  // ── 待审批角标数 ──
  const pendingCount = useMemo(() => localApprovals.filter(a => a.status === '待审核').length, [localApprovals]);

  // ── 打开审批详情并重置驳回原因 ──
  const openPendingDetail = (approval: SpaceApproval) => {
    setPendingDetailSpace(approval);
    setRejectionReason('');
    setPendingDetailOpen(true);
  };

  // ── 从抽屉发起驳回 ──
  const handleRejectFromDrawer = () => {
    setRejectionReasonOpen(true);
  };

  // ── 创建空间提交 ──
  const handleCreateSubmit = (_values: SpaceCreateValues) => {
    message.success('空间创建成功');
    setCreateDrawerOpen(false);
    triggerRefresh();
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
                    onCreate={() => { setCreateDrawerOpen(true); }}
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
                      { title: '已驳回', value: localApprovals.filter(a => a.status === '已驳回').length, color: '#ff4d4f' },
                      { title: '已通过', value: localApprovals.filter(a => a.status === '已通过').length, color: '#52c41a' },
                      { title: '驳回率', value: (() => { const r = localApprovals.filter(a => a.status === '已驳回').length; const a = localApprovals.filter(a => a.status === '已通过').length; return a + r > 0 ? Math.round((r / (a + r)) * 100) + '%' : '0%'; })(), color: '#fa8c16' },
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
          ]}
        />

      {/* ── 审批详情抽屉 ── */}
      <Drawer
        title={pendingDetailSpace ? `审批空间申请 - ${pendingDetailSpace.spaceName}` : '审批空间申请'}
        open={pendingDetailOpen}
        onClose={() => { setPendingDetailOpen(false); setPendingDetailSpace(null); }}
        width={640}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
        footer={
          pendingDetailSpace?.status === '待审核' ? (
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
          ) : undefined
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
                    {pendingDetailSpace.spaceName.charAt(0)}
                  </div>
                </Col>
                <Col flex={1}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{pendingDetailSpace.spaceName}</div>
                  <Space size={6}>
                    <Tag color={pendingDetailSpace.spaceType === '专案空间' ? 'orange' : 'green'}>{pendingDetailSpace.spaceType}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{pendingDetailSpace.dept}</Text>
                    <Tag color={pendingDetailSpace.status === '已通过' ? 'green' : pendingDetailSpace.status === '已驳回' ? 'red' : 'orange'}>
                      {pendingDetailSpace.status}
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* 基本信息 */}
            <div style={{ padding: '20px', borderRadius: 10, background: '#f5f8ff', border: '1px solid #d6e4ff', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>基本信息</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { label: '空间名称', value: pendingDetailSpace.spaceName },
                  { label: '空间类型', value: pendingDetailSpace.spaceType },
                  { label: '所属部门', value: pendingDetailSpace.dept },
                  { label: '申请人', value: pendingDetailSpace.applicant },
                  { label: '申请时间', value: pendingDetailSpace.applyTime },
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
                  { label: '模型', values: pendingDetailSpace.presetResources?.models ?? [] },
                  { label: '提示词', values: pendingDetailSpace.presetResources?.prompts ?? [] },
                  { label: '工具', values: pendingDetailSpace.presetResources?.tools ?? [] },
                  { label: '连接器', values: pendingDetailSpace.presetResources?.connectors ?? [] },
                  { label: '知识库', values: pendingDetailSpace.presetResources?.knowledge ?? [] },
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
                {(pendingDetailSpace.members?.length ?? 0) > 0
                  ? pendingDetailSpace.members!.map(m => (
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
                        <Tag style={{ marginLeft: 8 }} color={m.role === '所有者' ? 'gold' : undefined}>
                          {m.role === '所有者' && <CrownOutlined style={{ marginRight: 2 }} />}{m.role}
                        </Tag>
                      </div>
                    ))
                  : <Text type="secondary">未添加成员</Text>
                }
              </div>
            </div>

            {pendingDetailSpace.status === '已驳回' && (
              <div style={{
                padding: '20px', borderRadius: 10, background: '#fff1f0',
                border: '1px solid #ffccc7',
              }}>
                <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#ff4d4f' }}>驳回原因</Title>
                <div style={{ fontSize: 14, color: '#d93026', lineHeight: '22px', whiteSpace: 'pre-wrap' }}>
                  {pendingDetailSpace.rejectionReason || '未填写驳回原因'}
                </div>
              </div>
            )}

            {pendingDetailSpace.status === '待审核' && (
              /* 审批提示 */
              <div style={{
                padding: '16px 20px', borderRadius: 10, background: '#fffbe6',
                border: '1px solid #ffe58f',
              }}>
                <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#d48806' }}>审批须知</Title>
                <div style={{ fontSize: 13, color: '#8c6d00', lineHeight: '22px' }}>
                  <div>通过后，该空间将立即启用，空间创建者将自动成为空间所有者。</div>
                  <div>驳回需填写驳回原因，驳回后该空间不会出现在用户切换列表中。</div>
                  <div>请确认空间基本信息、资源、成员无误后再操作。</div>
                </div>
              </div>
            )}
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
      <SpaceCreateDrawer
        mode="create"
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* ── 空间详情抽屉 ── */}
      <Drawer
        title={selectedSpace ? `空间详情 - ${selectedSpace.name}` : '空间详情'}
        open={detailDrawerOpen}
        onClose={() => { setDetailDrawerOpen(false); }}
        width={900}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        {selectedSpace && (
          <SpaceDetailDrawerBody
            key={selectedSpace.id}
            space={selectedSpace}
            detailTab={detailTab}
            onTabChange={setDetailTab}
          />
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
          setSpaceMembers(prev => [...prev, newMember]);
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
            <Input
              disabled
              value="普通用户"
              style={{ borderRadius: 6 }}
            />
            <div style={{ marginTop: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>新增成员默认为普通用户。</Text>
            </div>
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
            ? ['空间不可进入', '已发布的智能体对外服务继续运行', '可随时恢复启用，数据不受影响']
            : confirmState?.action === '归档'
              ? ['空间不可进入', '归档前请确认空间内无已发布的智能体和已上线资源广场的资源', '可恢复，但不轻易操作；适用于长期不活跃或使命完成的空间']
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
