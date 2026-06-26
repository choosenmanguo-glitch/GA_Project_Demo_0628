import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Drawer, Form, Input, Select, message, Popconfirm, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import FilterBar from '@/components/FilterBar';
import { mockPrompts, PromptTemplate } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';

const { Text, Paragraph } = Typography;
const { Option } = Select;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索提示词名称', width: 220 },
  { type: 'select', key: 'type', placeholder: '编排模式', width: 130, options: [
    { label: '自定义模式', value: 'custom' },
    { label: '工程化模式', value: 'engineering' },
  ]},
  { type: 'select', key: 'category', placeholder: '分类', width: 120, options: [
    { label: '警情分析', value: '警情分析' },
    { label: '反诈研判', value: '反诈研判' },
    { label: '治安管理', value: '治安管理' },
    { label: '交通管理', value: '交通管理' },
    { label: '刑侦办案', value: '刑侦办案' },
  ]},
];

const PromptDrawer: React.FC<{ prompt: PromptTemplate; open: boolean; onClose: () => void }> = ({ prompt, open, onClose }) => {
  return (
    <Drawer title="提示词详情" open={open} onClose={onClose} width={560} placement="right">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Text type="secondary">名称</Text>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{prompt.name}</div>
        </div>
        <div>
          <Text type="secondary">分类</Text>
          <div><Tag>{prompt.category}</Tag></div>
        </div>
        <div>
          <Text type="secondary">编排模式</Text>
          <div>
            <Tag color={prompt.type === 'custom' ? 'blue' : 'purple'}>
              {prompt.type === 'custom' ? '自定义模式' : `工程化模式 · ${prompt.method}`}
            </Tag>
          </div>
        </div>
        <div>
          <Text type="secondary">创建信息</Text>
          <div>{prompt.creator} · {prompt.createTime}</div>
        </div>
        <div>
          <Text type="secondary">使用次数</Text>
          <div>{prompt.usageCount} 次</div>
        </div>
        <div>
          <Text type="secondary">变量 ({prompt.variables.length})</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {prompt.variables.map((v) => (
              <Tag key={v} color="processing">{`$\{${v}}`}</Tag>
            ))}
          </div>
        </div>
        <div>
          <Text type="secondary">完整内容</Text>
          <Paragraph
            style={{
              background: '#fafafa',
              padding: 12,
              borderRadius: 6,
              whiteSpace: 'pre-wrap',
              fontSize: 13,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            {prompt.content}
          </Paragraph>
        </div>
      </div>
    </Drawer>
  );
};

const PromptsPage: React.FC = () => {
  const [data, setData] = useState<PromptTemplate[]>(mockPrompts);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<PromptTemplate | null>(null);
  const [form] = Form.useForm();

  const [filters, setFilters] = useState<Record<string, any>>({
    keyword: '', type: undefined, category: undefined,
  });

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword)) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.category && item.category !== filters.category) return false;
      return true;
    });
  }, [data, filters]);

  const statItems = [
    { title: '提示词模板总数', value: data.length, color: '#1677ff' },
    { title: '工程化模式', value: data.filter((d) => d.type === 'engineering').length, color: '#722ed1' },
    { title: '自定义模式', value: data.filter((d) => d.type === 'custom').length, color: '#13c2c2' },
    { title: '累计引用次数', value: data.reduce((s, d) => s + d.usageCount, 0), color: '#fa8c16' },
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ type: 'custom' });
    setDrawerOpen(true);
  };

  const handleEdit = (record: PromptTemplate) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((d) => d.id !== id));
    message.success('删除成功');
  };

  const handleCopy = (record: PromptTemplate) => {
    const newItem = { ...record, id: String(Date.now()), name: `${record.name} (副本)`, createTime: new Date().toISOString().slice(0, 10), updateTime: new Date().toISOString().slice(0, 10) };
    setData((prev) => [...prev, newItem]);
    message.success('已复制提示词模板');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const variables = values.content.match(/\$\{([^}]+)\}/g)?.map((v: string) => v.slice(2, -1)) || [];
    if (editingId) {
      setData((prev) =>
        prev.map((d) => (d.id === editingId ? { ...d, ...values, variables, updateTime: new Date().toISOString().slice(0, 10) } : d))
      );
      message.success('编辑成功');
    } else {
      setData((prev) => [...prev, {
        id: String(Date.now()),
        ...values,
        variables,
        usageCount: 0,
        creator: '当前用户',
        createTime: new Date().toISOString().slice(0, 10),
        updateTime: new Date().toISOString().slice(0, 10),
      }]);
      message.success('创建成功');
    }
    setDrawerOpen(false);
  };

  const columns: ColumnsType<PromptTemplate> = [
    { title: '提示词名称', dataIndex: 'name', width: 220, render: (text, record) => (
      <div>
        <div style={{ fontWeight: 500 }}>{text}</div>
        <Text type="secondary" style={{ fontSize: 12 }}>{record.usageCount} 次使用</Text>
      </div>
    )},
    { title: '分类', dataIndex: 'category', width: 100, render: (v) => <Tag>{v}</Tag> },
    { title: '编排模式', dataIndex: 'type', width: 140, render: (v, record) => (
      <Tag color={v === 'custom' ? 'blue' : 'purple'}>{v === 'custom' ? '自定义' : record.method}</Tag>
    )},
    { title: '变量数', dataIndex: 'variables', width: 80, render: (v: string[]) => v.length },
    { title: '创建人', dataIndex: 'creator', width: 120 },
    { title: '更新时间', dataIndex: 'updateTime', width: 120 },
    { title: '操作', key: 'action', width: 220, fixed: 'right', render: (_, record) => (
      <>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setViewingPrompt(record)}>查看</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(record)}>复制</Button>
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
          title="提示词管理"
          hint="管理智能体使用的提示词模板，支持自定义模式和工程化模式（ICIO/CRISPE/RASCEF），通过 ${变量名} 注入动态参数。"
        />
        <StatCards items={statItems} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={filterFields}
            filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setFilters({ keyword: '', type: undefined, category: undefined })}
            onCreate={handleOpenAdd}
            createText="新建提示词"
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
        title={editingId ? '编辑提示词' : '新建提示词'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
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
          <Form.Item name="name" label="提示词名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：110接警警情分析提取" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select placeholder="选择分类">
              <Option value="警情分析">警情分析</Option>
              <Option value="反诈研判">反诈研判</Option>
              <Option value="治安管理">治安管理</Option>
              <Option value="交通管理">交通管理</Option>
              <Option value="刑侦办案">刑侦办案</Option>
            </Select>
          </Form.Item>
          <Form.Item name="type" label="编排模式" rules={[{ required: true }]}>
            <Select>
              <Option value="custom">自定义模式</Option>
              <Option value="engineering">工程化模式</Option>
            </Select>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 'engineering' && (
                <Form.Item name="method" label="工程化方法" rules={[{ required: true }]}>
                  <Select placeholder="选择方法">
                    <Option value="ICIO">ICIO</Option>
                    <Option value="CRISPE">CRISPE</Option>
                    <Option value="RASCEF">RASCEF</Option>
                  </Select>
                </Form.Item>
              )
            }
          </Form.Item>
          <Form.Item name="content" label="提示词内容" rules={[{ required: true, message: '请输入提示词内容' }]} extra="使用 ${变量名} 格式插入动态变量">
            <Input.TextArea rows={8} placeholder="输入提示词模板内容，支持 ${变量名} 格式" />
          </Form.Item>
          <Form.Item name="creator" label="创建人">
            <Input placeholder="默认当前用户" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 查看详情抽屉 */}
      {viewingPrompt && (
        <PromptDrawer prompt={viewingPrompt} open={!!viewingPrompt} onClose={() => setViewingPrompt(null)} />
      )}
    </>
  );
};

export default PromptsPage;
