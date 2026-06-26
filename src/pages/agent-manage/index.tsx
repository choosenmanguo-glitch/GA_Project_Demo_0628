import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Tooltip, Drawer, Form, Input, Select, message, Row, Col, Statistic, Typography } from 'antd';
import { PlusOutlined, ThunderboltOutlined, FileTextOutlined, RocketOutlined, SettingOutlined, FileDoneOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CopyOutlined, SendOutlined, CheckCircleOutlined, ExclamationCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import StatCards from '@/components/StatCards';
import type { FilterField } from '@/components/FilterBar';
import { mockAgents, type AgentItem, type AgentType } from '@/mock/data';

const { TextArea } = Input;
const { Text, Title } = Typography;

const typeColorMap: Record<AgentType, string> = {
  '标准智能体': 'blue',
  '流程智能体': 'purple',
  '自主智能体': 'geekblue',
};

const statusColorMap: Record<string, string> = {
  '草稿': 'default',
  '已发布': 'green',
  '已下架': 'orange',
};

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索智能体名称或描述', width: 240 },
  { type: 'select', key: 'type', placeholder: '智能体类型', width: 140, options: [
    { label: '标准智能体', value: '标准智能体' },
    { label: '流程智能体', value: '流程智能体' },
    { label: '自主智能体', value: '自主智能体' },
  ]},
  { type: 'select', key: 'status', placeholder: '状态', width: 100, options: [
    { label: '已发布', value: '已发布' },
    { label: '草稿', value: '草稿' },
    { label: '已下架', value: '已下架' },
  ]},
];

export default function AgentManagePage() {
  const [data, setData] = useState<AgentItem[]>(mockAgents);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', type: undefined, status: undefined });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentItem | null>(null);
  const [activePane, setActivePane] = useState<'create' | 'config'>('create');
  const [viewingAgent, setViewingAgent] = useState<AgentItem | null>(null);
  const [configTab, setConfigTab] = useState('info');
  const [createMethod, setCreateMethod] = useState<'blank' | 'template' | 'import' | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword) && !item.description.includes(filters.keyword)) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);

  const statItems = [
    { title: '智能体总数', value: data.length, color: '#1677ff' },
    { title: '已发布', value: data.filter(d => d.status === '已发布').length, color: '#52c41a' },
    { title: '草稿', value: data.filter(d => d.status === '草稿').length, color: '#faad14' },
    { title: '已下架', value: data.filter(d => d.status === '已下架').length, color: '#bfbfbf' },
  ];

  const tableColumns: ColumnsType<AgentItem> = useMemo(() => [
    { title: '智能体名称', dataIndex: 'name', width: 200, render: (name, r) => (
      <Space>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, #1677ff, #69b1ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{name.charAt(0)}</div>
        <div>
          <div style={{ fontWeight: 500, marginBottom: 2 }}>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.description.slice(0, 24)}{r.description.length > 24 ? '…' : ''}</Text>
        </div>
      </Space>
    )},
    { title: '类型', dataIndex: 'type', width: 120, render: (t: AgentType) => <Tag color={typeColorMap[t]}>{t}</Tag> },
    { title: '所属空间', dataIndex: 'spaceName', width: 120, render: (n) => <Text type="secondary">{n}</Text> },
    { title: '绑定模型', dataIndex: 'modelName', width: 140 },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={statusColorMap[s]}>{s}</Tag> },
    { title: '调用次数', dataIndex: 'callCount', width: 100, render: (n: number) => n.toLocaleString(), sorter: (a, b) => a.callCount - b.callCount },
    { title: '成功率', dataIndex: 'successRate', width: 90, render: (n: number) => <span style={{ color: n >= 95 ? '#52c41a' : n >= 85 ? '#faad14' : '#ff4d4f' }}>{n}%</span>, sorter: (a, b) => a.successRate - b.successRate },
    { title: '创建人', dataIndex: 'creator', width: 100 },
    { title: '更新时间', dataIndex: 'updateTime', width: 110 },
    { title: '操作', width: 200, render: (_, r) => (
      <Space size={0}>
        <Tooltip title="查看"><Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setViewingAgent(r)} /></Tooltip>
        <Tooltip title="编辑"><Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditingAgent(r); setActivePane('config'); setDrawerOpen(true); }} /></Tooltip>
        <Tooltip title="复制"><Button type="link" size="small" icon={<CopyOutlined />} /></Tooltip>
        <Tooltip title="发布"><Button type="link" size="small" icon={<RocketOutlined />} /></Tooltip>
        <Tooltip title="删除"><Button type="link" size="small" danger icon={<DeleteOutlined />} /></Tooltip>
      </Space>
    )},
  ], []);

  const creationMethods = [
    { key: 'blank', icon: <FileDoneOutlined style={{ fontSize: 32, color: '#1677ff' }} />, title: '空白智能体', desc: '从零开始配置提示词、模型与工具' },
    { key: 'template', icon: <FileTextOutlined style={{ fontSize: 32, color: '#722ed1' }} />, title: '基于模板', desc: '选择预置模板快速创建' },
    { key: 'import', icon: <SendOutlined style={{ fontSize: 32, color: '#13c2c2' }} />, title: '导入配置', desc: '从JSON文件中导入智能体配置' },
  ];

  const handleOpenCreate = () => {
    setEditingAgent(null);
    setActivePane('create');
    setCreateMethod(null);
    setDrawerOpen(true);
  };

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="智能体管理" hint="管理已创建的智能体，查看运行状态、调用数据并进行版本管理" />
        <StatCards items={statItems} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
          filters={filterFields}
          filterValues={filters}
          onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onSearch={() => {}}
          onReset={() => setFilters({ keyword: '', type: undefined, status: undefined })}
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>创建智能体</Button>}
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
          <Table rowKey="id" columns={tableColumns} dataSource={filteredData} size="middle" pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} style={{ marginTop: 12 }} locale={{ emptyText: '暂无智能体' }} />
        </div>
      </div>

      {/* 创建/配置抽屉 */}
      <Drawer
        title={editingAgent ? `编辑智能体 - ${editingAgent.name}` : '创建智能体'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={activePane === 'config' ? '80%' : 560}
        destroyOnClose
        extra={activePane === 'create' ? (
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" disabled={!createMethod} onClick={() => { if (createMethod === 'blank') { setActivePane('config'); setConfigTab('info'); } else { message.info('模板/导入功能开发中'); } }}>下一步：配置</Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button onClick={() => { message.success('已保存草稿'); setDrawerOpen(false); }}>保存草稿</Button>
            <Button type="primary" icon={<RocketOutlined />}>发布智能体</Button>
          </Space>
        )}
        styles={{ body: { padding: 0 } }}
      >
        {activePane === 'create' ? (
          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}><Text type="secondary">选择创建方式开始构建你的智能体</Text></div>
            {creationMethods.map((m) => (
              <div key={m.key} onClick={() => setCreateMethod(m.key as typeof createMethod)}
                style={{ padding: '20px 24px', marginBottom: 12, borderRadius: 12, cursor: 'pointer', border: `2px solid ${createMethod === m.key ? '#1677ff' : '#f0f0f0'}`, background: createMethod === m.key ? '#f0f5ff' : '#fff', transition: 'all .2s' }}>
                <Row align="middle" gutter={16}>
                  <Col>{m.icon}</Col>
                  <Col flex={1}><div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{m.title}</div><Text type="secondary" style={{ fontSize: 13 }}>{m.desc}</Text></Col>
                  <Col>{createMethod === m.key && <CheckCircleOutlined style={{ color: '#1677ff', fontSize: 20 }} />}</Col>
                </Row>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ width: 180, borderRight: '1px solid #f0f0f0', padding: '16px 0', background: '#fafafa' }}>
              {[
                { key: 'info', icon: <SettingOutlined />, label: '信息卡片' },
                { key: 'config', icon: <ThunderboltOutlined />, label: '配置' },
                { key: 'publish', icon: <RocketOutlined />, label: '发布' },
                { key: 'logs', icon: <FileTextOutlined />, label: '日志' },
                { key: 'stats', icon: <BarChartOutlined />, label: '统计' },
              ].map((tab) => (
                <div key={tab.key} onClick={() => setConfigTab(tab.key)}
                  style={{ padding: '10px 20px', cursor: 'pointer', fontSize: 14, color: configTab === tab.key ? '#1677ff' : '#595959', background: configTab === tab.key ? '#e6f4ff' : 'transparent', borderRight: configTab === tab.key ? '3px solid #1677ff' : '3px solid transparent', fontWeight: configTab === tab.key ? 600 : 400, transition: 'all .2s' }}>
                  <Space size={8}>{tab.icon}{tab.label}</Space>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
              {configTab === 'info' && (
                <div>
                  <Title level={5} style={{ margin: '0 0 20px' }}>基础信息</Title>
                  <Form layout="vertical" form={form}>
                    <Row gutter={16}>
                      <Col span={12}><Form.Item label="智能体名称" required><Input placeholder="请输入智能体名称" /></Form.Item></Col>
                      <Col span={12}><Form.Item label="智能体类型" required><Select placeholder="选择类型" options={['标准智能体', '流程智能体', '自主智能体'].map(v => ({ label: v, value: v }))} /></Form.Item></Col>
                      <Col span={12}><Form.Item label="所属空间" required><Select placeholder="选择空间" options={mockAgents.slice(0, 4).map(a => ({ label: a.spaceName, value: a.spaceName }))} /></Form.Item></Col>
                      <Col span={12}><Form.Item label="绑定模型" required><Input placeholder="选择模型" /></Form.Item></Col>
                      <Col span={24}><Form.Item label="智能体描述"><TextArea rows={3} placeholder="描述智能体的功能和用途" /></Form.Item></Col>
                    </Row>
                  </Form>
                </div>
              )}
              {configTab === 'config' && (
                <div>
                  <Title level={5} style={{ margin: 0 }}>提示词配置</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>为智能体设计系统提示词与行为准则</Text>
                  <TextArea rows={8} placeholder={'你是一位经验丰富的公安数据分析专家。你的职责是\n\n1. 理解用户的警务数据需求\n2. 调用合适的工具获取数据\n3. 以结构化格式呈现分析结果\n4. 确保分析结论符合警务规范'} style={{ marginBottom: 16, fontFamily: 'monospace' }} />
                  <div style={{ padding: '16px', background: '#fafafa', borderRadius: 8, marginTop: 8 }}>
                    <Text type="secondary">提示词变量：{'{user_query}  {result_data}  {context_info}'}</Text>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{['结构清晰', '警务规范', '数据准确'].map(t => <Tag key={t} color="processing">{t}</Tag>)}</div>
                  </div>
                </div>
              )}
              {configTab === 'publish' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                  <RocketOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                  <Title level={4}>准备发布智能体</Title>
                  <Text type="secondary" style={{ marginBottom: 24 }}>发布后智能体将对空间内所有成员可用</Text>
                  <Space direction="vertical" style={{ width: '100%', maxWidth: 400 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><CheckCircleOutlined style={{ color: '#52c41a' }} /> <span>提示词配置完成</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><ExclamationCircleOutlined style={{ color: '#faad14' }} /> <span>未绑定知识库</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><CheckCircleOutlined style={{ color: '#52c41a' }} /> <span>模型已选择</span></div>
                  </Space>
                </div>
              )}
              {configTab === 'logs' && <div style={{ textAlign: 'center', padding: '40px 0' }}><FileTextOutlined style={{ fontSize: 40, color: '#d9d9d9', marginBottom: 12 }} /><Text type="secondary">操作日志将在智能体发布后记录</Text></div>}
              {configTab === 'stats' && <div style={{ textAlign: 'center', padding: '40px 0' }}><BarChartOutlined style={{ fontSize: 40, color: '#d9d9d9', marginBottom: 12 }} /><Text type="secondary">统计数据将在智能体发布后生成</Text></div>}
            </div>
          </div>
        )}
      </Drawer>

      {/* 查看详情抽屉 */}
      <Drawer title="智能体详情" open={!!viewingAgent} onClose={() => setViewingAgent(null)} width={560} destroyOnClose>
        {viewingAgent && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #1677ff, #69b1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24, margin: '0 auto 12px' }}>{viewingAgent.name.charAt(0)}</div>
              <Title level={4} style={{ margin: 0 }}>{viewingAgent.name}</Title>
              <Tag color={typeColorMap[viewingAgent.type]} style={{ marginTop: 8 }}>{viewingAgent.type}</Tag>
              <Tag color={statusColorMap[viewingAgent.status]}>{viewingAgent.status}</Tag>
            </div>
            <Text style={{ display: 'block', marginBottom: 24, textAlign: 'center' }}>{viewingAgent.description}</Text>
            <Row gutter={[16, 16]}>
              {[
                { label: '所属空间', value: viewingAgent.spaceName }, { label: '绑定模型', value: viewingAgent.modelName },
                { label: '创建人', value: viewingAgent.creator }, { label: '创建时间', value: viewingAgent.createTime },
                { label: '发布时间', value: viewingAgent.publishTime || '-' }, { label: '更新时间', value: viewingAgent.updateTime },
              ].map((item) => (
                <Col span={12} key={item.label}><div style={{ marginBottom: 8 }}><Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text><div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div></div></Col>
              ))}
            </Row>
            <div style={{ marginTop: 20, padding: '16px', background: '#fafafa', borderRadius: 8 }}>
              <Row gutter={16}>
                <Col span={8}><Statistic title="调用次数" value={viewingAgent.callCount} formatter={v => (v as number).toLocaleString()} /></Col>
                <Col span={8}><Statistic title="成功率" value={viewingAgent.successRate} suffix="%" valueStyle={{ color: viewingAgent.successRate >= 95 ? '#52c41a' : '#faad14' }} /></Col>
                <Col span={8}><Statistic title="活跃用户" value={viewingAgent.activeUsers} /></Col>
              </Row>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
