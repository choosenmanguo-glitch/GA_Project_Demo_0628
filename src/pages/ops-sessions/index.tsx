import React, { useState, useMemo } from 'react';
import { Table, Tag, Space, Typography, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import StatCards from '@/components/StatCards';
import { SessionDetailDrawer } from '@/components/SessionDetailDrawer';
import type { FilterField } from '@/components/FilterBar';
import { mockSessions, type SessionLog } from '@/mock/data';

const { Text } = Typography;

const channelColorMap: Record<string, string> = { 'Web端': 'blue', 'API': 'purple', '企业微信': 'green', '第三方': 'orange' };

const statusColorMap: Record<string, { color: string; bg: string }> = {
  '正常运行': { color: '#52c41a', bg: '#f6ffed' },
  '部分报错': { color: '#faad14', bg: '#fffbe6' },
  '全部报错': { color: '#ff4d4f', bg: '#fff2f0' },
};

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索会话标题、智能体或用户', width: 260 },
  { type: 'select', key: 'status', placeholder: '运行状态', width: 120, options: [
    { label: '正常运行', value: '正常运行' }, { label: '部分报错', value: '部分报错' }, { label: '全部报错', value: '全部报错' },
  ]},
];

export default function OpsSessionsPage() {
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', status: undefined });
  const [drawerSession, setDrawerSession] = useState<SessionLog | null>(null);

  const filteredSessions = useMemo(() => {
    return mockSessions.filter((s) => {
      if (filters.keyword && !s.title.includes(filters.keyword) && !s.agentName.includes(filters.keyword) && !s.userName.includes(filters.keyword)) return false;
      if (filters.status && s.status !== filters.status) return false;
      return true;
    });
  }, [filters]);

  const statItems = [
    { title: '今日会话', value: 142, color: '#1677ff' },
    { title: '活跃会话', value: 38, color: '#52c41a' },
    { title: '平均消息', value: '8.6', color: '#722ed1' },
    { title: '异常会话', value: 3, color: '#ff4d4f' },
  ];

  const sessionColumns: ColumnsType<SessionLog> = useMemo(() => [
    { title: '会话ID', dataIndex: 'id', width: 140, render: (id) => <Text code style={{ fontSize: 12 }}>{id}</Text> },
    { title: '渠道', dataIndex: 'channel', width: 90, render: (c: string) => <Tag color={channelColorMap[c] || 'default'}>{c}</Tag> },
    { title: '智能体', dataIndex: 'agentName', width: 180, render: (n) => <span style={{ fontWeight: 500 }}>{n}</span> },
    { title: '空间', dataIndex: 'spaceName', width: 100, render: (n) => <Text type="secondary">{n}</Text> },
    { title: '用户', dataIndex: 'userName', width: 100 },
    { title: '会话标题', dataIndex: 'title', width: 240 },
    { title: '消息数', dataIndex: 'messageCount', width: 80, align: 'center' as const },
    { title: 'Token', dataIndex: 'tokenConsumption', width: 90, render: (n) => n.toLocaleString() },
    { title: '开始时间', dataIndex: 'startTime', width: 140 },
    { title: '最后活跃', dataIndex: 'lastActive', width: 140 },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => {
      const style = statusColorMap[s] || { color: '#999', bg: '#f5f5f5' };
      return <Tag style={{ color: style.color, background: style.bg, borderColor: style.color }}>{s}</Tag>;
    }},
    { title: '操作', width: 80, render: (_, r) => (
      <Button type="link" size="small" onClick={() => setDrawerSession(r)}>查看详情</Button>
    )},
  ], []);

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="会话日志" hint="查看所有用户与智能体的对话会话记录与详细消息" />
        <StatCards items={statItems} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
          filters={filterFields}
          filterValues={filters}
          onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onSearch={() => {}}
          onReset={() => setFilters({ keyword: '', status: undefined })}
          extra={<Button icon={<ReloadOutlined />}>刷新</Button>}
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
          <Table
            rowKey="id" columns={sessionColumns} dataSource={filteredSessions} size="middle"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
            style={{ marginTop: 12 }}
          />
        </div>
      </div>

      <SessionDetailDrawer
        open={drawerSession !== null}
        session={drawerSession}
        onClose={() => setDrawerSession(null)}
      />
    </div>
  );
}
