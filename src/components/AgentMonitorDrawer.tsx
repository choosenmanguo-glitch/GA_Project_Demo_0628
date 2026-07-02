import { useState } from 'react';
import { Drawer, Tabs, Row, Col, Typography, Statistic, Progress, Space, Tag, Button } from 'antd';
import { ThunderboltOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, AreaChartOutlined, BarChartOutlined } from '@ant-design/icons';
import type { AgentItem } from '@/mock/data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Text, Title } = Typography;

const COLORS = ['#52c41a', '#ff4d4f', '#faad14'];

interface Props {
  agent: AgentItem | null;
  open: boolean;
  onClose: () => void;
}

const hourlyData = [
  { hour: '00:00', 成功: 125, 失败: 3, 平均延迟: 280 },
  { hour: '02:00', 成功: 98, 失败: 2, 平均延迟: 260 },
  { hour: '04:00', 成功: 56, 失败: 1, 平均延迟: 240 },
  { hour: '06:00', 成功: 42, 失败: 0, 平均延迟: 230 },
  { hour: '08:00', 成功: 210, 失败: 5, 平均延迟: 310 },
  { hour: '10:00', 成功: 380, 失败: 12, 平均延迟: 380 },
  { hour: '12:00', 成功: 320, 失败: 8, 平均延迟: 340 },
  { hour: '14:00', 成功: 450, 失败: 15, 平均延迟: 420 },
  { hour: '16:00', 成功: 520, 失败: 18, 平均延迟: 450 },
  { hour: '18:00', 成功: 380, 失败: 8, 平均延迟: 350 },
  { hour: '20:00', 成功: 280, 失败: 5, 平均延迟: 310 },
  { hour: '22:00', 成功: 190, 失败: 4, 平均延迟: 290 },
];

const weeklyData = [
  { day: '06/19', 调用: 980, 成功: 952, 失败: 28 },
  { day: '06/20', 调用: 1240, 成功: 1198, 失败: 42 },
  { day: '06/21', 调用: 1100, 成功: 1069, 失败: 31 },
  { day: '06/22', 调用: 1350, 成功: 1302, 失败: 48 },
  { day: '06/23', 调用: 1180, 成功: 1146, 失败: 34 },
  { day: '06/24', 调用: 1420, 成功: 1372, 失败: 48 },
  { day: '06/25', 调用: 1280, 成功: 1246, 失败: 34 },
];

const errorDist = [
  { name: '成功', value: 96.5 },
  { name: '调用超时', value: 1.8 },
  { name: '模型错误', value: 1.2 },
  { name: '参数异常', value: 0.5 },
];

const topSessions = [
  { user: '李警官', channel: 'Web端', messages: 12, tokens: 2560, time: '14:00-14:15' },
  { user: '王大队', channel: 'API', messages: 8, tokens: 4320, time: '10:30-10:52' },
  { user: '孙民警', channel: '企业微信', messages: 6, tokens: 890, time: '09:15-09:22' },
];

export default function AgentMonitorDrawer({ agent, open, onClose }: Props) {
  const [tab, setTab] = useState('overview');

  if (!agent) return null;

  return (
    <Drawer
      title={
        <Space>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1677ff, #69b1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
            {agent.name.charAt(0)}
          </div>
          <span>{agent.name} - 运行监控</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      size="large"
      destroyOnClose
      styles={{ body: { padding: 0 } }}
    >
      {/* 顶部 KPI 栏 */}
      <div style={{ padding: '16px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
        <Row gutter={16}>
          <Col span={6}><Statistic title="今日调用" value={agent.callCount} formatter={v => (v as number).toLocaleString()} prefix={<ThunderboltOutlined />} /></Col>
          <Col span={6}><Statistic title="成功率" value={agent.successRate} suffix="%" valueStyle={{ color: agent.successRate >= 95 ? '#52c41a' : '#faad14' }} prefix={<CheckCircleOutlined />} /></Col>
          <Col span={6}><Statistic title="平均延迟" value={340} suffix="ms" prefix={<ClockCircleOutlined />} /></Col>
          <Col span={6}><Statistic title="Token消耗" value={agent.tokenConsumption} formatter={v => ((v as number) / 10000).toFixed(1) + '万'} prefix={<BarChartOutlined />} /></Col>
        </Row>
      </div>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        style={{ padding: '0 24px' }}
        items={[
          {
            key: 'overview',
            label: <Space><AreaChartOutlined />概览</Space>,
            children: (
              <div>
                {/* 24h 调用趋势 */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: 'block', marginBottom: 12 }}>24h 调用趋势</Text>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={hourlyData}>
                      <defs>
                        <linearGradient id="agGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#52c41a" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="hour" stroke="#bfbfbf" fontSize={11} />
                      <YAxis stroke="#bfbfbf" fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="成功" stroke="#52c41a" strokeWidth={2} fill="url(#agGreen)" />
                      <Area type="monotone" dataKey="失败" stroke="#ff4d4f" strokeWidth={1.5} fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* 错误率分布 */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong style={{ display: 'block', marginBottom: 12 }}>调用结果分布</Text>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={errorDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                            {errorDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div>
                        {errorDist.map((item, i) => (
                          <div key={item.name} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i] }} />
                            <span style={{ fontSize: 12 }}>{item.name}</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.value}%</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text strong style={{ display: 'block', marginBottom: 12 }}>延迟分布（ms）</Text>
                    <div style={{ padding: '16px', background: '#fafafa', borderRadius: 8 }}>
                      {[
                        { label: 'P50', value: 340, color: '#52c41a' },
                        { label: 'P95', value: 1250, color: '#1677ff' },
                        { label: 'P99', value: 3200, color: '#fa8c16' },
                      ].map((item) => (
                        <div key={item.label} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{item.value}ms</span>
                          </div>
                          <Progress percent={Math.min(item.value / 40, 100)} size="small" strokeColor={item.color} showInfo={false} />
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'trend',
            label: <Space><AreaChartOutlined />7天趋势</Space>,
            children: (
              <div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="day" stroke="#bfbfbf" fontSize={11} />
                    <YAxis stroke="#bfbfbf" fontSize={11} />
                    <Tooltip />
                    <Area type="monotone" dataKey="调用" stroke="#1677ff" strokeWidth={2} fill="url(#agBlue)" name="总调用" />
                    <Area type="monotone" dataKey="成功" stroke="#52c41a" strokeWidth={2} fill="url(#agGreen2)" name="成功" />
                    <Area type="monotone" dataKey="失败" stroke="#ff4d4f" strokeWidth={1.5} fill="none" name="失败" />
                  </AreaChart>
                </ResponsiveContainer>
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="agBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1677ff" stopOpacity={0.15} /><stop offset="95%" stopColor="#1677ff" stopOpacity={0} /></linearGradient>
                    <linearGradient id="agGreen2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#52c41a" stopOpacity={0.15} /><stop offset="95%" stopColor="#52c41a" stopOpacity={0} /></linearGradient>
                  </defs>
                </svg>
              </div>
            ),
          },
          {
            key: 'sessions',
            label: <Space><BarChartOutlined />最近会话</Space>,
            children: (
              <div>
                {topSessions.map((s, i) => (
                  <div key={i} style={{ padding: '14px 16px', marginBottom: 12, borderRadius: 8, border: '1px solid #f0f0f0', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Space>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>{s.user.charAt(0)}</div>
                        <span style={{ fontWeight: 500 }}>{s.user}</span>
                        <Tag>{s.channel}</Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>{s.time}</Text>
                    </div>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <span><Text type="secondary" style={{ fontSize: 12 }}>消息:</Text> {s.messages}</span>
                      <span><Text type="secondary" style={{ fontSize: 12 }}>Token:</Text> {s.tokens.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button type="link">查看全部会话日志</Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
