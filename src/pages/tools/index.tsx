import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Drawer, message, Typography, Space, Row, Col, Pagination, Card, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  ApiOutlined,
  NodeIndexOutlined,
  GlobalOutlined,
  MoreOutlined,
  DeleteOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import { mockTools, ToolItem } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';

const { Text } = Typography;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索工具名称或描述', width: 240 },
  { type: 'select', key: 'type', placeholder: '工具类型', width: 120, options: [
    { label: '插件', value: '插件' },
    { label: 'API', value: 'API' },
    { label: '工作流', value: '工作流' },
  ]},
  { type: 'select', key: 'source', placeholder: '来源', width: 110, options: [
    { label: '默认', value: '默认' },
    { label: '自定义', value: '自定义' },
    { label: '广场资源', value: '广场资源' },
  ]},
];

const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
  '插件': { color: '#722ed1', bg: '#f9f0ff', label: '插件' },
  'API': { color: '#1677ff', bg: '#e6f4ff', label: 'API' },
  '工作流': { color: '#13c2c2', bg: '#e6fffb', label: '工作流' },
};

const sourceConfig: Record<string, { color: string; bg: string }> = {
  '默认': { color: '#8c8c8c', bg: '#fafafa' },
  '自定义': { color: '#1677ff', bg: '#e6f4ff' },
  '广场资源': { color: '#fa8c16', bg: '#fff7e6' },
};

const typeIcons: Record<string, React.ReactNode> = {
  '插件': <NodeIndexOutlined />,
  'API': <ApiOutlined />,
  '工作流': <GlobalOutlined />,
};

const ToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data] = useState<ToolItem[]>(mockTools);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', type: undefined, source: undefined });
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const [viewingTool, setViewingTool] = useState<ToolItem | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword) && !item.provider.includes(filters.keyword) && !item.description.includes(filters.keyword)) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.source && item.source !== filters.source) return false;
      return true;
    });
  }, [data, filters]);

  const activeStatIndex = activeStat === 'all' ? 0 : activeStat === '插件' ? 1 : activeStat === 'API' ? 2 : activeStat === '工作流' ? 3 : -1;

  const statCards = [
    { key: 'all', title: '工具总数', value: data.length, color: '#1677ff', icon: <ApiOutlined />, bg: '#e6f4ff' },
    { key: '插件', title: '插件工具', value: data.filter(d => d.type === '插件').length, color: '#722ed1', icon: <NodeIndexOutlined />, bg: '#f9f0ff' },
    { key: 'API', title: 'API工具', value: data.filter(d => d.type === 'API').length, color: '#1677ff', icon: <ApiOutlined />, bg: '#e6f4ff' },
    { key: '工作流', title: '工作流', value: data.filter(d => d.type === '工作流').length, color: '#13c2c2', icon: <GlobalOutlined />, bg: '#e6fffb' },
  ];

  // ──── Card Component ────
  const ToolCard: React.FC<{ tool: ToolItem }> = ({ tool }) => {
    const tc = typeConfig[tool.type];
    const canEdit = tool.source === '自定义';
    const canDelete = tool.source === '自定义' || tool.source === '广场资源';

    const dropdownItems: any[] = [
      ...(canEdit ? [{ key: 'edit', icon: <EditOutlined />, label: '编辑', onClick: ({ domEvent }: any) => { domEvent.stopPropagation(); message.info('编辑功能'); } }] : []),
      ...(canDelete ? [{ key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: ({ domEvent }: any) => { domEvent.stopPropagation(); message.success('已删除'); } }] : []),
    ];

    return (
      <div
        onClick={() => setViewingTool(tool)}
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
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: tc.color }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: tc.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: tc.color, fontSize: 18,
            }}>
              {typeIcons[tool.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tool.name}
              </div>
              <Space size={4}>
                <Tag color={tc.color} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{tool.type}</Tag>
                <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, color: '#5F6B7A', background: '#F2F3F8', border: 'none' }}>{tool.provider}</Tag>
              </Space>
            </div>
          </div>
        </div>
        <Text type="secondary" style={{ fontSize: 13, lineHeight: '20px', height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {tool.description}
        </Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>{tool.source} · {tool.author} · {tool.createTime}</Text>
          <Dropdown
            menu={{ items: dropdownItems }}
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
  };

  const columns: ColumnsType<ToolItem> = [
    { title: '工具名称', dataIndex: 'name', width: 190, render: (text, record) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: typeConfig[record.type]?.color, fontSize: 16 }}>
          {typeIcons[record.type]}
        </span>
        <span style={{ fontWeight: 500 }}>{text}</span>
      </div>
    )},
    { title: '类型', dataIndex: 'type', width: 90, render: (v) => (
      <Tag color={typeConfig[v]?.color}>{v}</Tag>
    )},
    { title: '提供方', dataIndex: 'provider', width: 160, ellipsis: true },
    { title: '来源', dataIndex: 'source', width: 90, render: (v) => {
      const sc = sourceConfig[v];
      return <Tag color={sc?.color} style={{ borderRadius: 4 }}>{v}</Tag>;
    }},
    { title: '描述', dataIndex: 'description', ellipsis: true, width: 260 },
    { title: '操作', key: 'action', width: 120, fixed: 'right' as const, render: (_, record) => (
      <>
        {record.source === '自定义' && (
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info('编辑功能')}>编辑</Button>
        )}
        {record.source !== '默认' && (
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => message.success('已删除')}>删除</Button>
        )}
      </>
    )},
  ];

  return (
    <>
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          title="工具管理"
          hint="管理智能体可调用的工具与函数，扩展智能体的执行能力，支持 API、插件和工作流三种类型"
        />
        <Row gutter={16} style={{ padding: '0 0 12px' }}>
          {statCards.map((item, idx) => {
            const isActive = activeStatIndex === idx;
            const handleClick = () => {
              if (item.key === 'all') {
                setFilters(prev => ({ ...prev, type: undefined, source: undefined }));
                setActiveStat('all');
              } else {
                setFilters(prev => ({ ...prev, type: item.key, source: undefined }));
                setActiveStat(item.key);
              }
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
            onFilterChange={(key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setCardPage(1); if (key === 'source' || key === 'type') setActiveStat(null); }}
            onSearch={() => {}}
            onReset={() => { setFilters({ keyword: '', type: undefined, source: undefined }); setActiveStat(null); setCardPage(1); }}
            onCreate={() => message.info('创建工具功能')}
            createText="创建工具"
            extra={
              <Button icon={<ShoppingOutlined />} onClick={() => navigate('/dev/resource-square?tab=api')}>
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
                scroll={{ x: 1100 }}
                style={{ marginTop: 12 }}
              />
            ) : (
              <>
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14, flex: 1, alignContent: 'start' }}>
                  {filteredData.slice((cardPage - 1) * cardPageSize, cardPage * cardPageSize).map((item) => (
                    <ToolCard key={item.id} tool={item} />
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

      {/* Detail Drawer */}
      <Drawer title={viewingTool?.name} open={!!viewingTool} onClose={() => setViewingTool(null)} width={520} placement="right">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#8c8c8c', fontSize: 16 }}>
          展开 {viewingTool?.name} 工具详情页
        </div>
      </Drawer>
    </>
  );
};

export default ToolsPage;
