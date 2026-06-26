import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Select, Segmented, Space } from 'antd';
import { TeamOutlined, AppstoreOutlined, UserOutlined, SwapOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import StatCards from '@/components/StatCards';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockDeptAnalyses } from '@/mock/data';

const { Text } = Typography;

const insightTypes = [
  { key: 'dept', label: '部门分析', icon: <TeamOutlined />, path: '/ops/dept-analysis' },
  { key: 'space', label: '空间分析', icon: <AppstoreOutlined />, path: '/ops/space-analysis' },
  { key: 'user', label: '用户分析', icon: <UserOutlined />, path: '/ops/user-analysis' },
];

const trendData = [
  { date: '06/19', 指挥中心: 980, 反诈中心: 580, 刑警大队: 780, 交警支队: 320 },
  { date: '06/20', 指挥中心: 1240, 反诈中心: 720, 刑警大队: 920, 交警支队: 410 },
  { date: '06/21', 指挥中心: 1100, 反诈中心: 650, 刑警大队: 850, 交警支队: 360 },
  { date: '06/22', 指挥中心: 1350, 反诈中心: 810, 刑警大队: 1050, 交警支队: 480 },
  { date: '06/23', 指挥中心: 1180, 反诈中心: 690, 刑警大队: 890, 交警支队: 390 },
  { date: '06/24', 指挥中心: 1420, 反诈中心: 760, 刑警大队: 970, 交警支队: 450 },
  { date: '06/25', 指挥中心: 1280, 反诈中心: 740, 刑警大队: 830, 交警支队: 420 },
];

const currentData = [
  { dept: '指挥中心', calls: 28500, users: 45, agents: 5, growth: '+18.2%' },
  { dept: '刑警大队', calls: 23500, users: 32, agents: 6, growth: '+12.5%' },
  { dept: '反诈中心', calls: 15600, users: 28, agents: 3, growth: '+8.7%' },
  { dept: '交警支队', calls: 8900, users: 18, agents: 4, growth: '+5.3%' },
];

const pieColors = ['#1677ff', '#722ed1', '#13c2c2', '#52c41a', '#fa8c16', '#ff4d4f'];

export default function OpsInsightPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const activeTab = useMemo(() => {
    const found = insightTypes.find(m => loc.pathname === m.path);
    return found?.key || 'dept';
  }, [loc.pathname]);
  const [compareMode, setCompareMode] = useState(false);

  const selectedDept = mockDeptAnalyses['指挥中心'];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="运营洞察" hint="从部门、空间、用户维度洞察平台运营数据，支持对比分析" />
        <div style={{ padding: '0 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Segmented
            value={activeTab}
            onChange={(v) => { const found = insightTypes.find(m => m.key === v); if (found) nav(found.path); }}
            options={insightTypes.map(m => ({ label: <Space size={4}>{m.icon}{m.label}</Space>, value: m.key }))}
            size="large"
            style={{ padding: 4, background: '#fafafa' }}
          />
          <button
            onClick={() => setCompareMode(!compareMode)}
            style={{ border: compareMode ? '1px solid #1677ff' : '1px solid #d9d9d9', background: compareMode ? '#f0f5ff' : '#fff', color: compareMode ? '#1677ff' : '#595959', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <SwapOutlined /> 对比模式
          </button>
        </div>
        <StatCards stats={[
          { label: '活跃用户数', value: '238', hint: '本月累计', trend: '+15.8%', trendUp: true },
          { label: '月度调用量', value: '76.5万', hint: '同比上月', trend: '+21.3%', trendUp: true },
          { label: '月Token消耗', value: '24.8M', hint: '环比上月', trend: '+18.6%', trendUp: true },
          { label: '活跃智能体', value: '18', hint: '本月有效', trend: '+4', trendUp: true },
        ]} />
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
          <Row gutter={16} style={{ marginTop: 4 }}>
            <Col span={16}>
              {/* 部门调用趋势 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text strong>{activeTab === 'dept' ? '部门调用趋势（近7天）' : activeTab === 'space' ? '空间调用趋势' : '用户活跃趋势'}</Text>
                  <Select defaultValue={compareMode ? ['指挥中心', '刑警大队'] : undefined} mode={compareMode ? 'multiple' : undefined} size="small" style={{ width: compareMode ? 200 : 100 }}
                    options={['指挥中心', '刑警大队', '反诈中心', '交警支队'].map(d => ({ label: d, value: d }))} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="insightBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1677ff" stopOpacity={0.15} /><stop offset="95%" stopColor="#1677ff" stopOpacity={0} /></linearGradient>
                      <linearGradient id="insightPurple" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#722ed1" stopOpacity={0.15} /><stop offset="95%" stopColor="#722ed1" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#bfbfbf" fontSize={11} />
                    <YAxis stroke="#bfbfbf" fontSize={11} />
                    <Tooltip />
                    <Area type="monotone" dataKey="指挥中心" stroke="#1677ff" strokeWidth={2} fill="url(#insightBlue)" />
                    {compareMode && <Area type="monotone" dataKey="刑警大队" stroke="#722ed1" strokeWidth={2} fill="url(#insightPurple)" />}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 部门概览表 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '20px 24px' }}>
                <Text strong style={{ display: 'block', marginBottom: 16 }}>部门概览</Text>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e8e8e8' }}>
                      {['部门', '总调用', '活跃用户', '智能体数', '环比增长'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#8c8c8c', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((d) => (
                      <tr key={d.dept} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 500 }}>{d.dept}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{d.calls.toLocaleString()}</td>
                        <td style={{ padding: '10px 12px' }}>{d.users}</td>
                        <td style={{ padding: '10px 12px' }}>{d.agents}</td>
                        <td style={{ padding: '10px 12px' }}><Text type={d.growth.startsWith('+') ? 'success' : 'danger'}>{d.growth}</Text></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>

            <Col span={8}>
              {/* 智能体类型分布 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>智能体类型分布</Text>
                {selectedDept && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie data={selectedDept.agentTypeDist} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                          {selectedDept.agentTypeDist.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div>
                      {selectedDept.agentTypeDist.map((item, i) => (
                        <div key={item.type} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: pieColors[i] }} />
                          <span style={{ fontSize: 13 }}>{item.type}</span>
                          <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>{item.value}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Top 智能体 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>Top 智能体（调用量）</Text>
                {selectedDept && selectedDept.topAgents.map((a, i) => (
                  <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < selectedDept.topAgents.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <Space>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: i < 3 ? '#1677ff' : '#e8e8e8', color: i < 3 ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>{i + 1}</span>
                      <span style={{ fontSize: 13 }}>{a.name}</span>
                    </Space>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{a.calls.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Top 用户 */}
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '20px 24px' }}>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>Top 活跃用户</Text>
                {selectedDept && selectedDept.topUsers.map((u, i) => (
                  <div key={u.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < selectedDept.topUsers.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <Space>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>{u.name.charAt(0)}</div>
                      <span style={{ fontSize: 13 }}>{u.name}</span>
                    </Space>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{u.calls.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
    </div>
  );
}
