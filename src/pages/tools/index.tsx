import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Drawer, Form, Input, Select, message, Typography, Space, Row, Col, Tooltip, Pagination } from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  ApiOutlined,
  NodeIndexOutlined,
  GlobalOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import FilterBar from '@/components/FilterBar';
import { mockTools, ToolItem } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';

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

const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
  '插件': { color: '#722ed1', bg: '#f9f0ff', label: '插件' },
  'API': { color: '#1677ff', bg: '#e6f4ff', label: 'API' },
  '工作流': { color: '#13c2c2', bg: '#e6fffb', label: '工作流' },
};

const typeIcons: Record<string, React.ReactNode> = {
  '插件': <NodeIndexOutlined />,
  'API': <ApiOutlined />,
  '工作流': <GlobalOutlined />,
};

const ToolsPage: React.FC = () => {
  const [data] = useState<ToolItem[]>(mockTools);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', type: undefined, status: undefined });
  const [viewingTool, setViewingTool] = useState<ToolItem | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [cardPage, setCardPage] = useState(1);
  const cardPageSize = 9;

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword) && !item.provider.includes(filters.keyword) && !item.description.includes(filters.keyword)) return false;
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
    { title: '工具总数', value: data.length, color: '#1677ff' },
    { title: '插件工具', value: data.filter(d => d.type === '插件').length, color: '#722ed1' },
    { title: 'API工具', value: data.filter(d => d.type === 'API').length, color: '#1677ff' },
    { title: '工作流', value: data.filter(d => d.type === '工作流').length, color: '#13c2c2' },
  ];

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
    { title: '状态', dataIndex: 'status', width: 80, render: (v) => (
      <Tag color={v === '启用' ? 'green' : 'orange'}>{v}</Tag>
    )},
    { title: '描述', dataIndex: 'description', ellipsis: true, width: 260 },
    { title: '调用次数', dataIndex: 'callCount', width: 100, render: (v) => v.toLocaleString(), sorter: (a, b) => a.callCount - b.callCount },
    { title: '成功率', dataIndex: 'successRate', width: 90, render: (v) => (
      <Text style={{ color: v >= 95 ? '#52c41a' : v >= 90 ? '#faad14' : '#ff4d4f' }}>{v}%</Text>
    ), sorter: (a, b) => a.successRate - b.successRate },
    { title: '操作', key: 'action', width: 120, fixed: 'right' as const, render: (_, record) => (
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
          hint="管理智能体可调用的工具/函数，包括插件工具、API 工具和工作流。工具可在智能体配置中挂载，扩展智能体能力边界。"
        />
        <StatCards items={statItems} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={filterFields}
            filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onSearch={() => {}}
            onReset={() => setFilters({ keyword: '', type: undefined, status: undefined })}
            onCreate={() => message.info('注册工具功能')}
            createText="注册工具"
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
                    const tc = typeConfig[item.type];
                    return (
                      <Col span={8} key={item.id}>
                        <div
                          style={{
                            background: '#fff',
                            borderRadius: 8,
                            border: '1px solid #E5EAF3',
                            borderTop: `3px solid ${tc.color}`,
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
                              width: 38, height: 38, borderRadius: 8, background: tc.bg, color: tc.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0,
                            }}>
                              {typeIcons[item.type]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', lineHeight: '22px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name}
                              </div>
                              <Space size={5} style={{ marginTop: 4 }} wrap>
                                <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, background: tc.bg, color: tc.color, border: 'none' }}>
                                  {item.type}
                                </Tag>
                                <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, color: '#5F6B7A', background: '#F2F3F8', border: 'none' }}>
                                  {item.provider}
                                </Tag>
                                <Tag color={item.status === '启用' ? 'green' : 'orange'} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>
                                  {item.status}
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
                              <div style={{ fontSize: 11, color: '#7A8599', marginBottom: 2 }}>调用次数</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: '#1D2129', lineHeight: 1 }}>
                                {item.callCount.toLocaleString()}
                              </div>
                            </div>
                            <div style={{ width: 1, height: 28, background: '#E5EAF3' }} />
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: 11, color: '#7A8599', marginBottom: 2 }}>成功率</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: item.successRate >= 95 ? '#52c41a' : item.successRate >= 90 ? '#faad14' : '#ff4d4f', lineHeight: 1 }}>
                                {item.successRate}%
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div style={{ marginTop: 'auto', padding: '10px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 12, color: '#7A8599' }}>{item.author} · {item.createTime}</Text>
                            <Space size={2}>
                              <Tooltip title="查看详情"><Button type="text" size="small" icon={<EyeOutlined />} style={{ color: '#7A8599' }} onClick={() => setViewingTool(item)} /></Tooltip>
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

      {/* Detail Drawer */}
      <Drawer title={viewingTool?.name} open={!!viewingTool} onClose={() => setViewingTool(null)} width={520} placement="right">
        {viewingTool && (() => {
          const tc = typeConfig[viewingTool.type];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>工具类型</Text>
                <div style={{ marginTop: 4 }}><Tag color={tc.color} style={{ borderRadius: 4 }}>{viewingTool.type}</Tag></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>提供方</Text>
                <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500 }}>{viewingTool.provider}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>状态</Text>
                <div style={{ marginTop: 4 }}><Tag color={viewingTool.status === '启用' ? 'green' : 'orange'} style={{ borderRadius: 4 }}>{viewingTool.status}</Tag></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>创建者</Text>
                <div style={{ marginTop: 4, fontSize: 14 }}>{viewingTool.author}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>创建时间</Text>
                <div style={{ marginTop: 4, fontSize: 14 }}>{viewingTool.createTime}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>调用次数 / 成功率</Text>
                <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: '#1D2129' }}>
                  {viewingTool.callCount.toLocaleString()} 次 · <span style={{ color: viewingTool.successRate >= 95 ? '#52c41a' : '#faad14' }}>{viewingTool.successRate}%</span>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>描述</Text>
                <div style={{ marginTop: 4, fontSize: 13, color: '#5F6B7A', lineHeight: '22px' }}>{viewingTool.description}</div>
              </div>
              {viewingTool.params && viewingTool.params.length > 0 && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>参数列表</Text>
                  <Table
                    size="small"
                    dataSource={viewingTool.params}
                    rowKey="name"
                    pagination={false}
                    style={{ marginTop: 8 }}
                    columns={[
                      { title: '名称', dataIndex: 'name', width: 140, render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code> },
                      { title: '类型', dataIndex: 'type', width: 80 },
                      { title: '必填', dataIndex: 'required', width: 60, render: (v: boolean) => v ? <Tag color="red" style={{ borderRadius: 4, margin: 0 }}>是</Tag> : <Tag style={{ borderRadius: 4, margin: 0 }}>否</Tag> },
                      { title: '说明', dataIndex: 'description', ellipsis: true },
                    ]}
                  />
                </div>
              )}
            </div>
          );
        })()}
      </Drawer>
    </>
  );
};

export default ToolsPage;
