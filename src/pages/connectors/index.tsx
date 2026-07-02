import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Drawer, Form, Input, Select, message, Typography, Space, Row, Col, Tooltip, Pagination } from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  ApiOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import FilterBar from '@/components/FilterBar';
import { mockConnectors, ConnectorItem, ConnectorStatus } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';

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

const statusConfig: Record<ConnectorStatus, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  '已连接': { color: '#52c41a', bg: '#f6ffed', label: '已连接', icon: <WifiOutlined /> },
  '连接异常': { color: '#faad14', bg: '#fffbe6', label: '连接异常', icon: <ApiOutlined /> },
  '离线': { color: '#bfbfbf', bg: '#f5f5f5', label: '离线', icon: <DisconnectOutlined /> },
};

const typeConfig: Record<string, { color: string; bg: string }> = {
  'SSE': { color: '#1677ff', bg: '#e6f4ff' },
  'stdio': { color: '#722ed1', bg: '#f9f0ff' },
};

const ConnectorsPage: React.FC = () => {
  const [data] = useState<ConnectorItem[]>(mockConnectors);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', type: undefined, status: undefined });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ConnectorItem | null>(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [cardPage, setCardPage] = useState(1);
  const cardPageSize = 9;

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword) && !item.description.includes(filters.keyword)) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);

  const pagedCards = useMemo(() => {
    const start = (cardPage - 1) * cardPageSize;
    return filteredData.slice(start, start + cardPageSize);
  }, [filteredData, cardPage]);

  const statItems = [
    { title: '连接器总数', value: data.length, color: '#1677ff' },
    { title: '已连接', value: data.filter(d => d.status === '已连接').length, color: '#52c41a' },
    { title: '连接异常', value: data.filter(d => d.status === '连接异常').length, color: '#faad14' },
    { title: '暴露工具', value: data.reduce((s, d) => s + d.toolCount, 0), color: '#722ed1', suffix: ' 个' },
  ];

  const handleCreate = async () => {
    const values = await form.validateFields();
    message.success('连接器创建成功');
    setDrawerOpen(false);
    form.resetFields();
  };

  const columns: ColumnsType<ConnectorItem> = [
    { title: '连接器名称', dataIndex: 'name', width: 200, render: (text, record) => {
      const sc = statusConfig[record.status];
      return (
        <div>
          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: sc.color, fontSize: 14 }}>{sc.icon}</span>
            {text}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description.slice(0, 38)}{record.description.length > 38 ? '…' : ''}</Text>
        </div>
      );
    }},
    { title: '连接模式', dataIndex: 'type', width: 90, render: (v) => {
      const tc = typeConfig[v];
      return <Tag style={{ borderRadius: 4, margin: 0, background: tc?.bg, color: tc?.color, border: 'none' }}>{v}</Tag>;
    }},
    { title: '连接状态', dataIndex: 'status', width: 100, render: (v: ConnectorStatus) => {
      const sc = statusConfig[v];
      return (
        <Tag style={{ borderRadius: 4, margin: 0, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30` }}>
          {sc.icon}<span style={{ marginLeft: 4 }}>{v}</span>
        </Tag>
      );
    }},
    { title: '暴露工具', dataIndex: 'toolCount', width: 90, render: (v) => `${v} 个`, sorter: (a, b) => a.toolCount - b.toolCount },
    { title: '调用次数', dataIndex: 'callCount', width: 100, render: (v) => v.toLocaleString(), sorter: (a, b) => a.callCount - b.callCount },
    { title: '平均延迟', dataIndex: 'avgLatency', width: 100, render: (v) => {
      const color = v <= 300 ? '#52c41a' : v <= 600 ? '#faad14' : '#ff4d4f';
      return <Text style={{ color, fontWeight: 500 }}>{v} ms</Text>;
    }, sorter: (a, b) => a.avgLatency - b.avgLatency },
    { title: '更新时间', dataIndex: 'updateTime', width: 110 },
    { title: '操作', key: 'action', width: 140, fixed: 'right' as const, render: (_, record) => (
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
        <StatCards items={statItems} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={filterFields}
            filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setFilters({ keyword: '', type: undefined, status: undefined })}
            onCreate={() => { form.resetFields(); setDrawerOpen(true); }}
            createText="添加连接器"
            viewMode={viewMode}
            onViewModeChange={(mode) => { setViewMode(mode); setCardPage(1); }}
          />
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
            {viewMode === 'table' ? (
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                scroll={{ x: 1100 }}
                style={{ marginTop: 12 }}
              />
            ) : (
              <div style={{ marginTop: 12 }}>
                <Row gutter={[16, 16]}>
                  {pagedCards.map((item) => {
                    const sc = statusConfig[item.status];
                    const tc = typeConfig[item.type];
                    return (
                      <Col span={8} key={item.id}>
                        <div
                          style={{
                            background: '#fff',
                            borderRadius: 8,
                            border: '1px solid #E5EAF3',
                            borderTop: `3px solid ${sc.color}`,
                            overflow: 'hidden',
                            transition: 'all .2s',
                            cursor: 'default',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.05)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          {/* Card header */}
                          <div style={{ padding: '16px 18px 0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: 8, background: sc.bg, color: sc.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0,
                            }}>
                              {sc.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', lineHeight: '22px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name}
                              </div>
                              <Space size={5} style={{ marginTop: 4 }} wrap>
                                <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, background: tc.bg, color: tc.color, border: 'none' }}>
                                  {item.type}
                                </Tag>
                                <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30` }}>
                                  {sc.icon}<span style={{ marginLeft: 3 }}>{sc.label}</span>
                                </Tag>
                              </Space>
                            </div>
                          </div>

                          {/* Description */}
                          <div style={{ padding: '8px 18px 0' }}>
                            <Text style={{ fontSize: 13, color: '#5F6B7A', lineHeight: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.description}
                            </Text>
                          </div>

                          {/* Metrics */}
                          <div style={{ margin: '12px 18px 0', padding: '10px 14px', background: '#F7F9FC', borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: 11, color: '#7A8599', marginBottom: 2 }}>工具数</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: '#1D2129', lineHeight: 1 }}>
                                {item.toolCount}
                              </div>
                            </div>
                            <div style={{ width: 1, height: 28, background: '#E5EAF3' }} />
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: 11, color: '#7A8599', marginBottom: 2 }}>调用次数</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: '#1D2129', lineHeight: 1 }}>
                                {item.callCount.toLocaleString()}
                              </div>
                            </div>
                            <div style={{ width: 1, height: 28, background: '#E5EAF3' }} />
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: 11, color: '#7A8599', marginBottom: 2 }}>延迟</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: item.avgLatency <= 300 ? '#52c41a' : item.avgLatency <= 600 ? '#faad14' : '#ff4d4f', lineHeight: 1 }}>
                                {item.avgLatency}ms
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div style={{ marginTop: 'auto', padding: '10px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 12, color: '#7A8599' }}>
                              {item.type === 'SSE' ? 'SSE远程' : '本地进程'} · {item.updateTime}
                            </Text>
                            <Space size={2}>
                              <Tooltip title="查看详情"><Button type="text" size="small" icon={<EyeOutlined />} style={{ color: '#7A8599' }} onClick={() => setViewingItem(item)} /></Tooltip>
                              <Tooltip title="编辑"><Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#7A8599' }} onClick={() => message.info('编辑功能')} /></Tooltip>
                            </Space>
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <Pagination
                    current={cardPage}
                    pageSize={cardPageSize}
                    total={filteredData.length}
                    onChange={(p) => setCardPage(p)}
                    showSizeChanger={false}
                    showTotal={(total) => `共 ${total} 条`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Drawer */}
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
            <Input placeholder="例如：公安数据研判连接器" />
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
                  <Input placeholder="https://connector.example.com/sse" />
                </Form.Item>
              ) : (
                <Form.Item name="command" label="启动命令" rules={[{ required: true }]}>
                  <Input placeholder="node connector-server.js" />
                </Form.Item>
              )
            }
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="描述连接器的用途和提供的工具/服务" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer title="连接器详情" open={!!viewingItem} onClose={() => setViewingItem(null)} size={480} placement="right">
        {viewingItem && (() => {
          const sc = statusConfig[viewingItem.status];
          const tc = typeConfig[viewingItem.type];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>名称</Text>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{viewingItem.name}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>连接模式</Text>
                <div style={{ marginTop: 4 }}><Tag style={{ borderRadius: 4, background: tc.bg, color: tc.color, border: 'none' }}>{viewingItem.type}</Tag></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>连接状态</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag style={{ borderRadius: 4, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30` }}>
                    {sc.icon}<span style={{ marginLeft: 4 }}>{viewingItem.status}</span>
                  </Tag>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>{viewingItem.type === 'SSE' ? '端点地址' : '启动命令'}</Text>
                <div style={{ fontFamily: 'monospace', fontSize: 13, marginTop: 4, color: '#5F6B7A' }}>
                  {viewingItem.endpoint || viewingItem.command || '-'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, padding: '14px 18px', borderRadius: 8, background: '#F7F9FC' }}>
                <div>
                  <Text style={{ fontSize: 11, color: '#7A8599' }}>暴露工具</Text>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1677ff' }}>{viewingItem.toolCount} 个</div>
                </div>
                <div>
                  <Text style={{ fontSize: 11, color: '#7A8599' }}>调用次数</Text>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1677ff' }}>{viewingItem.callCount.toLocaleString()}</div>
                </div>
                <div>
                  <Text style={{ fontSize: 11, color: '#7A8599' }}>平均延迟</Text>
                  <div style={{ fontSize: 18, fontWeight: 700, color: viewingItem.avgLatency <= 300 ? '#52c41a' : '#faad14' }}>{viewingItem.avgLatency} ms</div>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>创建 / 更新时间</Text>
                <div style={{ marginTop: 4, fontSize: 14 }}>{viewingItem.createTime} / {viewingItem.updateTime}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>描述</Text>
                <div style={{ marginTop: 4, fontSize: 13, color: '#5F6B7A', lineHeight: '22px' }}>{viewingItem.description}</div>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </>
  );
};

export default ConnectorsPage;
