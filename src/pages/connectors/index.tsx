import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Drawer, Form, Input, Select, message, Popconfirm, Typography, Space, Row, Col, Pagination, Card } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import { mockConnectors, ConnectorItem, ConnectorAuthStatus, ConnectorSource } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';

const { Text } = Typography;
const { Option } = Select;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索连接器名称或描述', width: 240 },
  { type: 'select', key: 'source', placeholder: '来源', width: 120, options: [
    { label: '自定义', value: '自定义' },
    { label: '广场资源', value: '广场资源' },
  ]},
  { type: 'select', key: 'authStatus', placeholder: '授权状态', width: 120, options: [
    { label: '已授权', value: '已授权' },
    { label: '未授权', value: '未授权' },
  ]},
];

const authStatusConfig: Record<ConnectorAuthStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  '已授权': { color: '#52c41a', bg: '#f6ffed', icon: <CheckCircleOutlined />, label: '已授权' },
  '未授权': { color: '#bfbfbf', bg: '#f5f5f5', icon: <ExclamationCircleOutlined />, label: '未授权' },
};

const sourceConfig: Record<ConnectorSource, { color: string; bg: string }> = {
  '自定义': { color: '#1677ff', bg: '#e6f4ff' },
  '广场资源': { color: '#1677ff', bg: '#e6f4ff' },
};

const ConnectorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ConnectorItem[]>(mockConnectors);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', source: undefined, authStatus: undefined });
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<ConnectorItem | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword) && !item.serverKey.includes(filters.keyword) && !item.description.includes(filters.keyword)) return false;
      if (filters.source && item.source !== filters.source) return false;
      if (filters.authStatus && item.authStatus !== filters.authStatus) return false;
      return true;
    });
  }, [data, filters]);

  const activeStatIndex = activeStat === 'all' ? 0 : activeStat === '已授权' ? 1 : activeStat === '未授权' ? 2 : -1;

  const statCards = [
    { key: 'all', title: '连接器总数', value: data.length, color: '#1677ff', icon: <ApiOutlined />, bg: '#e6f4ff' },
    { key: '已授权', title: '已授权', value: data.filter(d => d.authStatus === '已授权').length, color: '#1677ff', icon: <CheckCircleOutlined />, bg: '#e6f4ff' },
    { key: '未授权', title: '未授权', value: data.filter(d => d.authStatus === '未授权').length, color: '#1677ff', icon: <ExclamationCircleOutlined />, bg: '#e6f4ff' },
  ];

  const handleGoSquare = () => {
    navigate('/dev/resource-square?tab=连接器');
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const handleEdit = (record: ConnectorItem) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((d) => d.id !== id));
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingId) {
      setData((prev) =>
        prev.map((d) => (d.id === editingId ? { ...d, ...values, updateTime: new Date().toISOString().slice(0, 10) } : d))
      );
      message.success('编辑成功');
    } else {
      setData((prev) => [...prev, {
        id: `cn-${Date.now()}`,
        ...values,
        creator: '当前用户',
        toolCount: 0,
        createTime: new Date().toISOString().slice(0, 10),
        updateTime: new Date().toISOString().slice(0, 10),
      }]);
      message.success('创建成功');
    }
    setDrawerOpen(false);
  };

  const columns: ColumnsType<ConnectorItem> = [
    { title: '名称', dataIndex: 'name', width: 200, render: (text, record) => {
      const sc = sourceConfig[record.source];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="resource-icon" style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: sc?.bg || '#e6f4ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: sc?.color || '#1677ff', fontSize: 14,
          }}>
            <ThunderboltOutlined />
          </div>
          <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{text}</span>
        </div>
      );
    }},
    { title: '服务器标识', dataIndex: 'serverKey', width: 200, render: (v: string) => (
      <code style={{ fontSize: 12 }}>{v}</code>
    )},
    { title: '授权状态', dataIndex: 'authStatus', width: 110, render: (v: ConnectorAuthStatus) => {
      const ac = authStatusConfig[v];
      return (
        <Tag style={{ borderRadius: 4, margin: 0, background: ac.bg, color: ac.color, border: `1px solid ${ac.color}30` }}>
          {ac.icon}<span style={{ marginLeft: 4 }}>{v}</span>
        </Tag>
      );
    }},
    { title: '工具数量', dataIndex: 'toolCount', width: 90, render: (v) => `${v} 个` },
    { title: '描述', dataIndex: 'description', ellipsis: true, width: 260 },
    { title: '创建人', dataIndex: 'creator', width: 90 },
    { title: '日期', dataIndex: 'createTime', width: 110 },
    { title: '操作', key: 'action', width: 120, render: (_, record) => (
      <>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </>
    )},
  ];

  // ──── Card Component ────
  const ConnectorCard: React.FC<{ item: ConnectorItem }> = ({ item }) => {
    const sc = sourceConfig[item.source];
    return (
      <div
        className="resource-card"
        onClick={() => setViewingItem(item)}
        style={{
          background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0',
          padding: '20px 20px 16px', cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
          display: 'flex', flexDirection: 'column', gap: 12,
          position: 'relative', overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = '#1677ff';
          el.style.boxShadow = '0 6px 20px rgba(22,119,255,0.08)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = '#f0f0f0';
          el.style.boxShadow = 'none';
        }}
      >
        <div className="resource-card-accent" style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div className="resource-icon" style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: sc.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: sc.color, fontSize: 16,
            }}>
              <ThunderboltOutlined />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code style={{ fontSize: 11, color: '#8c8c8c' }}>{item.serverKey}</code>
                <Text type="secondary" style={{ fontSize: 11 }}>{item.toolCount} 个工具</Text>
              </div>
            </div>
          </div>
          <Tag color={item.authStatus === '已授权' ? 'success' : 'default'} style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>
            {item.authStatus}
          </Tag>
        </div>
        <Text type="secondary" style={{ fontSize: 13, lineHeight: '20px', height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {item.description}
        </Text>
        <div className="resource-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 11 }}>{item.source} · {item.creator} · {item.createTime}</Text>
        </div>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="连接器管理"
        hint="管理 MCP 协议连接器，接入外部服务并暴露工具供智能体调用"
      />
      <Row gutter={16} style={{ padding: '0 0 12px' }}>
        {statCards.map((item, idx) => {
          const isActive = activeStatIndex === idx;
          const handleClick = () => {
            if (item.key === 'all') {
              setFilters(prev => ({ ...prev, authStatus: undefined, source: undefined }));
              setActiveStat('all');
            } else {
              setFilters(prev => ({ ...prev, authStatus: item.key, source: undefined }));
              setActiveStat(item.key);
            }
            setCardPage(1);
          };
          return (
            <Col span={24 / statCards.length} key={item.key}>
              <Card
                className="resource-stat-card"
                size="small"
                onClick={handleClick}
                style={{
                  borderRadius: 10,
                  borderColor: isActive ? item.color : '#f0f0f0',
                  cursor: 'pointer',
                  background: isActive ? item.bg : '#fff',
                  boxShadow: isActive ? `0 2px 8px ${item.color}18` : 'none',
                  transition: 'all .2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.color, fontSize: 20,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.title}</Text>
                    <div style={{ fontSize: 26, fontWeight: 700, color: item.color, lineHeight: '32px' }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <FilterBar
          filters={filterFields}
          filterValues={filters}
          onFilterChange={(key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setCardPage(1); if (key === 'source' || key === 'authStatus') setActiveStat(null); }}
          onSearch={() => {}}
          onReset={() => { setFilters({ keyword: '', source: undefined, authStatus: undefined }); setActiveStat(null); setCardPage(1); }}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode)}
          extra={<Button icon={<ShoppingOutlined />} onClick={handleGoSquare}>从广场获取</Button>}
          onCreate={handleOpenAdd}
          createText="创建连接器"
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
          {viewMode === 'table' ? (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
              scroll={{ x: 1150 }}
              style={{ marginTop: 12 }}
              locale={{ emptyText: '暂无连接器' }}
            />
          ) : (
            <>
              <div className="resource-card-grid" style={{ marginTop: 12 }}>
                {filteredData.slice((cardPage - 1) * cardPageSize, cardPage * cardPageSize).map((item) => (
                  <ConnectorCard key={item.id} item={item} />
                ))}
              </div>
              <div className="resource-page-pagination">
                <Pagination
                  current={cardPage}
                  pageSize={cardPageSize}
                  total={filteredData.length}
                  showSizeChanger
                  showTotal={(total) => `共 ${total} 条`}
                  pageSizeOptions={['8', '12', '16', '24']}
                  onChange={(page, size) => { setCardPage(page); setCardPageSize(size); }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 新建/编辑抽屉 */}
      <Drawer
        title={editingId ? '编辑连接器' : '新建连接器'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
        placement="right"
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>确定</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：公安数据研判连接器" />
          </Form.Item>
          <Form.Item name="serverKey" label="服务器标识" rules={[{ required: true, message: '请输入服务器标识' }]}>
            <Input placeholder="例如：police-data-analysis-connector" />
          </Form.Item>
          <Form.Item name="authStatus" label="授权状态" rules={[{ required: true }]}>
            <Select placeholder="请选择授权状态">
              <Option value="已授权">已授权</Option>
              <Option value="未授权">未授权</Option>
            </Select>
          </Form.Item>
          <Form.Item name="source" label="来源" rules={[{ required: true }]}>
            <Select placeholder="请选择来源">
              <Option value="自定义">自定义</Option>
              <Option value="广场资源">广场资源</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} placeholder="描述连接器的用途和提供的工具/服务" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 查看详情抽屉 */}
      <Drawer
        title={viewingItem?.name}
        open={!!viewingItem}
        onClose={() => setViewingItem(null)}
        width={520}
        placement="right"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#8c8c8c', fontSize: 16 }}>
          展开 {viewingItem?.name} 工具详情页
        </div>
      </Drawer>
    </div>
  );
};

export default ConnectorsPage;
