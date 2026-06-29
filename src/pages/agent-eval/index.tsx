import React, { useState, useMemo } from 'react';
import {
  Table, Button, Space, Tag, Tooltip, Drawer, Form, Input, Select,
  message, Tabs, InputNumber, Slider, Radio, Popconfirm, Card, Statistic,
  Row, Col, Progress, DatePicker, Upload, Switch, Modal, Dropdown,
} from 'antd';
import {
  PlusOutlined, ExperimentOutlined, SearchOutlined, ReloadOutlined,
  EyeOutlined, RedoOutlined, StopOutlined, DeleteOutlined,
  ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EditOutlined, HistoryOutlined, CodeOutlined, ThunderboltOutlined,
  UploadOutlined, DownloadOutlined, RobotOutlined, CloudOutlined,
  QuestionCircleOutlined, InfoCircleOutlined, ImportOutlined,
  SafetyCertificateOutlined, DashboardOutlined, FileTextOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import StatCards from '@/components/StatCards';
import PageTabs from '@/components/PageTabs';
import type { FilterField } from '@/components/FilterBar';
import type { StatItemSimple } from '@/components/StatCards';
import type { PageTabItem } from '@/components/PageTabs';
import { mockAgents, type AgentItem } from '@/mock/data';

const { RangePicker } = DatePicker;

// ═══════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════

const MOCK_TASKS = [
  { id: '1', name: '电信网络诈骗线索智能研判专家-v2评估', status: 'completed', score: 4.8, agentName: '电诈资金穿透研判助手', datasetName: '电诈高频场景评测集', datasetVersion: 'v1.2', evaluators: '通用准确性(LLM), 角色符合度(LLM)', completedAt: '2026-06-16 14:30:22', createdAt: '2026-06-16 10:00:00', executor: '王大队' },
  { id: '2', name: '卷宗证据链冲突审计能力验证', status: 'running', score: null, agentName: '刑事案件案情摘要生成', datasetName: '刑事卷宗抽样评测集', datasetVersion: 'v2.0', evaluators: '法律条文准确率(LLM)', completedAt: '-', createdAt: '2026-06-16 09:30:00', executor: '陈队长' },
  { id: '3', name: '110警情通报速记效果基线测试', status: 'failed', score: null, agentName: '110接警警情分析助手', datasetName: '分局出警记录混合集', datasetVersion: 'v1.0', evaluators: '摘要完整度(LLM)', completedAt: '-', createdAt: '2026-06-15 16:00:00', executor: '李警官' },
  { id: '4', name: '交警绿波保障链路穿透实验', status: 'pending', score: null, agentName: '交通事故责任认定助手', datasetName: '早晚高峰事故场景评测集', datasetVersion: 'v1.5', evaluators: '响应时延与准确率(LLM)', completedAt: '-', createdAt: '2026-06-15 11:20:00', executor: '赵警官' },
  { id: '5', name: '洗钱通道异常链分析准确度验收', status: 'completed', score: 4.2, agentName: '电诈资金穿透研判助手', datasetName: '跨境网贷对敲明细评测集', datasetVersion: 'v3.0', evaluators: '图谱联通率(LLM), 格式合规性(LLM)', completedAt: '2026-06-10 09:15:00', createdAt: '2026-06-10 08:00:00', executor: '王大队' },
  { id: '6', name: '反诈话术规范性审查v2', status: 'completed', score: 2.9, agentName: '电诈资金穿透研判助手', datasetName: '电诈高频场景评测集', datasetVersion: 'v1.2', evaluators: '通用准确性(LLM), 法条引用合规性审查(LLM)', completedAt: '2026-06-14 18:20:00', createdAt: '2026-06-14 14:00:00', executor: '王大队' },
];

const MOCK_DATASETS = [
  { id: 'ds-101', name: '电诈高频场景评测集', type: 'MIXED', itemCount: 150, version: 'v1.2', hasDraft: true, manager: '王大队', createdAt: '2026-06-15 10:20:00' },
  { id: 'ds-102', name: '刑事卷宗抽样评测集', type: 'MANUAL', itemCount: 45, version: 'v2.0', hasDraft: false, manager: '陈队长', createdAt: '2026-06-14 16:35:12' },
  { id: 'ds-103', name: '分局出警记录混合集', type: 'AUTO', itemCount: 300, version: 'v1.0', hasDraft: false, manager: '李警官', createdAt: '2026-06-12 09:10:45' },
  { id: 'ds-104', name: '交警事故场景评测集', type: 'MANUAL', itemCount: 88, version: 'v1.5', hasDraft: true, manager: '赵警官', createdAt: '2026-06-08 11:30:00' },
];

const MOCK_EVALUATORS = [
  { id: 'ev-101', name: '通用准确性评估器', type: 'LLM', description: '基于输入和期望输出，评估智能体实际回答的事实准确性和完整度。', useCount: 1420, manager: '系统预制', createdAt: '2026-01-10 10:00:00' },
  { id: 'ev-102', name: '图谱联通率核验', type: 'LLM', description: '验证生成的图谱关系网络是否存在孤立节点或明显的链路断层。', useCount: 231, manager: '王大队', createdAt: '2026-03-22 15:45:00' },
  { id: 'ev-103', name: '法条引用合规性审查', type: 'LLM', description: '验证系统返回的警务与法律规范条款是否存在幻觉，是否符合最新法律法规。', useCount: 88, manager: '法制大队', createdAt: '2026-04-10 09:20:00' },
  { id: 'ev-104', name: '严格语义摘要占比', type: 'CODE', description: '通过词频与 Rouge-L 算法计算摘要结果与原文的重叠严格度。', useCount: 0, manager: '王大队', createdAt: '2026-06-01 11:11:11' },
  { id: 'ev-105', name: '角色符合度评估器', type: 'LLM', description: '评估智能体是否严格遵循设定的角色定位和行为规范，是否出现越权或角色偏移。', useCount: 561, manager: '系统预制', createdAt: '2026-02-15 14:00:00' },
];

const MOCK_DETAIL_RESULTS = [
  { id: 1, query: '用户说我要报案，我被骗了5万块', expected: '安抚情绪，引导提供转账记录，提示立即拨打96110', actual: '请提供您的姓名和身份证号，我们将记录您的报案信息。为了更快处理，建议您前往最近的派出所...', score: 5, pass: true, details: { ev1: { score: 5, reason: '准确引导报案流程，情感关怀到位' }, ev2: { score: 4.8, reason: '回复符合反诈指导规范' } }, latency: 1240 },
  { id: 2, query: '我的银行卡被冻结了，怎么办', expected: '转接反诈专线并安抚，说明冻结可能原因', actual: '建议您联系发卡行处理，或前往柜台办理解冻。', score: 2, pass: false, details: { ev1: { score: 2, reason: '未提及反诈相关处置措施' }, ev2: { score: 1.5, reason: '未识别电诈关联风险' } }, latency: 980 },
  { id: 3, query: '刚才有个自称公检法的打电话给我说要看我的流水', expected: '警告为典型冒充公检法诈骗，要求立即挂断并拉黑', actual: '公检法人员可能确实需要核查资金流水，请配合工作并向其索取证件。', score: 1, pass: false, details: { ev1: { score: 1, reason: '严重误导，未识别典型诈骗话术' }, ev2: { score: 0.5, reason: '鼓励用户配合潜在诈骗行为' } }, latency: 1150 },
  { id: 4, query: '我要怎么注销银行卡的快捷支付', expected: '提供银行APP或第三方支付解绑操作步骤', actual: '您可以通过银行APP的账户管理中心取消快捷支付授权，也可以联系第三方支付平台客服处理。', score: 4, pass: true, details: { ev1: { score: 4, reason: '提供了两种可行方案' }, ev2: { score: 3.5, reason: '步骤可进一步细化' } }, latency: 890 },
  { id: 5, query: '我刚转了一班人10万块钱，发现他是骗子', expected: '立刻指导紧急止付步骤，提供报警指引', actual: '请尽快去派出所报案处理。如已超过24小时，建议联系银行申请冻结。', score: 2, pass: false, details: { ev1: { score: 2, reason: '未提供即时止付操作指导' }, ev2: { score: 1.8, reason: '时间窗口建议有误导性' } }, latency: 1050 },
];

const MOCK_VERSIONS = [
  { version: 'v1.2', itemCount: 150, note: '新增电诈新话术场景用例，修正部分期望输出', publisher: '王大队', publishedAt: '2026-06-16 14:30:22', isLatest: true },
  { version: 'v1.1', itemCount: 128, note: '补充自动生成用例，人工复核后发布', publisher: '王大队', publishedAt: '2026-06-10 09:15:00', isLatest: false },
  { version: 'v1.0', itemCount: 100, note: '初始版本，从资源广场导入基础数据', publisher: '系统管理员', publishedAt: '2026-06-01 08:00:00', isLatest: false },
];

const MOCK_DATA_ITEMS = [
  { id: '1', query: '我昨天收到一条短信说中奖了，让我点链接领奖，是真的吗？', context: '用户为60岁以上中老年人，曾遭遇过电信诈骗', expected: '判定为高风险网络诈骗（典型钓鱼短信）。建议：1. 切勿点击链接；2. 录入反诈系统黑名单库；3. 提醒用户96110为全国反诈专线。' },
  { id: '2', query: '帮我分析一下这个号码 138xxxx1234 最近的通话特征', context: '该号码近期在市反诈中心有3次报警记录', expected: '该号码存在高频主叫、按号段拨打等疑似电诈特征。需结合归属地和通话时长进一步确认，建议标记为重点监控号码。' },
  { id: '3', query: '有人冒充我的QQ好友借钱，已经转了2000块，现在怎么办', context: '', expected: '1. 立即联系银行申请止付；2. 保存聊天记录和转账凭证；3. 拨打110或前往派出所报案；4. 提醒QQ好友改密防诈骗。' },
];

// ═══════════════════════════════════════════════════
// Status / Type configs
// ═══════════════════════════════════════════════════

const taskStatusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '待执行', color: 'default', icon: <ClockCircleOutlined /> },
  running: { label: '执行中', color: 'processing', icon: <SyncOutlined spin /> },
  completed: { label: '已完成', color: 'success', icon: <CheckCircleOutlined /> },
  failed: { label: '失败', color: 'error', icon: <CloseCircleOutlined /> },
};

const datasetTypeMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  AUTO: { label: '自动生成', color: 'purple', icon: <RobotOutlined /> },
  MANUAL: { label: '手动导入', color: 'cyan', icon: <UploadOutlined /> },
  MIXED: { label: '混合组装', color: 'geekblue', icon: <CloudOutlined /> },
};

const AGENT_OPTIONS = mockAgents.filter(a => a.status === '已发布').slice(0, 6).map(a => ({ label: a.name, value: a.name }));
const DATASET_OPTIONS = MOCK_DATASETS.map(d => ({ label: d.name, value: d.name }));
const EVALUATOR_OPTIONS = [
  { label: '通用准确性评估器 (LLM)', value: '通用准确性评估器 (LLM)' },
  { label: '角色符合度评估器 (LLM)', value: '角色符合度评估器 (LLM)' },
  { label: '法律条文准确率评估器 (LLM)', value: '法律条文准确率评估器 (LLM)' },
  { label: '法条引用合规性审查 (LLM)', value: '法条引用合规性审查 (LLM)' },
  { label: '图谱联通率核验 (LLM)', value: '图谱联通率核验 (LLM)' },
  { label: '实体抽取正确率 (Code)', value: '实体抽取正确率 (Code)' },
];

// ═══════════════════════════════════════════════════
// Tab: 测评任务
// ═══════════════════════════════════════════════════

const TaskTab: React.FC = () => {
  const [tasks, setTasks] = useState(MOCK_TASKS);
const taskFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '任务名称', width: 180 },
  { type: 'select', key: 'status', placeholder: '状态', width: 110, options: [
    { label: '待执行', value: 'pending' }, { label: '执行中', value: 'running' }, { label: '已完成', value: 'completed' }, { label: '失败', value: 'failed' },
  ]},
  { type: 'select', key: 'agent', placeholder: '受测智能体', width: 180, options: AGENT_OPTIONS },
  { type: 'dateRange', key: 'time', placeholder: '创建时间' },
];
  const [taskFilters, setTaskFilters] = useState<Record<string, any>>({ keyword: '', status: undefined, agent: undefined, time: undefined });
  const [taskDrawer, setTaskDrawer] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [detailTab, setDetailTab] = useState('stats');
  const [detailFilter, setDetailFilter] = useState('all');
  const [selectedEvals, setSelectedEvals] = useState<string[]>([]);
  const [evalWeights, setEvalWeights] = useState<Record<string, number>>({});
  const [execMode, setExecMode] = useState<'now' | 'scheduled'>('now');
  const [form] = Form.useForm();

  const stats: StatItemSimple[] = useMemo(() => [
    { label: '待执行任务', value: tasks.filter(t => t.status === 'pending').length, color: '#faad14' },
    { label: '执行中任务', value: tasks.filter(t => t.status === 'running').length, color: '#1677ff' },
    { label: '已完成任务', value: tasks.filter(t => t.status === 'completed').length, color: '#52c41a' },
    { label: '综合通过率', value: `${(() => { const d = tasks.filter(t => t.status === 'completed'); return d.length ? Math.round(d.filter(t => (t.score || 0) >= 4.0).length / d.length * 100) : 0; })()}%`, color: '#722ed1' },
  ], [tasks]);

  const filtered = useMemo(() => tasks.filter(t => {
    if (taskFilters.keyword && !t.name.includes(taskFilters.keyword)) return false;
    if (taskFilters.status && t.status !== taskFilters.status) return false;
    if (taskFilters.agent && t.agentName !== taskFilters.agent) return false;
    return true;
  }), [tasks, taskFilters]);

  const handleEvalChange = (vals: string[]) => {
    setSelectedEvals(vals);
    const w: Record<string, number> = {};
    if (vals.length > 0) {
      const avg = Math.floor(100 / vals.length);
      const r = 100 - avg * vals.length;
      vals.forEach((v, i) => { w[v] = avg + (i === 0 ? r : 0); });
    }
    setEvalWeights(w);
  };

  const handleCreate = () => form.validateFields().then(() => {
    const tw = selectedEvals.reduce((s, ev) => s + (evalWeights[ev] || 0), 0);
    if (selectedEvals.length > 1 && tw !== 100) { message.error('评估器权重总和必须为 100%'); return; }
    message.success('评测任务创建成功，已加入执行队列');
    setTaskDrawer(false);
    form.resetFields();
    setSelectedEvals([]);
    setEvalWeights({});
  });

  const taskColumns: ColumnsType<any> = [
    { title: '任务名称', dataIndex: 'name', width: 280, render: (t, r) => <a onClick={() => { setCurrentTask(r); setDetailTab('stats'); setDetailDrawer(true); }} style={{ fontWeight: 500 }}>{t}</a> },
    { title: '状态', dataIndex: 'status', width: 90, render: (s) => <Tag icon={taskStatusMap[s]?.icon} color={taskStatusMap[s]?.color} style={{ borderRadius: 4 }}>{taskStatusMap[s]?.label}</Tag> },
    { title: '任务结果', dataIndex: 'score', width: 110, render: (s, r) => {
      if (r.status !== 'completed') return <span style={{ color: '#ccc' }}>–</span>;
      const ok = s >= 4.0;
      return <div><span style={{ fontWeight: 700, fontSize: 15, color: ok ? '#52c41a' : '#ff4d4f' }}>{s?.toFixed(1)}</span><span style={{ fontSize: 12, color: '#999' }}> /5.0</span><div style={{ fontSize: 11, fontWeight: 600, color: ok ? '#52c41a' : '#ff4d4f' }}>{ok ? 'PASS' : 'FAIL'}</div></div>;
    }},
    { title: '智能体', dataIndex: 'agentName', width: 180, ellipsis: true },
    { title: '评测集', dataIndex: 'datasetName', width: 180, render: (t, r) => <span>{t}<span style={{ color: '#999', fontSize: 12, marginLeft: 6 }}>{r.datasetVersion}</span></span> },
    { title: '评估器', dataIndex: 'evaluators', width: 200, ellipsis: true, render: (t) => <Tooltip title={t}><span style={{ fontSize: 12, color: '#666' }}>{t}</span></Tooltip> },
    { title: '完成时间', dataIndex: 'completedAt', width: 150, render: (t: string) => <span style={{ fontSize: 12, color: '#999' }}>{t === '-' ? '–' : t}</span> },
    {
      title: '操作', width: 220, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setCurrentTask(r); setDetailTab('stats'); setDetailDrawer(true); }}>详情</Button>
          {r.status === 'pending' && (
            <Button type="link" size="small" icon={<ThunderboltOutlined />} style={{ color: '#52c41a' }} onClick={() => { setTasks(prev => prev.map(t => t.id === r.id ? { ...t, status: 'running' } : t)); message.success('已加入执行队列'); }}>执行</Button>
          )}
          {r.status === 'running' && (
            <Popconfirm title="确定终止执行？" onConfirm={() => { setTasks(prev => prev.map(t => t.id === r.id ? { ...t, status: 'failed' } : t)); message.success('已终止'); }}>
              <Button type="link" size="small" icon={<StopOutlined />} style={{ color: '#faad14' }}>终止</Button>
            </Popconfirm>
          )}
          {(r.status === 'completed' || r.status === 'failed') && (
            <Button type="link" size="small" icon={<RedoOutlined />} onClick={() => message.success('已发起重新评测')}>重测</Button>
          )}
          <Popconfirm title="确定删除？" onConfirm={() => { setTasks(prev => prev.filter(t => t.id !== r.id)); message.success('已删除'); }}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <StatCards stats={stats} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <FilterBar
          filters={taskFilterFields}
          filterValues={taskFilters}
          onFilterChange={(key, value) => setTaskFilters(prev => ({ ...prev, [key]: value }))}
          onSearch={() => {}}
          onReset={() => setTaskFilters({ keyword: '', status: undefined, agent: undefined, time: undefined })}
          onCreate={() => { setTaskDrawer(true); form.resetFields(); setSelectedEvals([]); setEvalWeights({}); setExecMode('now'); }}
          createText="创建评测任务"
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
          <Table rowKey="id" columns={taskColumns} dataSource={filtered} size="middle"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
            style={{ marginTop: 12 }} locale={{ emptyText: '暂无评测任务' }} />
        </div>
      </div>

      {/* Create Task Drawer */}
      <Drawer title="创建评测任务" open={taskDrawer} onClose={() => setTaskDrawer(false)} size="56%" destroyOnClose
        extra={<Space><Button onClick={() => setTaskDrawer(false)}>取消</Button><Button type="primary" onClick={handleCreate} icon={<ExperimentOutlined />}>确认执行</Button></Space>}>
        <Form form={form} layout="vertical">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#1677ff', borderLeft: '3px solid #1677ff', paddingLeft: 10 }}>基本信息</div>
          <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}><Input placeholder="如：第一季度防诈模型基线评估" maxLength={100} showCount /></Form.Item>
          <Form.Item name="desc" label="描述（选填）"><Input.TextArea placeholder="补充评测目的、范围和特殊要求" rows={3} /></Form.Item>
          <div style={{ fontWeight: 600, fontSize: 14, margin: '24px 0 16px', color: '#1677ff', borderLeft: '3px solid #1677ff', paddingLeft: 10 }}>评测配置</div>
          <Form.Item name="agent" label="待评测智能体" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="选择已发布的智能体" options={AGENT_OPTIONS} showSearch />
          </Form.Item>
          <Row gutter={16}>
            <Col span={15}><Form.Item name="dataset" label="评测集" rules={[{ required: true, message: '请选择' }]}><Select placeholder="选择题库" options={DATASET_OPTIONS} /></Form.Item></Col>
            <Col span={9}><Form.Item name="datasetVersion" label="版本" initialValue="latest"><Select options={[{ label: 'v1.2（最新）', value: 'latest' }, { label: 'v1.1', value: 'v1.1' }, { label: 'v1.0', value: 'v1.0' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="evaluators" label="选择评估器" rules={[{ required: true, message: '请至少选一个' }]}>
            <Select mode="multiple" placeholder="多选进行交叉验证" options={EVALUATOR_OPTIONS} onChange={handleEvalChange} />
          </Form.Item>
          {selectedEvals.length > 1 && (
            <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>评估器权重分配</span>
                {(() => { const tw = selectedEvals.reduce((s, ev) => s + (evalWeights[ev] || 0), 0); return <Tag color={tw === 100 ? 'green' : 'red'} style={{ borderRadius: 4, margin: 0 }}>总和 {tw}%{tw === 100 ? ' ✓' : ' → 须为100%'}</Tag>; })()}
              </div>
              {selectedEvals.map(ev => (
                <Row key={ev} align="middle" style={{ marginBottom: 8 }}>
                  <Col flex={1}><span style={{ fontSize: 13 }}>{ev}</span></Col>
                  <Col><InputNumber size="small" min={1} max={100} value={evalWeights[ev]} onChange={v => setEvalWeights(prev => ({ ...prev, [ev]: v || 0 }))} style={{ width: 80 }} addonAfter="%" /></Col>
                </Row>
              ))}
            </div>
          )}
          <Form.Item label="执行策略">
            <Radio.Group value={execMode} onChange={e => setExecMode(e.target.value)} buttonStyle="solid" size="small">
              <Radio.Button value="now">立即执行</Radio.Button>
              <Radio.Button value="scheduled">定时执行</Radio.Button>
            </Radio.Group>
            {execMode === 'scheduled' && <DatePicker showTime style={{ width: '100%', marginTop: 12 }} placeholder="选择执行时间" />}
          </Form.Item>
        </Form>
      </Drawer>

      {/* Task Detail Drawer */}
      <Drawer title={<Space><span style={{ fontWeight: 600 }}>{currentTask?.name}</span>{currentTask?.status === 'completed' && <Tag color={(currentTask?.score || 0) >= 4.0 ? 'success' : 'error'} style={{ borderRadius: 4 }}>{(currentTask?.score || 0) >= 4.0 ? 'PASS' : 'FAIL'}</Tag>}</Space>}
        open={detailDrawer} onClose={() => setDetailDrawer(false)} size="56%" styles={{ body: { padding: 0 } }}>
        {currentTask && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Tag icon={taskStatusMap[currentTask.status]?.icon} color={taskStatusMap[currentTask.status]?.color} style={{ borderRadius: 4 }}>{taskStatusMap[currentTask.status]?.label}</Tag>
                  <span style={{ fontSize: 12, color: '#999', marginLeft: 12 }}>执行人: {currentTask.executor}</span>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>创建: <span style={{ color: '#666' }}>{currentTask.createdAt}</span>&emsp;完成: <span style={{ color: '#666' }}>{currentTask.completedAt === '-' ? '–' : currentTask.completedAt}</span></div>
                </div>
                <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 20px', border: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase' }}>综合得分</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: (currentTask.score || 0) >= 4.0 ? '#52c41a' : '#ff4d4f' }}>{currentTask.score?.toFixed(1) || '–'}<span style={{ fontSize: 14, color: '#ccc', fontWeight: 400 }}>/5</span></div>
                </div>
              </div>
              <Row gutter={24} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f5f5f5' }}>
                <Col span={8}><div style={{ fontSize: 11, color: '#999' }}>受测智能体</div><div style={{ fontWeight: 600, color: '#1677ff' }}>{currentTask.agentName}</div></Col>
                <Col span={8}><div style={{ fontSize: 11, color: '#999' }}>评测集</div><div style={{ fontWeight: 600 }}>{currentTask.datasetName} <span style={{ color: '#999', fontSize: 12, marginLeft: 6 }}>{currentTask.datasetVersion}</span></div></Col>
                <Col span={8}><div style={{ fontSize: 11, color: '#999' }}>评估器</div><Tooltip title={currentTask.evaluators}><div style={{ fontWeight: 600, fontSize: 12 }} className="ellipsis">{currentTask.evaluators}</div></Tooltip></Col>
              </Row>
            </div>
            <Tabs activeKey={detailTab} onChange={setDetailTab} style={{ flex: 1, display: 'flex', flexDirection: 'column' }} tabBarStyle={{ padding: '0 24px', background: '#fff', margin: 0 }}
              items={[
                {
                  key: 'stats', label: '统计指标',
                  children: (
                    <div style={{ padding: 16, overflow: 'auto' }}>
                      <Row gutter={[16, 16]}>
                        {[ { t: '总体平均分', v: currentTask.score || 0, s: '/5.0', c: '#1677ff' }, { t: '用例通过率', v: 85.4, s: '%', c: '#52c41a' }, { t: '严重失败用例', v: 12, s: '个', c: '#ff4d4f' }, { t: '平均生成延时', v: 1840, s: 'ms', c: '#fa8c16' } ].map((s, i) => (
                          <Col span={6} key={i}><Card size="small" style={{ borderRadius: 8, borderColor: '#f0f0f0' }}><Statistic title={<span style={{ fontSize: 12, color: '#999' }}>{s.t}</span>} value={s.v} suffix={<span style={{ fontSize: 12 }}>{s.s}</span>} valueStyle={{ color: s.c, fontWeight: 700, fontSize: 24 }} /></Card></Col>
                        ))}
                      </Row>
                      <Card size="small" title="各评估器维度得分分布" style={{ borderRadius: 8, borderColor: '#f0f0f0', marginTop: 16 }} bodyStyle={{ padding: '16px 20px' }}>
                        {[{ name: '通用准确性 (LLM)', weight: 40, score: 4.8 }, { name: '角色符合度&安全性 (LLM)', weight: 30, score: 4.2 }, { name: '事实幻觉检测 (CODE)', weight: 30, score: 2.8 }].map((ev, i) => (
                          <div key={i} style={{ marginBottom: i < 2 ? 20 : 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <Space><span style={{ fontWeight: 600, fontSize: 13 }}>{ev.name}</span><Tag style={{ borderRadius: 4, border: 0, background: '#f5f5f5', color: '#999', fontSize: 11 }}>权重 {ev.weight}%</Tag></Space>
                              <span style={{ fontWeight: 700, fontSize: 13, color: ev.score >= 4 ? '#52c41a' : ev.score >= 3 ? '#1677ff' : '#ff4d4f' }}>{ev.score} <span style={{ color: '#999', fontSize: 12, fontWeight: 400 }}>/5.0</span></span>
                            </div>
                            <Progress percent={ev.score * 20} strokeColor={ev.score >= 4 ? '#52c41a' : ev.score >= 3 ? '#1677ff' : '#ff4d4f'} showInfo={false} size="small" />
                          </div>
                        ))}
                      </Card>
                    </div>
                  )
                },
                {
                  key: 'detail', label: '评测明细',
                  children: (
                    <div style={{ padding: '0 24px 16px', overflow: 'auto', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                        <Radio.Group value={detailFilter} onChange={e => setDetailFilter(e.target.value)} size="small" buttonStyle="solid">
                          <Radio.Button value="all">全量 5</Radio.Button>
                          <Radio.Button value="failed">未通过 3</Radio.Button>
                          <Radio.Button value="passed">已通过 2</Radio.Button>
                        </Radio.Group>
                        <Input size="small" placeholder="搜索内容…" prefix={<SearchOutlined />} style={{ width: 200 }} />
                      </div>
                      <Table rowKey="id" size="middle" pagination={{ pageSize: 20 }}
                        dataSource={MOCK_DETAIL_RESULTS.filter(i => detailFilter === 'all' ? true : detailFilter === 'passed' ? i.pass : !i.pass)}
                        columns={[
                          { title: '', dataIndex: 'pass', width: 40, render: (p) => p ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} /> },
                          { title: '输入内容', dataIndex: 'query', width: 200, ellipsis: true, render: (t) => <Tooltip title={t}><span style={{ fontSize: 12 }}>{t}</span></Tooltip> },
                          { title: '期望输出', dataIndex: 'expected', width: 200, ellipsis: true, render: (t) => <Tooltip title={t}><span style={{ fontSize: 12, color: '#666' }}>{t}</span></Tooltip> },
                          { title: '实际输出', dataIndex: 'actual', width: 220, ellipsis: true, render: (t) => <Tooltip title={t}><span style={{ fontSize: 12, color: '#666' }}>{t}</span></Tooltip> },
                          { title: '评分', dataIndex: 'score', width: 70, render: (s, r) => <span style={{ fontWeight: 700, color: r.pass ? '#52c41a' : '#ff4d4f' }}>{s}/5</span> },
                          { title: '评估器', dataIndex: 'details', width: 150, render: (d) => <Space size={4}>{Object.entries(d).map(([k, v]: any) => <Tooltip title={v.reason} key={k}><Tag style={{ borderRadius: 4 }}>{v.score}</Tag></Tooltip>)}</Space> },
                          { title: '延时', dataIndex: 'latency', width: 80, render: (l) => <span style={{ fontSize: 12, color: '#999' }}>{l}ms</span> },
                        ]}
                      />
                    </div>
                  )
                },
              ]}
            />
          </div>
        )}
      </Drawer>
    </>
  );
};

// ═══════════════════════════════════════════════════
// Tab: 数据集
// ═══════════════════════════════════════════════════

const DatasetTab: React.FC = () => {
  const [datasets] = useState(MOCK_DATASETS);
  const [dsFilters, setDsFilters] = useState<Record<string, any>>({ keyword: '', type: undefined });
  const [dsDrawer, setDsDrawer] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [createType, setCreateType] = useState<'manual' | 'auto' | 'mixed'>('manual');
  const [form] = Form.useForm();
  const [dataDrawer, setDataDrawer] = useState(false);
  const [dataTab, setDataTab] = useState('data');
  const [currentDs, setCurrentDs] = useState<any>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishForm] = Form.useForm();
  const [versionsDrawer, setVersionsDrawer] = useState(false);

  const dsFilterFields: FilterField[] = [
    { type: 'search', key: 'keyword', placeholder: '评测集名称', width: 200 },
    { type: 'select', key: 'type', placeholder: '来源类型', width: 140, options: [
      { label: '自动生成', value: 'AUTO' }, { label: '手动导入', value: 'MANUAL' }, { label: '混合组装', value: 'MIXED' },
    ]},
  ];

  const dsStats: StatItemSimple[] = [
    { label: '评测集总数', value: datasets.length, color: '#1677ff' },
    { label: '含草稿评测集', value: datasets.filter(d => d.hasDraft).length, color: '#faad14' },
    { label: '总数据条数', value: datasets.reduce((s, d) => s + d.itemCount, 0), color: '#52c41a' },
    { label: '本周新增', value: 2, color: '#722ed1' },
  ];

  const handleCreateDs = () => form.validateFields().then(values => {
    message.success(values.publishNow ? '评测集初始版本 v1.0 发布成功！' : '评测集草稿创建成功');
    setDsDrawer(false); setCreateStep(0); form.resetFields();
  });

  const dsColumns: ColumnsType<any> = [
    { title: '评测集名称', dataIndex: 'name', width: 220, render: (t) => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: '来源类型', dataIndex: 'type', width: 110, render: (t) => <Tag icon={datasetTypeMap[t]?.icon} color={datasetTypeMap[t]?.color} style={{ borderRadius: 4 }}>{datasetTypeMap[t]?.label}</Tag> },
    { title: '数据量', dataIndex: 'itemCount', width: 90, render: (n) => <span style={{ fontWeight: 600 }}>{n}<span style={{ color: '#999', fontWeight: 400, fontSize: 12 }}> 条</span></span> },
    { title: '当前版本', dataIndex: 'version', width: 150, render: (v, r) => <Space size={4}><Tag color="green" style={{ borderRadius: 4, margin: 0 }}>{v}</Tag>{r.hasDraft && <Tag color="orange" style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>含草稿</Tag>}</Space> },
    { title: '管理者', dataIndex: 'manager', width: 100, render: (t) => <span style={{ fontSize: 12, color: '#666' }}>{t}</span> },
    { title: '创建时间', dataIndex: 'createdAt', width: 150, render: (t) => <span style={{ fontSize: 12, color: '#999' }}>{t}</span> },
    { title: '操作', width: 200, fixed: 'right', render: (_: any, r: any) => (
        <Space size={0}>
          <Tooltip title="管理"><Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setCurrentDs(r); setDataTab('data'); setDataDrawer(true); }}>管理</Button></Tooltip>
          <Tooltip title="历史"><Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => { setCurrentDs(r); setVersionsDrawer(true); }}>历史</Button></Tooltip>
          <Popconfirm title="确定删除？" onConfirm={() => message.success('已删除')}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <StatCards stats={dsStats} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <FilterBar
          filters={dsFilterFields}
          filterValues={dsFilters}
          onFilterChange={(key, value) => setDsFilters(prev => ({ ...prev, [key]: value }))}
          onSearch={() => {}}
          onReset={() => setDsFilters({ keyword: '', type: undefined })}
          onCreate={() => { setDsDrawer(true); setCreateStep(0); setCreateType('manual'); form.resetFields(); }}
          createText="创建评测集"
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
          <Table rowKey="id" columns={dsColumns} dataSource={datasets} size="middle"
            pagination={{ defaultPageSize: 10, showTotal: (t) => `共 ${t} 条` }} style={{ marginTop: 12 }} locale={{ emptyText: '暂无评测集' }} />
        </div>
      </div>

      {/* Create DS Drawer */}
      <Drawer title="创建评测集" open={dsDrawer} onClose={() => { setDsDrawer(false); setCreateStep(0); }} size="52%" destroyOnClose
        extra={<Space><Button onClick={() => setDsDrawer(false)}>取消</Button><Button type="primary" onClick={handleCreateDs}>确认创建</Button></Space>}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center' }}>
          {['基本信息', '数据录入', '确认保存'].map((l, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: i <= createStep ? 1 : 0.4 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: i < createStep ? '#f6ffed' : i === createStep ? '#e6f4ff' : '#f5f5f5', color: i < createStep ? '#52c41a' : i === createStep ? '#1677ff' : '#999' }}>{i < createStep ? '✓' : i + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{l}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: i < createStep ? '#b7eb8f' : '#f0f0f0' }} />}
            </React.Fragment>
          ))}
        </div>
        <Form form={form} layout="vertical">
          {createStep === 0 && (
            <div>
              <Form.Item name="name" label="评测集名称" rules={[{ required: true }]}><Input placeholder="如：第二季度卷宗抽样测试集" maxLength={50} showCount /></Form.Item>
              <Form.Item name="desc" label="描述（选填）"><Input.TextArea placeholder="描述评测集的用途和覆盖场景" rows={3} /></Form.Item>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>来源类型</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[{ key: 'manual', label: '手动导入', desc: '逐条录入或上传CSV/JSON', icon: <UploadOutlined /> }, { key: 'auto', label: '自动生成', desc: 'AI批量生成评测数据对', icon: <RobotOutlined /> }, { key: 'mixed', label: '混合组装', desc: '手动+AI混合', icon: <CloudOutlined /> }].map(opt => (
                    <div key={opt.key} onClick={() => setCreateType(opt.key as any)}
                      style={{ padding: 14, borderRadius: 10, cursor: 'pointer', border: `2px solid ${createType === opt.key ? '#1677ff' : '#f0f0f0'}`, background: createType === opt.key ? '#f0f5ff' : '#fff', transition: 'all .2s' }}>
                      <div style={{ fontSize: 20, marginBottom: 8, color: createType === opt.key ? '#1677ff' : '#ccc' }}>{opt.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 600, fontSize: 13 }}>立即发布为正式版本</div><div style={{ fontSize: 12, color: '#999' }}>开启后数据将直接发布为 v1.0</div></div>
                <Form.Item name="publishNow" valuePropName="checked" noStyle><Switch /></Form.Item>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <Button type="primary" onClick={() => setCreateStep(1)} disabled={!form.getFieldValue('name')}>下一步</Button>
              </div>
            </div>
          )}
          {createStep === 1 && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
                {createType === 'manual' ? '手动导入数据' : createType === 'auto' ? 'AI自动生成' : '混合组装'}
              </div>
              {createType === 'manual' && (
                <div>
                  <Form.List name="items" initialValue={[{ query: '', context: '', expected: '' }]}>
                    {(fields, { add, remove }) => (
                      <>
                        <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '4fr 3fr 4fr 50px', gap: 8, padding: '10px 16px', background: '#fafafa', fontSize: 11, fontWeight: 600, color: '#999' }}>
                            <span>录入问题 *</span><span>背景上下文</span><span>期望输出 *</span><span />
                          </div>
                          <div style={{ maxHeight: 300, overflow: 'auto' }}>
                            {fields.map(({ key, name, ...rest }) => (
                              <div key={key} style={{ display: 'grid', gridTemplateColumns: '4fr 3fr 4fr 50px', gap: 8, padding: '12px 16px', borderBottom: '1px solid #f5f5f5', alignItems: 'start' }}>
                                <Form.Item {...rest} name={[name, 'query']} noStyle rules={[{ required: true }]}><Input.TextArea placeholder="用户输入…" rows={2} /></Form.Item>
                                <Form.Item {...rest} name={[name, 'context']} noStyle><Input.TextArea placeholder="上下文（选填）" rows={2} /></Form.Item>
                                <Form.Item {...rest} name={[name, 'expected']} noStyle rules={[{ required: true }]}><Input.TextArea placeholder="期望输出…" rows={2} /></Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>{fields.length > 1 && <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} />}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button type="dashed" onClick={() => add({ query: '', context: '', expected: '' })} block icon={<PlusOutlined />} style={{ marginBottom: 12 }}>添加一行数据</Button>
                      </>
                    )}
                  </Form.List>
                  <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <UploadOutlined style={{ fontSize: 18, color: '#999' }} />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>批量导入</div><div style={{ fontSize: 12, color: '#999' }}>支持上传 CSV 或 JSON 格式文件</div></div>
                    <Upload><Button icon={<UploadOutlined />} size="small">选择文件</Button></Upload>
                    <Button icon={<DownloadOutlined />} size="small">下载模板</Button>
                  </div>
                </div>
              )}
              {createType === 'auto' && (
                <div>
                  <Form.Item name="genTopic" label="生成主题" rules={[{ required: true }]}><Input.TextArea placeholder="如：电诈案件中典型用户问询场景…" rows={3} /></Form.Item>
                  <Row gutter={16}>
                    <Col span={12}><Form.Item name="genCount" label="生成条数" initialValue={50}><Select options={[10, 50, 100, 200].map(n => ({ label: `${n} 条`, value: n }))} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="genModel" label="生成模型" initialValue="qwen-max"><Select options={[{ label: 'Qwen-Max（推荐）', value: 'qwen-max' }, { label: 'Qwen-Plus', value: 'qwen-plus' }]} /></Form.Item></Col>
                  </Row>
                  <div style={{ background: '#f0f5ff', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <RobotOutlined style={{ color: '#1677ff' }} /><span style={{ fontSize: 12, color: '#666' }}>AI 将根据主题描述生成多样化的问答对，生成后可在数据管理中进行逐条审核修改。</span>
                  </div>
                  <Button icon={<ThunderboltOutlined />} block>开始 AI 生成预览</Button>
                </div>
              )}
              {createType === 'mixed' && (
                <div>
                  <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}><UploadOutlined style={{ marginRight: 6 }} />手动导入区</div>
                    <div style={{ fontSize: 12, color: '#999' }}>先录入部分基础数据，再使用 AI 扩充</div>
                  </div>
                  <div style={{ background: '#fafafa', borderRadius: 8, padding: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}><RobotOutlined style={{ marginRight: 6 }} />AI 批量生成区</div>
                    <Form.Item name="genTopic" label="生成主题"><Input.TextArea placeholder="描述主题场景…" rows={2} /></Form.Item>
                    <Row gutter={16}>
                      <Col span={12}><Form.Item name="genCount" label="生成条数" initialValue={50}><Select options={[10, 50, 100].map(n => ({ label: `${n} 条`, value: n }))} /></Form.Item></Col>
                      <Col span={12}><Form.Item name="genModel" label="生成模型" initialValue="qwen-max"><Select options={[{ label: 'Qwen-Max', value: 'qwen-max' }]} /></Form.Item></Col>
                    </Row>
                    <Button icon={<ThunderboltOutlined />}>开始 AI 生成</Button>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <Button onClick={() => setCreateStep(0)}>上一步</Button>
                <Button type="primary" onClick={() => setCreateStep(2)}>下一步</Button>
              </div>
            </div>
          )}
          {createStep === 2 && (
            <div>
              <Card size="small" style={{ borderRadius: 8, borderColor: '#f0f0f0' }} bodyStyle={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}><span style={{ color: '#999' }}>评测集名称</span><span style={{ fontWeight: 600 }}>{form.getFieldValue('name') || '–'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}><span style={{ color: '#999' }}>来源类型</span><span style={{ fontWeight: 600 }}>{createType === 'manual' ? '手动导入' : createType === 'auto' ? '自动生成' : '混合组装'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid #f5f5f5', paddingTop: 8 }}><span style={{ color: '#999' }}>发布策略</span><Tag color={form.getFieldValue('publishNow') ? 'blue' : 'default'} style={{ borderRadius: 4, margin: 0 }}>{form.getFieldValue('publishNow') ? '创建后立即发布 v1.0' : '仅保存为草稿'}</Tag></div>
              </Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <Button onClick={() => setCreateStep(1)}>上一步</Button>
                <Button type="primary" onClick={handleCreateDs}>确认创建</Button>
              </div>
            </div>
          )}
        </Form>
      </Drawer>

      {/* Data Management Drawer */}
      <Drawer title={currentDs?.name || '–'} open={dataDrawer} onClose={() => setDataDrawer(false)} size="56%" styles={{ body: { padding: 0 } }}
        extra={<Tag color="orange" style={{ borderRadius: 4 }}>编辑中草稿（基于 {currentDs?.version || '–'}）</Tag>}>
        <Tabs activeKey={dataTab} onChange={setDataTab} tabBarStyle={{ padding: '0 24px', background: '#fff', margin: 0 }}
          items={[
            {
              key: 'data', label: '数据管理',
              children: (
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Space>
                      <Button icon={<PlusOutlined />} size="small">添加数据</Button>
                      <Button icon={<UploadOutlined />} size="small">上传文件</Button>
                      <Button icon={<ThunderboltOutlined />} size="small">AI 批量生成</Button>
                    </Space>
                    <span style={{ fontSize: 12, color: '#999' }}>共 {MOCK_DATA_ITEMS.length} 条</span>
                  </div>
                  <Table rowKey="id" size="middle" dataSource={MOCK_DATA_ITEMS} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                    columns={[
                      { title: '录入问题', key: 'query', width: '30%', render: (_: any, r: any) => <Tooltip title={r.query}><span className="ellipsis" style={{ fontSize: 12 }}>{r.query}</span></Tooltip> },
                      { title: '背景上下文', key: 'context', width: '25%', render: (_: any, r: any) => <span style={{ fontSize: 12, color: '#999', fontStyle: r.context ? 'normal' : 'italic' }}>{r.context || '–'}</span> },
                      { title: '期望输出', key: 'expected', width: '30%', render: (_: any, r: any) => <Tooltip title={r.expected}><span className="ellipsis" style={{ fontSize: 12 }}>{r.expected}</span></Tooltip> },
                      { title: '操作', width: 120, render: () => <Space size={0}><Button type="link" size="small" style={{ color: '#1677ff' }}>编辑</Button><Button type="link" size="small" danger>移除</Button></Space> },
                    ]}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <Button type="primary" onClick={() => setPublishOpen(true)} style={{ background: '#52c41a', borderColor: '#52c41a' }}>发布新版本</Button>
                  </div>
                </div>
              )
            },
            {
              key: 'versions', label: '历史版本',
              children: (
                <div style={{ padding: '16px 24px' }}>
                  <Table rowKey="version" size="middle" dataSource={MOCK_VERSIONS} pagination={false}
                    columns={[
                      { title: '版本号', dataIndex: 'version', width: 100, render: (v, r) => <span style={{ fontWeight: 700 }}>{v}{r.isLatest && <Tag color="blue" style={{ borderRadius: 4, marginLeft: 8, fontSize: 10 }}>当前</Tag>}</span> },
                      { title: '数据量', dataIndex: 'itemCount', width: 80, render: (n) => <span>{n} 条</span> },
                      { title: '变更说明', dataIndex: 'note', ellipsis: true },
                      { title: '发布人', dataIndex: 'publisher', width: 100 },
                      { title: '发布时间', dataIndex: 'publishedAt', width: 160, render: (t) => <span style={{ fontSize: 12, color: '#999' }}>{t}</span> },
                      { title: '', width: 60, render: () => <Button type="link" size="small" icon={<EyeOutlined />}>预览</Button> },
                    ]}
                  />
                </div>
              )
            },
          ]}
        />
      </Drawer>

      {/* Versions History Drawer */}
      <Drawer title={`版本历史: ${currentDs?.name || '–'}`} open={versionsDrawer} onClose={() => setVersionsDrawer(false)} size="48%">
        <Table rowKey="version" size="middle" dataSource={MOCK_VERSIONS} pagination={false}
          columns={[
            { title: '版本号', dataIndex: 'version', width: 100, render: (v, r) => <span style={{ fontWeight: 700 }}>{v}{r.isLatest && <Tag color="blue" style={{ borderRadius: 4, marginLeft: 8, fontSize: 10 }}>当前</Tag>}</span> },
            { title: '数据量', dataIndex: 'itemCount', width: 80, render: (n) => <span>{n} 条</span> },
            { title: '变更说明', dataIndex: 'note', ellipsis: true },
            { title: '发布人', dataIndex: 'publisher', width: 100 },
            { title: '发布时间', dataIndex: 'publishedAt', width: 160, render: (t) => <span style={{ fontSize: 12, color: '#999' }}>{t}</span> },
            { title: '', width: 60, render: () => <Button type="link" size="small" icon={<EyeOutlined />}>预览</Button> },
          ]}
        />
      </Drawer>

      {/* Publish Modal */}
      <Modal title="发布新版本" open={publishOpen} onCancel={() => setPublishOpen(false)} onOk={() => { publishForm.validateFields().then(() => { message.success('版本 v2.1 发布成功'); setPublishOpen(false); }); }} okText="确认发布" cancelText="取消" width={480} centered>
        <Form form={publishForm} layout="vertical">
          <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>当前数据变更统计</div>
            <div style={{ display: 'flex', gap: 32 }}>
              <div><div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>12</div><div style={{ fontSize: 12, color: '#999' }}>新增</div></div>
              <div><div style={{ fontSize: 24, fontWeight: 700, color: '#faad14' }}>5</div><div style={{ fontSize: 12, color: '#999' }}>修改</div></div>
              <div><div style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f' }}>2</div><div style={{ fontSize: 12, color: '#999' }}>删除</div></div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>版本号: <span style={{ fontWeight: 600, color: '#666' }}>v1.2 → v1.3</span></div>
          </div>
          <Form.Item name="note" label="版本变更说明"><Input.TextArea placeholder="描述本次变更内容（选填）" rows={3} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ═══════════════════════════════════════════════════
// Tab: 评估器
// ═══════════════════════════════════════════════════

const EvaluatorTab: React.FC = () => {
  const [evaluators] = useState(MOCK_EVALUATORS);
  const [evFilters, setEvFilters] = useState<Record<string, any>>({ keyword: '', type: undefined });
  const [drawer, setDrawer] = useState(false);
  const [evalType, setEvalType] = useState<'LLM' | 'CODE'>('LLM');
  const [form] = Form.useForm();
  const [testResult, setTestResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('config');

  const evFilterFields: FilterField[] = [
    { type: 'search', key: 'keyword', placeholder: '评估器名称', width: 200 },
    { type: 'select', key: 'type', placeholder: '评估器类型', width: 140, options: [
      { label: 'LLM 裁判', value: 'LLM' }, { label: 'Code 逻辑', value: 'CODE' },
    ]},
  ];

  const evStats: StatItemSimple[] = [
    { label: '评估器总数', value: evaluators.length, color: '#1677ff' },
    { label: 'LLM 类型', value: evaluators.filter(e => e.type === 'LLM').length, color: '#52c41a' },
    { label: 'Code 类型', value: evaluators.filter(e => e.type === 'CODE').length, color: '#8c8c8c' },
    { label: '累计引用次数', value: evaluators.reduce((s, e) => s + e.useCount, 0).toLocaleString(), color: '#722ed1' },
  ];

  const evColumns: ColumnsType<any> = [
    { title: '评估器名称', dataIndex: 'name', width: 200, render: (t: string, r: any) => (
        <Space>
          <div style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: r.type === 'LLM' ? '#e6f4ff' : '#f5f5f5', color: r.type === 'LLM' ? '#1677ff' : '#999' }}>
            {r.type === 'LLM' ? <RobotOutlined style={{ fontSize: 13 }} /> : <CodeOutlined style={{ fontSize: 13 }} />}
          </div>
          <span style={{ fontWeight: 600 }}>{t}</span>
        </Space>
      )},
    { title: '类型', dataIndex: 'type', width: 80, render: (t) => <Tag style={{ borderRadius: 4, border: 0, background: t === 'LLM' ? '#e6f4ff' : '#f5f5f5', color: t === 'LLM' ? '#1677ff' : '#999' }}>{t}</Tag> },
    { title: '描述', dataIndex: 'description', width: 300, ellipsis: true, render: (t) => <Tooltip title={t}><span style={{ fontSize: 12, color: '#666' }}>{t}</span></Tooltip> },
    { title: '引用次数', dataIndex: 'useCount', width: 100, render: (n) => <span style={{ fontWeight: 600 }}>{n.toLocaleString()}<span style={{ color: '#999', fontWeight: 400, fontSize: 12 }}> 次</span></span> },
    { title: '管理者', dataIndex: 'manager', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', width: 150, render: (t) => <span style={{ fontSize: 12, color: '#999' }}>{t}</span> },
    { title: '操作', width: 180, render: () => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
          <Popconfirm title="确定删除？"><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <StatCards stats={evStats} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <FilterBar
          filters={evFilterFields}
          filterValues={evFilters}
          onFilterChange={(key, value) => setEvFilters(prev => ({ ...prev, [key]: value }))}
          onSearch={() => {}}
          onReset={() => setEvFilters({ keyword: '', type: undefined })}
          onCreate={() => { setDrawer(true); setActiveTab('config'); setEvalType('LLM'); form.resetFields(); setTestResult(null); }}
          createText="创建评估器"
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
          <Table rowKey="id" columns={evColumns} dataSource={evaluators} size="middle"
            pagination={{ defaultPageSize: 10, showTotal: (t) => `共 ${t} 条` }} style={{ marginTop: 12 }} locale={{ emptyText: '暂无评估器' }} />
        </div>
      </div>

      {/* Create/Edit Drawer */}
      <Drawer
        title="创建自定义评估器"
        open={drawer} onClose={() => setDrawer(false)} size="58%" destroyOnClose
        extra={<Space>
          <Button onClick={() => setDrawer(false)}>取消</Button>
          <Button type="primary" icon={<CheckCircleOutlined />}
            onClick={() => form.validateFields().then(() => { message.success('评估器创建成功'); setDrawer(false); })}>确认创建</Button>
        </Space>}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 24 }}
          items={[
            {
              key: 'config', label: '评估器配置',
              children: (
                <Form form={form} layout="vertical">
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#1677ff', borderLeft: '3px solid #1677ff', paddingLeft: 10 }}>评估器类型</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                    {[{ key: 'LLM', label: 'LLM Prompt 裁判', desc: '通过大模型提示词对输出进行智能评估', icon: <RobotOutlined />, bg: '#eff6ff', color: '#1677ff' },
                      { key: 'CODE', label: 'Code 逻辑评估器', desc: '通过脚本代码进行确定性算法评估', icon: <CodeOutlined />, bg: '#f5f5f5', color: '#595959' },
                    ].map(opt => (
                      <div key={opt.key} onClick={() => setEvalType(opt.key as 'LLM' | 'CODE')}
                        style={{ padding: '16px 18px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${evalType === opt.key ? opt.color : '#f0f0f0'}`, background: evalType === opt.key ? opt.bg : '#fff', transition: 'all .2s' }}>
                        <div style={{ fontSize: 22, marginBottom: 8, color: evalType === opt.key ? opt.color : '#ccc' }}>{opt.icon}</div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: evalType === opt.key ? opt.color : '#595959' }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                  <Form.Item name="name" label="评估器名称" rules={[{ required: true }]}><Input placeholder="如：通用准确性评估器" maxLength={40} showCount /></Form.Item>
                  <Form.Item name="desc" label="描述"><Input.TextArea placeholder="描述评估器的评估逻辑和适用场景" rows={2} /></Form.Item>
                  {evalType === 'LLM' && (
                    <>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#1677ff', borderLeft: '3px solid #1677ff', paddingLeft: 10, marginTop: 8 }}>Prompt 配置</div>
                      <Form.Item name="systemPrompt" label="系统提示词" rules={[{ required: true }]}><Input.TextArea rows={6} placeholder={`你是一个专业的智能体输出质量评估专家。请根据以下标准对智能体的输出进行评分：\n\n1. 准确性：回答是否基于事实，是否存在错误信息\n2. 完整性：是否覆盖了用户问题的所有要点\n3. 合规性：是否符合行业规范和约束\n\n请以 JSON 格式返回评分结果...`} /></Form.Item>
                      <Form.Item name="humanPrompt" label="用户提示词模板"><Input.TextArea rows={3} placeholder="支持变量注入：{user_query} {ai_output} {context} {expected_output}" /></Form.Item>
                      <div style={{ fontWeight: 600, fontSize: 14, margin: '8px 0 16px', color: '#1677ff', borderLeft: '3px solid #1677ff', paddingLeft: 10 }}>评分阈值设置</div>
                      <Row gutter={16}>
                        <Col span={8}><Form.Item name="pass" label="合格阈值" initialValue={4.0}><InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} addonAfter="/5.0" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="review" label="人工复核阈值" initialValue={3.0}><InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} addonAfter="/5.0" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="fail" label="直接拒绝阈值" initialValue={1.5}><InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} addonAfter="/5.0" /></Form.Item></Col>
                      </Row>
                    </>
                  )}
                  {evalType === 'CODE' && (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, margin: '8px 0 16px', color: '#1677ff', borderLeft: '3px solid #1677ff', paddingLeft: 10 }}>代码编辑器（暂未开放）</div>
                      <Card size="small" style={{ borderRadius: 8, borderColor: '#f0f0f0', background: '#fafafa' }}>
                        <div style={{ fontSize: 12, color: '#999', whiteSpace: 'pre-wrap' }}>{`def evaluate(user_query, ai_output, expected, context):\n    # 编写你的评估逻辑\n    score = 0\n    # ...\n    return {"score": score, "reason": "..."}\n`}</div>
                        <Button icon={<CodeOutlined />} size="small" disabled style={{ marginTop: 12 }}>代码编辑器开发中</Button>
                      </Card>
                    </div>
                  )}
                </Form>
              )
            },
            {
              key: 'test', label: '测试验证',
              children: (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#1677ff', borderLeft: '3px solid #1677ff', paddingLeft: 10 }}>样本输入</div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>用户问题</div>
                      <Input.TextArea rows={3} placeholder="输入测试用户问题…" defaultValue="有人冒充我的QQ好友借钱，已经转了2000块" />
                    </Col>
                    <Col span={12}>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>期望输出</div>
                      <Input.TextArea rows={3} placeholder="期望的标准回答…" defaultValue="1. 立即联系银行申请止付；2. 保存证据并拨打110；3. 提醒好友改密" />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>AI 实际输出（模拟）</div>
                    <Input.TextArea rows={3} placeholder="在此粘贴或自动填充智能体实际输出…" defaultValue="请尽快去派出所报案处理。如已超过24小时，建议联系银行申请冻结。" />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => setTestResult({ score: 2.5, pass: false, reason: '未提供即时止付操作指导，时间窗口建议有误导性', dimensions: [{ name: '准确性', score: 2.0 }, { name: '完整性', score: 1.5 }, { name: '合规性', score: 3.5 }] })}>运行测试</Button>
                    <Button icon={<DownloadOutlined />}>导入用例</Button>
                  </div>
                  {testResult && (
                    <Card size="small" style={{ borderRadius: 8, borderColor: testResult.pass ? '#b7eb8f' : '#ffa39e', marginTop: 16, background: testResult.pass ? '#f6ffed' : '#fff2f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Space><span style={{ fontWeight: 600 }}>评估结果</span><Tag color={testResult.pass ? 'success' : 'error'} style={{ borderRadius: 4, margin: 0 }}>{testResult.pass ? 'PASS' : 'FAIL'}</Tag></Space>
                        <span style={{ fontSize: 24, fontWeight: 700, color: testResult.pass ? '#52c41a' : '#ff4d4f' }}>{testResult.score.toFixed(1)}<span style={{ fontSize: 14, fontWeight: 400, color: '#ccc' }}>/5.0</span></span>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 12, padding: '8px 12px', background: '#fff', borderRadius: 6 }}><span style={{ fontWeight: 600 }}>评估理由：</span>{testResult.reason}</div>
                      {testResult.dimensions.map((d: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                          <span style={{ color: '#999' }}>{d.name}</span>
                          <span style={{ fontWeight: 600 }}>{d.score.toFixed(1)}/5.0</span>
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              )
            },
          ]}
        />
      </Drawer>
    </>
  );
};

// ═══════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════

export default function AgentEvalPage() {
  const [activeTab, setActiveTab] = useState('tasks');

  const tabItems: PageTabItem[] = [
    { key: 'tasks', label: '测评任务', children: <TaskTab /> },
    { key: 'datasets', label: '数据集', children: <DatasetTab /> },
    { key: 'evaluators', label: '评估器', children: <EvaluatorTab /> },
  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="智能体测评" hint="统一管理评测任务、评测数据集与评估器，全流程保障智能体输出质量" />
      <PageTabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
}