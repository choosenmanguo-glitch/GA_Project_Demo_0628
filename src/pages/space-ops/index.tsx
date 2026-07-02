import React, { useState, useMemo } from 'react';
import {
  Row, Col, Table, Tabs, Tag, Button, Space, Typography,
  Form, Input, Modal, Select, Progress, DatePicker, message, Popconfirm,
  Card, Statistic,
} from 'antd';
import {
  TeamOutlined, PlusOutlined, HistoryOutlined, LockOutlined,
  EditOutlined, SearchOutlined, ExportOutlined,
  InfoCircleOutlined, UserOutlined, CrownOutlined, SafetyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import type { FilterField } from '@/components/FilterBar';
import {
  mockSpaces, mockMembers, mockOperationLogs, mockAgents,
  type SpaceItem, type SpaceMember, type OperationLog,
} from '@/mock/data';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import MemberSelect from '@/components/MemberSelect';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// ── 角色颜色映射 ──
const roleColorMap: Record<string, string> = {
  '所有者': 'gold',
  '管理员': 'blue',
  '普通用户': 'default',
};

// ── 成员筛选 ──
const memberFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索姓名或部门', width: 220 },
  { type: 'select', key: 'role', placeholder: '角色筛选', width: 120, options: [
    { label: '全部角色', value: 'all' },
    { label: '所有者', value: '所有者' },
    { label: '管理员', value: '管理员' },
    { label: '普通用户', value: '普通用户' },
  ]},
];

// ── 日志筛选 ──
const logFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索操作人或操作对象', width: 220 },
  { type: 'dateRange', key: 'dateRange', placeholder: '时间范围', width: 240 },
];

export default function SpaceManagePage() {
  const { currentSpace } = useWorkspace();
  const isPersonal = currentSpace.type === '个人空间';
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── 基本信息表单 ──
  const [form] = Form.useForm();

  // ── 成员状态 ──
  const [memberFilters, setMemberFilters] = useState<Record<string, any>>({ keyword: '', role: 'all' });
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState<'管理员' | '普通用户'>('普通用户');
  const [addMemberSelected, setAddMemberSelected] = useState<string[]>([]);

  // ── 日志状态 ──
  const [logFilters, setLogFilters] = useState<Record<string, any>>({ keyword: '', dateRange: undefined });
  const [logDetailOpen, setLogDetailOpen] = useState(false);
  const [logDetailData, setLogDetailData] = useState<OperationLog | null>(null);

  // ── 过滤成员 ──
  const filteredMembers = useMemo(() => {
    return mockMembers.filter(m => {
      const roleFilter = memberFilters.role;
      if (roleFilter && roleFilter !== 'all') {
        if (roleFilter === '所有者' && m.role !== '所有者') return false;
        if (roleFilter === '管理员' && m.role !== '管理员') return false;
        if (roleFilter === '普通用户' && m.role !== '普通用户') return false;
      }
      if (memberFilters.keyword) {
        const kw = memberFilters.keyword.toLowerCase();
        if (!m.name.toLowerCase().includes(kw) && !m.dept.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [memberFilters]);

  // ── 过滤日志 ──
  const filteredLogs = useMemo(() => {
    return mockOperationLogs.filter(l => {
      if (logFilters.keyword) {
        const kw = logFilters.keyword.toLowerCase();
        if (!l.operator.toLowerCase().includes(kw) && !l.target.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [logFilters]);

  // ── 成员列定义 ──
  const memberColumns: ColumnsType<SpaceMember> = [
    {
      title: '成员', dataIndex: 'name', width: 200,
      render: (n, r) => (
        <Space>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0,
          }}>
            {n.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{n}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.dept}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '角色', dataIndex: 'role', width: 100,
      render: (r: string) => (
        <Tag color={roleColorMap[r] || 'default'} style={{ borderRadius: 4 }}>
          {r === '所有者' ? <><CrownOutlined style={{ marginRight: 2 }} />{r}</> : r === '管理员' ? <><SafetyOutlined style={{ marginRight: 2 }} />{r}</> : <><UserOutlined style={{ marginRight: 2 }} />{r}</>}
        </Tag>
      ),
    },
    { title: '加入时间', dataIndex: 'joinTime', width: 120, render: t => <Text type="secondary">{t}</Text> },
    { title: '最近活跃', dataIndex: 'lastActive', width: 150, render: t => <Text type="secondary">{t}</Text> },
    {
      title: '操作', width: 160,
      render: (_, r) => {
        const isOwner = r.role === '所有者';
        return (
          <Space size={0}>
            <Select
              size="small"
              value={r.role}
              disabled={isOwner}
              onChange={(val) => message.success(`已将 ${r.name} 的角色变更为 ${val}`)}
              style={{ width: 88 }}
              options={[
                { label: '管理员', value: '管理员' },
                { label: '普通用户', value: '普通用户' },
              ]}
              variant="borderless"
            />
            <Popconfirm
              title={isOwner ? '所有者不可被移除' : `确定移除 ${r.name}？`}
              disabled={isOwner}
              onConfirm={() => message.success(`已移除 ${r.name}`)}
            >
              <Button type="link" size="small" danger disabled={isOwner}>移除</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // ── 日志列定义 ──
  const logColumns: ColumnsType<OperationLog> = [
    {
      title: '时间', dataIndex: 'time', width: 170,
      render: t => <Text type="secondary" style={{ fontSize: 13 }}>{t}</Text>,
    },
    { title: '操作人', dataIndex: 'operator', width: 100 },
    {
      title: '操作类型', dataIndex: 'type', width: 100,
      render: (t: string) => {
        const colorMap: Record<string, string> = {
          '创建': 'blue', '发布': 'green', '修改配置': 'orange', '修改设置': 'orange',
          '添加成员': 'cyan', '删除': 'red', '下架': 'volcano', '接入模型': 'purple',
          '接口': 'geekblue',
        };
        return <Tag color={colorMap[t] || 'default'}>{t}</Tag>;
      },
    },
    { title: '操作对象', dataIndex: 'target', width: 160, render: t => <span style={{ fontWeight: 500 }}>{t}</span> },
    {
      title: '操作', width: 80, key: 'action',
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => { setLogDetailData(r); setLogDetailOpen(true); }}>
          详情
        </Button>
      ),
    },
  ];

  // ── Tab 定义 ──
  const tabItems = [
    // ═══════ Tab 1: 基本信息 ═══════
    {
      key: 'info',
      label: <Space><InfoCircleOutlined />基本信息</Space>,
      children: (
        <div style={{ maxWidth: 640 }}>
          {/* 空间概览卡片 */}
          <Card style={{ marginBottom: 24, borderRadius: 10, border: '1px solid #f0f0f0' }}>
            <Row align="middle" gutter={20}>
              <Col>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 24, fontWeight: 700,
                }}>
                  {currentSpace.name.charAt(0)}
                </div>
              </Col>
              <Col flex={1}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{currentSpace.name}</div>
                <Space size={6}>
                  <Tag color="blue">{currentSpace.type}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>{currentSpace.dept}</Text>
                  <Tag color={currentSpace.status === '启用' ? 'green' : currentSpace.status === '停用' ? 'orange' : 'default'}>
                    {currentSpace.status}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>

          <Form
            form={form}
            layout="vertical"
            initialValues={{ name: currentSpace.name, description: currentSpace.description, dept: currentSpace.dept, creator: currentSpace.creator, createTime: currentSpace.createTime }}
            disabled={!editing}
          >
            <Form.Item label="空间名称" name="name" rules={[{ required: true, message: '请输入空间名称' }]}>
              <Input placeholder="请输入空间名称" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item label="空间描述" name="description">
              <TextArea rows={3} placeholder="描述该空间的用途和适用范围" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item label="空间图标">
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 28, fontWeight: 700, cursor: 'pointer',
                border: '2px dashed #d9d9d9',
              }}>
                {currentSpace.name.charAt(0)}
              </div>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="所属警种/部门" name="dept">
                  <Select
                    style={{ borderRadius: 6 }}
                    options={['指挥中心', '反诈中心', '刑警大队', '交警支队', '治安支队', '法制大队', '派出所', '科信大队', '巡特警支队']
                      .map(d => ({ label: d, value: d }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="空间类型">
                  <Input value={currentSpace.type} disabled style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="所有者" name="creator">
                  <Input disabled style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="创建时间" name="createTime">
                  <Input disabled style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
            </Row>

          </Form>

          <div style={{ marginTop: 8 }}>
            {editing ? (
              <Space>
                <Button type="primary" loading={saving} onClick={() => {
                  setSaving(true);
                  setTimeout(() => {
                    setSaving(false);
                    setEditing(false);
                    message.success('空间信息已更新');
                  }, 600);
                }}>
                  保存
                </Button>
                <Button onClick={() => { setEditing(false); form.resetFields(); }}>取消</Button>
              </Space>
            ) : (
              <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
                编辑
              </Button>
            )}
          </div>
        </div>
      ),
    },

    // ═══════ Tab 2: 成员管理 ═══════
    {
      key: 'members',
      label: <Space><TeamOutlined />成员管理</Space>,
      children: (
        <div>
          {isPersonal ? (
            /* 个人空间：禁用成员管理 */
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              background: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f0',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 28, fontWeight: 700,
              }}>
                {currentSpace.name.charAt(0)}
              </div>
              <Title level={5} style={{ marginBottom: 8 }}>个人空间</Title>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.8 }}>
                我的空间是您的专属个人空间，不支持添加其他成员。
                <br />
                如需多人协作，请切换到或创建一个<Text strong>工作空间</Text>。
              </Text>
            </div>
          ) : (
            <>
          <FilterBar
            filters={memberFilterFields}
            filterValues={memberFilters}
            onFilterChange={(key, value) => setMemberFilters(prev => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setMemberFilters({ keyword: '', role: 'all' })}
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setAddMemberSelected([]);
                setAddMemberOpen(true);
              }}>
                添加成员
              </Button>
            }
            style={{ padding: '12px 0' }}
          />

          <Table
            rowKey="id"
            columns={memberColumns}
            dataSource={filteredMembers}
            size="middle"
            pagination={{ defaultPageSize: 10, showTotal: t => `共 ${t} 人` }}
            style={{ marginTop: 12 }}
          />

          {/* 添加成员弹窗 */}
          <Modal
            title="添加成员"
            open={addMemberOpen}
            onCancel={() => setAddMemberOpen(false)}
            onOk={() => {
              if (addMemberSelected.length === 0) { message.warning('请选择成员'); return; }
              message.success(`已添加 ${addMemberSelected.length} 位成员`);
              setAddMemberOpen(false);
            }}
            okText="确认添加"
            width={480}
          >
            <Form layout="vertical">
              <Form.Item label="选择成员">
                <MemberSelect
                  value={addMemberSelected}
                  onChange={setAddMemberSelected}
                  placeholder="搜索姓名或部门"
                  options={mockMembers.map(m => ({ name: m.name, dept: m.dept, value: m.id }))}
                />
              </Form.Item>
              <Form.Item label="初始角色">
                <Select
                  value={newMemberRole}
                  onChange={setNewMemberRole}
                  style={{ width: '100%', borderRadius: 6 }}
                  options={[
                    { label: '管理员', value: '管理员' },
                    { label: '普通用户', value: '普通用户' },
                  ]}
                />
              </Form.Item>
            </Form>
          </Modal>
          </>
          )}
        </div>
      ),
    },

    // ═══════ Tab 3: 操作日志 ═══════
    {
      key: 'logs',
      label: <Space><HistoryOutlined />操作日志</Space>,
      children: (
        <div>
          <FilterBar
            filters={logFilterFields}
            filterValues={logFilters}
            onFilterChange={(key, value) => setLogFilters(prev => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setLogFilters({ keyword: '', dateRange: undefined })}
            extra={
              <Button icon={<ExportOutlined />} size="middle" onClick={() => message.success('正在导出操作日志...')}>
                导出
              </Button>
            }
            style={{ padding: '12px 0' }}
          />

          <Table
            rowKey="id"
            columns={logColumns}
            dataSource={filteredLogs}
            size="middle"
            pagination={{ defaultPageSize: 20, showTotal: t => `共 ${t} 条` }}
            style={{ marginTop: 12 }}
          />

          {/* 操作日志详情弹窗 */}
          <Modal
            title="操作详情"
            open={logDetailOpen}
            onCancel={() => setLogDetailOpen(false)}
            footer={null}
            width={520}
          >
            {logDetailData && (
              <div style={{
                padding: '12px 16px', background: '#fafafa', borderRadius: 8,
                fontFamily: 'SF Mono, Menlo, monospace', fontSize: 12, color: '#666',
                whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 400, overflow: 'auto',
              }}>
                {JSON.stringify({ id: logDetailData.id, time: logDetailData.time, operator: logDetailData.operator, type: logDetailData.type, target: logDetailData.target, detail: logDetailData.detail, spaceName: logDetailData.spaceName }, null, 2)}
              </div>
            )}
          </Modal>
        </div>
      ),
    },

  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="空间管理"
        hint="管理当前空间的基本信息、成员与操作日志"
      />

      {/* 当前空间名称 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        padding: '12px 16px', borderRadius: 10,
        background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%)',
        border: '1px solid #d6e4ff',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 22, fontWeight: 700, flexShrink: 0,
        }}>
          {currentSpace.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{currentSpace.name}</span>
            <Tag color={currentSpace.type === '个人空间' ? 'blue' : 'green'} style={{ borderRadius: 4 }}>{currentSpace.type}</Tag>
            <Tag color="gold" style={{ borderRadius: 4 }}><CrownOutlined style={{ marginRight: 2 }} />所有者</Tag>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
            <span>创建时间：{currentSpace.createTime}</span>
            <span>所有者：{currentSpace.creator}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          tabBarStyle={{ padding: '0 24px', borderBottom: '1px solid #f0f0f0', marginBottom: 0 }}
          items={tabItems.map(item => ({
            key: item.key,
            label: <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>,
            children: <div style={{ padding: '16px 24px', overflow: 'auto', flex: 1 }}>{item.children}</div>,
          }))}
        />
      </div>
    </div>
  );
}
