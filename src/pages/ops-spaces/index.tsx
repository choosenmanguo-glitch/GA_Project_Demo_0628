import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Drawer, Form, Input, Select, Steps, Row, Col, Progress, Typography, Tabs, Statistic, message, Radio } from 'antd';
import { PlusOutlined, SettingOutlined, InfoCircleOutlined, TeamOutlined, HistoryOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import type { FilterField } from '@/components/FilterBar';
import { mockSpaces, mockMembers, mockTemplates, type SpaceItem, type AgentTemplate } from '@/mock/data';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const statusColorMap: Record<string, string> = { '启用': 'green', '停用': 'orange', '归档': 'default' };

const spaceFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索空间名称', width: 220 },
  { type: 'select', key: 'status', placeholder: '状态', width: 100, options: [
    { label: '启用', value: '启用' }, { label: '停用', value: '停用' }, { label: '归档', value: '归档' },
  ]},
];

export default function OpsSpacesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', status: undefined });
  const [selectedSpace, setSelectedSpace] = useState<SpaceItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [detailTab, setDetailTab] = useState('info');
  const [templateFilter, setTemplateFilter] = useState('all');

  const filteredSpaces = useMemo(() => {
    return mockSpaces.filter((s) => {
      if (filters.keyword && !s.name.includes(filters.keyword)) return false;
      if (filters.status && s.status !== filters.status) return false;
      return true;
    });
  }, [filters]);

  const filteredTemplates = useMemo(() =>
    templateFilter === 'all' ? mockTemplates : mockTemplates.filter(t => t.type === templateFilter),
    [templateFilter]
  );

  const tableColumns: ColumnsType<SpaceItem> = useMemo(() => [
    { title: '空间名称', dataIndex: 'name', width: 180, render: (n, r) => (
      <Space>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1677ff, #69b1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{n.charAt(0)}</div>
        <div>
          <a onClick={() => { setSelectedSpace(r); setDetailDrawerOpen(true); }} style={{ fontWeight: 500 }}>{n}</a>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.dept}</Text></div>
        </div>
      </Space>
    )},
    { title: '类型', dataIndex: 'type', width: 90, render: (t: string) => <Tag>{t}</Tag> },
    { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={statusColorMap[s]}>{s}</Tag> },
    { title: '成员', dataIndex: 'memberCount', width: 70, sorter: (a, b) => a.memberCount - b.memberCount },
    { title: '智能体', dataIndex: 'agentCount', width: 70 },
    { title: '知识库', dataIndex: 'knowledgeCount', width: 70 },
    { title: '提示词', dataIndex: 'promptCount', width: 70 },
    { title: '工具', dataIndex: 'toolCount', width: 70 },
    { title: '创建人', dataIndex: 'creator', width: 100 },
    { title: '更新时间', dataIndex: 'updateTime', width: 110 },
    { title: '操作', width: 160, render: (_, r) => (
      <Space size={0}>
        <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => { setSelectedSpace(r); setDetailDrawerOpen(true); }}>详情</Button>
        <Button type="link" size="small" danger>归档</Button>
      </Space>
    )},
  ], []);

  const templateColumns: ColumnsType<AgentTemplate> = [
    { title: '模板名称', dataIndex: 'name', width: 180, render: (n) => <span style={{ fontWeight: 500 }}>{n}</span> },
    { title: '场景', dataIndex: 'scene', width: 90, render: (s) => <Tag>{s}</Tag> },
    { title: '类型', dataIndex: 'type', width: 90, render: (t) => <Tag color={t === '系统预置' ? 'blue' : 'purple'}>{t}</Tag> },
    { title: '标签', dataIndex: 'tags', width: 200, render: (tags: string[]) => <Space size={4}>{tags.map(t => <Tag key={t} style={{ borderRadius: 4 }}>{t}</Tag>)}</Space> },
    { title: '使用次数', dataIndex: 'useCount', width: 100, sorter: (a, b) => a.useCount - b.useCount },
    { title: '参考模型', dataIndex: 'modelName', width: 140 },
    { title: '操作', width: 120, render: () => (
      <Space size={0}><Button type="link" size="small">预览</Button><Button type="link" size="small" style={{ color: '#1677ff' }}>使用模板</Button></Space>
    )},
  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="空间管理" hint="管理所有运维空间，包括创建、配置成员和资源监控" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
          filters={spaceFilterFields}
          filterValues={filters}
          onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onSearch={() => {}}
          onReset={() => setFilters({ keyword: '', status: undefined })}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode as 'table' | 'card')}
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
          <Tabs
            defaultActiveKey="spaces"
            style={{ marginTop: 12 }}
            items={[
              {
                key: 'spaces',
                label: '空间列表',
                children: (
                  <>
                    <div style={{ textAlign: 'right', marginBottom: 12 }}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => { setCreateStep(0); setCreateDrawerOpen(true); }}>创建空间</Button>
                    </div>
                    <Table rowKey="id" columns={tableColumns} dataSource={filteredSpaces} size="middle" pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }} />
                  </>
                ),
              },
              {
                key: 'templates',
                label: '模板管理',
                children: (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Radio.Group value={templateFilter} onChange={(e) => setTemplateFilter(e.target.value)} size="small" optionType="button" buttonStyle="solid">
                        <Radio.Button value="all">全部</Radio.Button>
                        <Radio.Button value="系统预置">系统预置</Radio.Button>
                        <Radio.Button value="自定义">自定义</Radio.Button>
                      </Radio.Group>
                    </div>
                    <Table rowKey="id" columns={templateColumns} dataSource={filteredTemplates} size="middle" pagination={false} />
                  </>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* 创建空间抽屉 */}
      <Drawer title="创建空间" open={createDrawerOpen} onClose={() => setCreateDrawerOpen(false)} width={560} destroyOnClose
        extra={<Space><Button onClick={() => setCreateDrawerOpen(false)}>取消</Button>{createStep === 1 ? <Button type="primary" onClick={() => { message.success('空间创建成功'); setCreateDrawerOpen(false); }}>完成创建</Button> : <Button type="primary" onClick={() => setCreateStep(1)}>下一步</Button>}</Space>}>
        <Steps current={createStep} size="small" style={{ marginBottom: 24 }} items={[{ title: '基本信息' }, { title: '成员与权限' }]} />
        {createStep === 0 && (
          <Form layout="vertical">
            <Form.Item label="空间名称" required><Input placeholder="请输入空间名称" /></Form.Item>
            <Form.Item label="所属部门" required><Input placeholder="如：指挥中心、刑警大队" /></Form.Item>
            <Form.Item label="空间类型" required><Select placeholder="选择类型" options={[{ label: '工作空间', value: '工作空间' }, { label: '个人空间', value: '个人空间' }]} /></Form.Item>
            <Form.Item label="空间描述"><TextArea rows={3} placeholder="描述该空间的用途和适用范围" /></Form.Item>
            <Form.Item label="模型调用配额（次/月）"><Input placeholder="100000" suffix="次/月" /></Form.Item>
            <Form.Item label="存储配额（MB）"><Input placeholder="10000" suffix="MB" /></Form.Item>
          </Form>
        )}
        {createStep === 1 && (
          <Form layout="vertical">
            <Form.Item label="添加空间成员"><Select mode="tags" placeholder="搜索并添加成员" options={mockMembers.map(m => ({ label: `${m.name} (${m.dept})`, value: m.id }))} /></Form.Item>
            <Form.Item label="创建人角色"><Input value="管理员" disabled /></Form.Item>
            <div style={{ padding: '16px', background: '#fafafa', borderRadius: 8 }}><Text type="secondary">创建后可随时在空间详情中添加或移除成员</Text></div>
          </Form>
        )}
      </Drawer>

      {/* 空间详情面板 */}
      <Drawer title={selectedSpace ? `空间详情 - ${selectedSpace.name}` : '空间详情'} open={detailDrawerOpen} onClose={() => setDetailDrawerOpen(false)} width="50%" destroyOnClose styles={{ body: { padding: 0 } }}>
        {selectedSpace && (
          <div>
            <div style={{ padding: '20px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              <Row align="middle" gutter={16}>
                <Col><div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #1677ff, #69b1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>{selectedSpace.name.charAt(0)}</div></Col>
                <Col flex={1}><div style={{ fontWeight: 600, fontSize: 16 }}>{selectedSpace.name}</div><Space size={6}><Tag color="blue">{selectedSpace.type}</Tag><Text type="secondary" style={{ fontSize: 12 }}>{selectedSpace.dept}</Text><Tag color={statusColorMap[selectedSpace.status]}>{selectedSpace.status}</Tag></Space></Col>
              </Row>
            </div>
            <Tabs activeKey={detailTab} onChange={setDetailTab} style={{ padding: '16px 24px 0' }} items={[
              {
                key: 'info', label: <Space><InfoCircleOutlined />基本信息</Space>,
                children: (
                  <div>
                    {[{ label: '创建人', value: selectedSpace.creator }, { label: '创建时间', value: selectedSpace.createTime }, { label: '更新时间', value: selectedSpace.updateTime }].map(item => (
                      <div key={item.label} style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}><Text type="secondary" style={{ width: 80 }}>{item.label}</Text><span>{item.value}</span></div>
                    ))}
                    <Title level={5} style={{ margin: '20px 0 12px' }}>资源使用</Title>
                    <Row gutter={16}>
                      <Col span={12}><div style={{ marginBottom: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13 }}>模型配额</span><Text type="secondary" style={{ fontSize: 12 }}>{selectedSpace.modelQuotaUsed.toLocaleString()} / {selectedSpace.modelQuotaLimit.toLocaleString()}</Text></div><Progress percent={Math.round(selectedSpace.modelQuotaUsed / selectedSpace.modelQuotaLimit * 100)} size="small" strokeColor={{ from: '#1677ff', to: '#69b1ff' }} /></div></Col>
                      <Col span={12}><div style={{ marginBottom: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13 }}>存储</span><Text type="secondary" style={{ fontSize: 12 }}>{selectedSpace.storageUsed}MB / {selectedSpace.storageLimit}MB</Text></div><Progress percent={Math.round(selectedSpace.storageUsed / selectedSpace.storageLimit * 100)} size="small" strokeColor={{ from: '#722ed1', to: '#d3adf7' }} /></div></Col>
                      <Col span={12}><div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13 }}>智能体</span><Text type="secondary" style={{ fontSize: 12 }}>{selectedSpace.agentQuotaUsed} / {selectedSpace.agentQuotaLimit}</Text></div><Progress percent={Math.round(selectedSpace.agentQuotaUsed / selectedSpace.agentQuotaLimit * 100)} size="small" strokeColor={{ from: '#52c41a', to: '#95de64' }} /></div></Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: 'members', label: <Space><TeamOutlined />成员管理</Space>,
                children: (
                  <div>
                    <div style={{ marginBottom: 12, textAlign: 'right' }}><Button type="primary" size="small" icon={<PlusOutlined />}>添加成员</Button></div>
                    {mockMembers.slice(0, 5).map((m) => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, marginRight: 10 }}>{m.name.charAt(0)}</div>
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>{m.name}</div><Text type="secondary" style={{ fontSize: 12 }}>{m.dept}</Text></div>
                        <Tag color={m.role === '创建人' ? 'blue' : m.role === '管理员' ? 'purple' : 'default'}>{m.role}</Tag>
                        <Button type="link" size="small">编辑</Button>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: 'logs', label: <Space><HistoryOutlined />操作日志</Space>,
                children: (
                  <div>
                    {[{ time: '2026-06-25 14:30', user: '演示用户', action: '修改空间设置', detail: '更新了空间图标和描述' }, { time: '2026-06-24 16:20', user: '王大队', action: '创建智能体', detail: '创建了涉诈APP分析助手' }, { time: '2026-06-23 11:45', user: '周科长', action: '添加成员', detail: '添加成员：孙法官' }, { time: '2026-06-22 09:30', user: '管理员', action: '接入模型', detail: '接入了 DeepSeek-Chat 模型' }].map((log, i) => (
                      <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontWeight: 500 }}>{log.user} <Tag style={{ marginLeft: 6 }}>{log.action}</Tag></span><Text type="secondary" style={{ fontSize: 12 }}>{log.time}</Text></div>
                        <Text type="secondary" style={{ fontSize: 13 }}>{log.detail}</Text>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: 'advanced', label: <Space><LockOutlined />高级操作</Space>,
                children: (
                  <div>
                    <Title level={5} style={{ marginTop: 0 }}>危险操作</Title>
                    <Paragraph type="secondary">以下操作不可逆，请谨慎操作</Paragraph>
                    {[{ label: '停用空间', desc: '停用后空间内所有智能体将不可用', btnText: '停用', danger: true }, { label: '重置配额', desc: '重置空间内所有配额统计数据', btnText: '重置', danger: false }, { label: '归档空间', desc: '将空间标记为归档状态，释放资源', btnText: '归档', danger: true }].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <div><div style={{ fontWeight: 500 }}>{item.label}</div><Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text></div>
                        <Button danger={item.danger} size="small">{item.btnText}</Button>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]} />
          </div>
        )}
      </Drawer>
    </div>
  );
}
