import React, { useState, useMemo } from 'react';
import {
  Table, Button, Space, Tag, Drawer, Form, Input, Select, Steps, Row, Col, Progress, Typography, Tabs, message, Card, Popconfirm, DatePicker,
} from 'antd';
import {
  PlusOutlined, SettingOutlined, InfoCircleOutlined, TeamOutlined,
  HistoryOutlined, LockOutlined, SearchOutlined, CrownOutlined,
  SafetyOutlined, UserOutlined, EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import StatCards from '@/components/StatCards';
import type { FilterField } from '@/components/FilterBar';
import { mockSpaces, mockMembers, type SpaceItem } from '@/mock/data';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const statusColorMap: Record<string, string> = { '启用': 'green', '停用': 'orange', '归档': 'default' };
const roleColorMap: Record<string, string> = { '创建人': 'gold', '管理员': 'blue', '普通用户': 'default' };

const spaceFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索空间名称', width: 220 },
  { type: 'select', key: 'status', placeholder: '状态', width: 100, options: [
    { label: '启用', value: '启用' }, { label: '停用', value: '停用' }, { label: '归档', value: '归档' },
  ]},
  { type: 'select', key: 'spaceType', placeholder: '空间类型', width: 120, options: [
    { label: '个人空间', value: '个人空间' }, { label: '工作空间', value: '工作空间' }, { label: '案情专项', value: '案情专项' },
  ]},
];

export default function OpsSpacesPage() {
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', status: undefined, spaceType: undefined });
  const [selectedSpace, setSelectedSpace] = useState<SpaceItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [detailTab, setDetailTab] = useState('info');

  // ── 统计卡片数据 ──
  const statCardItems = useMemo(() => {
    const total = mockSpaces.length;
    const personalCount = mockSpaces.filter(s => s.type === '个人空间').length;
    const workCount = mockSpaces.filter(s => s.type === '工作空间').length;
    const caseSpecialCount = mockSpaces.filter(s => s.type === '案情专项').length;
    return [
      { title: '总空间数', value: total, color: '#1677ff' },
      { title: '个人空间', value: personalCount, color: '#52c41a' },
      { title: '工作空间', value: workCount, color: '#722ed1' },
      { title: '案情专项空间', value: caseSpecialCount, color: '#fa8c16' },
    ];
  }, []);

  // ── 点击统计卡片设置筛选 ──
  const [activeStatIndex, setActiveStatIndex] = useState<number | undefined>(undefined);

  const filteredSpaces = useMemo(() => {
    return mockSpaces.filter((s) => {
      if (filters.keyword && !s.name.includes(filters.keyword)) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (filters.spaceType && s.type !== filters.spaceType) return false;
      return true;
    });
  }, [filters]);

  // ── 空间表格列 ──
  const tableColumns: ColumnsType<SpaceItem> = useMemo(() => [
    {
      title: '空间名称', dataIndex: 'name', width: 200,
      render: (n, r) => (
        <Space>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {n.charAt(0)}
          </div>
          <div>
            <a onClick={() => { setSelectedSpace(r); setDetailDrawerOpen(true); }} style={{ fontWeight: 500 }}>{n}</a>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{r.dept}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: '所属警种/部门', dataIndex: 'dept', width: 110,
      render: d => <Text type="secondary">{d}</Text>,
    },
    {
      title: '空间类型', dataIndex: 'type', width: 100,
      render: (t: string) => (
        <Tag color={t === '个人空间' ? 'blue' : 'green'} style={{ borderRadius: 4 }}>{t}</Tag>
      ),
    },
    {
      title: '成员数', dataIndex: 'memberCount', width: 80,
      sorter: (a, b) => a.memberCount - b.memberCount,
    },
    {
      title: '智能体数', dataIndex: 'agentCount', width: 90,
      render: (v: number, r: SpaceItem) => (
        <span>{r.agentQuotaUsed} <Text type="secondary" style={{ fontSize: 11 }}>/ {r.agentQuotaLimit}</Text></span>
      ),
      sorter: (a, b) => a.agentCount - b.agentCount,
    },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (s: string) => <Tag color={statusColorMap[s]}>{s}</Tag>,
    },
    {
      title: '创建时间', dataIndex: 'createTime', width: 110,
      sorter: (a, b) => a.createTime.localeCompare(b.createTime),
    },
    {
      title: '操作', width: 220,
      render: (_, r) => (
        <Space size={0} wrap>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelectedSpace(r); setDetailDrawerOpen(true); }}>编辑</Button>
          <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => { setSelectedSpace(r); setDetailTab('members'); setDetailDrawerOpen(true); }}>成员</Button>
          <Button type="link" size="small" icon={<LockOutlined />} onClick={() => { setSelectedSpace(r); setDetailTab('advanced'); setDetailDrawerOpen(true); }}>更多</Button>
        </Space>
      ),
    },
  ], []);

  // ── 创建步骤 ──
  const createSteps = [
    { title: '基本信息' },
    { title: '预置资源' },
    { title: '确认创建' },
  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="空间管理" hint="管理平台全部工作空间，包括创建、编辑、状态管理和配额配置" />

      {/* ── 统计概览卡片组 ── */}
      <StatCards
        items={statCardItems}
        activeIndex={activeStatIndex}
        colSpan={6}
      />

      {/* ── 空间列表主操作区 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <FilterBar
          filters={spaceFilterFields}
          filterValues={filters}
          onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onSearch={() => {}}
          onReset={() => { setFilters({ keyword: '', status: undefined }); setActiveStatIndex(undefined); }}
          onCreate={() => { setCreateStep(0); setCreateDrawerOpen(true); }}
          createText="创建空间"
        />

        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
          <Table
            rowKey="id"
            columns={tableColumns}
            dataSource={filteredSpaces}
            size="middle"
            style={{ marginTop: 12 }}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
            }}
            onRow={(record) => ({
              onClick: () => setSelectedSpace(record),
              style: {
                cursor: 'pointer',
                background: selectedSpace?.id === record.id ? '#f0f5ff' : undefined,
              },
            })}
          />
        </div>
      </div>

      {/* ── 创建空间抽屉 ── */}
      <Drawer
        title="创建空间"
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        width={640}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => setCreateDrawerOpen(false)}>取消</Button>
            {createStep < 2 ? (
              <Button type="primary" onClick={() => setCreateStep(prev => prev + 1)}>下一步</Button>
            ) : (
              <Button type="primary" onClick={() => {
                message.success('空间创建成功');
                setCreateDrawerOpen(false);
              }}>确认创建</Button>
            )}
          </Space>
        }
      >
        <Steps current={createStep} size="small" style={{ marginBottom: 24 }} items={createSteps} />

        {/* 第一步：基本信息 */}
        {createStep === 0 && (
          <Form layout="vertical">
            <Form.Item label="空间名称" required rules={[{ required: true }]}>
              <Input placeholder="请输入空间名称" style={{ borderRadius: 6 }} />
            </Form.Item>
            <Form.Item label="空间描述">
              <TextArea rows={3} placeholder="描述该空间的用途和适用范围" style={{ borderRadius: 6 }} />
            </Form.Item>
            <Form.Item label="空间图标">
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 28, fontWeight: 700,
                border: '2px dashed #d9d9d9', cursor: 'pointer',
              }}>
                +
              </div>
            </Form.Item>
            <Form.Item label="所属警种/部门" required>
              <Select
                placeholder="从组织架构中选择"
                style={{ borderRadius: 6 }}
                options={[
                  '指挥中心', '反诈中心', '刑警大队', '交警支队', '治安支队',
                  '法制大队', '派出所', '科信大队', '巡特警支队',
                ].map(d => ({ label: d, value: d }))}
              />
            </Form.Item>
            <Form.Item label="空间类型" required>
              <Select
                defaultValue="工作空间"
                style={{ borderRadius: 6 }}
                options={[
                  { label: '工作空间', value: '工作空间' },
                  { label: '个人空间', value: '个人空间' },
                ]}
              />
              <div style={{ marginTop: 6 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  工作空间支持多人协作；个人空间仅创建人可见，不支持添加其他成员。
                </Text>
              </div>
            </Form.Item>
          </Form>
        )}

        {/* 第二步：预置资源 */}
        {createStep === 1 && (
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>预置模型</Title>
            <Row gutter={[12, 12]}>
              {[
                { name: 'DeepSeek-Chat', desc: '通用对话模型，支持长上下文' },
                { name: 'DeepSeek-Reasoner', desc: '深度推理模型' },
                { name: 'Qwen-72B-Chat', desc: '本地化部署大模型' },
                { name: 'GPT-4o', desc: '多模态旗舰模型' },
              ].map(m => (
                <Col span={12} key={m.name}>
                  <div style={{
                    padding: '12px 16px', borderRadius: 8, border: '1px solid #f0f0f0',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1677ff'; e.currentTarget.style.background = '#f0f5ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#fff'; }}
                  >
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{m.desc}</Text>
                  </div>
                </Col>
              ))}
            </Row>

            <Title level={5} style={{ margin: '24px 0 16px' }}>预置知识库</Title>
            <Row gutter={[12, 12]}>
              {[
                { name: '公安法规库', desc: '收录现行公安法律法规与规章' },
                { name: '警情案例库', desc: '典型警情案例与处置方案' },
                { name: '标准文书库', desc: '公安标准化文书模板' },
              ].map(kb => (
                <Col span={12} key={kb.name}>
                  <div style={{
                    padding: '12px 16px', borderRadius: 8, border: '1px solid #f0f0f0',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#722ed1'; e.currentTarget.style.background = '#f9f0ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#fff'; }}
                  >
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{kb.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{kb.desc}</Text>
                  </div>
                </Col>
              ))}
            </Row>

            <Title level={5} style={{ margin: '24px 0 16px' }}>预置提示词模板</Title>
            <Row gutter={[12, 12]}>
              {[
                { name: '交警提示词包', desc: '交通事故认定、违章分析等' },
                { name: '刑侦提示词包', desc: '案情摘要、证据分析等' },
                { name: '治安提示词包', desc: '协查通报、接警分析等' },
                { name: '出入境提示词包', desc: '证件审核、信息核查等' },
              ].map(p => (
                <Col span={12} key={p.name}>
                  <div style={{
                    padding: '12px 16px', borderRadius: 8, border: '1px solid #f0f0f0',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#52c41a'; e.currentTarget.style.background = '#f6ffed'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#fff'; }}
                  >
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{p.desc}</Text>
                  </div>
                </Col>
              ))}
            </Row>

            <Title level={5} style={{ margin: '24px 0 16px' }}>预置工具集</Title>
            <Row gutter={[12, 12]}>
              {[
                { name: '文书智能解析', desc: '自动解析法律文书和报案材料' },
                { name: '人口信息查询', desc: '全国人口基础信息库检索' },
                { name: '车辆轨迹查询', desc: '交警缉查布控记录查询' },
                { name: '图像识别', desc: '监控图像目标检测与识别' },
              ].map(t => (
                <Col span={12} key={t.name}>
                  <div style={{
                    padding: '12px 16px', borderRadius: 8, border: '1px solid #f0f0f0',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#fa8c16'; e.currentTarget.style.background = '#fff7e6'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#fff'; }}
                  >
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{t.desc}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* 第三步：确认创建 */}
        {createStep === 2 && (
          <div>
            <div style={{
              padding: '20px', borderRadius: 10, background: '#f5f8ff',
              border: '1px solid #d6e4ff', marginBottom: 16,
            }}>
              <Title level={5} style={{ margin: 0 }}>基本信息</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { label: '空间名称', value: '（请在第一步填写）' },
                  { label: '空间类型', value: '工作空间' },
                  { label: '所属部门', value: '（请在第一步选择）' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', padding: '6px 0' }}>
                    <Text type="secondary" style={{ width: 100 }}>{item.label}</Text>
                    <span style={{ fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              padding: '20px', borderRadius: 10, background: '#fafafa',
              border: '1px solid #f0f0f0',
            }}>
              <Title level={5} style={{ margin: 0 }}>预置资源清单</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { label: '模型', value: '请在第二步勾选' },
                  { label: '知识库', value: '请在第二步勾选' },
                  { label: '提示词模板', value: '请在第二步勾选' },
                  { label: '工具集', value: '请在第二步勾选' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', padding: '6px 0' }}>
                    <Text type="secondary" style={{ width: 100 }}>{item.label}</Text>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ── 空间详情抽屉 ── */}
      <Drawer
        title={selectedSpace ? `空间详情 - ${selectedSpace.name}` : '空间详情'}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        width={640}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        {selectedSpace && (
          <div>
            {/* 头部信息 */}
            <div style={{ padding: '20px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 20,
                  }}>
                    {selectedSpace.name.charAt(0)}
                  </div>
                </Col>
                <Col flex={1}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{selectedSpace.name}</div>
                  <Space size={6}>
                    <Tag color={selectedSpace.type === '个人空间' ? 'blue' : 'green'}>{selectedSpace.type}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{selectedSpace.dept}</Text>
                    <Tag color={statusColorMap[selectedSpace.status]}>{selectedSpace.status}</Tag>
                  </Space>
                </Col>
              </Row>
            </div>

            <Tabs activeKey={detailTab} onChange={setDetailTab} style={{ padding: '16px 24px 0' }} items={[
              // Tab 1: 基本信息
              {
                key: 'info',
                label: <Space><InfoCircleOutlined />基本信息</Space>,
                children: (
                  <div>
                    {[
                      { label: '空间名称', value: selectedSpace.name },
                      { label: '所属部门', value: selectedSpace.dept },
                      { label: '空间类型', value: selectedSpace.type },
                      { label: '创建人', value: selectedSpace.creator },
                      { label: '创建时间', value: selectedSpace.createTime },
                      { label: '最近更新', value: selectedSpace.updateTime },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <Text type="secondary" style={{ width: 80, flexShrink: 0 }}>{item.label}</Text>
                        <span style={{ fontWeight: 500 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                ),
              },

              // Tab 2: 成员管理
              {
                key: 'members',
                label: <Space><TeamOutlined />成员管理</Space>,
                children: (
                  <div>
                    {selectedSpace.type === '个人空间' ? (
                      /* 个人空间：仅展示创建人，不可操作 */
                      <div>
                        <div style={{
                          textAlign: 'center', padding: '32px 24px',
                          background: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f0',
                          marginBottom: 16,
                        }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                            background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 24, fontWeight: 700,
                          }}>
                            {selectedSpace.creator.charAt(0)}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{selectedSpace.creator}</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            个人空间仅创建人可访问，不支持添加其他成员
                          </Text>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', padding: '10px 0',
                          borderBottom: '1px solid #f5f5f5',
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: '#1677ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 13, marginRight: 10, flexShrink: 0,
                          }}>
                            {selectedSpace.creator.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{selectedSpace.creator}</div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{selectedSpace.dept} · 创建于 {selectedSpace.createTime}</Text>
                          </div>
                          <Tag color="gold" style={{ borderRadius: 4 }}>
                            <CrownOutlined style={{ marginRight: 2 }} />创建人
                          </Tag>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <Space>
                            <Select
                              size="small"
                              defaultValue="all"
                              style={{ width: 110 }}
                              options={[
                                { label: '全部', value: 'all' },
                                { label: '创建人', value: '创建人' },
                                { label: '管理员', value: '管理员' },
                                { label: '普通用户', value: '普通用户' },
                              ]}
                            />
                            <Input
                              size="small"
                              placeholder="搜索成员"
                              prefix={<SearchOutlined />}
                              style={{ width: 180 }}
                            />
                          </Space>
                          <Button type="primary" size="small" icon={<PlusOutlined />}>添加成员</Button>
                        </div>
                        {mockMembers.slice(0, 6).map((m) => (
                          <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', padding: '10px 0',
                            borderBottom: '1px solid #f5f5f5',
                          }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', background: '#1677ff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: 13, marginRight: 10, flexShrink: 0,
                            }}>
                              {m.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500 }}>{m.name}</div>
                              <Text type="secondary" style={{ fontSize: 12 }}>{m.dept} · 加入于 {m.joinTime}</Text>
                            </div>
                            <Tag color={roleColorMap[m.role]} style={{ borderRadius: 4, marginRight: 8 }}>
                              {m.role === '创建人' ? <CrownOutlined style={{ marginRight: 2 }} /> : m.role === '管理员' ? <SafetyOutlined /> : <UserOutlined />}
                              {' '}{m.role}
                            </Tag>
                            <Button type="link" size="small">变更角色</Button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ),
              },

              // Tab 3: 资源配额
              {
                key: 'quota',
                label: <Space><LockOutlined />资源配额</Space>,
                children: (
                  <div>
                    <Title level={5} style={{ marginTop: 0 }}>配额概览</Title>
                    <Row gutter={16}>
                      <Col span={24}>
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>模型调用次数上限（按月/日）</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {selectedSpace.modelQuotaUsed.toLocaleString()} / {selectedSpace.modelQuotaLimit.toLocaleString()}
                            </Text>
                          </div>
                          <Progress
                            percent={Math.round(selectedSpace.modelQuotaUsed / selectedSpace.modelQuotaLimit * 100)}
                            size="small"
                            strokeColor={{
                              from: '#1677ff',
                              to: selectedSpace.modelQuotaUsed / selectedSpace.modelQuotaLimit > 0.8 ? '#ff4d4f' : '#69b1ff',
                            }}
                          />
                        </div>
                      </Col>
                      <Col span={24}>
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>存储空间上限</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {selectedSpace.storageUsed}MB / {selectedSpace.storageLimit}MB
                            </Text>
                          </div>
                          <Progress
                            percent={Math.round(selectedSpace.storageUsed / selectedSpace.storageLimit * 100)}
                            size="small"
                            strokeColor={{ from: '#722ed1', to: '#d3adf7' }}
                          />
                        </div>
                      </Col>
                      <Col span={24}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>可创建智能体数量上限</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {selectedSpace.agentQuotaUsed} / {selectedSpace.agentQuotaLimit}
                            </Text>
                          </div>
                          <Progress
                            percent={Math.round(selectedSpace.agentQuotaUsed / selectedSpace.agentQuotaLimit * 100)}
                            size="small"
                            strokeColor={{ from: '#52c41a', to: '#95de64' }}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Button type="primary" size="small" style={{ borderRadius: 6 }} onClick={() => message.info('打开配额设置对话框')}>
                      设置配额
                    </Button>
                  </div>
                ),
              },

              // Tab 4: 操作日志
              {
                key: 'logs',
                label: <Space><HistoryOutlined />操作日志</Space>,
                children: (
                  <div>
                    {[
                      { time: '2026-06-25 14:30', user: '演示用户', action: '修改空间设置', detail: '更新了空间图标和描述' },
                      { time: '2026-06-24 16:20', user: '王大队', action: '创建智能体', detail: '创建了涉诈APP分析助手' },
                      { time: '2026-06-23 11:45', user: '周科长', action: '添加成员', detail: '添加成员：孙法官' },
                      { time: '2026-06-22 09:30', user: '管理员', action: '接入模型', detail: '接入了 DeepSeek-Chat 模型' },
                      { time: '2026-06-21 15:10', user: '李警官', action: '修改配额', detail: '将模型调用配额提升至 150%' },
                    ].map((log, i) => (
                      <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{log.user}
                            <Tag color={
                              log.action === '创建智能体' ? 'blue' :
                                log.action === '添加成员' ? 'cyan' :
                                  log.action === '修改配额' ? 'orange' : 'default'
                            } style={{ marginLeft: 6 }}>
                              {log.action}
                            </Tag>
                          </span>
                          <Text type="secondary" style={{ fontSize: 12 }}>{log.time}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 13 }}>{log.detail}</Text>
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
