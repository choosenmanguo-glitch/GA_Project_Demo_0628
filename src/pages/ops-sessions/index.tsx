import React, { useState, useMemo } from 'react';
import { Table, Tag, Space, Typography, Button, Row, Col } from 'antd';
import { ExpandAltOutlined, CompressOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import StatCards from '@/components/StatCards';
import type { FilterField } from '@/components/FilterBar';
import { mockSessions, type SessionLog, type SessionMessage } from '@/mock/data';

const { Text, Paragraph } = Typography;

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
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

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
      <Button type="link" size="small" icon={expandedRowKeys.includes(r.id) ? <CompressOutlined /> : <ExpandAltOutlined />}
        onClick={() => setExpandedRowKeys(expandedRowKeys.includes(r.id) ? expandedRowKeys.filter(k => k !== r.id) : [...expandedRowKeys, r.id])}>
        {expandedRowKeys.includes(r.id) ? '收起' : '详情'}
      </Button>
    )},
  ], [expandedRowKeys]);

  const expandedRender = (record: SessionLog) => (
    <div style={{ padding: '8px 16px 16px', background: '#fafafa', borderLeft: '3px solid #1677ff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text strong style={{ fontSize: 15 }}>对话详情</Text>
        <Space><Text type="secondary" style={{ fontSize: 13 }}>共 {record.messageCount} 条消息 · Token: {record.tokenConsumption.toLocaleString()}</Text><Button size="small" icon={<ReloadOutlined />}>加载全部</Button></Space>
      </div>
      <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>会话渠道: {record.channel} | 用户: {record.userName} | 空间: {record.spaceName}</Text>
      </div>
      {record.messages ? (
        <div style={{ maxHeight: 500, overflow: 'auto' }}>
          {record.messages.map((msg: SessionMessage) => (
            <div key={msg.id} style={{ marginBottom: 16, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%' }}>
                <div style={{ marginBottom: 4, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'center' }}>
                  <Tag color={msg.role === 'user' ? 'blue' : 'green'} style={{ borderRadius: 4, margin: 0 }}>{msg.role === 'user' ? '用户' : '智能体'}</Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>{msg.time}</Text>
                  {msg.role === 'assistant' && msg.latency !== undefined && <Text type="secondary" style={{ fontSize: 11 }}>延迟 {msg.latency}ms</Text>}
                  {msg.hasError && <Tag color="red" style={{ borderRadius: 4, margin: 0 }}>出错</Tag>}
                </div>
                <div style={{ padding: '12px 16px', borderRadius: 12, background: msg.role === 'user' ? '#1677ff' : '#f5f5f5', color: msg.role === 'user' ? '#fff' : '#333', borderBottomRightRadius: msg.role === 'user' ? 4 : 12, borderBottomLeftRadius: msg.role === 'user' ? 12 : 4 }}>
                  <Paragraph style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-line' }}>{msg.content}</Paragraph>
                </div>
                {msg.role === 'assistant' && msg.tokens && msg.model && (
                  <div style={{ marginTop: 4, display: 'flex', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>模型: {msg.model}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>Token: {msg.tokens.input}(in) + {msg.tokens.output}(out)</Text>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0' }}><Text type="secondary">暂无该会话的完整对话记录</Text></div>
      )}
    </div>
  );

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
            expandable={{
              expandedRowRender: expandedRender,
              expandedRowKeys,
              onExpand: (expanded, record) => {
                if (expanded) setExpandedRowKeys([...expandedRowKeys, record.id]);
                else setExpandedRowKeys(expandedRowKeys.filter(k => k !== record.id));
              },
              expandIcon: () => null,
            }}
          />
        </div>
      </div>
    </div>
  );
}
