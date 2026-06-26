import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Select, Segmented, Space } from 'antd';
import { ThunderboltOutlined, RobotOutlined, BookOutlined, ToolOutlined, ApiOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const { Text } = Typography;

const monitorTypes = [
  { key: 'agent', label: '智能体分析', icon: <ThunderboltOutlined />, path: '/ops/agent-analysis' },
  { key: 'model', label: '模型分析', icon: <RobotOutlined />, path: '/ops/model-analysis' },
  { key: 'knowledge', label: '知识库分析', icon: <BookOutlined />, path: '/ops/knowledge-analysis' },
  { key: 'tool', label: '工具分析', icon: <ToolOutlined />, path: '/ops/tool-analysis' },
  { key: 'connector', label: '连接器分析', icon: <ApiOutlined />, path: '/ops/connector-analysis' },
];

const trendData = [
  { time: '00:00', 成功: 420, 失败: 12, 调用: 432 },
  { time: '02:00', 成功: 380, 失败: 8, 调用: 388 },
  { time: '04:00', 成功: 210, 失败: 5, 调用: 215 },
  { time: '06:00', 成功: 180, 失败: 3, 调用: 183 },
  { time: '08:00', 成功: 560, 失败: 18, 调用: 578 },
  { time: '10:00', 成功: 890, 失败: 32, 调用: 922 },
  { time: '12:00', 成功: 720, 失败: 22, 调用: 742 },
  { time: '14:00', 成功: 950, 失败: 28, 调用: 978 },
  { time: '16:00', 成功: 1020, 失败: 35, 调用: 1055 },
  { time: '18:00', 成功: 780, 失败: 20, 调用: 800 },
  { time: '20:00', 成功: 650, 失败: 15, 调用: 665 },
  { time: '22:00', 成功: 510, 失败: 10, 调用: 520 },
];

const topData = [
  { name: '110接警警情分析助手', value: 12860, successRate: 98.7 },
  { name: '社区警务工作台', value: 8960, successRate: 98.2 },
  { name: '笔录文书智能校对', value: 8340, successRate: 99.1 },
  { name: '电诈资金穿透研判助手', value: 5620, successRate: 96.1 },
  { name: '刑事案件案情摘要生成', value: 4520, successRate: 97.3 },
  { name: '交通事故责任认定助手', value: 2340, successRate: 94.5 },
  { name: '走失人员协查通报助手', value: 1980, successRate: 92.8 },
];

const latencyData = [
  { time: '00:00', p50: 280, p95: 850, p99: 2100 },
  { time: '02:00', p50: 260, p95: 780, p99: 1900 },
  { time: '04:00', p50: 240, p95: 720, p99: 1800 },
  { time: '06:00', p50: 230, p95: 690, p99: 1750 },
  { time: '08:00', p50: 310, p95: 980, p99: 2400 },
  { time: '10:00', p50: 380, p95: 1250, p99: 3200 },
  { time: '12:00', p50: 340, p95: 1020, p99: 2800 },
  { time: '14:00', p50: 420, p95: 1380, p99: 3500 },
  { time: '16:00', p50: 450, p95: 1420, p99: 3800 },
  { time: '18:00', p50: 360, p95: 1100, p99: 2900 },
  { time: '20:00', p50: 320, p95: 920, p99: 2500 },
  { time: '22:00', p50: 290, p95: 880, p99: 2200 },
];

const errorTypeData = [
  { name: 'API超时', value: 125 },
  { name: '模型返回错误', value: 68 },
  { name: '参数校验失败', value: 42 },
  { name: '并发超限', value: 28 },
  { name: '网络异常', value: 15 },
];

const COLORS = ['#ff4d4f', '#fa8c16', '#fadb14', '#52c41a', '#1677ff'];

export default function OpsMonitorPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const activeMonitor = useMemo(() => {
    const found = monitorTypes.find(m => loc.pathname === m.path);
    return found?.key || 'agent';
  }, [loc.pathname]);

  const statItems = [
    { title: '总调用次数', value: '186,200', color: '#1677ff' },
    { title: '成功率', value: '96.8%', color: '#52c41a' },
    { title: '平均延迟', value: '340ms', color: '#722ed1' },
    { title: '活跃智能体', value: 12, color: '#fa8c16' },
  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="资源监控" hint="从智能体/模型/知识库/工具/连接器维度监控平台资源运行状况" />
        <StatCards items={statItems} />
        <div style={{ padding: '0 24px 12px' }}>
          <Segmented
            value={activeMonitor}
            onChange={(v) => { const found = monitorTypes.find(m => m.key === v); if (found) nav(found.path); }}
            options={monitorTypes.map(m => ({ label: <Space size={4}>{m.icon}{m.label}</Space>, value: m.key }))}
            size="large"
            style={{ padding: 4, background: '#fafafa' }}
          />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
          <Row gutter={16} style={{ marginTop: 12 }}>
            <Col span={16}>
              {/* 调用趋势 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text strong>调用量趋势（24h）</Text>
                  <Select defaultValue="1h" size="small" style={{ width: 100 }} options={[
                    { label: '实时', value: 'realtime' }, { label: '1小时', value: '1h' }, { label: '24小时', value: '24h' }, { label: '7天', value: '7d' },
                  ]} />
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1677ff" stopOpacity={0.15} /><stop offset="95%" stopColor="#1677ff" stopOpacity={0} /></linearGradient>
                      <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.1} /><stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" stroke="#bfbfbf" fontSize={11} />
                    <YAxis stroke="#bfbfbf" fontSize={11} />
                    <Tooltip />
                    <Area type="monotone" dataKey="调用" stroke="#1677ff" strokeWidth={2} fill="url(#callGrad)" />
                    <Area type="monotone" dataKey="失败" stroke="#ff4d4f" strokeWidth={1.5} fill="url(#errGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 延迟分布 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '20px 24px' }}>
                <Text strong style={{ display: 'block', marginBottom: 16 }}>延迟分布（P50/P95/P99）</Text>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={latencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" stroke="#bfbfbf" fontSize={11} />
                    <YAxis stroke="#bfbfbf" fontSize={11} unit="ms" />
                    <Tooltip />
                    <Area type="monotone" dataKey="p99" stroke="#ffa940" strokeWidth={1.5} fill="none" />
                    <Area type="monotone" dataKey="p95" stroke="#1677ff" strokeWidth={1.5} fill="none" />
                    <Area type="monotone" dataKey="p50" stroke="#52c41a" strokeWidth={1.5} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Col>

            <Col span={8}>
              {/* Top 调用排名 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>调用量 Top7</Text>
                {topData.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: i < topData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: i < 3 ? '#1677ff' : '#f0f0f0', color: i < 3 ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, marginRight: 8, flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <Text type="secondary" style={{ fontSize: 11 }}>{item.value.toLocaleString()} 次 · 成功率 {item.successRate}%</Text>
                    </div>
                  </div>
                ))}
              </div>

              {/* 错误分布 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '20px 24px' }}>
                <Text strong style={{ display: 'block', marginBottom: 16 }}>错误类型分布</Text>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={errorTypeData} layout="vertical" margin={{ left: 0, right: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" stroke="#bfbfbf" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="#bfbfbf" fontSize={11} width={80} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                      {errorTypeData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>
        </div>
    </div>
  );
}
