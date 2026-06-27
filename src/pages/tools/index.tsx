import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Form, Input, Select, message, Drawer, Typography, Tabs } from 'antd';
import { EditOutlined, EyeOutlined, ApiOutlined, GlobalOutlined, NodeIndexOutlined, UserOutlined, CarOutlined, ScanOutlined, PhoneOutlined, FileTextOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import FilterBar from '@/components/FilterBar';
import { mockTools, ToolItem } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';
import type { StatCardItem } from '@/components/StatCards';

const { Text } = Typography;
const { Option } = Select;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索工具名称', width: 220 },
  { type: 'select', key: 'type', placeholder: '工具类型', width: 120, options: [
    { label: '插件', value: '插件' },
    { label: 'API', value: 'API' },
    { label: '工作流', value: '工作流' },
  ]},
  { type: 'select', key: 'status', placeholder: '状态', width: 100, options: [
    { label: '启用', value: '启用' },
    { label: '停用', value: '停用' },
  ]},
];

const typeTagMap: Record<string, { color: string; icon: React.ReactNode }> = {
  '插件': { color: 'purple', icon: <NodeIndexOutlined /> },
  'API': { color: 'blue', icon: <ApiOutlined /> },
  '工作流': { color: 'cyan', icon: <GlobalOutlined /> },
};

const ToolDetailDrawer: React.FC<{ tool: ToolItem | null; open: boolean; onClose: () => void }> = ({ tool, open, onClose }) => {
  if (!tool) return null;
  return (
    <Drawer title={tool.name} open={open} onClose={onClose} width={520} placement="right">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Text type="secondary">工具类型</Text>
          <div><Tag color={typeTagMap[tool.type]?.color}>{tool.type}</Tag></div>
        </div>
        <div>
          <Text type="secondary">提供方</Text>
          <div>{tool.provider}</div>
        </div>
        <div>
          <Text type="secondary">状态</Text>
          <div><Tag color={tool.status === '启用' ? 'green' : 'orange'}>{tool.status}</Tag></div>
        </div>
        <div>
          <Text type="secondary">创建者</Text>
          <div>{tool.author}</div>
        </div>
        <div>
          <Text type="secondary">创建时间</Text>
          <div>{tool.createTime}</div>
        </div>
        <div>
          <Text type="secondary">调用次数 / 成功率</Text>
          <div>{tool.callCount.toLocaleString()} 次 · {tool.successRate}%</div>
        </div>
        <div>
          <Text type="secondary">描述</Text>
          <div>{tool.description}</div>
        </div>
        {tool.params && tool.params.length > 0 && (
          <div>
            <Text type="secondary">参数列表</Text>
            <Table
              size="small"
              dataSource={tool.params}
              rowKey="name"
              pagination={false}
              style={{ marginTop: 8 }}
              columns={[
                { title: '名称', dataIndex: 'name', width: 140, render: (v: string) => <code>{v}</code> },
                { title: '类型', dataIndex: 'type', width: 80 },
                { title: '必填', dataIndex: 'required', width: 60, render: (v: boolean) => v ? <Tag color="red">是</Tag> : <Tag>否</Tag> },
                { title: '说明', dataIndex: 'description', ellipsis: true },
              ]}
            />
          </div>
        )}
      </div>
    </Drawer>
  );
};

const ToolsPage: React.FC = () => {
  const [data] = useState<ToolItem[]>(mockTools);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', type: undefined, status: undefined });
  const [viewingTool, setViewingTool] = useState<ToolItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('全部');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (activeTab !== '全部' && item.type !== activeTab) return false;
      if (filters.keyword && !item.name.includes(filters.keyword) && !item.provider.includes(filters.keyword)) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }, [data, filters, activeTab]);

  const statItems: StatCardItem[] = [
    { title: '工具总数', value: data.length, color: '#1677ff' },
    { title: '插件工具', value: data.filter((d) => d.type === '插件').length, color: '#722ed1' },
    { title: 'API工具', value: data.filter((d) => d.type === 'API').length, color: '#1677ff' },
    { title: '工作流', value: data.filter((d) => d.type === '工作流').length, color: '#13c2c2' },
    { title: '累计调用', value: data.reduce((s, d) => s + d.callCount, 0).toLocaleString(), color: '#fa8c16' },
  ];

  const columns: ColumnsType<ToolItem> = [
    { title: '工具名称', dataIndex: 'name', width: 180, render: (text, record) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: typeTagMap[record.type]?.color }}>
          {typeTagMap[record.type]?.icon}
        </span>
        <span style={{ fontWeight: 500 }}>{text}</span>
      </div>
    )},
    { title: '类型', dataIndex: 'type', width: 90, render: (v) => (
      <Tag color={typeTagMap[v]?.color}>{v}</Tag>
    )},
    { title: '提供方', dataIndex: 'provider', width: 160, ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 80, render: (v) => (
      <Tag color={v === '启用' ? 'green' : 'orange'}>{v}</Tag>
    )},
    { title: '描述', dataIndex: 'description', ellipsis: true, width: 280 },
    { title: '调用次数', dataIndex: 'callCount', width: 100, render: (v) => v.toLocaleString(), sorter: (a, b) => a.callCount - b.callCount },
    { title: '成功率', dataIndex: 'successRate', width: 90, render: (v) => (
      <Text style={{ color: v >= 95 ? '#52c41a' : v >= 90 ? '#faad14' : '#ff4d4f' }}>{v}%</Text>
    ), sorter: (a, b) => a.successRate - b.successRate },
    { title: '操作', key: 'action', width: 120, render: (_, record) => (
      <>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setViewingTool(record)}>详情</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info('编辑功能')}>编辑</Button>
      </>
    )},
  ];

  return (
    <>
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          title="工具管理"
          hint="管理智能体可调用的工具/函数，包括插件工具、API工具和工作流。工具可在智能体配置中挂载，扩展智能体能力边界。"
        />
        <StatCards items={statItems} colSpan={24 / statItems.length} />
        {/* Tab 切换 — PRD 3.2 三级导航 */}
        <div style={{ padding: '0 24px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: '全部', label: '全部' },
              { key: '插件', label: '插件工具' },
              { key: 'API', label: 'API工具' },
              { key: '工作流', label: '工作流' },
            ]}
            style={{ marginBottom: 0 }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={filterFields}
            filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setFilters({ keyword: '', type: undefined, status: undefined })}
            onCreate={() => message.info('注册工具功能')}
            createText="注册工具"
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

      <ToolDetailDrawer tool={viewingTool} open={!!viewingTool} onClose={() => setViewingTool(null)} />
    </>
  );
};

export default ToolsPage;
