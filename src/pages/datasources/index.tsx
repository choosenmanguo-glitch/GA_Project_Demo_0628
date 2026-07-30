import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Drawer, Form, Input, InputNumber, Select, message, Popconfirm, Typography, Space, Row, Col, Card, Dropdown, Pagination } from 'antd';
import { EditOutlined, DeleteOutlined, DatabaseOutlined, MoreOutlined, FolderOutlined, TableOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import PaginationBar from '@/components/PaginationBar';
import { mockDataSources, DataSourceItem, DbType } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';

const { Text } = Typography;
const { Option } = Select;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索数据源名称', width: 220 },
  { type: 'select', key: 'dataType', placeholder: '数据类型', width: 120, options: [
    { label: '结构化', value: '结构化' },
    { label: '非结构化', value: '非结构化' },
  ]},
  { type: 'select', key: 'dbType', placeholder: '数据库类型', width: 130, options: [
    { label: 'MySQL', value: 'MySQL' },
    { label: 'TiDB', value: 'TiDB' },
    { label: 'MinIO', value: 'MinIO' },
    { label: 'HighGoV9', value: 'HighGoV9' },
  ]},
];

const dbTypeBgColors: Record<DbType, string> = {
  MySQL: '#e6f4ff',
  TiDB: '#e6f4ff',
  MinIO: '#e6f4ff',
  HighGoV9: '#e6f4ff',
};

const dataTypeTagStyle = (dataType: DataSourceItem['dataType']): React.CSSProperties => ({
  border: 'none',
  background: dataType === '结构化' ? '#e6f4ff' : '#f2f3f5',
  color: dataType === '结构化' ? '#1677ff' : '#5f6b7a',
});

const dbTypeTagStyle: React.CSSProperties = {
  border: 'none',
  background: '#f2f3f5',
  color: '#5f6b7a',
};

const DataSourcesPage: React.FC = () => {
  const [data, setData] = useState<DataSourceItem[]>(mockDataSources);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', dataType: undefined, dbType: undefined });
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<DataSourceItem | null>(null);
  const [form] = Form.useForm();

  const activeStatIndex = activeStat === 'all' ? 0 : activeStat === '结构化' ? 1 : activeStat === '非结构化' ? 2 : -1;

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword) && !item.dbName.includes(filters.keyword)) return false;
      if (filters.dataType && item.dataType !== filters.dataType) return false;
      if (filters.dbType && item.dbType !== filters.dbType) return false;
      return true;
    });
  }, [data, filters]);

  const statCards = [
    { key: 'all', title: '数据源总数', value: data.length, color: '#1677ff', icon: <DatabaseOutlined />, bg: '#e6f4ff' },
    { key: '结构化', title: '结构化', value: data.filter((d) => d.dataType === '结构化').length, color: '#1677ff', icon: <TableOutlined />, bg: '#e6f4ff' },
    { key: '非结构化', title: '非结构化', value: data.filter((d) => d.dataType === '非结构化').length, color: '#1677ff', icon: <FolderOutlined />, bg: '#e6f4ff' },
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ dbType: 'MySQL', port: 3306 });
    setDrawerOpen(true);
  };

  const handleEdit = (record: DataSourceItem) => {
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
        id: String(Date.now()),
        ...values,
        creator: '当前用户',
        createTime: new Date().toISOString().slice(0, 10),
        updateTime: new Date().toISOString().slice(0, 10),
      }]);
      message.success('创建成功');
    }
    setDrawerOpen(false);
  };

  const columns: ColumnsType<DataSourceItem> = [
    { title: '数据源名称', dataIndex: 'name', width: 160, render: (text, record) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="resource-icon" style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: dbTypeBgColors[record.dbType],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1677ff', fontSize: 14,
        }}>
          <DatabaseOutlined />
        </div>
        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{text}</span>
      </div>
    )},
    { title: '数据类型', dataIndex: 'dataType', width: 100, render: (v: string) => (
      <Tag style={dataTypeTagStyle(v as DataSourceItem['dataType'])}>{v}</Tag>
    )},
    { title: '数据库类型', dataIndex: 'dbType', width: 120, render: (v: DbType) => (
      <Tag style={dbTypeTagStyle}>{v}</Tag>
    )},
    { title: '主机地址', dataIndex: 'host', width: 150, render: (text, record) => (
      <code style={{ fontSize: 13 }}>{text}:{record.port}</code>
    )},
    { title: '数据库名', dataIndex: 'dbName', width: 140, ellipsis: true },
    { title: '创建人', dataIndex: 'creator', width: 80 },
    { title: '更新时间', dataIndex: 'updateTime', width: 120 },
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
  const DataSourceCard: React.FC<{ item: DataSourceItem }> = ({ item }) => (
    <div
      className="resource-card"
      onClick={() => handleEdit(item)}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="resource-icon" style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: dbTypeBgColors[item.dbType],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1677ff', fontSize: 16,
        }}>
          <DatabaseOutlined />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </div>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.dbName} · {item.host}:{item.port}
          </Text>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Tag style={{ ...dataTypeTagStyle(item.dataType), borderRadius: 4, margin: 0, fontSize: 11 }}>{item.dataType}</Tag>
        <Tag style={{ ...dbTypeTagStyle, borderRadius: 4, margin: 0, fontSize: 11 }}>{item.dbType}</Tag>
      </div>
      <Text type="secondary" style={{ fontSize: 13, lineHeight: '20px', height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {item.description}
      </Text>
      <div className="resource-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 11 }}>{item.creator} · {item.createTime}</Text>
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <EditOutlined />, label: '编辑', onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleEdit(item); } },
              { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleDelete(item.id); } },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            style={{ borderRadius: 6, fontSize: 12 }}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="数据连接管理"
        hint="管理数据源连接，为智能体和知识库提供结构化与非结构化数据的统一访问能力"
      />
      <Row gutter={[16, 16]} style={{ padding: '0 0 12px' }}>
        {statCards.map((item, idx) => {
          const isActive = activeStatIndex === idx;
          const handleClick = () => {
            if (item.key === 'all') {
              setFilters(prev => ({ ...prev, dataType: undefined, dbType: undefined }));
              setActiveStat('all');
            } else if (item.key === '结构化' || item.key === '非结构化') {
              setFilters(prev => ({ ...prev, dataType: item.key, dbType: undefined }));
              setActiveStat(item.key);
            } else {
              setFilters(prev => ({ ...prev, dbType: item.key }));
              setActiveStat(item.key);
            }
          };
          return (
            <Col key={item.key} span={24 / statCards.length}>


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
          onFilterChange={(key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setCardPage(1); if (key === 'dataType' || key === 'dbType') setActiveStat(null); }}
          onSearch={() => {}}
          onReset={() => { setFilters({ keyword: '', dataType: undefined, dbType: undefined }); setActiveStat(null); setCardPage(1); }}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode)}
          onCreate={handleOpenAdd}
          createText="新建连接"
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
          {viewMode === 'table' ? (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
              scroll={{ x: 1000 }}
              style={{ marginTop: 12 }}
              locale={{ emptyText: '暂无数据连接' }}
            />
          ) : (
            <>
              <div className="resource-card-grid" style={{ marginTop: 12 }}>
                {filteredData.slice((cardPage - 1) * cardPageSize, cardPage * cardPageSize).map((item) => (
                  <DataSourceCard key={item.id} item={item} />
                ))}
              </div>
              <PaginationBar current={cardPage} pageSize={cardPageSize} total={filteredData.length} onChange={(p, s) => { setCardPage(p); setCardPageSize(s); }} />
            </>
          )}
        </div>
      </div>

      {/* 新建/编辑抽屉 */}
      <Drawer
        title={editingId ? '编辑数据连接' : '新建数据连接'}
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
          <Form.Item name="name" label="数据源名称" rules={[{ required: true }]}>
            <Input placeholder="例如：核心业务主库" />
          </Form.Item>
          <Form.Item name="dbType" label="数据库类型" rules={[{ required: true }]}>
            <Select>
              <Option value="MySQL">MySQL</Option>
              <Option value="TiDB">TiDB</Option>
              <Option value="MinIO">MinIO</Option>
              <Option value="HighGoV9">HighGoV9</Option>
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="host" label="主机地址" rules={[{ required: true }]} style={{ flex: 2 }}>
              <Input placeholder="192.168.1.100" />
            </Form.Item>
            <Form.Item name="port" label="端口" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber placeholder="3306" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="dbName" label="数据库名" rules={[{ required: true }]}>
            <Input placeholder="core_business" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="描述数据源的用途" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 详情抽屉 */}
      <Drawer title="数据连接详情" open={!!viewingItem} onClose={() => setViewingItem(null)} size={460} placement="right">
        {viewingItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Text type="secondary">数据源名称</Text>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{viewingItem.name}</div>
            </div>
            <div>
              <Text type="secondary">数据库类型</Text>
              <div><Tag color={dbTypeColors[viewingItem.dbType]}>{viewingItem.dbType}</Tag></div>
            </div>
            <div>
              <Text type="secondary">连接地址</Text>
              <div><code>{viewingItem.host}:{viewingItem.port}</code></div>
            </div>
            <div>
              <Text type="secondary">数据库名</Text>
              <div>{viewingItem.dbName}</div>
            </div>
            <div>
              <Text type="secondary">数据类型</Text>
              <div><Tag color={viewingItem.dataType === '结构化' ? 'green' : 'purple'}>{viewingItem.dataType}</Tag></div>
            </div>
            <div>
              <Text type="secondary">创建人</Text>
              <div>{viewingItem.creator}</div>
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
    </div>
  );
};

export default DataSourcesPage;
