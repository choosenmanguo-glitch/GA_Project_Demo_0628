import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Drawer, Form, Input, InputNumber, Select, message, Popconfirm, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, DatabaseOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import FilterBar from '@/components/FilterBar';
import { mockDataSources, DataSourceItem, DbType } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';
import type { StatCardItem } from '@/components/StatCards';

const { Text } = Typography;
const { Option } = Select;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索数据源名称', width: 220 },
  { type: 'select', key: 'dbType', placeholder: '数据库类型', width: 150, options: [
    { label: 'MySQL', value: 'MySQL' },
    { label: 'Oracle', value: 'Oracle' },
    { label: 'PostgreSQL', value: 'PostgreSQL' },
    { label: 'MongoDB', value: 'MongoDB' },
    { label: 'Elasticsearch', value: 'Elasticsearch' },
    { label: 'Redis', value: 'Redis' },
  ]},
  { type: 'select', key: 'status', placeholder: '状态', width: 120, options: [
    { label: '已连接', value: '已连接' },
    { label: '连接异常', value: '连接异常' },
    { label: '未连接', value: '未连接' },
  ]},
];

const dbTypeColors: Record<DbType, string> = {
  MySQL: '#4479A1',
  Oracle: '#F80000',
  PostgreSQL: '#336791',
  MongoDB: '#47A248',
  Elasticsearch: '#00BFB3',
  Redis: '#DC382D',
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  '已连接': { color: 'green', icon: <CheckCircleOutlined /> },
  '连接异常': { color: 'orange', icon: <ExclamationCircleOutlined /> },
  '未连接': { color: 'default', icon: <CloseCircleOutlined /> },
};

const DataSourcesPage: React.FC = () => {
  const [data, setData] = useState<DataSourceItem[]>(mockDataSources);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', dbType: undefined, status: undefined });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<DataSourceItem | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword) && !item.dbName.includes(filters.keyword)) return false;
      if (filters.dbType && item.dbType !== filters.dbType) return false;
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);

  const statItems: StatCardItem[] = [
    { title: '数据源总数', value: data.length, color: '#1677ff' },
    { title: '已连接', value: data.filter((d) => d.status === '已连接').length, color: '#52c41a' },
    { title: '连接异常', value: data.filter((d) => d.status === '连接异常').length, color: '#faad14' },
    { title: '数据库类型', value: [...new Set(data.map((d) => d.dbType))].length, color: '#722ed1' },
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
    { title: '数据源名称', dataIndex: 'name', width: 180, render: (text, record) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <DatabaseOutlined style={{ color: dbTypeColors[record.dbType] || '#1677ff', fontSize: 16 }} />
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.dbName}</Text>
        </div>
      </div>
    )},
    { title: '数据库类型', dataIndex: 'dbType', width: 130, render: (v: DbType) => (
      <Tag color={dbTypeColors[v]}>{v}</Tag>
    )},
    { title: '主机地址', dataIndex: 'host', width: 150, render: (text, record) => (
      <code style={{ fontSize: 13 }}>{text}:{record.port}</code>
    )},
    { title: '状态', dataIndex: 'status', width: 100, render: (v) => {
      const cfg = statusConfig[v];
      return <Tag color={cfg.color} icon={cfg.icon}>{v}</Tag>;
    }},
    { title: '创建人', dataIndex: 'creator', width: 80 },
    { title: '更新时间', dataIndex: 'updateTime', width: 120 },
    { title: '操作', key: 'action', width: 180, render: (_, record) => (
      <>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setViewingItem(record)}>查看</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </>
    )},
  ];

  return (
    <>
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          title="数据连接管理"
          hint="管理知识库所需的数据源连接。支持 MySQL、Oracle、PostgreSQL、MongoDB、Elasticsearch 和 Redis 六种数据库类型。"
        />
        <StatCards items={statItems} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={filterFields}
            filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setFilters({ keyword: '', dbType: undefined, status: undefined })}
            onCreate={handleOpenAdd}
            createText="新建连接"
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
              <Option value="Oracle">Oracle</Option>
              <Option value="PostgreSQL">PostgreSQL</Option>
              <Option value="MongoDB">MongoDB</Option>
              <Option value="Elasticsearch">Elasticsearch</Option>
              <Option value="Redis">Redis</Option>
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
              <Text type="secondary">状态</Text>
              <div>
                <Tag color={statusConfig[viewingItem.status]?.color} icon={statusConfig[viewingItem.status]?.icon}>
                  {viewingItem.status}
                </Tag>
              </div>
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
    </>
  );
};

export default DataSourcesPage;
