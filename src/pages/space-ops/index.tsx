import React, { useState, useMemo } from 'react';
import { Row, Col, Statistic, Table, Tabs, Tag, Button, Space, Typography } from 'antd';
import { TeamOutlined, ThunderboltOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import StatCards from '@/components/StatCards';
import type { FilterField } from '@/components/FilterBar';
import { mockSpaces, mockMembers, mockOperationLogs, type SpaceMember, type OperationLog } from '@/mock/data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Text, Title } = Typography;

const trendData = [
  { date: '06/19', 智能体调用: 2450, 知识库检索: 890 },
  { date: '06/20', 智能体调用: 3120, 知识库检索: 1020 },
  { date: '06/21', 智能体调用: 2890, 知识库检索: 950 },
  { date: '06/22', 智能体调用: 3580, 知识库检索: 1150 },
  { date: '06/23', 智能体调用: 3240, 知识库检索: 1080 },
  { date: '06/24', 智能体调用: 4010, 知识库检索: 1320 },
  { date: '06/25', 智能体调用: 3760, 知识库检索: 1210 },
];

const memberFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索成员姓名', width: 220 },
];

const logFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索操作对象或详情', width: 240 },
];

const memberColumns: ColumnsType<SpaceMember> = [
  { title: '成员', dataIndex: 'name', width: 120, render: (n) => (
    <Space>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>{n.charAt(0)}</div>
      <span style={{ fontWeight: 500 }}>{n}</span>
    </Space>
  )},
  { title: '部门', dataIndex: 'dept', width: 110, render: (d) => <Text type="secondary">{d}</Text> },
  { title: '角色', dataIndex: 'role', width: 100, render: (r: string) => {
    const color = r === '创建人' ? 'blue' : r === '管理员' ? 'purple' : 'default';
    return <Tag color={color}>{r}</Tag>;
  }},
  { title: '加入时间', dataIndex: 'joinTime', width: 110 },
  { title: '最近活跃', dataIndex: 'lastActive', width: 150 },
  { title: '操作', width: 120, render: () => (
    <Space size={0}>
      <Button type="link" size="small">编辑角色</Button>
      <Button type="link" size="small" danger>移除</Button>
    </Space>
  )},
];

const logColumns: ColumnsType<OperationLog> = [
  { title: '时间', dataIndex: 'time', width: 160, render: (t) => <Text type="secondary" style={{ fontSize: 13 }}>{t}</Text> },
  { title: '操作人', dataIndex: 'operator', width: 100 },
  { title: '类型', dataIndex: 'type', width: 90, render: (t: string) => <Tag>{t}</Tag> },
  { title: '操作对象', dataIndex: 'target', width: 160 },
  { title: '详情', dataIndex: 'detail', render: (d) => <Text type="secondary">{d}</Text> },
  { title: '所属空间', dataIndex: 'spaceName', width: 110, render: (n) => n ? <Text type="secondary">{n}</Text> : '-' },
];

export default function SpaceOpsPage() {
  const [opsTab, setOpsTab] = useState('stats');
  const [memberFilters, setMemberFilters] = useState<Record<string, any>>({ keyword: '' });
  const [logFilters, setLogFilters] = useState<Record<string, any>>({ keyword: '' });

  const statItems = [
    { title: '总空间数', value: mockSpaces.length, color: '#1677ff' },
    { title: '活跃空间', value: mockSpaces.filter(s => s.status === '启用').length, color: '#52c41a' },
    { title: '成员总数', value: mockSpaces.reduce((sum, s) => sum + s.memberCount, 0), color: '#722ed1' },
    { title: '智能体总数', value: mockSpaces.reduce((sum, s) => sum + s.agentCount, 0), color: '#fa8c16' },
  ];

  const tabItems = [
    {
      key: 'stats',
      label: '统计分析',
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            {[
              { label: '总空间数', value: mockSpaces.length, icon: <TeamOutlined style={{ color: '#1677ff' }} />, color: '#e6f4ff' },
              { label: '活跃空间', value: mockSpaces.filter(s => s.status === '启用').length, icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, color: '#f6ffed' },
              { label: '成员总数', value: mockSpaces.reduce((sum, s) => sum + s.memberCount, 0), icon: <TeamOutlined style={{ color: '#722ed1' }} />, color: '#f9f0ff' },
              { label: '智能体总数', value: mockSpaces.reduce((sum, s) => sum + s.agentCount, 0), icon: <ThunderboltOutlined style={{ color: '#fa8c16' }} />, color: '#fff7e6' },
            ].map((s) => (
              <Col span={6} key={s.label}>
                <div style={{ padding: '16px 20px', background: s.color, borderRadius: 10, border: `1px solid #e8e8e8` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><Text type="secondary" style={{ fontSize: 13 }}>{s.label}</Text><div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{s.value}</div></div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>近7天调用趋势</Text>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="opsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1677ff" stopOpacity={0.2} /><stop offset="95%" stopColor="#1677ff" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#bfbfbf" fontSize={12} />
                <YAxis stroke="#bfbfbf" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="智能体调用" stroke="#1677ff" strokeWidth={2} fill="url(#opsGrad)" />
                <Area type="monotone" dataKey="知识库检索" stroke="#722ed1" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>空间资源用量排行</Text>
            {mockSpaces.slice(0, 5).sort((a, b) => b.modelQuotaUsed - a.modelQuotaUsed).map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? '1px solid #f5f5f5' : 'none' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: i < 3 ? '#1677ff' : '#f0f0f0', color: i < 3 ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginRight: 12 }}>{i + 1}</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>{s.name}</div><Text type="secondary" style={{ fontSize: 12 }}>{s.dept}</Text></div>
                <div style={{ width: 200, marginRight: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}><Text type="secondary">模型配额</Text><span>{s.modelQuotaUsed.toLocaleString()} / {s.modelQuotaLimit.toLocaleString()}</span></div>
                  <div style={{ height: 6, borderRadius: 3, background: '#f0f0f0', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(s.modelQuotaUsed / s.modelQuotaLimit) * 100}%`, borderRadius: 3, background: s.modelQuotaUsed / s.modelQuotaLimit > 0.8 ? '#ff4d4f' : '#1677ff' }} /></div>
                </div>
                <div style={{ width: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}><Text type="secondary">存储用量</Text><span>{s.storageUsed}MB / {s.storageLimit}MB</span></div>
                  <div style={{ height: 6, borderRadius: 3, background: '#f0f0f0', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(s.storageUsed / s.storageLimit) * 100}%`, borderRadius: 3, background: '#722ed1' }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'manage',
      label: '空间管理',
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {mockSpaces.map((s) => (
            <div key={s.id} style={{ padding: '20px 24px', borderRadius: 10, border: '1px solid #f0f0f0', background: '#fff', cursor: 'pointer', transition: 'box-shadow .2s' }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
              <Row align="middle" gutter={24}>
                <Col><div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #1677ff, #69b1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>{s.name.charAt(0)}</div></Col>
                <Col flex={1}><div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.name}</div><Space size={6}><Tag color="blue">{s.type}</Tag><Text type="secondary" style={{ fontSize: 12 }}>{s.dept}</Text><Tag color={s.status === '启用' ? 'green' : s.status === '停用' ? 'orange' : 'default'}>{s.status}</Tag></Space></Col>
                {[{ label: '成员', value: s.memberCount }, { label: '智能体', value: s.agentCount }, { label: '知识库', value: s.knowledgeCount }, { label: '提示词', value: s.promptCount }, { label: '工具', value: s.toolCount }].map((stat) => (
                  <Col key={stat.label} style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700 }}>{stat.value}</div><Text type="secondary" style={{ fontSize: 12 }}>{stat.label}</Text></Col>
                ))}
                <Col><Space><Button size="small">查看详情</Button><Button size="small" type="primary">管理</Button></Space></Col>
              </Row>
            </div>
          ))}
        </Space>
      ),
    },
    {
      key: 'members',
      label: '成员管理',
      children: (
        <div>
          <FilterBar
            filters={memberFilterFields}
            filterValues={memberFilters}
            onFilterChange={(key, value) => setMemberFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setMemberFilters({ keyword: '' })}
            extra={<Button type="primary" icon={<PlusOutlined />}>邀请成员</Button>}
          />
          <div style={{ padding: '0 24px 16px' }}>
            <Table rowKey="id" columns={memberColumns} dataSource={mockMembers} size="middle" pagination={false} style={{ marginTop: 12 }} />
          </div>
        </div>
      ),
    },
    {
      key: 'logs',
      label: '操作日志',
      children: (
        <div>
          <FilterBar
            filters={logFilterFields}
            filterValues={logFilters}
            onFilterChange={(key, value) => setLogFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setLogFilters({ keyword: '' })}
            extra={<Text type="secondary">共 {mockOperationLogs.length} 条记录</Text>}
          />
          <div style={{ padding: '0 24px 16px' }}>
            <Table rowKey="id" columns={logColumns} dataSource={mockOperationLogs} size="middle" pagination={{ defaultPageSize: 10, showTotal: (t) => `共 ${t} 条` }} style={{ marginTop: 12 }} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="空间运营" hint="查看空间使用统计数据与空间管理详情" />
        <StatCards items={statItems} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
            <Tabs activeKey={opsTab} onChange={setOpsTab} style={{ marginTop: 12 }} items={tabItems} />
          </div>
        </div>
    </div>
  );
}
