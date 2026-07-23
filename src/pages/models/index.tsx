import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Drawer, Form, Input, Select, message, Popconfirm, Typography, Space, Row, Col, Pagination, Card, Dropdown } from 'antd';
import {
  SettingOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  FileSearchOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  MoreOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import { mockModels, ModelItem, mockModelSources, ModelSourceItem } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';

const { Text } = Typography;
const { Option } = Select;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索模型名称', width: 220 },
  { type: 'select', key: 'source', placeholder: '来源', width: 120, options: [
    { label: '自定义', value: '自定义' },
    { label: '广场资源', value: '广场资源' },
  ]},
  { type: 'select', key: 'modelType', placeholder: '模型类型', width: 140, options: [
    { label: '通用大模型', value: '通用大模型' },
    { label: '向量化模型', value: '向量化模型' },
    { label: 'ReRank模型', value: 'ReRank模型' },
  ]},
  { type: 'select', key: 'deployType', placeholder: '部署方式', width: 120, options: [
    { label: '公网', value: '公网' },
    { label: '本地', value: '本地' },
    { label: '私有云', value: '私有云' },
  ]},
  { type: 'select', key: 'status', placeholder: '状态', width: 100, options: [
    { label: '启用', value: '启用' },
    { label: '停用', value: '停用' },
  ]},
];

const ModelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ModelItem[]>(mockModels);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [activeStat, setActiveStat] = useState<string | null>(null);

  // 模型源管理
  const [sourceDrawerOpen, setSourceDrawerOpen] = useState(false);
  const [sourceData, setSourceData] = useState<ModelSourceItem[]>(mockModelSources);
  const [sourceFilters, setSourceFilters] = useState<Record<string, any>>({ keyword: '', deployType: undefined });
  const [sourceFormOpen, setSourceFormOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [sourceForm] = Form.useForm();

  const [filters, setFilters] = useState<Record<string, any>>({
    keyword: '', source: undefined, modelType: undefined, deployType: undefined, status: undefined,
  });

  // 筛选后的数据
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.displayName.includes(filters.keyword) && !item.modelName.includes(filters.keyword)) return false;
      if (filters.source && item.source !== filters.source) return false;
      if (filters.modelType && item.modelType !== filters.modelType) return false;
      if (filters.deployType && item.deployType !== filters.deployType) return false;
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);

  // 卡片模式分页
  const pagedCards = useMemo(() => {
    const start = (cardPage - 1) * cardPageSize;
    return filteredData.slice(start, start + cardPageSize);
  }, [filteredData, cardPage, cardPageSize]);

  const modelTypeIcon: Record<string, React.ReactNode> = {
    '通用大模型': <RobotOutlined />,
    '向量化模型': <FileSearchOutlined />,
    'ReRank模型': <ApiOutlined />,
  };

  const sourceConfig: Record<string, { color: string; bg: string }> = {
    '自定义': { color: '#1677ff', bg: '#e6f4ff' },
    '广场资源': { color: '#fa8c16', bg: '#fff7e6' },
  };

  // 统计卡片
  const statCards = [
    { key: 'all', title: '模型总数', value: data.length, color: '#1677ff', icon: <RobotOutlined />, bg: '#e6f4ff' },
    { key: '通用大模型', title: '通用大模型', value: data.filter((d) => d.modelType === '通用大模型').length, color: '#52c41a', icon: <RobotOutlined />, bg: '#f6ffed' },
    { key: '向量化模型', title: '向量化模型', value: data.filter((d) => d.modelType === '向量化模型').length, color: '#faad14', icon: <FileSearchOutlined />, bg: '#fffbe6' },
    { key: 'ReRank模型', title: 'ReRank模型', value: data.filter((d) => d.modelType === 'ReRank模型').length, color: '#722ed1', icon: <ApiOutlined />, bg: '#f9f0ff' },
  ];
  const activeStatIndex = activeStat === 'all' ? 0 : activeStat === '通用大模型' ? 1 : activeStat === '向量化模型' ? 2 : activeStat === 'ReRank模型' ? 3 : -1;

  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: '启用', deployType: '公网', source: '自定义' });
    setDrawerOpen(true);
  };

  const handleEdit = (record: ModelItem) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((d) => d.id !== id));
    message.success('删除成功');
  };

  const handleToggleStatus = (record: ModelItem) => {
    setData((prev) =>
      prev.map((d) =>
        d.id === record.id ? { ...d, status: d.status === '启用' ? ('停用' as const) : ('启用' as const) } : d
      )
    );
    message.success(`已${record.status === '启用' ? '停用' : '启用'}`);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingId) {
      setData((prev) =>
        prev.map((d) => (d.id === editingId ? { ...d, ...values, updateTime: new Date().toISOString().slice(0, 10) } : d))
      );
      message.success('编辑成功');
    } else {
      const newItem: ModelItem = {
        id: String(Date.now()),
        ...values,
        creator: '当前用户',
        createTime: new Date().toISOString().slice(0, 10),
        updateTime: new Date().toISOString().slice(0, 10),
      };
      setData((prev) => [...prev, newItem]);
      message.success('创建成功');
    }
    setDrawerOpen(false);
  };

  // 模型源管理操作
  const filteredSources = useMemo(() => {
    return sourceData.filter((item) => {
      if (sourceFilters.keyword && !item.name.includes(sourceFilters.keyword) && !item.remark.includes(sourceFilters.keyword)) return false;
      if (sourceFilters.deployType && item.deployType !== sourceFilters.deployType) return false;
      return true;
    });
  }, [sourceData, sourceFilters]);

  const handleOpenSourceAdd = () => {
    setEditingSourceId(null);
    sourceForm.resetFields();
    setSourceFormOpen(true);
  };

  const handleEditSource = (record: ModelSourceItem) => {
    setEditingSourceId(record.id);
    sourceForm.setFieldsValue(record);
    setSourceFormOpen(true);
  };

  const handleDeleteSource = (id: string) => {
    setSourceData((prev) => prev.filter((d) => d.id !== id));
    message.success('删除成功');
  };

  const handleSourceSubmit = async () => {
    const values = await sourceForm.validateFields();
    if (editingSourceId) {
      setSourceData((prev) =>
        prev.map((d) => (d.id === editingSourceId ? { ...d, ...values, updateTime: new Date().toISOString().slice(0, 10) } : d))
      );
      message.success('编辑成功');
    } else {
      setSourceData((prev) => [...prev, {
        id: `ms-${Date.now()}`,
        ...values,
        creator: '当前用户',
        createTime: new Date().toISOString().slice(0, 10),
        updateTime: new Date().toISOString().slice(0, 10),
      }]);
      message.success('添加成功');
    }
    setSourceFormOpen(false);
  };

  const handleTestConnection = async () => {
    const baseUrl = sourceForm.getFieldValue('baseUrl');
    const apiKey = sourceForm.getFieldValue('apiKey');
    if (!baseUrl) { message.warning('请先填写 Base URL'); return; }
    message.loading({ content: '正在测试连接…', key: 'testConn', duration: 2 });
    setTimeout(() => {
      message.success({ content: '连接测试成功', key: 'testConn', duration: 2 });
    }, 1500);
  };

  // 模型源列表列定义
  const sourceColumns: ColumnsType<ModelSourceItem> = [
    { title: '模型源名称', dataIndex: 'name', width: 200 },
    { title: '部署方式', dataIndex: 'deployType', width: 100, render: (v) => (
      <Tag color={v === '公网' ? 'blue' : 'purple'}>{v}</Tag>
    )},
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '操作', key: 'action', width: 140, render: (_, record) => (
      <Space size={2}>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditSource(record)}>编辑</Button>
        <Popconfirm title="确定删除?" onConfirm={() => handleDeleteSource(record.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const columns: ColumnsType<ModelItem> = [
    { title: '模型', dataIndex: 'modelName', width: 180, render: (v) => (
      <span style={{ fontSize: 12, color: '#5F6B7A' }}>{v}</span>
    )},
    { title: '显示名称', dataIndex: 'displayName', width: 180, render: (v) => (
      <span style={{ fontWeight: 500 }}>{v}</span>
    )},
    { title: '模型类型', dataIndex: 'modelType', width: 120, render: (v) => <Tag>{v}</Tag> },
    { title: '部署方式', dataIndex: 'deployType', width: 100, render: (v) => (
      <Tag color={v === '公网' ? 'blue' : v === '本地' ? 'purple' : 'geekblue'}>{v}</Tag>
    )},
    { title: '使用状态', dataIndex: 'status', width: 100, render: (v) => (
      <Tag color={v === '启用' ? 'green' : 'orange'}>{v}</Tag>
    )},
    { title: '来源', dataIndex: 'source', width: 100, render: (v) => {
      const sc = sourceConfig[v];
      return <Tag style={{ borderRadius: 4, background: sc?.bg, color: sc?.color, border: 'none', margin: 0 }}>{v}</Tag>;
    }},
    { title: '创建人', dataIndex: 'creator', width: 100 },
    { title: '日期', dataIndex: 'updateTime', width: 110 },
    { title: '操作', key: 'action', width: 200, fixed: 'right', render: (_, record) => (
      <span style={{ whiteSpace: 'nowrap' }}>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Button
          type="link"
          size="small"
          icon={record.status === '启用' ? <PauseCircleOutlined /> : <CheckCircleOutlined />}
          style={{ color: record.status === '启用' ? '#faad14' : '#52c41a' }}
          onClick={() => handleToggleStatus(record)}
        >
          {record.status === '启用' ? '停用' : '启用'}
        </Button>
        <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </span>
    )},
  ];

  return (
    <>
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          title="模型管理"
          hint="管理已接入的通用大模型、向量化模型和 ReRank 模型，为智能体提供推理与内容生成能力"
          extra={
            <Button icon={<SettingOutlined />} onClick={() => setSourceDrawerOpen(true)}>模型源管理</Button>
          }
        />
        <Row gutter={16} style={{ padding: '0 0 12px' }}>
          {statCards.map((item, idx) => {
            const isActive = activeStatIndex === idx;
            const handleClick = () => {
              if (item.key === 'all') {
                setFilters(prev => ({ ...prev, modelType: undefined }));
                setActiveStat('all');
              } else {
                setFilters(prev => ({ ...prev, modelType: item.key }));
                setActiveStat(item.key);
              }
              setCardPage(1);
            };
            return (
              <Col span={6} key={item.key}>
                <Card
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
            onFilterChange={(key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setCardPage(1); setActiveStat(null); }}
            onSearch={() => {}}
            onReset={() => { setFilters({ keyword: '', source: undefined, modelType: undefined, deployType: undefined, status: undefined }); setActiveStat(null); setCardPage(1); }}
            onCreate={handleOpenAdd}
            createText="接入模型"
            extra={
              <Button icon={<ShoppingOutlined />} onClick={() => navigate('/dev/resource-square?tab=model')}>
                从广场获取
              </Button>
            }
            viewMode={viewMode}
            onViewModeChange={(mode) => { setViewMode(mode); setCardPage(1); }}
          />
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
            {viewMode === 'table' ? (
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                scroll={{ x: 1320 }}
                style={{ marginTop: 12 }}
              />
            ) : (
              <>
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14, flex: 1, alignContent: 'start' }}>
                  {pagedCards.map((item) => (
                    <div
                      key={item.id}
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
                        el.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.borderColor = '#f0f0f0';
                        el.style.boxShadow = 'none';
                        el.style.transform = 'none';
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: item.status === '启用' ? '#1677ff' : '#d9d9d9' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                            background: item.status === '启用' ? 'linear-gradient(135deg, #1677ff, #69b1ff)' : 'linear-gradient(135deg, #bfbfbf, #d9d9d9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 16,
                          }}>
                            {modelTypeIcon[item.modelType] || <RobotOutlined />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.displayName}
                            </div>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.modelName}</Text>
                          </div>
                        </div>
                        <Tag color={item.status === '启用' ? 'green' : 'orange'} style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>
                          {item.status === '启用' ? <CheckCircleOutlined style={{ fontSize: 10, marginRight: 2 }} /> : <PauseCircleOutlined style={{ fontSize: 10, marginRight: 2 }} />}
                          {item.status}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Tag color="blue" style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{item.modelType}</Tag>
                        <Tag color={item.deployType === '公网' ? 'geekblue' : item.deployType === '本地' ? 'purple' : 'cyan'} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{item.deployType}</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 13, lineHeight: '20px', height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.description}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.source} · {item.creator} · {item.updateTime}</Text>
                        <Space size={4}>
                          <Dropdown
                            menu={{
                              items: [
                                { key: 'edit', icon: <EditOutlined />, label: '编辑', onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleEdit(item); } },
                                { key: 'toggle', icon: item.status === '启用' ? <PauseCircleOutlined /> : <CheckCircleOutlined />, label: item.status === '启用' ? '停用' : '启用', onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleToggleStatus(item); } },
                                { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleDelete(item.id); } },
                              ],
                            }}
                            trigger={['click']}
                          >
                            <Button type="text" size="small" icon={<MoreOutlined />} style={{ borderRadius: 6, fontSize: 12 }} onClick={(e) => e.stopPropagation()} />
                          </Dropdown>
                        </Space>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 0 0' }}>
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
      </div>

      {/* 新建/编辑抽屉 */}
      <Drawer
        title={editingId ? '编辑模型' : '接入模型'}
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
          <Form.Item name="displayName" label="展示名称" rules={[{ required: true, message: '请输入展示名称' }]}>
            <Input placeholder="例如：DeepSeek-Chat" />
          </Form.Item>
          <Form.Item name="modelName" label="模型标识" rules={[{ required: true, message: '请输入模型标识' }]}>
            <Input placeholder="例如：deepseek-chat" />
          </Form.Item>
          <Form.Item name="modelType" label="模型类型" rules={[{ required: true }]}>
            <Select>
              <Option value="通用大模型">通用大模型</Option>
              <Option value="向量化模型">向量化模型</Option>
              <Option value="ReRank模型">ReRank模型</Option>
            </Select>
          </Form.Item>
          <Form.Item name="supplier" label="供应商" rules={[{ required: true }]}>
            <Input placeholder="例如：DeepSeek" />
          </Form.Item>
          <Form.Item name="deployType" label="部署方式" rules={[{ required: true }]}>
            <Select>
              <Option value="公网">公网</Option>
              <Option value="本地">本地</Option>
              <Option value="私有云">私有云</Option>
            </Select>
          </Form.Item>
          <Form.Item name="source" label="来源" rules={[{ required: true }]}>
            <Select>
              <Option value="自定义">自定义</Option>
              <Option value="广场资源">广场资源</Option>
            </Select>
          </Form.Item>
          <Form.Item name="endpoint" label="API 地址">
            <Input placeholder="https://api.example.com/v1" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="描述模型的用途和特点" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="启用">启用</Option>
              <Option value="停用">停用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 模型源管理抽屉 */}
      <Drawer
        title="模型源管理"
        open={sourceDrawerOpen}
        onClose={() => setSourceDrawerOpen(false)}
        width={720}
        placement="right"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <FilterBar
            filters={[
              { type: 'search', key: 'keyword', placeholder: '搜索模型源名称或备注', width: 240 },
              { type: 'select', key: 'deployType', placeholder: '部署方式', width: 120, options: [
                { label: '公网', value: '公网' },
                { label: '本地', value: '本地' },
              ]},
            ]}
            filterValues={sourceFilters}
            onFilterChange={(key, value) => setSourceFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setSourceFilters({ keyword: '', deployType: undefined })}
            onCreate={handleOpenSourceAdd}
            createText="添加模型源"
            style={{ borderTop: 'none' }}
          />
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px' }}>
            <Table
              columns={sourceColumns}
              dataSource={filteredSources}
              rowKey="id"
              pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
            />
          </div>
        </div>
      </Drawer>

      {/* 添加/编辑模型源子抽屉 */}
      <Drawer
        title={editingSourceId ? '编辑模型源' : '添加模型源'}
        open={sourceFormOpen}
        onClose={() => setSourceFormOpen(false)}
        width={500}
        placement="right"
        extra={
          <Space>
            <Button onClick={() => setSourceFormOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleSourceSubmit}>确定</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={sourceForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="模型源名称" rules={[{ required: true, message: '请输入模型源名称' }]}>
            <Input placeholder="例如：DeepSeek 官方源" />
          </Form.Item>
          <Form.Item name="baseUrl" label="Base URL" rules={[{ required: true, message: '请输入 Base URL' }]}>
            <Input placeholder="https://api.deepseek.com/v1" />
          </Form.Item>
          <Form.Item name="apiKey" label="API Key" rules={[{ required: true, message: '请输入 API Key' }]}>
            <Input.Password placeholder="请输入 API Key" />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleTestConnection} block>连接测试</Button>
          </Form.Item>
          <Form.Item name="deployType" label="部署方式" rules={[{ required: true }]}>
            <Select placeholder="请选择部署方式">
              <Option value="本地">本地</Option>
              <Option value="公网">公网</Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="备注信息（可选）" />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default ModelsPage;
