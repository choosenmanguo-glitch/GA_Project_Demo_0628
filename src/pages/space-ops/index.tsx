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

const { Text, Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// ── 角色颜色映射 ──
const roleColorMap: Record<string, string> = {
  '创建人': 'gold',
  '管理员': 'blue',
  '普通用户': 'default',
};

// ── 成员筛选 ──
const memberFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索姓名或部门', width: 220 },
];

// ── 日志筛选 ──
const logFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索操作人或操作对象', width: 220 },
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
  const [memberFilters, setMemberFilters] = useState<Record<string, any>>({ keyword: '' });
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newMemberRole, setNewMemberRole] = useState<'管理员' | '普通用户'>('普通用户');

  // ── 日志状态 ──
  const [logFilters, setLogFilters] = useState<Record<string, any>>({ keyword: '' });

  // ── 计算成员统计 ──
  const memberStats = useMemo(() => {
    const spaceMembers = mockMembers; // 模拟：实际应过滤当前空间
    const total = spaceMembers.length;
    const admins = spaceMembers.filter(m => m.role === '管理员' || m.role === '创建人').length;
    const normals = total - admins;
    return { total, admins, normals };
  }, []);

  // ── 过滤成员 ──
  const filteredMembers = useMemo(() => {
    return mockMembers.filter(m => {
      if (roleFilter === '创建人' && m.role !== '创建人') return false;
      if (roleFilter === '管理员' && m.role !== '管理员') return false;
      if (roleFilter === '普通用户' && m.role !== '普通用户') return false;
      if (memberFilters.keyword) {
        const kw = memberFilters.keyword.toLowerCase();
        if (!m.name.toLowerCase().includes(kw) && !m.dept.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [memberFilters, roleFilter]);

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
          {r === '创建人' ? <><CrownOutlined style={{ marginRight: 2 }} />{r}</> : r === '管理员' ? <><SafetyOutlined style={{ marginRight: 2 }} />{r}</> : <><UserOutlined style={{ marginRight: 2 }} />{r}</>}
        </Tag>
      ),
    },
    { title: '加入时间', dataIndex: 'joinTime', width: 120, render: t => <Text type="secondary">{t}</Text> },
    { title: '最近活跃', dataIndex: 'lastActive', width: 150, render: t => <Text type="secondary">{t}</Text> },
    {
      title: '操作', width: 160,
      render: (_, r) => {
        const isCreator = r.role === '创建人';
        return (
          <Space size={0}>
            <Select
              size="small"
              value={r.role}
              disabled={isCreator}
              onChange={(val) => message.success(`已将 ${r.name} 的角色变更为 ${val}`)}
              style={{ width: 88 }}
              options={[
                { label: '管理员', value: '管理员' },
                { label: '普通用户', value: '普通用户' },
              ]}
              variant="borderless"
            />
            <Popconfirm
              title={isCreator ? '创建人不可被移除' : `确定移除 ${r.name}？`}
              disabled={isCreator}
              onConfirm={() => message.success(`已移除 ${r.name}`)}
            >
              <Button type="link" size="small" danger disabled={isCreator}>移除</Button>
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
      render: t => <Text type="secondary" style={{ fontSize: 13, fontFamily: 'SF Mono, Menlo, monospace' }}>{t}</Text>,
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
      title: '详情', dataIndex: 'detail',
      render: d => <Text type="secondary" style={{ fontSize: 12 }}>{d}</Text>,
    },
    {
      title: '所属空间', dataIndex: 'spaceName', width: 110,
      render: n => n ? <Text type="secondary" style={{ fontSize: 12 }}>{n}</Text> : '-',
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
            initialValues={{ name: currentSpace.name, dept: currentSpace.dept, creator: currentSpace.creator, createTime: currentSpace.createTime }}
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
                  <Input disabled style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="创建人" name="creator">
                  <Input disabled style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="创建时间" name="createTime">
              <Input disabled style={{ borderRadius: 6 }} />
            </Form.Item>

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
          </Form>
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
              <div style={{ marginTop: 20 }}>
                {mockSpaces
                  .filter(s => s.type === '工作空间' && s.status === '启用')
                  .slice(0, 3)
                  .map(s => (
                    <Tag key={s.id} color="green" style={{ borderRadius: 4, padding: '2px 10px', margin: '0 4px 6px', cursor: 'pointer' }}>
                      {s.name}
                    </Tag>
                  ))}
              </div>
            </div>
          ) : (
            <>
          {/* 成员统计 */}
          <Row gutter={12} style={{ marginBottom: 16 }}>
            {[
              { label: '总人数', value: memberStats.total, color: '#1677ff', bg: '#f0f5ff' },
              { label: '管理员', value: memberStats.admins, color: '#722ed1', bg: '#f9f0ff' },
              { label: '普通用户', value: memberStats.normals, color: '#666', bg: '#fafafa' },
            ].map(s => (
              <Col key={s.label}>
                <div style={{
                  padding: '6px 16px', borderRadius: 20, background: s.bg,
                  border: `1px solid ${s.color}20`, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 12, color: '#666' }}>{s.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              </Col>
            ))}
          </Row>

          <FilterBar
            filters={memberFilterFields}
            filterValues={memberFilters}
            onFilterChange={(key, value) => setMemberFilters(prev => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setMemberFilters({ keyword: '' })}
            extra={
              <Space>
                <Select
                  size="middle"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  style={{ width: 110 }}
                  options={[
                    { label: '全部角色', value: 'all' },
                    { label: '创建人', value: '创建人' },
                    { label: '管理员', value: '管理员' },
                    { label: '普通用户', value: '普通用户' },
                  ]}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                  setSelectedMembers([]);
                  setAddMemberOpen(true);
                }}>
                  添加成员
                </Button>
              </Space>
            }
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
              if (selectedMembers.length === 0) { message.warning('请选择成员'); return; }
              message.success(`已添加 ${selectedMembers.length} 位成员`);
              setAddMemberOpen(false);
            }}
            okText="确认添加"
            width={560}
          >
            <div style={{ display: 'flex', gap: 16 }}>
              {/* 左侧组织架构 */}
              <div style={{ flex: 1, border: '1px solid #f0f0f0', borderRadius: 8, padding: 12, maxHeight: 360, overflow: 'auto' }}>
                <Input placeholder="搜索部门或人员" prefix={<SearchOutlined />} style={{ marginBottom: 12, borderRadius: 6 }} />
                <div style={{ fontSize: 13 }}>
                  {['指挥中心', '反诈中心', '刑警大队', '交警支队', '治安支队', '法制大队', '派出所', '科信大队'].map((dept, i) => (
                    <div
                      key={dept}
                      onClick={() => {
                        const membersInDept = mockMembers.filter(m => m.dept === dept).map(m => m.id);
                        setSelectedMembers(prev => {
                          const added = membersInDept.filter(id => !prev.includes(id));
                          return [...prev, ...added];
                        });
                        message.success(`已勾选 ${dept} 全部成员`);
                      }}
                      style={{
                        padding: '7px 10px', cursor: 'pointer', borderRadius: 6, marginBottom: 2,
                        background: selectedMembers.some(id => mockMembers.find(m => m.id === id)?.dept === dept) ? '#f0f5ff' : 'transparent',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={e => { if (!selectedMembers.some(id => mockMembers.find(m => m.id === id)?.dept === dept)) e.currentTarget.style.background = '#fafafa'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = selectedMembers.some(id => mockMembers.find(m => m.id === id)?.dept === dept) ? '#f0f5ff' : 'transparent'; }}
                    >
                      <Text type="secondary" style={{ fontSize: 11, marginRight: 6 }}>{String(i + 1).padStart(2, '0')}</Text>
                      {dept}
                    </div>
                  ))}
                </div>
              </div>

              {/* 右侧已选成员 */}
              <div style={{ width: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 13 }}>已选 {selectedMembers.length} 人</Text>
                  <Button type="link" size="small" onClick={() => setSelectedMembers([])}>清空</Button>
                </div>
                <div style={{ fontSize: 12, marginBottom: 12 }}>
                  <Select
                    size="small"
                    value={newMemberRole}
                    onChange={setNewMemberRole}
                    style={{ width: '100%' }}
                    options={[
                      { label: '管理员', value: '管理员' },
                      { label: '普通用户', value: '普通用户' },
                    ]}
                  />
                </div>
                <div style={{ maxHeight: 240, overflow: 'auto' }}>
                  {selectedMembers.map(id => {
                    const m = mockMembers.find(m => m.id === id);
                    if (!m) return null;
                    return (
                      <div key={id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 8px', borderRadius: 6, marginBottom: 4,
                        background: '#fafafa',
                      }}>
                        <Space size={6}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%', background: '#1677ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 11,
                          }}>
                            {m.name.charAt(0)}
                          </div>
                          <span style={{ fontSize: 12 }}>{m.name}</span>
                        </Space>
                        <Button type="link" size="small" danger onClick={() => setSelectedMembers(prev => prev.filter(i => i !== id))}>
                          移除
                        </Button>
                      </div>
                    );
                  })}
                  {selectedMembers.length === 0 && (
                    <div style={{ padding: 20, textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>在左侧选择成员</Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
            onReset={() => setLogFilters({ keyword: '' })}
            extra={
              <Space>
                <RangePicker size="middle" style={{ width: 240 }} placeholder={['开始日期', '结束日期']} />
                <Button icon={<ExportOutlined />} size="middle" onClick={() => message.success('正在导出操作日志...')}>
                  导出
                </Button>
              </Space>
            }
          />

          <Table
            rowKey="id"
            columns={logColumns}
            dataSource={filteredLogs}
            size="middle"
            pagination={{ defaultPageSize: 20, showTotal: t => `共 ${t} 条` }}
            style={{ marginTop: 12 }}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{
                  padding: '12px 16px', background: '#fafafa', borderRadius: 8,
                  fontFamily: 'SF Mono, Menlo, monospace', fontSize: 12, color: '#666',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                }}>
                  {JSON.stringify({ id: record.id, time: record.time, operator: record.operator, type: record.type, target: record.target, detail: record.detail, spaceName: record.spaceName }, null, 2)}
                </div>
              ),
              rowExpandable: () => true,
            }}
          />
        </div>
      ),
    },

    // ═══════ Tab 4: 高级操作 ═══════
    {
      key: 'advanced',
      label: <Space><LockOutlined />高级操作</Space>,
      children: (
        <div style={{ maxWidth: 600 }}>
          <Card style={{ borderRadius: 10, border: '1px solid #f0f0f0', marginBottom: 20 }}>
            <div style={{ padding: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: '#fff2e8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fa8c16', fontSize: 18, flexShrink: 0,
                }}>
                  <LockOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ margin: 0 }}>归档空间</Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    将空间设为归档状态，操作前校验所有已发布智能体是否已下架。归档后仅创建人可见，资源不可编辑，成员无法进入，数据完整保留。
                  </Text>
                </div>
                <Popconfirm
                  title="确认归档空间？"
                  description="归档前请确认所有已发布智能体已下架。"
                  onConfirm={() => message.success('空间已归档')}
                  okText="确认归档"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger style={{ borderRadius: 6 }}>归档空间</Button>
                </Popconfirm>
              </div>
            </div>
          </Card>

          <Card style={{ borderRadius: 10, border: '1px solid #f0f0f0' }}>
            <div style={{ padding: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: '#f6ffed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#52c41a', fontSize: 18, flexShrink: 0,
                }}>
                  <HistoryOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ margin: 0 }}>恢复空间</Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    仅归档状态可见，恢复为启用后成员可重新进入、资源可编辑。
                  </Text>
                </div>
                <Popconfirm
                  title="确认恢复空间？"
                  description="恢复后成员可重新进入空间。"
                  onConfirm={() => message.success('空间已恢复')}
                  okText="确认恢复"
                >
                  <Button type="primary" style={{ borderRadius: 6 }} icon={<HistoryOutlined />}>恢复空间</Button>
                </Popconfirm>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="空间管理"
        hint="管理当前空间的基本信息、成员与操作日志，支持归档与恢复等高级操作"
      />

      {/* 当前空间名称 */}
      <div style={{ marginBottom: 4 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 8,
          background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%)',
          border: '1px solid #d6e4ff',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700,
          }}>
            {currentSpace.name.charAt(0)}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{currentSpace.name}</span>
          <Tag color={currentSpace.type === '个人空间' ? 'blue' : 'green'} style={{ borderRadius: 4, margin: 0 }}>{currentSpace.type}</Tag>
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
