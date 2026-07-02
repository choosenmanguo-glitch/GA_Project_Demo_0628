import React, { useState, useMemo } from 'react';
import { Table, Tabs, Tag, Button, Space, Drawer, Steps, Form, Input, Select, Checkbox, Typography, message } from 'antd';
import { AlertOutlined, BellOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import type { FilterField } from '@/components/FilterBar';
import { mockAlertRecords, mockAlertRules, type AlertRecord, type AlertRule, type AlertLevel } from '@/mock/data';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

const levelColorMap: Record<AlertLevel, string> = { '紧急': 'red', '严重': 'orange', '警告': 'gold', '提示': 'blue' };

const statusIcons: Record<string, React.ReactNode> = {
  '待处理': <AlertOutlined style={{ color: '#ff4d4f' }} />,
  '处理中': <SyncOutlined spin style={{ color: '#faad14' }} />,
  '已解决': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  '已忽略': <MinusCircleOutlined style={{ color: '#bfbfbf' }} />,
};

const recordFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索告警标题或影响资源', width: 240 },
  { type: 'select', key: 'level', placeholder: '告警级别', width: 110, options: [
    { label: '紧急', value: '紧急' }, { label: '严重', value: '严重' }, { label: '警告', value: '警告' }, { label: '提示', value: '提示' },
  ]},
  { type: 'select', key: 'status', placeholder: '处理状态', width: 120, options: [
    { label: '待处理', value: '待处理' }, { label: '处理中', value: '处理中' }, { label: '已解决', value: '已解决' }, { label: '已忽略', value: '已忽略' },
  ]},
];

const ruleFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索规则名称', width: 220 },
];

export default function AlertPage() {
  const [activeTab, setActiveTab] = useState('records');
  const [recordFilters, setRecordFilters] = useState<Record<string, any>>({ keyword: '', level: undefined, status: undefined });
  const [ruleFilters, setRuleFilters] = useState<Record<string, any>>({ keyword: '' });
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);
  const [ruleDrawerOpen, setRuleDrawerOpen] = useState(false);
  const [ruleStep, setRuleStep] = useState(0);

  const filteredRecords = useMemo(() => {
    return mockAlertRecords.filter((r) => {
      if (recordFilters.keyword && !r.title.includes(recordFilters.keyword) && !r.targetResource.includes(recordFilters.keyword)) return false;
      if (recordFilters.level && r.level !== recordFilters.level) return false;
      if (recordFilters.status && r.status !== recordFilters.status) return false;
      return true;
    });
  }, [recordFilters]);

  const filteredRules = useMemo(() => {
    return mockAlertRules.filter((r) => {
      if (ruleFilters.keyword && !r.name.includes(ruleFilters.keyword)) return false;
      return true;
    });
  }, [ruleFilters]);

  const recordColumns: ColumnsType<AlertRecord> = useMemo(() => [
    { title: '级别', dataIndex: 'level', width: 80, render: (level: AlertLevel) => <Tag color={levelColorMap[level]} style={{ borderRadius: 4 }}>{level}</Tag> },
    { title: '告警标题', dataIndex: 'title', width: 240, render: (t, r) => <a onClick={() => setSelectedAlert(r)} style={{ fontWeight: 500 }}>{t}</a> },
    { title: '告警类型', dataIndex: 'type', width: 120, render: (t: string) => <Tag>{t}</Tag> },
    { title: '影响资源', dataIndex: 'targetResource', width: 160 },
    { title: '所属空间', dataIndex: 'spaceName', width: 100 },
    { title: '触发时间', dataIndex: 'triggerTime', width: 140 },
    { title: '持续时长', dataIndex: 'duration', width: 110 },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => <Space size={4}>{statusIcons[s]}<span>{s}</span></Space> },
    { title: '操作', width: 120, render: (_, r) => (
      <Space size={0}>
        <Button type="link" size="small" onClick={() => setSelectedAlert(r)}>查看</Button>
        {r.status === '待处理' && <Button type="link" size="small" style={{ color: '#1677ff' }}>认领</Button>}
      </Space>
    )},
  ], []);

  const ruleColumns: ColumnsType<AlertRule> = [
    { title: '规则名称', dataIndex: 'name', width: 220, render: (n) => <span style={{ fontWeight: 500 }}>{n}</span> },
    { title: '监控目标', dataIndex: 'monitorTarget', width: 100, render: (t: string) => <Tag>{t}</Tag> },
    { title: '触发条件', dataIndex: 'triggerCondition', width: 240, render: (c) => <Text type="secondary">{c}</Text> },
    { title: '告警级别', dataIndex: 'level', width: 90, render: (l: AlertLevel) => <Tag color={levelColorMap[l]}>{l}</Tag> },
    { title: '通知方式', dataIndex: 'notifyMethods', width: 200, render: (m: string[]) => <Space size={4}>{m.map(v => <Tag key={v} color="processing">{v}</Tag>)}</Space> },
    { title: '状态', dataIndex: 'enabled', width: 80, render: (e: boolean) => e ? <Tag color="green">启用</Tag> : <Tag>停用</Tag> },
    { title: '更新时间', dataIndex: 'updateTime', width: 110 },
    { title: '操作', width: 120, render: () => (
      <Space size={0}><Button type="link" size="small">编辑</Button><Button type="link" size="small" danger>删除</Button></Space>
    )},
  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="告警监控" hint="实时监控系统异常与资源告警，支持自定义告警规则" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginTop: 12, padding: '0 24px' }}
            items={[
              {
                key: 'records',
                label: <Space><BellOutlined />告警记录</Space>,
                children: (
                  <div>
                    <FilterBar
                      filters={recordFilterFields}
                      filterValues={recordFilters}
                      onFilterChange={(key, value) => setRecordFilters((prev) => ({ ...prev, [key]: value }))}
                      onSearch={() => {}}
                      onReset={() => setRecordFilters({ keyword: '', level: undefined, status: undefined })}
                      extra={
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          共 <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{mockAlertRecords.filter(r => r.status === '待处理').length}</span> 条待处理，{' '}
                          <span style={{ color: '#faad14', fontWeight: 600 }}>{mockAlertRecords.filter(r => r.status === '处理中').length}</span> 条处理中
                        </Text>
                      }
                    />
                    <div style={{ padding: '0 24px 16px' }}>
                      <Table rowKey="id" columns={recordColumns} dataSource={filteredRecords} size="middle" pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }} style={{ marginTop: 12 }} />
                    </div>
                  </div>
                ),
              },
              {
                key: 'rules',
                label: <Space><AlertOutlined />告警规则</Space>,
                children: (
                  <div>
                    <FilterBar
                      filters={ruleFilterFields}
                      filterValues={ruleFilters}
                      onFilterChange={(key, value) => setRuleFilters((prev) => ({ ...prev, [key]: value }))}
                      onSearch={() => {}}
                      onReset={() => setRuleFilters({ keyword: '' })}
                      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setRuleStep(0); setRuleDrawerOpen(true); }}>创建规则</Button>}
                    />
                    <div style={{ padding: '0 24px 16px' }}>
                      <Table rowKey="id" columns={ruleColumns} dataSource={filteredRules} size="middle" pagination={false} style={{ marginTop: 12 }} />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* 告警详情抽屉 */}
      <Drawer title="告警详情" open={!!selectedAlert} onClose={() => setSelectedAlert(null)} size={640} destroyOnClose
        extra={selectedAlert?.status === '待处理' && <Button type="primary" icon={<CheckCircleOutlined />}>认领处理</Button>}>
        {selectedAlert && (
          <div>
            <div style={{ marginBottom: 20, padding: '16px 20px', borderRadius: 10, background: '#fff7e6', border: '1px solid #ffe58f' }}>
              <Space><Tag color={levelColorMap[selectedAlert.level]}>{selectedAlert.level}</Tag><Text strong style={{ fontSize: 16 }}>{selectedAlert.title}</Text></Space>
              <div style={{ marginTop: 12 }}><Text type="secondary">{selectedAlert.description}</Text></div>
            </div>
            <div style={{ marginBottom: 20 }}>
              {[
                { label: '告警类型', value: selectedAlert.type }, { label: '影响资源', value: selectedAlert.targetResource },
                { label: '所属空间', value: selectedAlert.spaceName }, { label: '触发时间', value: selectedAlert.triggerTime },
                { label: '持续时长', value: selectedAlert.duration }, { label: '触发条件', value: selectedAlert.triggerCondition },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <Text type="secondary" style={{ width: 100, flexShrink: 0 }}>{item.label}</Text><span style={{ fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
              {selectedAlert.errorDetail && (
                <div style={{ display: 'flex', padding: '8px 0' }}><Text type="secondary" style={{ width: 100, flexShrink: 0 }}>错误详情</Text><Text code style={{ fontSize: 12 }}>{selectedAlert.errorDetail}</Text></div>
              )}
            </div>
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>处理建议</Text>
              <div style={{ padding: '12px 16px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <Paragraph style={{ margin: 0, whiteSpace: 'pre-line', fontSize: 13 }}>{selectedAlert.suggestion}</Paragraph>
              </div>
            </div>
            {selectedAlert.timeline && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>处理轨迹</Text>
                <div style={{ position: 'relative', paddingLeft: 24 }}>
                  {selectedAlert.timeline.map((t, i) => (
                    <div key={i} style={{ position: 'relative', paddingBottom: i < selectedAlert.timeline!.length - 1 ? 20 : 0 }}>
                      <div style={{ position: 'absolute', left: -27, top: 4, width: 8, height: 8, borderRadius: '50%', background: i === 0 ? '#1677ff' : '#d9d9d9' }} />
                      {i < selectedAlert.timeline!.length - 1 && <div style={{ position: 'absolute', left: -23.5, top: 14, width: 1, height: '100%', background: '#f0f0f0' }} />}
                      <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 2 }}>{t.time}</div>
                      <div><Tag>{t.action}</Tag> <span>{t.operator}</span></div>
                      <Text type="secondary" style={{ fontSize: 13 }}>{t.remark}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 创建规则抽屉 */}
      <Drawer title="创建告警规则" open={ruleDrawerOpen} onClose={() => setRuleDrawerOpen(false)} size={600} destroyOnClose
        extra={<Space><Button onClick={() => setRuleDrawerOpen(false)}>取消</Button>{ruleStep === 3 ? <Button type="primary" onClick={() => { message.success('规则创建成功'); setRuleDrawerOpen(false); }}>完成创建</Button> : <Button type="primary" onClick={() => setRuleStep(ruleStep + 1)}>下一步</Button>}</Space>}>
        <Steps current={ruleStep} size="small" style={{ marginBottom: 24 }} items={[{ title: '基本信息' }, { title: '触发条件' }, { title: '通知配置' }, { title: '确认创建' }]} />
        {ruleStep === 0 && (
          <Form layout="vertical">
            <Form.Item label="规则名称" required><Input placeholder="请输入规则名称" /></Form.Item>
            <Form.Item label="监控目标" required><Select placeholder="选择监控目标" options={['连接器', '模型调用', '资源配额', '智能体运行'].map(v => ({ label: v, value: v }))} /></Form.Item>
            <Form.Item label="规则描述"><TextArea rows={3} placeholder="描述该告警规则的监控目的和范围" /></Form.Item>
            <Form.Item label="告警级别" required><Select placeholder="选择告警级别" options={['紧急', '严重', '警告', '提示'].map(v => ({ label: v, value: v }))} /></Form.Item>
          </Form>
        )}
        {ruleStep === 1 && (
          <div>
            <Text strong style={{ display: 'block', marginBottom: 16 }}>设置触发条件</Text>
            <Form layout="vertical">
              <Form.Item label="监测指标"><Select placeholder="选择指标" options={['心跳状态', '响应耗时', '成功率', '配额使用率', '存储使用率', '并发数'].map(v => ({ label: v, value: v }))} /></Form.Item>
              <Form.Item label="比较条件"><Select placeholder="条件" options={['大于 >', '小于 <', '等于 =', '大于等于 ≥', '小于等于 ≤'].map(v => ({ label: v, value: v }))} /></Form.Item>
              <Form.Item label="阈值"><Input placeholder="输入阈值" /></Form.Item>
              <Form.Item label="统计周期"><Select placeholder="选择统计窗口" options={['实时', '最近5分钟', '最近15分钟', '最近30分钟', '最近1小时', '最近24小时'].map(v => ({ label: v, value: v }))} /></Form.Item>
              <Form.Item label="连续触发次数"><Input placeholder="如：连续3次触发后告警" /></Form.Item>
            </Form>
          </div>
        )}
        {ruleStep === 2 && (
          <div>
            <Text strong style={{ display: 'block', marginBottom: 16 }}>通知配置</Text>
            <Form layout="vertical">
              <Form.Item label="通知方式"><Checkbox.Group options={['站内消息', '短信', '邮件', '企业微信'].map(v => ({ label: v, value: v }))} /></Form.Item>
              <Form.Item label="通知对象"><Select mode="tags" placeholder="选择或输入通知对象" options={['运维管理员', '空间管理员', '李警官', '王大队'].map(v => ({ label: v, value: v }))} /></Form.Item>
              <Form.Item label="静默时间（分钟）"><Input placeholder="告警后多少分钟内不再重复通知" suffix="分钟" /></Form.Item>
            </Form>
          </div>
        )}
        {ruleStep === 3 && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>规则配置完毕</Title>
            <Text type="secondary">系统将按你设定的条件自动监控并触发告警</Text>
            <div style={{ marginTop: 20, textAlign: 'left', padding: '16px', background: '#fafafa', borderRadius: 8 }}>
              <div style={{ marginBottom: 8 }}><Text type="secondary">规则名称：</Text><span>（需填写基本信息）</span></div>
              <div style={{ marginBottom: 8 }}><Text type="secondary">监控目标：</Text><span>（需选择监控目标）</span></div>
              <div><Text type="secondary">通知方式：</Text><span>（需配置通知）</span></div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
