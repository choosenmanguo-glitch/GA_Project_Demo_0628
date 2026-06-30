import React, { useState, useMemo } from 'react';
import {
  Table, Button, Space, Tag, Drawer, Form, Input, Select, Row, Col, Progress, Typography, Tabs, message, Dropdown, Modal, InputNumber, Popconfirm,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined, SettingOutlined, InfoCircleOutlined, TeamOutlined,
  HistoryOutlined, LockOutlined, SearchOutlined, CrownOutlined,
  SafetyOutlined, UserOutlined, EditOutlined,
  StopOutlined, CheckCircleOutlined, DeleteOutlined, EllipsisOutlined,
  RobotOutlined, FileTextOutlined, ToolOutlined, ApiOutlined,
  ThunderboltOutlined, BookOutlined, DatabaseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import StatCards from '@/components/StatCards';
import type { FilterField } from '@/components/FilterBar';
import { mockSpaces, mockMembers, type SpaceItem, type SpaceMember } from '@/mock/data';
import MemberSelect from '@/components/MemberSelect';
import StepDrawer from '@/components/StepDrawer';
import ConfirmActionModal from '@/components/ConfirmActionModal';

const { Text, Title } = Typography;
const { TextArea } = Input;

const statusColorMap: Record<string, string> = { '启用': 'green', '停用': 'orange', '归档': 'default' };

const spaceFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索空间名称', width: 220 },
  { type: 'select', key: 'status', placeholder: '状态', width: 100, options: [
    { label: '启用', value: '启用' }, { label: '停用', value: '停用' }, { label: '归档', value: '归档' },
  ]},
  { type: 'select', key: 'spaceType', placeholder: '空间类型', width: 120, options: [
    { label: '个人空间', value: '个人空间' }, { label: '工作空间', value: '工作空间' }, { label: '专案空间', value: '专案空间' },
  ]},
];

export default function OpsSpacesPage() {
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', status: undefined, spaceType: undefined });
  const [selectedSpace, setSelectedSpace] = useState<SpaceItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [detailTab, setDetailTab] = useState('info');
  const [editingInfo, setEditingInfo] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [memberAddOpen, setMemberAddOpen] = useState(false);
  const [memberAddRole, setMemberAddRole] = useState<'管理员' | '普通用户'>('普通用户');
  const [spaceMembers, setSpaceMembers] = useState<SpaceMember[]>(mockMembers);
  const [presetSelections, setPresetSelections] = useState<Record<string, string[]>>({});
  const [confirmState, setConfirmState] = useState<{ action: string; space: SpaceItem } | null>(null);
  const [createSpaceName, setCreateSpaceName] = useState('');
  const [createSpaceDept, setCreateSpaceDept] = useState<string | undefined>(undefined);
  const [createSpaceType, setCreateSpaceType] = useState('工作空间');

  // ── 确认操作执行 ──
  const handleConfirm = () => {
    if (!confirmState) return;
    const { action, space } = confirmState;
    if (action === '停用') {
      space.status = '停用';
      message.success(`空间「${space.name}」已停用`);
    } else if (action === '归档') {
      space.status = '归档';
      message.success(`空间「${space.name}」已归档`);
    } else if (action === '删除') {
      message.success(`空间「${space.name}」已删除`);
    }
    setConfirmState(null);
    setFilters({ ...filters });
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

  // ── 统计卡片数据 ──
  const statCardItems = useMemo(() => {
    const total = mockSpaces.length;
    const personalCount = mockSpaces.filter(s => s.type === '个人空间').length;
    const workCount = mockSpaces.filter(s => s.type === '工作空间').length;
    const caseSpecialCount = mockSpaces.filter(s => s.type === '专案空间').length;
    return [
      { title: '总空间数', value: total, color: '#1677ff',
        onClick: () => { setActiveStatIndex(0); setFilters(prev => ({ ...prev, spaceType: undefined })); },
      },
      { title: '个人空间', value: personalCount, color: '#52c41a',
        onClick: () => { setActiveStatIndex(1); setFilters(prev => ({ ...prev, spaceType: '个人空间' })); },
      },
      { title: '工作空间', value: workCount, color: '#722ed1',
        onClick: () => { setActiveStatIndex(2); setFilters(prev => ({ ...prev, spaceType: '工作空间' })); },
      },
      { title: '专案空间', value: caseSpecialCount, color: '#fa8c16',
        onClick: () => { setActiveStatIndex(3); setFilters(prev => ({ ...prev, spaceType: '专案空间' })); },
      },
    ];
  }, []);

  // ── 点击统计卡片设置筛选 ──
  const [activeStatIndex, setActiveStatIndex] = useState<number | undefined>(undefined);

  const filteredSpaces = useMemo(() => {
    return mockSpaces.filter((s) => {
      if (filters.keyword && !s.name.includes(filters.keyword)) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (filters.spaceType && s.type !== filters.spaceType) return false;
      return true;
    });
  }, [filters]);

  // ── 空间表格列 ──
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
      render: (v: number, r: SpaceItem) => (
        <span>{r.agentQuotaUsed} <Text type="secondary" style={{ fontSize: 11 }}>/ {r.agentQuotaLimit}</Text></span>
      ),
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
          { key: 'quota', label: '资源配额', icon: <LockOutlined />, onClick: () => { setSelectedSpace(r); setDetailTab('quota'); setDetailDrawerOpen(true); } },
          { type: 'divider' },
          ...(r.status === '归档'
            ? [{ key: 'restore', label: '恢复', icon: <CheckCircleOutlined />, onClick: () => { r.status = '启用'; message.success(`空间「${r.name}」已恢复`); setFilters({ ...filters }); } }]
            : r.status === '停用'
              ? [{ key: 'enable', label: '启用', icon: <CheckCircleOutlined />, onClick: () => { r.status = '启用'; message.success(`空间「${r.name}」已启用`); setFilters({ ...filters }); } }]
              : [{ key: 'disable', label: '停用', icon: <StopOutlined />, onClick: () => setConfirmState({ action: '停用', space: r }) }]
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

  // ── 创建步骤 ──
  const createSteps = [
    { title: '基本信息' },
    { title: '预置资源' },
    { title: '资源配额' },
    { title: '确认创建' },
  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="空间管理" hint="管理平台全部工作空间，包括创建、编辑、状态管理和配额配置" />

      {/* ── 统计概览卡片组 ── */}
      <StatCards
        items={statCardItems}
        activeIndex={activeStatIndex}
        colSpan={6}
      />

      {/* ── 空间列表主操作区 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <FilterBar
          filters={spaceFilterFields}
          filterValues={filters}
          onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onSearch={() => {}}
          onReset={() => { setFilters({ keyword: '', status: undefined }); setActiveStatIndex(undefined); }}
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

      {/* ── 创建空间抽屉 ── */}
      <StepDrawer
        title="创建空间"
        open={createDrawerOpen}
        onClose={() => { setCreateDrawerOpen(false); setCreateSpaceName(''); setCreateSpaceDept(undefined); setCreateSpaceType('工作空间'); setPresetSelections({}); }}
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
          setPresetSelections({});
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
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 28, fontWeight: 700,
                border: '2px dashed #d9d9d9', cursor: 'pointer',
              }}>
                +
              </div>
            </Form.Item>
            <Form.Item label="所属警种/部门" required>
              <Select
                placeholder="从组织架构中选择"
                style={{ borderRadius: 6 }}
                value={createSpaceDept}
                onChange={setCreateSpaceDept}
                options={[
                  '指挥中心', '反诈中心', '刑警大队', '交警支队', '治安支队',
                  '法制大队', '派出所', '科信大队', '巡特警支队',
                ].map(d => ({ label: d, value: d }))}
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
              { label: '技能', icon: <ThunderboltOutlined />, placeholder: '搜索并选择技能', options: [
                { label: '法律文书生成', value: 'legal-doc-gen' },
                { label: '案情脉络分析', value: 'case-timeline' },
                { label: '证据链构建', value: 'evidence-chain' },
              ]},
              { label: '知识库', icon: <BookOutlined />, placeholder: '搜索并选择知识库', options: [
                { label: '公安法规库', value: 'legal-db' },
                { label: '警情案例库', value: 'case-db' },
                { label: '标准文书库', value: 'template-db' },
              ]},
              { label: '数据连接', icon: <DatabaseOutlined />, placeholder: '搜索并选择数据连接', options: [
                { label: '常住人口数据源', value: 'population-ds' },
                { label: '车辆管理数据源', value: 'vehicle-ds' },
                { label: '案事件数据源', value: 'case-ds' },
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

        {/* 第三步：资源配额 */}
        {createStep === 2 && (
          <Form layout="vertical">
            <Form.Item label="每日 Token 限额" tooltip="防止单个空间一日内过量消耗平台算力">
              <InputNumber style={{ width: 300, borderRadius: 6 }} defaultValue={200000} min={0} suffix="Token/日" />
            </Form.Item>
            <Form.Item label="每月 Token 限额" tooltip="限制空间整月算力总消耗，防止预算超支">
              <InputNumber style={{ width: 300, borderRadius: 6 }} defaultValue={5000000} min={0} suffix="Token/月" />
            </Form.Item>
            <Form.Item label="存储空间上限" tooltip="控制知识库文档与向量数据的累计存储容量">
              <InputNumber style={{ width: 300, borderRadius: 6 }} defaultValue={5000} min={0} suffix="MB" />
            </Form.Item>
            <Form.Item label="智能体数量上限" tooltip="避免空间内智能体无限制创建导致管理混乱">
              <InputNumber style={{ width: 300, borderRadius: 6 }} defaultValue={10} min={0} suffix="个" />
            </Form.Item>
            <Form.Item label="成员数量上限" tooltip="控制空间协作规模，个人空间默认为 1">
              <InputNumber style={{ width: 300, borderRadius: 6 }} defaultValue={50} min={1} suffix="人" />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12 }}>以上配额均填充平台统一默认值，可手动调整。后续可在空间详情面板中修改。</Text>
          </Form>
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
              border: '1px solid #f0f0f0',
            }}>
              <Title level={5} style={{ margin: 0 }}>预置资源清单</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { label: '模型', key: '模型' },
                  { label: '提示词', key: '提示词' },
                  { label: '工具', key: '工具' },
                  { label: '连接器', key: '连接器' },
                  { label: '技能', key: '技能' },
                  { label: '知识库', key: '知识库' },
                  { label: '数据连接', key: '数据连接' },
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
                            <CrownOutlined style={{ marginRight: 2 }} />创建人
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
                                { label: '创建人', value: '创建人' },
                                { label: '管理员', value: '管理员' },
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
                            {m.role === '创建人' ? (
                              <Tag color="gold" style={{ borderRadius: 4, marginRight: 8 }}>
                                <CrownOutlined style={{ marginRight: 2 }} />创建人
                              </Tag>
                            ) : (
                              <>
                                <Select
                                  size="small"
                                  value={m.role}
                                  style={{ width: 100, marginRight: 8 }}
                                  onChange={(val) => {
                                    setSpaceMembers(prev => prev.map(p => p.id === m.id ? { ...p, role: val as '管理员' | '普通用户' } : p));
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

              // Tab 3: 资源配额
              {
                key: 'quota',
                label: <Space><LockOutlined />资源配额</Space>,
                children: (
                  <div>
                    <Title level={5} style={{ marginTop: 0 }}>配额概览</Title>
                    <Row gutter={16}>
                      <Col span={24}>
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>每日 Token 限额</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {(selectedSpace.dailyTokenUsed ?? 0).toLocaleString()} / {(selectedSpace.dailyTokenLimit ?? 0).toLocaleString()}
                            </Text>
                          </div>
                          <Progress
                            percent={Math.round((selectedSpace.dailyTokenUsed ?? 0) / (selectedSpace.dailyTokenLimit ?? 1) * 100)}
                            size="small"
                            strokeColor={{ from: '#1677ff', to: '#69b1ff' }}
                          />
                        </div>
                      </Col>
                      <Col span={24}>
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>每月 Token 限额</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {(selectedSpace.monthlyTokenUsed ?? 0).toLocaleString()} / {(selectedSpace.monthlyTokenLimit ?? 0).toLocaleString()}
                            </Text>
                          </div>
                          <Progress
                            percent={Math.round((selectedSpace.monthlyTokenUsed ?? 0) / (selectedSpace.monthlyTokenLimit ?? 1) * 100)}
                            size="small"
                            strokeColor={{ from: '#1677ff', to: '#69b1ff' }}
                          />
                        </div>
                      </Col>
                      <Col span={24}>
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>存储空间上限</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {selectedSpace.storageUsed}MB / {selectedSpace.storageLimit}MB
                            </Text>
                          </div>
                          <Progress
                            percent={Math.round(selectedSpace.storageUsed / selectedSpace.storageLimit * 100)}
                            size="small"
                            strokeColor={{ from: '#722ed1', to: '#d3adf7' }}
                          />
                        </div>
                      </Col>
                      <Col span={24}>
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>智能体数量上限</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {selectedSpace.agentQuotaUsed} / {selectedSpace.agentQuotaLimit}
                            </Text>
                          </div>
                          <Progress
                            percent={Math.round(selectedSpace.agentQuotaUsed / selectedSpace.agentQuotaLimit * 100)}
                            size="small"
                            strokeColor={{ from: '#52c41a', to: '#95de64' }}
                          />
                        </div>
                      </Col>
                      <Col span={24}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>成员数量上限</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {selectedSpace.memberCount} / {selectedSpace.memberLimit ?? 0}
                            </Text>
                          </div>
                          <Progress
                            percent={Math.round(selectedSpace.memberCount / (selectedSpace.memberLimit ?? 1) * 100)}
                            size="small"
                            strokeColor={{ from: '#fa8c16', to: '#ffd591' }}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Button type="primary" size="small" style={{ borderRadius: 6 }} onClick={() => setQuotaModalOpen(true)}>
                      设置配额
                    </Button>
                  </div>
                ),
              },

              // Tab 4: 操作日志
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
            <Select
              value={memberAddRole}
              onChange={(val) => setMemberAddRole(val)}
              style={{ width: '100%', borderRadius: 6 }}
              options={[
                { label: '管理员', value: '管理员' },
                { label: '普通用户', value: '普通用户' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 配额设置对话框 ── */}
      <Modal
        title="设置配额"
        open={quotaModalOpen}
        onCancel={() => setQuotaModalOpen(false)}
        onOk={() => { setQuotaModalOpen(false); message.success('配额已更新'); }}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        {selectedSpace && (
          <Form layout="vertical">
            <Form.Item label="每日 Token 限额" tooltip="防止单个空间一日内过量消耗平台算力">
              <InputNumber
                defaultValue={selectedSpace.dailyTokenLimit ?? 200000}
                style={{ width: '100%' }}
                min={0}
                suffix="Token/日"
              />
            </Form.Item>
            <Form.Item label="每月 Token 限额" tooltip="限制空间整月算力总消耗，防止预算超支">
              <InputNumber
                defaultValue={selectedSpace.monthlyTokenLimit ?? 5000000}
                style={{ width: '100%' }}
                min={0}
                suffix="Token/月"
              />
            </Form.Item>
            <Form.Item label="存储空间上限" tooltip="控制知识库文档与向量数据的累计存储容量">
              <InputNumber
                defaultValue={selectedSpace.storageLimit}
                style={{ width: '100%' }}
                min={0}
                suffix="MB"
              />
            </Form.Item>
            <Form.Item label="智能体数量上限" tooltip="避免空间内智能体无限制创建导致管理混乱">
              <InputNumber
                defaultValue={selectedSpace.agentQuotaLimit}
                style={{ width: '100%' }}
                min={0}
                suffix="个"
              />
            </Form.Item>
            <Form.Item label="成员数量上限" tooltip="控制空间协作规模，个人空间默认为 1">
              <InputNumber
                defaultValue={selectedSpace.memberLimit ?? 50}
                style={{ width: '100%' }}
                min={1}
                suffix="人"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* ── 操作确认对话框 ── */}
      <ConfirmActionModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
        title={
          confirmState?.action === '删除' ? '删除空间' :
          confirmState?.action === '停用' ? '停用空间' : '归档空间'
        }
        targetName={confirmState?.space.name ?? ''}
        severity={confirmState?.action === '删除' ? 'danger' : confirmState?.action === '停用' ? 'warning' : 'info'}
        description={
          confirmState?.action === '停用'
            ? ['空间不可进入、不可编辑', '已发布的智能体对外服务<b>继续运行</b>', '可随时恢复启用，数据不受影响']
            : confirmState?.action === '归档'
              ? ['空间不可进入、不可操作', '已发布的智能体对外服务<b>停止</b>', '归档前请确认空间内无已发布的智能体', '可恢复，但不轻易操作；适用于长期不活跃或使命完成的空间']
              : ['空间及所有数据将<b>永久移除</b>，不可恢复', '仅适用于从未启用、误创建或完全无效的空间', '删除前请确认空间内无已发布的智能体']
        }
        requireNameInput={confirmState?.action === '删除'}
        okText={
          confirmState?.action === '删除' ? '确认删除' :
          confirmState?.action === '停用' ? '确认停用' : '确认归档'
        }
      />
    </div>
  );
}
