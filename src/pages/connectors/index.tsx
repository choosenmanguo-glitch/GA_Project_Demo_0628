import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Drawer, Form, Input, Select, message, Typography, Space } from 'antd';
import { EditOutlined, EyeOutlined, ApiOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import FilterBar from '@/components/FilterBar';
import { mockConnectors, ConnectorItem, ConnectorStatus } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';
import type { StatCardItem } from '@/components/StatCards';

const { Text } = Typography;
const { Option } = Select;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索连接器名称', width: 220 },
  { type: 'select', key: 'type', placeholder: '连接模式', width: 120, options: [
    { label: 'SSE', value: 'SSE' },
    { label: 'stdio', value: 'stdio' },
  ]},
  { type: 'select', key: 'status', placeholder: '连接状态', width: 120, options: [
    { label: '已连接', value: '已连接' },
    { label: '连接异常', value: '连接异常' },
    { label: '离线', value: '离线' },
  ]},
];

const statusConfig: Record<ConnectorStatus, { color: string; icon: React.ReactNode }> = {
  '已连接': { color: 'green', icon: <WifiOutlined /> },
  '连接异常': { color: 'orange', icon: <ApiOutlined /> },
  '离线': { color: 'default', icon: <DisconnectOutlined /> },
};

const ConnectorsPage: React.FC = () => {
  const [data] = useState<ConnectorItem[]>(mockConnectors);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', type: undefined, status: undefined });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ConnectorItem | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword)) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);

  const statItems: StatCardItem[] = [
    { title: '连接器总数', value: data.length, color: '#1677ff' },
    { title: '已连接', value: data.filter((d) => d.status === '已连接').length, color: '#52c41a' },
    { title: '连接异常', value: data.filter((d) => d.status === '连接异常').length, color: '#faad14' },
    { title: '暴露工具总数', value: data.reduce((s, d) => s + d.toolCount, 0), color: '#722ed1' },
    { title: '累计调用', value: (data.reduce((s, d) => s + d.callCount, 0) / 1000).toFixed(1) + 'K', color: '#fa8c16' },
  ];

  const handleCreate = async () => {
    const values = await form.validateFields();
    message.success('连接器创建成功');
    setDrawerOpen(false);
    form.resetFields();
  };

  const columns: ColumnsType<ConnectorItem> = [
    { title: '连接器名称', dataIndex: 'name', width: 200, render: (text, record) => (
      <div>
        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          {statusConfig[record.status]?.icon}
          {text}
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>{record.description.slice(0, 40)}{record.description.length > 40 ? '...' : ''}</Text>
      </div>
    )},
    { title: '连接模式', dataIndex: 'type', width: 90, render: (v) => <Tag>{v}</Tag> },
    { title: '连接状态', dataIndex: 'status', width: 100, render: (v: ConnectorStatus) => {
      const cfg = statusConfig[v];
      return (
        <Tag color={cfg.color} icon={cfg.icon}>
          {v}
        </Tag>
      );
    }},
    { title: '暴露工具', dataIndex: 'toolCount', width: 80, render: (v) => `${v} 个`, sorter: (a, b) => a.toolCount - b.toolCount },
    { title: '调用次数', dataIndex: 'callCount', width: 100, render: (v) => v.toLocaleString(), sorter: (a, b) => a.callCount - b.callCount },
    { title: '平均延迟', dataIndex: 'avgLatency', width: 100, render: (v) => {
      const color = v <= 300 ? '#52c41a' : v <= 600 ? '#faad14' : '#ff4d4f';
      return <Text style={{ color }}>{v} ms</Text>;
    }, sorter: (a, b) => a.avgLatency - b.avgLatency },
    { title: '更新时间', dataIndex: 'updateTime', width: 110 },
    { title: '操作', key: 'action', width: 140, render: (_, record) => (
      <>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setViewingItem(record)}>详情</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info('编辑功能')}>编辑</Button>
      </>
    )},
  ];

  return (
    <>
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          title="连接器管理"
          hint="管理 MCP（Model Context Protocol）连接器。支持 SSE 远程连接和 stdio 本地进程通信两种模式，连接后可暴露工具供智能体调用。"
        />
        <StatCards items={statItems} colSpan={24 / statItems.length} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={filterFields}
            filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setFilters({ keyword: '', type: undefined, status: undefined })}
            onCreate={() => { form.resetFields(); setDrawerOpen(true); }}
            createText="添加连接器"
            viewMode="table"
            onViewModeChange={(mode) => message.info(`切换到${mode === 'card' ? '卡片' : '列表'}视图`)}
          />
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
              scroll={{ x: 1000 }}
              style={{ marginTop: 12 }}
            />
          </div>
        </div>
      </div>

      {/* 新建连接器抽屉 */}
      <Drawer
        title="添加连接器"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
        placement="right"
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleCreate}>确定</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="连接器名称" rules={[{ required: true }]}>
            <Input placeholder="例如：公安数据研判MCP" />
          </Form.Item>
          <Form.Item name="type" label="连接模式" rules={[{ required: true }]}>
            <Select>
              <Option value="SSE">SSE（服务器推送事件）</Option>
              <Option value="stdio">stdio（本地进程通信）</Option>
            </Select>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 'SSE' ? (
                <Form.Item name="endpoint" label="SSE 端点地址" rules={[{ required: true }]}>
                  <Input placeholder="https://mcp.example.com/sse" />
                </Form.Item>
              ) : (
                <Form.Item name="command" label="启动命令" rules={[{ required: true }]}>
                  <Input placeholder="node mcp-server.js" />
                </Form.Item>
              )
            }
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="描述连接器的用途和提供的工具/服务" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 详情抽屉 */}
      <Drawer title="连接器详情" open={!!viewingItem} onClose={() => setViewingItem(null)} width={480} placement="right">
        {viewingItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Text type="secondary">名称</Text>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{viewingItem.name}</div>
            </div>
            <div>
              <Text type="secondary">连接模式</Text>
              <div><Tag>{viewingItem.type}</Tag></div>
            </div>
            <div>
              <Text type="secondary">连接状态</Text>
              <div>
                <Tag color={statusConfig[viewingItem.status]?.color}>{viewingItem.status}</Tag>
              </div>
            </div>
            <div>
              <Text type="secondary">{viewingItem.type === 'SSE' ? '端点地址' : '启动命令'}</Text>
              <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                {viewingItem.endpoint || viewingItem.command || '-'}
              </div>
            </div>
            <div>
              <Text type="secondary">暴露工具数</Text>
              <div>{viewingItem.toolCount} 个</div>
            </div>
            <div>
              <Text type="secondary">累计调用次数</Text>
              <div>{viewingItem.callCount.toLocaleString()} 次</div>
            </div>
            <div>
              <Text type="secondary">平均响应延迟</Text>
              <div>{viewingItem.avgLatency} ms</div>
            </div>
            <div>
              <Text type="secondary">创建 / 更新时间</Text>
              <div>{viewingItem.createTime} / {viewingItem.updateTime}</div>
            </div>
            <div>
              <Text type="secondary">描述</Text>
              <div>{viewingItem.description}</div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default ConnectorsPage;
