import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Drawer, Form, Input, Select, message, Popconfirm, Typography, Space, Row, Col, Tooltip, Pagination } from 'antd';
import {
  SettingOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SoundOutlined,
  FileSearchOutlined,
  ApiOutlined,
  CloudOutlined,
  HomeOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import FilterBar from '@/components/FilterBar';
import { mockModels, ModelItem } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';

const { Text } = Typography;
const { Option } = Select;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索模型名称', width: 220 },
  { type: 'select', key: 'modelType', placeholder: '模型类型', width: 140, options: [
    { label: '通用大模型', value: '通用大模型' },
    { label: '推理模型', value: '推理模型' },
    { label: '多模态模型', value: '多模态模型' },
    { label: '向量化模型', value: '向量化模型' },
    { label: '重排序模型', value: '重排序模型' },
    { label: '语音识别', value: '语音识别' },
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
  const [data, setData] = useState<ModelItem[]>(mockModels);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [cardPage, setCardPage] = useState(1);
  const cardPageSize = 9;

  const [filters, setFilters] = useState<Record<string, any>>({
    keyword: '', modelType: undefined, deployType: undefined, status: undefined,
  });

  // 筛选后的数据
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.displayName.includes(filters.keyword) && !item.modelName.includes(filters.keyword)) return false;
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
  }, [filteredData, cardPage]);

  const modelTypeIcon: Record<string, React.ReactNode> = {
    '通用大模型': <RobotOutlined />,
    '推理模型': <ThunderboltOutlined />,
    '多模态模型': <EyeOutlined />,
    '向量化模型': <FileSearchOutlined />,
    '重排序模型': <ApiOutlined />,
    '语音识别': <SoundOutlined />,
  };

  const deployIcon: Record<string, React.ReactNode> = {
    '公网': <CloudOutlined />,
    '本地': <HomeOutlined />,
    '私有云': <SafetyOutlined />,
  };

  // 统计卡片数据
  const statItems = [
    { title: '模型总数', value: data.length, color: '#1677ff' },
    { title: '启用中', value: data.filter((d) => d.status === '启用').length, color: '#52c41a' },
    { title: '公网部署', value: data.filter((d) => d.deployType === '公网').length, color: '#faad14' },
    { title: '本地部署', value: data.filter((d) => d.deployType === '本地').length, color: '#722ed1' },
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: '启用', deployType: '公网' });
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
        createTime: new Date().toISOString().slice(0, 10),
        updateTime: new Date().toISOString().slice(0, 10),
      };
      setData((prev) => [...prev, newItem]);
      message.success('创建成功');
    }
    setDrawerOpen(false);
  };

  const columns: ColumnsType<ModelItem> = [
    { title: '模型名称', dataIndex: 'displayName', width: 200, render: (text, record) => (
      <div>
        <div style={{ fontWeight: 500 }}>{text}</div>
        <Text type="secondary" style={{ fontSize: 12 }}>{record.modelName}</Text>
      </div>
    )},
    { title: '模型类型', dataIndex: 'modelType', width: 120, render: (v) => <Tag>{v}</Tag> },
    { title: '供应商', dataIndex: 'supplier', width: 100 },
    { title: '部署方式', dataIndex: 'deployType', width: 100, render: (v) => (
      <Tag color={v === '公网' ? 'blue' : v === '本地' ? 'purple' : 'geekblue'}>{v}</Tag>
    )},
    { title: '状态', dataIndex: 'status', width: 80, render: (v) => (
      <Tag color={v === '启用' ? 'green' : 'orange'}>{v}</Tag>
    )},
    { title: '描述', dataIndex: 'description', ellipsis: true, width: 260 },
    { title: '更新时间', dataIndex: 'updateTime', width: 120 },
    { title: '操作', key: 'action', width: 180, fixed: 'right', render: (_, record) => (
      <>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => message.info('API配置功能')}>配置</Button>
        <Popconfirm title="确定切换状态?" onConfirm={() => handleToggleStatus(record)}>
          <Button type="link" size="small">{record.status === '启用' ? '停用' : '启用'}</Button>
        </Popconfirm>
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
          title="模型管理"
          hint="在此管理所有大语言模型、多模态模型和向量化模型的接入配置，包括模型类型、供应商和部署方式。"
        />
        <StatCards items={statItems} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={filterFields}
            filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setFilters({ keyword: '', modelType: undefined, deployType: undefined, status: undefined })}
            onCreate={handleOpenAdd}
            createText="接入模型"
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
                  {pagedCards.map((item) => (
                    <Col span={8} key={item.id}>
                      <div
                        style={{
                          background: '#fff',
                          borderRadius: 12,
                          border: '1px solid #f0f0f0',
                          overflow: 'hidden',
                          transition: 'box-shadow .2s, transform .2s',
                          cursor: 'default',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {/* 卡片头部：图标 + 类型 */}
                        <div style={{
                          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0 20px',
                          background: item.status === '启用' ? 'linear-gradient(135deg, #f0f5ff, #e6f7ff)' : 'linear-gradient(135deg, #fafafa, #f5f5f5)',
                          borderBottom: '1px solid #f0f0f0',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10,
                              background: item.status === '启用' ? '#1677ff' : '#bfbfbf',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: 16,
                            }}>
                              {modelTypeIcon[item.modelType] || <RobotOutlined />}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f1f1f', lineHeight: '18px' }}>{item.displayName}</div>
                              <Text type="secondary" style={{ fontSize: 11 }}>{item.modelName}</Text>
                            </div>
                          </div>
                          <Tag color={item.status === '启用' ? 'green' : 'orange'} style={{ borderRadius: 6, margin: 0 }}>
                            {item.status === '启用' ? <CheckCircleOutlined style={{ fontSize: 10, marginRight: 2 }} /> : <PauseCircleOutlined style={{ fontSize: 10, marginRight: 2 }} />}
                            {item.status}
                          </Tag>
                        </div>

                        {/* 卡片主体 */}
                        <div style={{ padding: '20px' }}>
                          {/* 供应商 + 部署方式 */}
                          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '2px 10px', borderRadius: 6,
                              background: '#f6f8fa', border: '1px solid #f0f0f0',
                              fontSize: 12, color: '#595959',
                            }}>
                              <ToolOutlined style={{ fontSize: 11, color: '#8c8c8c' }} />
                              {item.supplier}
                            </div>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '2px 10px', borderRadius: 6,
                              background: '#f6f8fa', border: '1px solid #f0f0f0',
                              fontSize: 12, color: '#595959',
                            }}>
                              {deployIcon[item.deployType]}
                              {item.deployType}
                            </div>
                          </div>

                          {/* 类型标签 */}
                          <Tag color="processing" style={{ borderRadius: 6, marginBottom: 10 }}>{item.modelType}</Tag>

                          {/* 描述 */}
                          <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6, display: 'block', marginBottom: 16 }}>
                            {item.description.length > 60 ? `${item.description.slice(0, 60)}…` : item.description}
                          </Text>

                          {/* 底部信息 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: 12 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>更新于 {item.updateTime}</Text>
                            <Space size={2}>
                              <Tooltip title="编辑">
                                <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#8c8c8c' }} onClick={() => handleEdit(item)} />
                              </Tooltip>
                              <Tooltip title="配置">
                                <Button type="text" size="small" icon={<SettingOutlined />} style={{ color: '#8c8c8c' }} onClick={() => message.info('API配置功能')} />
                              </Tooltip>
                              <Popconfirm title="确定切换状态?" onConfirm={() => handleToggleStatus(item)}>
                                <Tooltip title={item.status === '启用' ? '停用' : '启用'}>
                                  <Button type="text" size="small" style={{ color: item.status === '启用' ? '#faad14' : '#52c41a' }}>
                                    {item.status === '启用' ? <PauseCircleOutlined /> : <CheckCircleOutlined />}
                                  </Button>
                                </Tooltip>
                              </Popconfirm>
                              <Popconfirm title="确定删除?" onConfirm={() => handleDelete(item.id)}>
                                <Tooltip title="删除">
                                  <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: '#ff4d4f' }} />
                                </Tooltip>
                              </Popconfirm>
                            </Space>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
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
              <Option value="推理模型">推理模型</Option>
              <Option value="多模态模型">多模态模型</Option>
              <Option value="向量化模型">向量化模型</Option>
              <Option value="重排序模型">重排序模型</Option>
              <Option value="语音识别">语音识别</Option>
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
    </>
  );
};

export default ModelsPage;
