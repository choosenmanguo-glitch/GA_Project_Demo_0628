
import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button, Input, Tag, Space, Typography, Switch, Select, InputNumber,
  Divider, message, Tooltip, Empty,
  Badge, Segmented, DatePicker, Popover, Row, Col, Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend,
  ComposedChart,
} from 'recharts';
import {
  ArrowLeftOutlined,
  SettingOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  UploadOutlined,
  ApiOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
  TeamOutlined,
  RocketOutlined,
  ExperimentOutlined,
  SyncOutlined,
  BulbOutlined,
  ExpandOutlined,
  CompressOutlined,
  RobotOutlined,
  ExportOutlined,
  DownloadOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

import { mockAgentSessions, type SessionLog } from '@/mock/data';
import { SessionDetailDrawer } from '@/components/SessionDetailDrawer';
import { tablePagination } from '@/components/PaginationBar';
import WorkflowEditor from './WorkflowEditor';
import AgentConfigPanel from './AgentConfigPanel';

// ════════════════════════════════════════════════
// Design System
// ════════════════════════════════════════════════

const DS = {
  // Primary palette
  blue: '#1677ff',
  blueLight: '#e6f4ff',
  blueDark: '#0958d9',

  // Neutral
  white: '#ffffff',
  bg: '#f5f6f8',
  card: '#ffffff',
  text: 'rgba(0,0,0,0.88)',
  textSec: 'rgba(0,0,0,0.52)',
  textTer: 'rgba(0,0,0,0.34)',
  border: '#e8ebf0',
  divider: '#f0f1f3',

  // Semantic
  green: '#52c41a',
  greenLight: '#f6ffed',
  orange: '#fa8c16',
  orangeLight: '#fff7e6',
  red: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',

  // Typography
  title: { fontSize: 15, fontWeight: 700, color: 'rgba(0,0,0,0.88)', letterSpacing: '-0.01em' },
  label: { fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.72)', lineHeight: '20px' },
  body: { fontSize: 13, color: 'rgba(0,0,0,0.58)', lineHeight: '1.6' },
  caption: { fontSize: 11, color: 'rgba(0,0,0,0.4)' },

  // Shadows
  cardShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
  hoverShadow: '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)',
  popShadow: '0 8px 40px rgba(0,0,0,0.12)',

  // Radii
  radius: 10,
  radiusSm: 8,
  radiusXs: 6,

  // Layout
  navWidth: 200,
};

// ════════════════════════════════════════════════
// Types & Mock Data
// ════════════════════════════════════════════════

type AgentType = 'standard' | 'workflow' | 'autonomous';
type NavKey = 'config' | 'publish' | 'logs' | 'stats';

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  subType: string;
  subTypeLabel: string;
  status: 'draft' | 'published' | 'offline';
  avatar: string;
}

const MOCK_AGENT: AgentInfo = {
  id: 'agent-001', name: '110接警警情分析助手',
  description: '自动提取警情要素，分类录入接处警系统，支持通话转写文本的结构化处理。',
  type: 'standard', subType: 'smart_extract', subTypeLabel: '智能抽取',
  status: 'draft', avatar: 'police',
};

const navItems: { key: NavKey; label: string; icon: React.ReactNode }[] = [
  { key: 'config', label: '配置', icon: <SettingOutlined /> },
  { key: 'publish', label: '发布', icon: <RocketOutlined /> },
  { key: 'logs', label: '日志', icon: <FileTextOutlined /> },
  { key: 'stats', label: '统计', icon: <BarChartOutlined /> },
];

const navTitleMap: Record<NavKey, string> = {
  config: '配置', publish: '发布', logs: '日志', stats: '统计',
};

const typeLabel: Record<AgentType, string> = {
  standard: '标准智能体', workflow: '流程智能体', autonomous: '自主智能体',
};

const MOCK_MODELS = [
  { value: 'deepseek-chat', label: 'DeepSeek-Chat', vendor: 'DeepSeek', tags: ['对话', '长文本'] },
  { value: 'deepseek-reasoner', label: 'DeepSeek-Reasoner', vendor: 'DeepSeek', tags: ['推理', '数学'] },
  { value: 'gpt-4o', label: 'GPT-4o', vendor: 'OpenAI', tags: ['多模态', '长文本'] },
  { value: 'qwen-72b', label: 'Qwen-72B-Chat', vendor: 'Alibaba', tags: ['国产', '长文本'] },
];

const MOCK_KNOWLEDGE_BASES = [
  { value: 'kb-1', label: '警情分类知识库' },
  { value: 'kb-2', label: '接处警规程库' },
  { value: 'kb-3', label: '法律法规库' },
  { value: 'kb-4', label: '案件卷宗库' },
];

const MOCK_TOOLS = [
  { value: 'tool-1', label: '文书智能解析', type: '插件' },
  { value: 'tool-2', label: '关系图谱生成', type: '插件' },
  { value: 'tool-3', label: '人口信息查询', type: 'API' },
  { value: 'tool-4', label: '警情统计分析', type: '工作流' },
];

const avatarPresets = [
  { key: 'police', color: DS.blue, bg: DS.blueLight, label: '警' },
  { key: 'shield', color: DS.green, bg: DS.greenLight, label: '盾' },
  { key: 'search', color: DS.purple, bg: '#f9f0ff', label: '侦' },
  { key: 'brain', color: DS.orange, bg: DS.orangeLight, label: '析' },
  { key: 'doc', color: DS.cyan, bg: '#e6fffb', label: '文' },
  { key: 'chat', color: '#eb2f96', bg: '#fff0f6', label: '答' },
];

const channelColorMap: Record<string, string> = { 'Web端': 'blue', 'API': 'purple', '企业微信': 'green', '第三方': 'orange' };
const statusStyle: Record<string, { color: string; bg: string }> = {
  '正常运行': { color: '#52c41a', bg: '#f6ffed' },
  '部分报错': { color: '#faad14', bg: '#fffbe6' },
  '全部报错': { color: '#ff4d4f', bg: '#fff2f0' },
};

const MOCK_OPERATION_LOGS = [
  { id: 'op1', time: '2026-06-26 15:32:08', op: '张警官', action: '修改配置', summary: '更新提示词内容，调整模型温度参数为0.3' },
  { id: 'op2', time: '2026-06-26 14:18:22', op: '张警官', action: '版本恢复', summary: '从 v1.2.0 恢复为当前草稿' },
  { id: 'op3', time: '2026-06-26 10:05:41', op: '李警官', action: '修改配置', summary: '新增知识库关联：道路交通安全法规库' },
  { id: 'op4', time: '2026-06-25 16:00:15', op: '李警官', action: '发布上线', summary: '版本 v1.2.0 发布至智能体广场及API接口' },
  { id: 'op5', time: '2026-06-25 10:15:30', op: '李警官', action: '修改配置', summary: '优化对话开场白文案，新增文件上传白名单配置' },
  { id: 'op6', time: '2026-06-24 09:08:12', op: '张警官', action: '创建', summary: '通过「接处警警情分析」模板创建智能体' },
];

const actionColorMap: Record<string, string> = {
  '创建': '#52c41a', '修改配置': '#1677ff', '发布上线': '#722ed1',
  '下架': '#fa8c16', '版本恢复': '#13c2c2',
};

interface AgentLogsPanelProps {
  agentId: string;
}

// ════════════════════════════════════════════════
// Logs Panel
// ════════════════════════════════════════════════

const AgentLogsPanel: React.FC<AgentLogsPanelProps> = ({ agentId }) => {
  const [activeTab, setActiveTab] = useState<'conversations' | 'operations'>('conversations');
  const [drawerSession, setDrawerSession] = useState<SessionLog | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [channelFilter, setChannelFilter] = useState<string | undefined>();

  const sessions = mockAgentSessions[agentId] || [];

  // ── Stats ──
  const stats = useMemo(() => {
    const total = sessions.length;
    const errors = sessions.filter(s => s.status !== '正常运行').length;
    const avgMessages = total > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.messageCount, 0) / total) : 0;
    return { total, errors, avgMessages, active: sessions.filter(s => s.status === '正常运行').length };
  }, [sessions]);

  // ── Filtered sessions ──
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (searchText && !s.title.includes(searchText) && !s.userName.includes(searchText) && !s.id.includes(searchText)) return false;
      if (statusFilter === 'success' && s.status !== '正常运行') return false;
      if (statusFilter === 'error' && s.status === '正常运行') return false;
      if (channelFilter && s.channel !== channelFilter) return false;
      return true;
    });
  }, [sessions, searchText, statusFilter, channelFilter]);

  // ── Columns ──
  const columns: ColumnsType<SessionLog> = useMemo(() => [
    { title: '会话ID', dataIndex: 'id', width: 150, render: (id: string) => (
      <Text code style={{ fontSize: 12 }}>{id}</Text>
    )},
    { title: '渠道', dataIndex: 'channel', width: 90, render: (c: string) => (
      <Tag color={channelColorMap[c] || 'default'}>{c}</Tag>
    )},
    { title: '使用者', dataIndex: 'userName', width: 100, render: (n: string) => (
      <span style={{ fontWeight: 500 }}>{n}</span>
    )},
    { title: '对话标题', dataIndex: 'title', width: 280, ellipsis: true },
    { title: '消息数', dataIndex: 'messageCount', width: 80, align: 'center' as const },
    { title: 'Token', dataIndex: 'tokenConsumption', width: 90, render: (n: number) => n.toLocaleString(),
      sorter: (a: SessionLog, b: SessionLog) => a.tokenConsumption - b.tokenConsumption,
    },
    { title: '开始时间', dataIndex: 'startTime', width: 140,
      sorter: (a: SessionLog, b: SessionLog) => a.startTime.localeCompare(b.startTime),
    },
    { title: '最后活跃', dataIndex: 'lastActive', width: 140, defaultSortOrder: 'descend' as const,
      sorter: (a: SessionLog, b: SessionLog) => a.lastActive.localeCompare(b.lastActive),
    },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => {
      const st = statusStyle[s] || { color: '#999', bg: '#f5f5f5' };
      return <Tag style={{ color: st.color, background: st.bg, borderColor: st.color, borderRadius: 4, margin: 0 }}>{s}</Tag>;
    }},
    { title: '操作', width: 80, render: (_, r) => (
      <Button type="link" size="small" onClick={() => setDrawerSession(r)}>查看详情</Button>
    )},
  ], []);

  // ── Stats cards ──
  const statCards = [
    { label: '会话总数', value: stats.total, color: DS.blue },
    { label: '活跃会话', value: stats.active, color: DS.green },
    { label: '平均消息', value: stats.avgMessages, color: DS.purple },
    { label: '异常会话', value: stats.errors, color: DS.red },
  ];

  // ═══════════════════════ RENDER ═══════════════════════
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Sub-tab Bar */}
      <div style={{ padding: '16px 24px 0', borderBottom: `1px solid ${DS.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Segmented
            value={activeTab}
            onChange={(val) => setActiveTab(val as 'conversations' | 'operations')}
            options={[
              { label: '对话日志', value: 'conversations' },
              { label: '操作日志', value: 'operations' },
            ]}
            style={{ borderRadius: DS.radiusXs }}
          />
          {activeTab === 'conversations' && (
            <Button size="small" icon={<SyncOutlined />} style={{ borderRadius: DS.radiusXs }}>刷新</Button>
          )}
        </div>
      </div>

      {/* ── Conversations Tab ── */}
      {activeTab === 'conversations' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Stat cards */}
          <div style={{ padding: '20px 24px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {statCards.map((sc) => (
                <div key={sc.label} style={{
                  background: DS.card, borderRadius: DS.radiusSm,
                  border: `1px solid ${DS.border}`, padding: '16px 20px',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  boxShadow: DS.cardShadow,
                }}>
                  <span style={{ fontSize: 11, color: DS.textTer, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{sc.label}</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: sc.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{sc.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ padding: '16px 24px 0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Input.Search
              placeholder="搜索会话标题、使用者或ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
              style={{ width: 280 }}
              allowClear
            />
            <Select
              placeholder="全部状态"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: 120 }}
              options={[
                { label: '全部状态', value: undefined },
                { label: '成功', value: 'success' },
                { label: '报错', value: 'error' },
              ]}
            />
            <Select
              placeholder="全部渠道"
              value={channelFilter}
              onChange={setChannelFilter}
              allowClear
              style={{ width: 120 }}
              options={[
                { label: '全部渠道', value: undefined },
                { label: 'Web端', value: 'Web端' },
                { label: 'API', value: 'API' },
                { label: '企业微信', value: '企业微信' },
                { label: '第三方', value: '第三方' },
              ]}
            />
            <div style={{ marginLeft: 'auto' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                共 {filteredSessions.length} 条会话
              </Text>
            </div>
          </div>

          {/* Table */}
          <div style={{ flex: 1, padding: '12px 24px 24px', overflow: 'hidden' }}>
            <div style={{ height: '100%', overflow: 'auto', background: DS.card, borderRadius: DS.radius, border: `1px solid ${DS.border}`, boxShadow: DS.cardShadow }}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredSessions}
                size="middle"
                pagination={tablePagination()}
                style={{ margin: 0 }}
                locale={{ emptyText: <Empty description="暂无对话记录" /> }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Operations Tab ── */}
      {activeTab === 'operations' && (
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
          <div style={{
            background: DS.card, borderRadius: DS.radius,
            border: `1px solid ${DS.border}`, boxShadow: DS.cardShadow,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px 0' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>配置变更历史</span>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              {MOCK_OPERATION_LOGS.map((log, idx) => (
                <div key={log.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '14px 0',
                    borderBottom: idx < MOCK_OPERATION_LOGS.length - 1 ? `1px solid ${DS.divider}` : 'none',
                    position: 'relative',
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{
                    minWidth: 8, height: 8, borderRadius: '50%',
                    background: actionColorMap[log.action] || DS.blue,
                    marginTop: 6, flexShrink: 0,
                    boxShadow: `0 0 0 3px ${(actionColorMap[log.action] || DS.blue) + '28'}`,
                  }} />
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, fontFamily: 'monospace', color: DS.textTer }}>{log.time}</Text>
                      <Tag style={{
                        borderRadius: 4, margin: 0, fontSize: 11,
                        color: actionColorMap[log.action], background: (actionColorMap[log.action] || DS.blue) + '14',
                        border: 'none', fontWeight: 500,
                      }}>{log.action}</Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: DS.text }}>{log.op}</span>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 2, display: 'block' }}>{log.summary}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <SessionDetailDrawer
        open={drawerSession !== null}
        session={drawerSession}
        onClose={() => setDrawerSession(null)}
      />
    </div>
  );
};

// ════════════════════════════════════════════════
// Stats Panel
// ════════════════════════════════════════════════

const { RangePicker } = DatePicker;

// ── Mock daily data (7 days) ──
const MOCK_DAILY_DATA = [
  { date: '06/20', users: 42, deptUsers: 8, calls: 1823, inputTokens: 245000, outputTokens: 98000, likes: 128, dislikes: 5, errors: 12, avgLatency: 1.18, p50: 0.82, p95: 2.41 },
  { date: '06/21', users: 38, deptUsers: 7, calls: 1650, inputTokens: 218000, outputTokens: 87000, likes: 115, dislikes: 3, errors: 8, avgLatency: 1.22, p50: 0.85, p95: 2.55 },
  { date: '06/22', users: 29, deptUsers: 5, calls: 1240, inputTokens: 168000, outputTokens: 62000, likes: 82, dislikes: 2, errors: 5, avgLatency: 1.15, p50: 0.79, p95: 2.18 },
  { date: '06/23', users: 51, deptUsers: 10, calls: 2140, inputTokens: 291000, outputTokens: 118000, likes: 156, dislikes: 7, errors: 15, avgLatency: 1.31, p50: 0.91, p95: 2.89 },
  { date: '06/24', users: 55, deptUsers: 11, calls: 2380, inputTokens: 324000, outputTokens: 132000, likes: 178, dislikes: 9, errors: 18, avgLatency: 1.28, p50: 0.88, p95: 2.68 },
  { date: '06/25', users: 47, deptUsers: 9, calls: 1980, inputTokens: 272000, outputTokens: 108000, likes: 142, dislikes: 4, errors: 10, avgLatency: 1.19, p50: 0.81, p95: 2.35 },
  { date: '06/26', users: 63, deptUsers: 12, calls: 2567, inputTokens: 356000, outputTokens: 148000, likes: 195, dislikes: 6, errors: 14, avgLatency: 1.24, p50: 0.84, p95: 2.52 },
];

const MOCK_CHANNEL_DATA = [
  { name: '智能体广场', value: 8540 },
  { name: 'API 接口', value: 3120 },
  { name: 'MCP', value: 980 },
  { name: '第三方集成', value: 520 },
];

const CHANNEL_COLORS = ['#1677ff', '#52c41a', '#722ed1', '#fa8c16'];

const MOCK_MODEL_USAGE = [
  { name: 'DeepSeek-Chat', tokens: 1280000 },
  { name: 'DeepSeek-Reasoner', tokens: 460000 },
  { name: 'GPT-4o', tokens: 210000 },
  { name: 'Qwen-72B', tokens: 85000 },
];

const MOCK_USER_RANKING = {
  calls: [
    { name: '张警官', dept: '刑侦支队', value: 326 },
    { name: '李警官', dept: '治安管理支队', value: 258 },
    { name: '王警官', dept: '经侦支队', value: 192 },
    { name: '赵警官', dept: '刑侦支队', value: 167 },
    { name: '陈警官', dept: '交巡警支队', value: 145 },
    { name: '刘警官', dept: '禁毒支队', value: 128 },
    { name: '孙警官', dept: '网安支队', value: 112 },
    { name: '周警官', dept: '刑侦支队', value: 98 },
    { name: '吴警官', dept: '治安管理支队', value: 85 },
    { name: '郑警官', dept: '经侦支队', value: 72 },
  ],
  activeDays: [
    { name: '李警官', dept: '治安管理支队', value: 28 },
    { name: '张警官', dept: '刑侦支队', value: 26 },
    { name: '王警官', dept: '经侦支队', value: 24 },
    { name: '赵警官', dept: '刑侦支队', value: 22 },
    { name: '陈警官', dept: '交巡警支队', value: 21 },
    { name: '刘警官', dept: '禁毒支队', value: 20 },
    { name: '孙警官', dept: '网安支队', value: 18 },
    { name: '周警官', dept: '刑侦支队', value: 16 },
    { name: '吴警官', dept: '治安管理支队', value: 15 },
    { name: '郑警官', dept: '经侦支队', value: 14 },
  ],
  tokens: [
    { name: '张警官', dept: '刑侦支队', value: 486000 },
    { name: '李警官', dept: '治安管理支队', value: 412000 },
    { name: '王警官', dept: '经侦支队', value: 358000 },
    { name: '赵警官', dept: '刑侦支队', value: 264000 },
    { name: '陈警官', dept: '交巡警支队', value: 228000 },
    { name: '刘警官', dept: '禁毒支队', value: 196000 },
    { name: '孙警官', dept: '网安支队', value: 172000 },
    { name: '周警官', dept: '刑侦支队', value: 148000 },
    { name: '吴警官', dept: '治安管理支队', value: 126000 },
    { name: '郑警官', dept: '经侦支队', value: 108000 },
  ],
};

const MOCK_DEPT_RANKING = {
  calls: [
    { name: '刑侦支队', value: 2840 },
    { name: '治安管理支队', value: 2150 },
    { name: '经侦支队', value: 1680 },
    { name: '交巡警支队', value: 1420 },
    { name: '禁毒支队', value: 980 },
    { name: '网安支队', value: 860 },
    { name: '法制支队', value: 620 },
    { name: '出入境管理支队', value: 480 },
    { name: '反恐支队', value: 380 },
    { name: '技术侦察支队', value: 320 },
  ],
  activeDays: [
    { name: '刑侦支队', value: 30 },
    { name: '治安管理支队', value: 28 },
    { name: '经侦支队', value: 26 },
    { name: '交巡警支队', value: 25 },
    { name: '禁毒支队', value: 22 },
    { name: '网安支队', value: 20 },
    { name: '法制支队', value: 18 },
    { name: '出入境管理支队', value: 15 },
    { name: '反恐支队', value: 14 },
    { name: '技术侦察支队', value: 12 },
  ],
  tokens: [
    { name: '刑侦支队', value: 1480000 },
    { name: '治安管理支队', value: 1120000 },
    { name: '经侦支队', value: 860000 },
    { name: '交巡警支队', value: 720000 },
    { name: '禁毒支队', value: 560000 },
    { name: '网安支队', value: 420000 },
    { name: '法制支队', value: 320000 },
    { name: '出入境管理支队', value: 260000 },
    { name: '反恐支队', value: 180000 },
    { name: '技术侦察支队', value: 140000 },
  ],
};

type RangeKey = '7d' | '30d' | 'custom';
type RankDim = 'calls' | 'activeDays' | 'tokens';

// ── Mini stat card with trend ──
const StatCard: React.FC<{
  title: string; value: string; icon: React.ReactNode;
  color: string; trend?: { direction: 'up' | 'down'; pct: number };
  sub?: string;
  tip?: string;
}> = ({ title, value, icon, color, trend, sub, tip }) => (
  <div style={{
    background: DS.card, borderRadius: DS.radius,
    border: `1px solid ${DS.border}`, boxShadow: DS.cardShadow,
    padding: '18px 20px', flex: '1 1 0', minWidth: 0,
    transition: 'box-shadow 0.2s, transform 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = DS.hoverShadow; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = DS.cardShadow; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{title}</Text>
        {tip && (
          <Tooltip title={tip}>
            <InfoCircleOutlined style={{ color: DS.textTer, fontSize: 11, cursor: 'help' }} />
          </Tooltip>
        )}
      </div>
      <span style={{ color: color + '99', fontSize: 15 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: '34px', marginBottom: 6 }}>{value}</div>
    {trend && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {trend.direction === 'up'
          ? <CaretUpOutlined style={{ color: DS.green, fontSize: 12 }} />
          : <CaretDownOutlined style={{ color: DS.red, fontSize: 12 }} />
        }
        <span style={{ fontSize: 11, fontWeight: 600, color: trend.direction === 'up' ? DS.green : DS.red }}>
          {trend.pct}%
        </span>
        <Text type="secondary" style={{ fontSize: 10 }}>vs 上周期</Text>
      </div>
    )}
    {sub && !trend && (
      <Text type="secondary" style={{ fontSize: 10, lineHeight: '15px' }}>{sub}</Text>
    )}
  </div>
);

// ── Chart card wrapper ──
const ChartCard: React.FC<{
  title: string; icon: React.ReactNode;
  subtitle?: string;
  tip?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, icon, subtitle, tip, children, style }) => (
  <div style={{
    background: DS.card, borderRadius: DS.radius,
    border: `1px solid ${DS.border}`, boxShadow: DS.cardShadow,
    padding: '20px 22px', transition: 'box-shadow 0.2s',
    ...style,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ color: DS.blue, fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: DS.text }}>{title}</span>
      {tip && (
        <Tooltip title={tip} placement="top">
          <InfoCircleOutlined style={{ color: DS.textTer, fontSize: 13, cursor: 'help' }} />
        </Tooltip>
      )}
      {subtitle && <Text type="secondary" style={{ fontSize: 11, marginLeft: 'auto' }}>{subtitle}</Text>}
    </div>
    {children}
  </div>
);

// ── Ranking table ──
const RankingTable: React.FC<{
  data: { name: string; dept?: string; value: number }[];
  valueLabel: string;
}> = ({ data, valueLabel }) => {
  const rankBadge = (idx: number): React.CSSProperties => {
    if (idx === 0) return { background: 'linear-gradient(135deg, #f5a623, #f7b84e)', color: '#fff', fontWeight: 700 };
    if (idx === 1) return { background: 'linear-gradient(135deg, #a0aab4, #c0c8d0)', color: '#fff', fontWeight: 700 };
    if (idx === 2) return { background: 'linear-gradient(135deg, #d4926a, #e0a882)', color: '#fff', fontWeight: 700 };
    return { background: DS.bg, color: DS.textSec, fontWeight: 500 };
  };
  const fmt = (v: number) => valueLabel === 'tokens' ? (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)) : String(v);

  return (
    <div style={{ maxHeight: 440, overflow: 'auto' }}>
      {data.map((item, idx) => (
        <div key={item.name} style={{
          display: 'flex', alignItems: 'center', padding: '8px 0',
          borderBottom: idx < data.length - 1 ? `1px solid ${DS.divider}` : 'none',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, fontSize: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 10, flexShrink: 0,
            ...rankBadge(idx),
          }}>{idx + 1}</div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: DS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: item.dept ? 0 : 1 }}>{item.name}</div>
            {item.dept && (
              <span style={{ fontSize: 10, color: DS.textTer, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {item.dept}
              </span>
            )}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: DS.text, fontFeatureSettings: '"tnum"', marginLeft: 12 }}>{fmt(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Custom Tooltip ──
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', borderRadius: 6, padding: '10px 14px',
      border: '1px solid #e8ebf0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontSize: 12,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: DS.text }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, lineHeight: '20px' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
          <span style={{ color: DS.textSec }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: DS.text, marginLeft: 'auto' }}>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════ MAIN COMPONENT ═══════════════
const StatsPanel: React.FC = () => {
  const [rangeKey, setRangeKey] = useState<RangeKey>('7d');
  const [customRange, setCustomRange] = useState<[any, any] | null>(null);
  const [rankDim, setRankDim] = useState<RankDim>('calls');
  const [exportPopOpen, setExportPopOpen] = useState(false);

  // Compute aggregates
  const total = useMemo(() => {
    const data = MOCK_DAILY_DATA;
    const input = data.reduce((s, d) => s + d.inputTokens, 0);
    const output = data.reduce((s, d) => s + d.outputTokens, 0);
    return {
      users: data[data.length - 1].users * 6.5,       // cumulative ≈ peak daily × multiplier
      calls: data.reduce((s, d) => s + d.calls, 0),
      tokens: input + output,
      likes: data.reduce((s, d) => s + d.likes, 0),
      successRate: ((data.reduce((s, d) => s + d.calls, 0) - data.reduce((s, d) => s + d.errors, 0)) / data.reduce((s, d) => s + d.calls, 0) * 100).toFixed(1),
      avgLatency: (data.reduce((s, d) => s + d.avgLatency * d.calls, 0) / data.reduce((s, d) => s + d.calls, 0)).toFixed(2),
      p50: (data.reduce((s, d) => s + d.p50 * d.calls, 0) / data.reduce((s, d) => s + d.calls, 0)).toFixed(2),
      p95: (data.reduce((s, d) => s + d.p95 * d.calls, 0) / data.reduce((s, d) => s + d.calls, 0)).toFixed(2),
    };
  }, []);

  const fmtNum = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

  // Handle export
  const handleExport = (type: 'pdf' | 'csv') => {
    setExportPopOpen(false);
    message.loading({ content: `正在导出${type === 'pdf' ? 'PDF 报表' : 'CSV 数据'}…`, key: 'export', duration: 1.5 });
    setTimeout(() => {
      message.success({ content: `${type === 'pdf' ? 'PDF 报表' : 'CSV 数据'}导出成功`, key: 'export' });
    }, 1500);
  };

  const exportContent = (
    <div style={{ padding: 4, minWidth: 180 }}>
      <div
        onClick={() => handleExport('pdf')}
        style={{
          padding: '8px 12px', borderRadius: DS.radiusXs, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = DS.bg; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <FileTextOutlined style={{ color: DS.blue }} /> 导出报表为 PDF
      </div>
      <div
        onClick={() => handleExport('csv')}
        style={{
          padding: '8px 12px', borderRadius: DS.radiusXs, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = DS.bg; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <DownloadOutlined style={{ color: DS.green }} /> 导出原始数据 (CSV)
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ padding: '28px 36px 40px' }}>

        {/* ═══ Header + time picker ═══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em' }}>运营统计</span>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>多维度运营数据看板</Text>
          </div>
          <Space size={12}>
            <Segmented
              options={[
                { value: '7d', label: '近七天' },
                { value: '30d', label: '近三十天' },
                { value: 'custom', label: '自定义' },
              ]}
              value={rangeKey}
              onChange={v => setRangeKey(v as RangeKey)}
            />
            {rangeKey === 'custom' && (
              <RangePicker size="small" value={customRange as any}
                onChange={(dates: any) => setCustomRange(dates)}
                style={{ borderRadius: DS.radiusXs }} />
            )}
            <Popover content={exportContent} trigger="click" open={exportPopOpen} onOpenChange={setExportPopOpen} placement="bottomRight">
              <Button icon={<ExportOutlined />} style={{ borderRadius: DS.radiusXs, fontWeight: 500 }}>导出报表</Button>
            </Popover>
          </Space>
        </div>

        {/* ═══ Metric Cards (6 cols) ═══ */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard title="累计用户数" value={fmtNum(total.users)} icon={<TeamOutlined />} color={DS.blue}
            trend={{ direction: 'up', pct: 12 }} tip="统计周期内至少调用过一次智能体的去重用户总数" />
          <StatCard title="累计调用次数" value={fmtNum(total.calls)} icon={<ThunderboltFilled />} color={DS.purple}
            trend={{ direction: 'up', pct: 8.5 }} tip="统计周期内智能体被调用的总次数，包括广场、API、MCP等所有渠道" />
          <StatCard title="累计Token消耗" value={fmtNum(total.tokens)} icon={<SettingOutlined />} color={DS.cyan}
            trend={{ direction: 'up', pct: 15.2 }} tip="统计周期内 Input Token + Output Token 的总消耗量" />
          <StatCard title="好评总数" value={fmtNum(total.likes)} icon={<StarOutlined />} color={DS.green}
            trend={{ direction: 'up', pct: 6.8 }} tip="用户对智能体回答进行点赞评价的总次数" />
          <StatCard title="运行成功率" value={`${total.successRate}%`} icon={<CheckCircleFilled />} color={DS.green}
            tip="智能体正常返回结果且未触发内容审查拦截的调用占比" />
          <StatCard
            title="平均响应耗时"
            value={`${total.avgLatency}s`}
            icon={<ThunderboltOutlined />}
            color={DS.orange}
            sub={`P50 ${total.p50}s · P95 ${total.p95}s · P99 3.8s`}
            tip="从用户发送消息到智能体返回首字的平均耗时，同时展示 P50/P95/P99 分位延迟"
          />
        </div>

        {/* ═══ Charts (2-col grid) ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Call trend */}
          <ChartCard title="调用次数趋势" icon={<ThunderboltFilled />} tip="展示智能体被调用次数的逐日变化趋势，面积图填充区域反映调用波动幅度">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MOCK_DAILY_DATA}>
                <defs>
                  <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={DS.blue} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={DS.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={DS.divider} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: DS.textTer }} axisLine={{ stroke: DS.divider }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: DS.textTer }} axisLine={false} tickLine={false} width={40} />
                <ReTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="calls" name="调用次数" stroke={DS.blue} strokeWidth={2} fill="url(#callsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Active users + depts trend */}
          <ChartCard title="活跃用户与部门趋势" icon={<TeamOutlined />} tip="蓝色柱状图展示每日活跃用户数，紫色折线叠加展示活跃部门数变化趋势">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={MOCK_DAILY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={DS.divider} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: DS.textTer }} axisLine={{ stroke: DS.divider }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: DS.textTer }} axisLine={false} tickLine={false} width={35} />
                <ReTooltip content={<ChartTooltip />} />
                <Bar yAxisId="left" dataKey="users" name="活跃用户" fill={`${DS.blue}40`} radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="deptUsers" name="活跃部门" stroke={DS.purple} strokeWidth={2} dot={{ r: 3, fill: DS.purple }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Token trend (dual line) */}
          <ChartCard title="Token 消耗趋势" icon={<SettingOutlined />} subtitle="Input / Output" tip="绿色折线为输入 Token 消耗量，橙色折线为输出 Token 消耗量，单位 K">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={MOCK_DAILY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={DS.divider} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: DS.textTer }} axisLine={{ stroke: DS.divider }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: DS.textTer }} axisLine={false} tickLine={false} width={45} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <ReTooltip content={<ChartTooltip />} />
                <Legend iconType="rect" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                <Line type="monotone" dataKey="inputTokens" name="Input Token" stroke={DS.green} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outputTokens" name="Output Token" stroke={DS.orange} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Average per dialog */}
          <ChartCard title="每次对话平均消耗" icon={<ExperimentOutlined />} tip="统计周期内单次对话的平均 Input、Output 及总 Token 消耗量，用于分析单次对话成本">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Input', value: 142 },
                { name: 'Output', value: 58 },
                { name: 'Total', value: 200 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={DS.divider} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: DS.textSec }} axisLine={{ stroke: DS.divider }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: DS.textTer }} axisLine={false} tickLine={false} width={35}
                  tickFormatter={v => `${v}`} />
                <ReTooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="Token" radius={[4, 4, 0, 0]}>
                  <Cell fill={DS.green} fillOpacity={0.8} />
                  <Cell fill={DS.orange} fillOpacity={0.8} />
                  <Cell fill={DS.blue} fillOpacity={0.8} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Latency trend */}
          <ChartCard title="响应耗时趋势" icon={<ThunderboltOutlined />} subtitle="P50 / P95" tip="蓝色实线为 P50 中位耗时，橙色虚线为 P95 高延迟耗时，用于监控性能退化">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={MOCK_DAILY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={DS.divider} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: DS.textTer }} axisLine={{ stroke: DS.divider }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: DS.textTer }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${v}s`} />
                <ReTooltip content={<ChartTooltip />} />
                <Legend iconType="rect" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                <Line type="monotone" dataKey="p50" name="P50" stroke={DS.blue} strokeWidth={2} dot={{ r: 3, fill: DS.blue }} />
                <Line type="monotone" dataKey="p95" name="P95" stroke={DS.orange} strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3, fill: DS.orange }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Error stats */}
          <ChartCard title="运行错误统计" icon={<SafetyCertificateOutlined />} tip="展示每日运行错误次数，柱体颜色越深表示错误率越高。错误定义为智能体返回异常或内容审查拦截">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MOCK_DAILY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={DS.divider} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: DS.textTer }} axisLine={{ stroke: DS.divider }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: DS.textTer }} axisLine={false} tickLine={false} width={25} />
                <ReTooltip content={<ChartTooltip />} />
                <Bar dataKey="errors" name="错误次数" radius={[4, 4, 0, 0]}>
                  {MOCK_DAILY_DATA.map((_, idx) => (
                    <Cell key={idx} fill={DS.red} fillOpacity={0.55 + idx * 0.05} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* User feedback trend */}
          <ChartCard title="用户评价趋势" icon={<StarOutlined />} tip="堆叠柱状图展示每日点赞（绿色）与点踩（红色）数量，高度为当日评价总数">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={MOCK_DAILY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={DS.divider} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: DS.textTer }} axisLine={{ stroke: DS.divider }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: DS.textTer }} axisLine={false} tickLine={false} width={30} />
                <ReTooltip content={<ChartTooltip />} />
                <Bar yAxisId="left" dataKey="likes" name="点赞" fill={`${DS.green}60`} radius={[4, 4, 0, 0]} stackId="feedback" />
                <Bar yAxisId="left" dataKey="dislikes" name="点踩" fill={`${DS.red}40`} radius={[4, 4, 0, 0]} stackId="feedback" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Channel distribution pie */}
          <ChartCard title="使用渠道分布" icon={<ApiOutlined />} tip="各使用渠道（广场、API、MCP、第三方集成）的调用占比环形图，扇区越大表示该渠道调用越活跃">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={MOCK_CHANNEL_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}
                  dataKey="value" stroke="none">
                  {MOCK_CHANNEL_DATA.map((_, idx) => (
                    <Cell key={idx} fill={CHANNEL_COLORS[idx]} />
                  ))}
                </Pie>
                <ReTooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(value: string) => <span style={{ color: DS.textSec }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Model usage */}
          <ChartCard title="按模型用量分布" icon={<RobotOutlined />} tip="横向柱状图对比各模型消耗的 Token 量排名，条形越长表示该模型被调用越频繁、消耗越多">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MOCK_MODEL_USAGE} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={DS.divider} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: DS.textTer }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: DS.textSec }} axisLine={false} tickLine={false} width={95} />
                <ReTooltip content={<ChartTooltip />} />
                <Bar dataKey="tokens" name="Token消耗" radius={[0, 4, 4, 0]} fill={DS.blue} fillOpacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ═══ Rankings ═══ */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Segmented size="small"
            options={[
              { value: 'calls', label: '对话次数' },
              { value: 'activeDays', label: '活跃天数' },
              { value: 'tokens', label: 'Token消耗' },
            ]}
            value={rankDim} onChange={v => setRankDim(v as RankDim)}
          />
        </div>

        <Row gutter={24}>
          {/* User ranking */}
          <Col span={12}>
            <div style={{
              background: DS.card, borderRadius: DS.radius,
              border: `1px solid ${DS.border}`, boxShadow: DS.cardShadow,
              padding: '20px 22px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrophyOutlined style={{ color: DS.orange, fontSize: 15 }} />
                用户排行 Top10
                <Tooltip title="根据所选维度对用户进行排名，支持按对话次数、活跃天数、Token消耗排序">
                  <InfoCircleOutlined style={{ color: DS.textTer, fontSize: 13, cursor: 'help' }} />
                </Tooltip>
              </div>
              <RankingTable data={MOCK_USER_RANKING[rankDim]} valueLabel={rankDim} />
            </div>
          </Col>

          {/* Dept ranking */}
          <Col span={12}>
            <div style={{
              background: DS.card, borderRadius: DS.radius,
              border: `1px solid ${DS.border}`, boxShadow: DS.cardShadow,
              padding: '20px 22px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrophyOutlined style={{ color: DS.orange, fontSize: 15 }} />
                部门排行 Top10
                <Tooltip title="根据所选维度对部门进行排名，支持按对话次数、活跃天数、Token消耗排序">
                  <InfoCircleOutlined style={{ color: DS.textTer, fontSize: 13, cursor: 'help' }} />
                </Tooltip>
              </div>
              <RankingTable data={MOCK_DEPT_RANKING[rankDim]} valueLabel={rankDim} />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════
// Config Panel — Standard Agent
// ════════════════════════════════════════════════

type SectionKey = 'model' | 'prompt' | 'kb' | 'upload' | 'tools' | 'interaction';

interface ConfigSectionProps {
  id: SectionKey;
  icon: React.ReactNode;
  title: string;
  badge?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ id, icon, title, badge, expanded, onToggle, children }) => (
  <section
    style={{
      background: DS.card,
      borderRadius: DS.radius,
      border: `1px solid ${expanded ? DS.blue : DS.border}`,
      marginBottom: 12,
      boxShadow: expanded ? '0 2px 8px rgba(22,119,255,0.08)' : DS.cardShadow,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
    }}
  >
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px', cursor: 'pointer',
        userSelect: 'none',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = DS.bg; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span style={{ color: expanded ? DS.blue : DS.textSec, fontSize: 15, transition: 'color 0.3s', display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, color: expanded ? DS.blue : DS.text, flex: 1, transition: 'color 0.3s' }}>
        {title}
      </span>
      {badge && (
        <span style={{ fontSize: 11, color: DS.textTer, fontWeight: 400, marginRight: 4 }}>{badge}</span>
      )}
      <span style={{
        fontSize: 12, color: DS.textTer,
        transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>▾</span>
    </div>
    <div style={{
      maxHeight: expanded ? 2000 : 0,
      opacity: expanded ? 1 : 0,
      overflow: 'hidden',
      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: expanded ? '0 20px 18px' : '0 20px',
    }}>
      {children}
    </div>
  </section>
);

const StandardConfigPanel: React.FC = () => {
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    model: true, prompt: false, kb: false, upload: false, tools: false, interaction: false,
  });
  const toggle = (key: SectionKey) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const [model, setModel] = useState('deepseek-chat');
  const [showModel, setShowModel] = useState(true);
  const [allowSwitch, setAllowSwitch] = useState(false);
  const [continuous, setContinuous] = useState(true);
  const [kbList, setKbList] = useState<string[]>(['kb-1']);
  const [showKb, setShowKb] = useState(true);
  const [allowKbSwitch, setAllowKbSwitch] = useState(false);
  const [showRef, setShowRef] = useState(true);
  const [similarity, setSimilarity] = useState(0.75);
  const [topK, setTopK] = useState(5);

  // Small switch row helper
  const SwitchRow = ({ items }: { items: { label: string; checked: boolean; onChange: (v: boolean) => void }[] }) => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <Space key={i} size={6}>
          <Switch checked={item.checked} onChange={item.onChange} size="small" />
          <span style={{ fontSize: 13, color: DS.text }}>{item.label}</span>
        </Space>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '20px 24px', overflow: 'auto', height: '100%' }}>
      <ConfigSection id="model" icon={<ThunderboltOutlined />} title="模型选择" badge="DeepSeek-Chat"
        expanded={expanded.model} onToggle={() => toggle('model')}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ ...DS.label, marginBottom: 6 }}>默认模型</div>
          <Select value={model} onChange={setModel} style={{ width: '100%', maxWidth: 420 }} size="large"
            options={MOCK_MODELS.map(m => ({
              value: m.value,
              label: <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span>{m.label}</span>
                <Space size={4}><Text type="secondary" style={{ fontSize: 11 }}>{m.vendor}</Text>
                  {m.tags.map(t => <Tag key={t} style={{ fontSize: 10, borderRadius: 3, lineHeight: '16px', padding: '0 4px' }}>{t}</Tag>)}
                </Space>
              </div>,
            }))} />
        </div>
        <SwitchRow items={[
          { label: '模型展示', checked: showModel, onChange: setShowModel },
          { label: '用户切换模型', checked: allowSwitch, onChange: setAllowSwitch },
          { label: '连续对话', checked: continuous, onChange: setContinuous },
        ]} />
      </ConfigSection>

      <ConfigSection id="prompt" icon={<BulbOutlined />} title="提示词编排"
        expanded={expanded.prompt} onToggle={() => toggle('prompt')}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ ...DS.label, marginBottom: 6 }}>系统提示词</div>
          <Input.TextArea rows={10}
            defaultValue={`你是一位经验丰富的110接警中心指挥长与警情研判专家。

【职责】从口语化混乱的通话转录中提取标准化警情要素，包括报案时间、精确位置、涉案人员信息、警情类别及紧急程度，并生成关键事实摘要。

【约束】信息不全时标注"待补充"而非猜测；敏感信息需脱敏处理。`}
            style={{ borderRadius: DS.radiusSm, fontFamily: "'SF Mono','Cascadia Code','Fira Code',monospace", fontSize: 13, lineHeight: '22px' }} />
        </div>
        <Space size={8} style={{ marginBottom: 16 }}>
          {[
            { icon: <RobotOutlined />, label: 'AI 自动生成' },
            { icon: <ThunderboltOutlined />, label: 'AI 优化' },
            { icon: <FileTextOutlined />, label: '从模板导入' },
          ].map(btn => (
            <Button key={btn.label} size="small" icon={btn.icon} style={{ borderRadius: DS.radiusXs }}>{btn.label}</Button>
          ))}
        </Space>
        <div>
          <div style={{ ...DS.label, marginBottom: 6 }}>对话开场白</div>
          <Input.TextArea rows={2}
            defaultValue="您好，我是110接警警情分析助手，请提供报案人通话录音或文字记录，我将为您提取标准化警情要素。"
            style={{ borderRadius: DS.radiusSm }} />
        </div>
      </ConfigSection>

      <ConfigSection id="kb" icon={<DatabaseOutlined />} title="知识库关联" badge={`${kbList.length} 个已选`}
        expanded={expanded.kb} onToggle={() => toggle('kb')}>
        <Select mode="multiple" value={kbList} onChange={setKbList}
          style={{ width: '100%', maxWidth: 420, marginBottom: 14 }} size="large"
          placeholder="搜索并选择知识库" options={MOCK_KNOWLEDGE_BASES} />
        <SwitchRow items={[
          { label: '知识库展示', checked: showKb, onChange: setShowKb },
          { label: '用户切换知识库', checked: allowKbSwitch, onChange: setAllowKbSwitch },
          { label: '引用来源标注', checked: showRef, onChange: setShowRef },
        ]} />
        <div style={{ display: 'flex', gap: 28, marginTop: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 12, color: DS.textSec, marginBottom: 5 }}>相似度阈值</div>
            <InputNumber value={similarity} onChange={v => setSimilarity(v ?? 0)} min={0} max={1} step={0.01} style={{ borderRadius: DS.radiusXs }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: DS.textSec, marginBottom: 5 }}>TopK 召回数量</div>
            <InputNumber value={topK} onChange={v => setTopK(v ?? 3)} min={1} max={50} style={{ borderRadius: DS.radiusXs }} />
          </div>
          <div style={{ paddingBottom: 1 }}>
            <Space size={6}><Switch size="small" /><span style={{ fontSize: 13, color: DS.text }}>重排序模型</span></Space>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection id="upload" icon={<UploadOutlined />} title="文件上传"
        expanded={expanded.upload} onToggle={() => toggle('upload')}>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: DS.textSec, marginBottom: 5 }}>白名单类型</div>
            <Select mode="multiple" defaultValue={['pdf', 'docx', 'txt']} style={{ width: 200 }}
              options={[{ value: 'pdf', label: 'PDF' }, { value: 'docx', label: 'DOCX' }, { value: 'txt', label: 'TXT' }, { value: 'jpg', label: 'JPG' }, { value: 'png', label: 'PNG' }]} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: DS.textSec, marginBottom: 5 }}>文件大小上限 (MB)</div>
            <InputNumber defaultValue={10} min={1} max={100} style={{ borderRadius: DS.radiusXs }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: DS.textSec, marginBottom: 5 }}>上传数量上限</div>
            <InputNumber defaultValue={5} min={1} max={50} style={{ borderRadius: DS.radiusXs }} />
          </div>
        </div>
      </ConfigSection>

      <ConfigSection id="tools" icon={<ApiOutlined />} title="工具挂载" badge="可选"
        expanded={expanded.tools} onToggle={() => toggle('tools')}>
        <Select mode="multiple" defaultValue={['tool-1']} style={{ width: '100%', maxWidth: 420 }} size="large"
          options={MOCK_TOOLS.map(t => ({
            value: t.value,
            label: <Space><span>{t.label}</span><Tag style={{ fontSize: 10, borderRadius: 3, lineHeight: '16px', padding: '0 4px', opacity: 0.7 }}>{t.type}</Tag></Space>,
          }))} placeholder="搜索并选择可调用的工具" />
      </ConfigSection>

      <ConfigSection id="interaction" icon={<MessageOutlined />} title="对话交互"
        expanded={expanded.interaction} onToggle={() => toggle('interaction')}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { label: '下一步问题建议', checked: false, onChange: () => {} },
            { label: '语音转文字', checked: false, onChange: () => {} },
            { label: '文字转语音', checked: false, onChange: () => {} },
          ].map((item, i) => (
            <Space key={i} size={6}><Switch size="small" /><span style={{ fontSize: 13, color: DS.text }}>{item.label}</span></Space>
          ))}
        </div>
        <Divider style={{ margin: '0 0 16px', borderColor: DS.divider }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <SafetyCertificateOutlined style={{ color: DS.blue, fontSize: 15 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: DS.text }}>内容安全审查</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, background: DS.bg, borderRadius: DS.radiusSm, padding: '14px 16px', border: `1px solid ${DS.border}` }}>
            <Badge status="processing" text={<span style={{ fontSize: 13, fontWeight: 600 }}>关键词审查</span>} style={{ marginBottom: 8 }} />
            <Input placeholder="敏感词（逗号分隔）" defaultValue="机密,涉密,绝密" style={{ borderRadius: DS.radiusXs, marginBottom: 6 }} />
            <Input placeholder="拦截提示语" defaultValue="您的消息包含敏感内容，已被拦截。" style={{ borderRadius: DS.radiusXs }} />
          </div>
          <div style={{ flex: 1, background: DS.bg, borderRadius: DS.radiusSm, padding: '14px 16px', border: `1px solid ${DS.border}`, opacity: 0.45 }}>
            <Badge status="default" text={<span style={{ fontSize: 13, fontWeight: 600 }}>接口扩展审查</span>} style={{ marginBottom: 8 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>选择第三方审核服务（待接入）</Text>
          </div>
        </div>
      </ConfigSection>
    </div>
  );
};

// ════════════════════════════════════════════════
// External Agent Config Panel
// ════════════════════════════════════════════════

const ExternalConfigPanel: React.FC = () => {
  const [name, setName] = useState('讯飞星火警务助手');
  const [externalUrl, setExternalUrl] = useState('https://xinghuo.xfyun.cn/chat/police');
  const [description, setDescription] = useState('科大讯飞星火大模型驱动的智能警务问答助手，支持语音交互和多轮对话');

  return (
    <div style={{ padding: '24px 32px', overflow: 'auto', height: '100%' }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ ...DS.label, marginBottom: 6 }}>智能体名称</div>
        <Input value={name} onChange={e => setName(e.target.value)}
          style={{ borderRadius: DS.radiusXs, marginBottom: 20 }} />
        <div style={{ ...DS.label, marginBottom: 6 }}>外部链接</div>
        <Input value={externalUrl} onChange={e => setExternalUrl(e.target.value)}
          placeholder="https://example.com/agent"
          style={{ borderRadius: DS.radiusXs, marginBottom: 20 }} />
        <div style={{ ...DS.label, marginBottom: 6 }}>描述</div>
        <Input.TextArea rows={3} value={description} onChange={e => setDescription(e.target.value)}
          style={{ borderRadius: DS.radiusXs, marginBottom: 20 }} />
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
          外部智能体不涉及模型选择、提示词编排、知识库关联及工具挂载等配置
        </Text>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════

export default function AgentConfigPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const isExternal = searchParams.get('external') === 'true';
  const typeParam = searchParams.get('type') as AgentType | null;
  const [activeNav, setActiveNav] = useState<NavKey>('config');
  const [agent] = useState<AgentInfo>(() => {
    if (typeParam && ['standard', 'workflow', 'autonomous'].includes(typeParam)) {
      return {
        ...MOCK_AGENT, type: typeParam,
        subType: typeParam === 'workflow' ? 'workflow' : 'smart_extract',
        subTypeLabel: typeParam === 'workflow' ? '工作流' : '智能抽取',
      };
    }
    return MOCK_AGENT;
  });
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const activeAv = avatarPresets.find(a => a.key === agent.avatar) || avatarPresets[0];

  const renderConfigPanel = () => {
    if (isExternal) return <ExternalConfigPanel />;
    if (agent.type === 'standard') return <StandardConfigPanel />;
    if (agent.type === 'workflow') return <WorkflowEditor />;
    return <AgentConfigPanel />;
  };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: DS.bg }}>
      {/* ═══ Left Sidebar ═══ */}
      <div style={{
        width: 240, minWidth: 240,
        borderRight: `1px solid ${DS.divider}`,
        display: 'flex', flexDirection: 'column',
        padding: '16px 12px', background: DS.white,
      }}>
        {/* 返回 */}
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => nav('/dev/agent-manage')}
          style={{ color: DS.textSec, fontWeight: 500, fontSize: 13, alignSelf: 'flex-start', padding: '4px 8px' }}>
          返回
        </Button>

        {/* 名称 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '0 6px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: activeAv.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: activeAv.color, fontSize: 15, fontWeight: 700, flexShrink: 0,
          }}>{activeAv.label}</div>
          <span style={{
            fontSize: 15, fontWeight: 700, color: DS.text, flex: 1, minWidth: 0,
            lineHeight: '20px', wordBreak: 'break-all',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{agent.name}</span>
        </div>

        {/* 描述 */}
        <Text type="secondary" style={{
          fontSize: 12, lineHeight: '18px', marginTop: 10, padding: '0 6px',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {agent.description}
        </Text>

        {/* 类型标签 */}
        <div style={{ marginTop: 10, padding: '0 6px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          <Tag style={{ margin: 0, borderRadius: 4, fontSize: 11 }}>{isExternal ? '外部智能体' : typeLabel[agent.type]}</Tag>
          {!isExternal && agent.subTypeLabel && <Tag style={{ margin: 0, borderRadius: 4, fontSize: 11 }} color="blue">{agent.subTypeLabel}</Tag>}
        </div>

        {/* 分割线 */}
        <div style={{ height: 1, background: DS.divider, margin: '16px 6px 12px' }} />

        {/* 菜单项 */}
        {navItems.map(item => {
          const active = activeNav === item.key;
          return (
            <div key={item.key} onClick={() => setActiveNav(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                margin: '0 0 2px', padding: '9px 12px', borderRadius: DS.radiusXs,
                cursor: 'pointer', userSelect: 'none',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                background: active ? DS.blueLight : 'transparent',
                color: active ? DS.blue : DS.textSec,
                fontWeight: active ? 600 : 400,
                fontSize: 13,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = DS.bg; e.currentTarget.style.color = DS.text; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = DS.textSec; } }}
            >
              <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </div>

      {/* ──── Right Content Area ──── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* 子页面 title 栏 */}
        <div style={{
          height: 44, padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: DS.white, borderBottom: `1px solid ${DS.divider}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16, fontWeight: 650, color: DS.text }}>{navTitleMap[activeNav]}</span>
          {activeNav === 'config' && (
            agent.type === 'workflow' ? (
              <Button type="text" size="small" icon={<ExpandOutlined />} onClick={() => setFullscreenOpen(true)}
                style={{ color: DS.textSec, fontSize: 12 }}>全屏使用</Button>
            ) : (
              <Button type="primary" icon={<RocketOutlined />} onClick={() => setActiveNav('publish')}
                style={{ borderRadius: DS.radiusXs, fontWeight: 600 }}>发布</Button>
            )
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeNav === 'config' ? (
              renderConfigPanel()
            ) : activeNav === 'publish' ? (
              <div style={{ flex: 1, overflow: 'auto' }} />
            ) : activeNav === 'logs' ? (
              isExternal
                ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text type="secondary">外部智能体不产生平台内运行数据</Text></div>
                : <AgentLogsPanel agentId={agent.id} />
            ) : (
              isExternal
                ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text type="secondary">外部智能体不产生平台内运行数据</Text></div>
                : <div style={{ flex: 1, overflow: 'auto' }}><StatsPanel /></div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Fullscreen Config ═══ */}
      {fullscreenOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000, background: '#f5f8fc',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            height: 44, padding: '0 24px', background: DS.white, borderBottom: `1px solid ${DS.divider}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <span style={{ fontSize: 16, fontWeight: 650, color: DS.text }}>{navTitleMap[activeNav]}</span>
            <Button type="text" size="small" icon={<CompressOutlined />} onClick={() => setFullscreenOpen(false)}
              style={{ color: DS.textSec, fontSize: 12 }}>退出全屏</Button>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {renderConfigPanel()}
          </div>
        </div>
      )}
    </div>
  );
}
