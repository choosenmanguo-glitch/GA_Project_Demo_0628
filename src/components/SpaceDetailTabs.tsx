import React, { useState, useMemo } from 'react';
import {
  Row, Col, Table, Tag, Button, Space, Typography,
  Form, Input, Modal, Select, message, Popconfirm, Card,
} from 'antd';
import {
  TeamOutlined, PlusOutlined, HistoryOutlined,
  EditOutlined, ExportOutlined,
  InfoCircleOutlined, UserOutlined, CrownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import FilterBar from '@/components/FilterBar';
import type { FilterField } from '@/components/FilterBar';
import {
  mockMembers, mockOperationLogs,
  type SpaceItem, type SpaceMember, type OperationLog,
} from '@/mock/data';
import MemberSelect from '@/components/MemberSelect';
import IconPicker, { type IconPickerValue } from '@/components/IconPicker';

const { Text, Title } = Typography;
const { TextArea } = Input;

// ── 角色颜色映射 ──
const roleColorMap: Record<string, string> = {
  '所有者': 'gold',
  '普通用户': 'default',
};

// ── 成员筛选 ──
const memberFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索姓名或部门', width: 220 },
  { type: 'select', key: 'role', placeholder: '角色筛选', width: 120, options: [
    { label: '全部角色', value: 'all' },
    { label: '所有者', value: '所有者' },
    { label: '普通用户', value: '普通用户' },
  ]},
];

// ── 日志筛选 ──
const logFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索操作人或操作对象', width: 220 },
  { type: 'dateRange', key: 'dateRange', placeholder: '时间范围', width: 240 },
];

export interface SpaceDetailTabsResult {
  infoContent: React.ReactNode;
  membersContent: React.ReactNode;
  logsContent: React.ReactNode;
}

/**
 * 空间详情 Tab 内容复用 Hook
 * 提供 基本信息 / 成员管理 / 操作日志 三个 Tab 的内容
 */
export function useSpaceDetailTabs(space: SpaceItem, showEditButton = true, showOverviewCard = true): SpaceDetailTabsResult {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [spaceIcon, setSpaceIcon] = useState<IconPickerValue>({ mode: 'text', text: space.name.charAt(0) });

  // ── 基本信息表单 ──
  const [form] = Form.useForm();

  // ── 成员状态 ──
  const [memberFilters, setMemberFilters] = useState<Record<string, any>>({ keyword: '', role: 'all' });
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberSelected, setAddMemberSelected] = useState<string[]>([]);
  const [localMembers, setLocalMembers] = useState<SpaceMember[]>(() => [...mockMembers]);

  // ── 日志状态 ──
  const [logFilters, setLogFilters] = useState<Record<string, any>>({ keyword: '', dateRange: undefined });
  const [logDetailOpen, setLogDetailOpen] = useState(false);
  const [logDetailData, setLogDetailData] = useState<OperationLog | null>(null);

  const isPersonal = space.type === '个人空间';

  // ── 过滤成员 ──
  const filteredMembers = useMemo(() => {
    return localMembers.filter(m => {
      const roleFilter = memberFilters.role;
      if (roleFilter && roleFilter !== 'all') {
        if (roleFilter === '所有者' && m.role !== '所有者') return false;
        if (roleFilter === '普通用户' && m.role !== '普通用户') return false;
      }
      if (memberFilters.keyword) {
        const kw = memberFilters.keyword.toLowerCase();
        if (!m.name.toLowerCase().includes(kw) && !m.dept.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [memberFilters, localMembers]);

  // ── 过滤日志（按空间名筛选） ──
  const filteredLogs = useMemo(() => {
    return mockOperationLogs.filter(l => {
      if (l.spaceName !== space.name) return false;
      if (logFilters.keyword) {
        const kw = logFilters.keyword.toLowerCase();
        if (!l.operator.toLowerCase().includes(kw) && !l.target.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [logFilters, space.name]);

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
          {r === '所有者' ? <><CrownOutlined style={{ marginRight: 2 }} />{r}</> : <><UserOutlined style={{ marginRight: 2 }} />{r}</>}
        </Tag>
      ),
    },
    { title: '加入时间', dataIndex: 'joinTime', width: 120, render: t => <Text type="secondary">{t}</Text> },
    { title: '最近活跃', dataIndex: 'lastActive', width: 150, render: t => <Text type="secondary">{t}</Text> },
    {
      title: '操作', width: 80,
      render: (_, r) => {
        const isOwner = r.role === '所有者';
        return (
          <Popconfirm
            title={isOwner ? '所有者不可被移除' : `确定移除 ${r.name}？`}
            disabled={isOwner}
            onConfirm={() => {
              setLocalMembers(prev => prev.filter(m => m.id !== r.id));
              message.success(`已移除 ${r.name}`);
            }}
          >
            <Button type="link" size="small" danger disabled={isOwner}>移除</Button>
          </Popconfirm>
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
          '创建空间': 'blue', '申请空间': 'orange', '审批通过': 'green', '审批驳回': 'red',
          '修改空间信息': 'orange', '添加成员': 'cyan', '移除成员': 'volcano',
          '冻结空间': '#faad14', '恢复空间': 'green', '归档空间': 'default', '删除空间': 'red',
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

  // ═══════ Tab 1: 基本信息 ═══════
  const infoContent = (
    <div style={{ maxWidth: 640 }}>
      {/* 空间概览卡片（当外部已有空间信息头部时可隐藏） */}
      {showOverviewCard && (
        <Card style={{ marginBottom: 24, borderRadius: 10, border: '1px solid #f0f0f0' }}>
          <Row align="middle" gutter={20}>
            <Col>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 24, fontWeight: 700,
              }}>
                {space.name.charAt(0)}
              </div>
            </Col>
            <Col flex={1}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{space.name}</div>
              <Space size={6}>
                <Tag color={space.type === '个人空间' ? 'blue' : space.type === '专案空间' ? 'orange' : 'green'}>{space.type}</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>{space.dept}</Text>
                <Tag color={space.status === '启用' ? 'green' : space.status === '冻结' ? 'orange' : 'default'}>
                  {space.status}
                </Tag>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{ name: space.name, description: space.description || '', dept: space.dept, creator: space.creator, createTime: space.createTime }}
        disabled={!editing}
      >
        <Form.Item label="空间名称" name="name" rules={[{ required: true, message: '请输入空间名称' }]}>
          <Input placeholder="请输入空间名称" style={{ borderRadius: 6 }} />
        </Form.Item>

        <Form.Item label="空间描述" name="description">
          <TextArea rows={3} placeholder="描述该空间的用途和适用范围" style={{ borderRadius: 6 }} />
        </Form.Item>

        <Form.Item label="空间图标">
          <IconPicker
            value={spaceIcon}
            onChange={setSpaceIcon}
            size={64}
            defaultName={space.name}
            disabled={!editing}
          />
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
              <Input value={space.type} disabled style={{ borderRadius: 6 }} />
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

      {showEditButton && (
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
      )}
    </div>
  );

  // ═══════ Tab 2: 成员管理 ═══════
  const membersContent = (
    <div>
      {isPersonal ? (
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
            {space.name.charAt(0)}
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
            style={{ padding: '12px 0', borderTop: 'none', marginTop: -16 }}
          />

          <Table
            rowKey="id"
            columns={memberColumns}
            dataSource={filteredMembers}
            size="middle"
            pagination={{ defaultPageSize: 10, showTotal: t => `共 ${t} 人` }}
            style={{ marginTop: 12 }}
          />

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
                <Input disabled value="普通用户" style={{ borderRadius: 6 }} />
                <div style={{ marginTop: 6 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>新增成员默认为普通用户。</Text>
                </div>
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );

  // ═══════ Tab 3: 操作日志 ═══════
  const logsContent = (
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
        style={{ padding: '12px 0', borderTop: 'none', marginTop: -16 }}
      />

      <Table
        rowKey="id"
        columns={logColumns}
        dataSource={filteredLogs}
        size="middle"
        pagination={{ defaultPageSize: 20, showTotal: t => `共 ${t} 条` }}
        style={{ marginTop: 12 }}
      />

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
  );

  return { infoContent, membersContent, logsContent };
}
