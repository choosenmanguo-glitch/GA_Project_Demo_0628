import React, { useState, useMemo } from 'react';
import {
  Row, Col, Card, Statistic, Typography, Progress, Tabs, Tag, Button, Space,
  Segmented,
} from 'antd';
import {
  RobotOutlined, FolderOutlined, FileTextOutlined, ToolOutlined,
  ThunderboltOutlined, ApiOutlined, RightOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import { mockSpaces, mockAgents, type SpaceItem, type AgentItem } from '@/mock/data';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const { Text, Title } = Typography;

// ── 模拟 30 天调用量趋势 ──
const thirtyDayTrend = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 5, 30 - i);
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    调用次数: Math.floor(2000 + Math.sin(i * 0.3) * 800 + Math.random() * 600),
    Token消耗: Math.floor(12000 + Math.sin(i * 0.25) * 5000 + Math.random() * 3000),
  };
}).reverse();

// ── 智能体类型分布 ──
const agentTypeDist: { name: string; value: number; color: string }[] = [
  { name: '标准智能体', value: 4, color: '#1677ff' },
  { name: '流程智能体', value: 1, color: '#722ed1' },
  { name: '自主智能体', value: 2, color: '#52c41a' },
];

// ── Token 消耗趋势 ──
const tokenTrend = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 5, 30 - i);
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    输入Token: Math.floor(8000 + Math.sin(i * 0.2) * 3000 + Math.random() * 2000),
    输出Token: Math.floor(4000 + Math.sin(i * 0.3) * 1500 + Math.random() * 1000),
  };
}).reverse();

// ── 活跃成员 TOP10 ──
const activeMembers = [
  { name: '李警官', calls: 4820 }, { name: '王大队', calls: 3910 }, { name: '陈队长', calls: 3520 },
  { name: '赵警官', calls: 3240 }, { name: '周科长', calls: 2870 }, { name: '张警官', calls: 2150 },
  { name: '演示用户', calls: 1980 }, { name: '刘队长', calls: 1620 }, { name: '孙民警', calls: 1380 },
  { name: '钱交警', calls: 1150 },
];

// ── 获取当前空间资源 ──
const currentSpaceAgents = mockAgents;

export default function SpaceStatsPage() {
  const { currentSpace } = useWorkspace();
  const [timeRange, setTimeRange] = useState<string>('近三十天');

  // ── 指标卡片数据 ──
  const statItems = [
    { title: '智能体数', value: currentSpace.agentCount, icon: <RobotOutlined />, color: '#1677ff' },
    { title: '知识库数', value: currentSpace.knowledgeCount, icon: <FolderOutlined />, color: '#722ed1' },
    { title: '提示词数', value: currentSpace.promptCount, icon: <FileTextOutlined />, color: '#52c41a' },
    { title: '工具数', value: currentSpace.toolCount, icon: <ToolOutlined />, color: '#fa8c16' },
    { title: '模型数', value: currentSpace.modelCount ?? 0, icon: <ThunderboltOutlined />, color: '#13c2c2' },
    { title: '连接器数', value: currentSpace.connectorCount ?? 0, icon: <ApiOutlined />, color: '#eb2f96' },
  ];

  // ── 配额数据 ──
  const quotaItems = [
    {
      label: '每日 Token 配额',
      used: currentSpace.dailyTokenUsed ?? 0,
      limit: currentSpace.dailyTokenLimit ?? 0,
      unit: 'Token',
      color: '#1677ff',
    },
    {
      label: '每月 Token 配额',
      used: currentSpace.monthlyTokenUsed ?? 0,
      limit: currentSpace.monthlyTokenLimit ?? 0,
      unit: 'Token',
      color: '#1677ff',
    },
    {
      label: '存储空间配额',
      used: currentSpace.storageUsed,
      limit: currentSpace.storageLimit,
      unit: 'MB',
      color: '#722ed1',
    },
    {
      label: '智能体数量配额',
      used: currentSpace.agentQuotaUsed,
      limit: currentSpace.agentQuotaLimit,
      unit: '个',
      color: '#52c41a',
    },
    {
      label: '成员数量配额',
      used: currentSpace.memberCount,
      limit: currentSpace.memberLimit ?? 0,
      unit: '人',
      color: '#13c2c2',
    },
  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="统计分析"
        hint="当前空间的运营数据仪表盘，查看资源使用概况与趋势"
      />

      {/* ── 空间信息头 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        padding: '12px 16px', borderRadius: 10,
        background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%)',
        border: '1px solid #d6e4ff',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 22, fontWeight: 700, flexShrink: 0,
        }}>
          {currentSpace.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{currentSpace.name}</span>
            <Tag color="blue" style={{ borderRadius: 4 }}>管理员</Tag>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
            <span>创建时间：{currentSpace.createTime}</span>
            <span>最近更新：{currentSpace.updateTime}</span>
          </div>
        </div>
        <Segmented
          size="small"
          value={timeRange}
          onChange={(v) => setTimeRange(v as string)}
          options={['近一天', '近七天', '近三十天']}
        />
      </div>

      {/* ── 6 指标卡片行 ── */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {statItems.map((item, idx) => (
          <Col span={4} key={idx}>
            <Card
              className="stat-card"
              size="small"
              style={{
                borderRadius: 10, border: '1px solid #f0f0f0',
                transition: 'all .2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.title}</Text>
                  <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: item.color }}>
                    {item.value}
                  </div>
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${item.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: item.color,
                }}>
                  {item.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── 配额使用概览（只读） ── */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {quotaItems.map((q, idx) => {
          const pct = Math.min(Math.round((q.used / q.limit) * 100), 100);
          const warnColor = pct >= 100 ? '#ff4d4f' : pct >= 80 ? '#fa8c16' : q.color;
          return (
            <Col span={4} key={idx}>
              <Card size="small" style={{ borderRadius: 10, border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 13 }}>{q.label}</Text>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: warnColor, marginBottom: 4 }}>
                  {q.used.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>/ {q.limit.toLocaleString()} {q.unit}</span>
                </div>
                <Progress
                  percent={pct}
                  size="small"
                  strokeColor={warnColor}
                  trailColor="#f0f0f0"
                  showInfo={false}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>{pct}% 已使用</Text>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* ── 图表区：第一行 ── */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* 近三十天调用量趋势 - 面积图 */}
        <Col span={12}>
          <Card
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>近三十天调用量趋势</span>}
            size="small"
            style={{ borderRadius: 10, border: '1px solid #f0f0f0' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={thirtyDayTrend}>
                <defs>
                  <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1677ff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#bfbfbf" interval={4} />
                <YAxis tick={{ fontSize: 11 }} stroke="#bfbfbf" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <Area type="monotone" dataKey="调用次数" stroke="#1677ff" strokeWidth={2} fill="url(#callGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 智能体类型分布 - 环形图 */}
        <Col span={12}>
          <Card
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>智能体类型分布</span>}
            size="small"
            style={{ borderRadius: 10, border: '1px solid #f0f0f0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={agentTypeDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {agentTypeDist.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
                    formatter={(val: any) => [`${val} 个`, '数量']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value: string) => <span style={{ fontSize: 12, color: '#666' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── 图表区：第二行 ── */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {/* Token 消耗趋势 - 折线图 */}
        <Col span={12}>
          <Card
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>Token 消耗趋势</span>}
            size="small"
            style={{ borderRadius: 10, border: '1px solid #f0f0f0' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={tokenTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#bfbfbf" interval={4} />
                <YAxis tick={{ fontSize: 11 }} stroke="#bfbfbf" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                />
                <Legend
                  iconType="line"
                  formatter={(value: string) => <span style={{ fontSize: 12, color: '#666' }}>{value}</span>}
                />
                <Line type="monotone" dataKey="输入Token" stroke="#1677ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="输出Token" stroke="#52c41a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 活跃成员 TOP10 - 横向条形图 */}
        <Col span={12}>
          <Card
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>活跃成员 TOP10</span>}
            size="small"
            style={{ borderRadius: 10, border: '1px solid #f0f0f0' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={activeMembers}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#bfbfbf" />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12 }}
                  stroke="#bfbfbf"
                  width={70}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  formatter={(val: any) => [`${(val as number).toLocaleString()} 次`, '调用次数']}
                />
                <Bar dataKey="calls" radius={[0, 6, 6, 0]} fill="#1677ff" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ── 资源明细区 ── */}
      <Row gutter={16}>
        {/* 最近智能体 */}
        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>最近智能体</span>
                <Button type="link" size="small" icon={<RightOutlined />} iconPosition="end" style={{ fontSize: 12 }}>
                  查看全部
                </Button>
              </div>
            }
            size="small"
            style={{ borderRadius: 10, border: '1px solid #f0f0f0' }}
          >
            {currentSpaceAgents.slice(0, 5).map((agent) => (
              <div
                key={agent.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid #f5f5f5',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{agent.name}</div>
                  <Space size={4}>
                    <Tag style={{ fontSize: 11, lineHeight: '18px' }}>{agent.type}</Tag>
                    <Tag color={agent.status === '已发布' ? 'green' : agent.status === '草稿' ? 'default' : 'red'} style={{ fontSize: 11, lineHeight: '18px' }}>
                      {agent.status}
                    </Tag>
                  </Space>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>{agent.createTime}</Text>
              </div>
            ))}
            {currentSpaceAgents.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <Text type="secondary">暂无智能体</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* 最近知识库 */}
        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>最近知识库</span>
                <Button type="link" size="small" icon={<RightOutlined />} iconPosition="end" style={{ fontSize: 12 }}>
                  查看全部
                </Button>
              </div>
            }
            size="small"
            style={{ borderRadius: 10, border: '1px solid #f0f0f0' }}
          >
            {[
              { name: '警情分类知识库', docs: 128, status: '已启用' },
              { name: '道路交通安全法规库', docs: 56, status: '已启用' },
              { name: '反诈案例知识库', docs: 203, status: '已启用' },
              { name: '案件卷宗库', docs: 89, status: '索引中' },
              { name: '户籍信息库', docs: 312, status: '已启用' },
            ].map((kb, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: idx < 4 ? '1px solid #f5f5f5' : 'none',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{kb.name}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{kb.docs} 个文档</Text>
                </div>
                <Tag color={kb.status === '已启用' ? 'green' : 'orange'} style={{ fontSize: 11 }}>{kb.status}</Tag>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
